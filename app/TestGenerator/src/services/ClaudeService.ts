import { spawn } from 'child_process';
import { appendFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import type { Config } from '../shared/config/Config.js';

export interface ClaudeOptions {
  outputFormat?: 'json' | 'text';
  appendSystemPromptFile?: string;
  allowedTools?: string;
  cwd?: string;
  // Override the model for this single call. If unset, uses ClaudeService's default
  // (TESTGEN_CLAUDE_MODEL env or 'claude-sonnet-4-6'). Pass an explicit model when a
  // step needs Opus-grade reasoning (e.g. Step 6 Gherkin, Step 7 implementation).
  model?: string;
}

// Default for every script-based claude CLI call. Sonnet is sufficient for
// formulaic templating (test-plan drafts, summaries, KB postings) and shifts
// spend off Opus-only buckets onto the Sonnet-only weekly cap.
export const DEFAULT_SCRIPT_MODEL = 'claude-sonnet-4-6';

export interface ClaudeResult {
  result: string;
  tokenUsage: number;
  raw: any;
}

export class ClaudeService {
  private signal?: AbortSignal;
  private readonly forcedModel?: string;

  constructor(private config: Config, forcedModel?: string) {
    this.forcedModel = forcedModel;
  }

  /** Returns a new ClaudeService that always uses the given model, overriding env and default. */
  withForcedModel(model: string): ClaudeService {
    const clone = new ClaudeService(this.config, model);
    clone.setSignal(this.signal);
    return clone;
  }

  setSignal(signal?: AbortSignal): void { this.signal = signal; }

  // spawn() bypasses the shell, so the user's claude-self/claude-atmail wrappers don't run — inject CLAUDE_CONFIG_DIR ourselves.
  private spawnEnv(): NodeJS.ProcessEnv {
    const claudeConfigDir = process.env.CLAUDE_CONFIG_DIR || `${process.env.HOME}/.claude-self`;
    return { ...process.env, CLAUDE_CONFIG_DIR: claudeConfigDir };
  }

  private detectAuthFailure(stdout: string): string | null {
    if (/Not logged in.*\/login/i.test(stdout)) {
      const dir = process.env.CLAUDE_CONFIG_DIR || `${process.env.HOME}/.claude-self`;
      return `Claude CLI is not authenticated for CLAUDE_CONFIG_DIR=${dir}. Run \`CLAUDE_CONFIG_DIR=${dir} claude\` then \`/login\`, or point CLAUDE_CONFIG_DIR at a logged-in profile.`;
    }
    return null;
  }

  // Claude CLI's -p --output-format=json may emit either:
  //  (a) a single result object: { type:'result', result:'...', usage:{...}, is_error:false }
  //  (b) an array of stream events: [ {type:'system'...}, {type:'assistant'...}, ..., {type:'result', result:'...'} ]
  //  (c) a malformed/unparseable blob (older CLI, partial flush)
  // Extract a single result + token usage from any of these, or throw with a useful detail.
  private extractResult(stdout: string, stderr: string, exitCode: number | null): ClaudeResult {
    const trimmed = stdout.trim();
    if (!trimmed) {
      throw new Error(`Claude CLI returned empty stdout (exit ${exitCode}). stderr: ${stderr.trim() || '(empty)'}`);
    }

    let parsed: any;
    try { parsed = JSON.parse(trimmed); }
    catch {
      // Could be NDJSON (stream-json without the array wrapper) — one object per line.
      const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
      const events: any[] = [];
      for (const l of lines) {
        try { events.push(JSON.parse(l)); } catch { /* skip */ }
      }
      if (events.length > 0) parsed = events;
      else throw new Error(`Claude CLI returned unparseable output (exit ${exitCode}). First 400 chars: ${trimmed.slice(0, 400)}`);
    }

    if (Array.isArray(parsed)) {
      const resultEvent = [...parsed].reverse().find(e => e?.type === 'result');
      if (resultEvent) {
        if (resultEvent.is_error === true) {
          const detail = (typeof resultEvent.result === 'string' && resultEvent.result.trim())
            || resultEvent.subtype || JSON.stringify(resultEvent).slice(0, 400);
          throw new Error(`Claude CLI returned is_error=true: ${detail}`);
        }
        const text = typeof resultEvent.result === 'string' ? resultEvent.result : '';
        if (text.trim()) {
          return { result: text, tokenUsage: this.tokensOf(resultEvent.usage), raw: resultEvent };
        }
      }
      // No result event — aggregate text from assistant messages.
      const assistantText = parsed
        .filter(e => e?.type === 'assistant' && e?.message?.content)
        .map(e => {
          const c = e.message.content;
          if (Array.isArray(c)) return c.filter((x: any) => x?.type === 'text').map((x: any) => x.text).join('');
          return typeof c === 'string' ? c : '';
        })
        .join('');
      if (assistantText.trim()) {
        return { result: assistantText, tokenUsage: 0, raw: parsed };
      }
      const summary = JSON.stringify(parsed).slice(0, 500);
      throw new Error(`Claude CLI emitted ${parsed.length} event(s) but no usable result. Raw: ${summary}`);
    }

    // Single-object path
    if (parsed.is_error === true) {
      const detail = (typeof parsed.result === 'string' && parsed.result.trim()) || stderr.trim() || JSON.stringify(parsed).slice(0, 400);
      throw new Error(`Claude CLI returned is_error=true: ${detail}`);
    }
    const text = typeof parsed.result === 'string' ? parsed.result : '';
    if (!text.trim()) {
      const detail = stderr.trim() || JSON.stringify(parsed).slice(0, 400);
      throw new Error(`Claude CLI returned empty result. Raw: ${detail}`);
    }
    return { result: text, tokenUsage: this.tokensOf(parsed.usage), raw: parsed };
  }

  private tokensOf(usage: any): number {
    if (!usage || typeof usage !== 'object') return 0;
    return (usage.input_tokens || 0) + (usage.cache_read_input_tokens || 0) + (usage.output_tokens || 0);
  }

  private logExecutionTime(startMs: number): void {
    const seconds = Math.round((Date.now() - startMs) / 1000);
    try {
      mkdirSync(this.config.logsDir, { recursive: true });
      appendFileSync(resolve(this.config.logsDir, 'claude-execution-timer.log'), `Claude executed for ${seconds}s\n`, 'utf-8');
    } catch { /* swallow — never break a Claude call due to logging */ }
  }

  // Resolve the model for a single call. Per-call option wins; then forced model
  // (set via withForcedModel); then TESTGEN_CLAUDE_MODEL env; then DEFAULT_SCRIPT_MODEL.
  private resolveModel(options: ClaudeOptions): string {
    return options.model || this.forcedModel || process.env.TESTGEN_CLAUDE_MODEL?.trim() || DEFAULT_SCRIPT_MODEL;
  }

  async prompt(input: string, options: ClaudeOptions = {}): Promise<ClaudeResult> {
    const args = ['-p', '--model', this.resolveModel(options)];

    if (options.outputFormat) args.push('--output-format', options.outputFormat);
    if (options.appendSystemPromptFile) args.push('--append-system-prompt-file', options.appendSystemPromptFile);
    if (options.allowedTools) args.push('--allowedTools', options.allowedTools);

    const cwd = options.cwd || this.config.projectDir;
    const startMs = Date.now();

    return new Promise((resolveProm, reject) => {
      const proc = spawn('claude', args, {
        cwd,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: this.spawnEnv(),
      });

      let settled = false;

      if (this.signal) {
        if (this.signal.aborted) { proc.kill(); this.logExecutionTime(startMs); reject(new Error('Cancelled')); return; }
        this.signal.addEventListener('abort', () => {
          if (!settled) { proc.kill(); this.logExecutionTime(startMs); reject(new Error('Cancelled')); }
        }, { once: true });
      }

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
      proc.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });

      proc.stdin.write(input);
      proc.stdin.end();

      proc.on('close', (code) => {
        settled = true;
        this.logExecutionTime(startMs);

        const authError = this.detectAuthFailure(stdout);
        if (authError) {
          reject(new Error(authError));
          return;
        }

        if (code !== 0 && !stdout) {
          reject(new Error(`Claude CLI exited with code ${code}: ${stderr}`));
          return;
        }

        if (options.outputFormat === 'json') {
          try {
            resolveProm(this.extractResult(stdout, stderr, code));
          } catch (err) {
            reject(err instanceof Error ? err : new Error(String(err)));
          }
        } else {
          if (!stdout.trim()) {
            reject(new Error(`Claude CLI returned empty stdout (exit ${code}). stderr: ${stderr.trim() || '(empty)'}`));
            return;
          }
          resolveProm({ result: stdout, tokenUsage: 0, raw: null });
        }
      });
    });
  }

  promptStreaming(input: string, options: ClaudeOptions = {}, onData?: (chunk: string) => void): Promise<ClaudeResult> {
    const args = ['-p', '--model', this.resolveModel(options)];

    if (options.outputFormat) args.push('--output-format', options.outputFormat);
    if (options.appendSystemPromptFile) args.push('--append-system-prompt-file', options.appendSystemPromptFile);
    if (options.allowedTools) args.push('--allowedTools', options.allowedTools);

    const cwd = options.cwd || this.config.projectDir;
    const startMs = Date.now();

    return new Promise((resolveProm, reject) => {
      const proc = spawn('claude', args, {
        cwd,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: this.spawnEnv(),
      });

      let settled = false;

      if (this.signal) {
        if (this.signal.aborted) { proc.kill(); this.logExecutionTime(startMs); reject(new Error('Cancelled')); return; }
        this.signal.addEventListener('abort', () => {
          if (!settled) { proc.kill(); this.logExecutionTime(startMs); reject(new Error('Cancelled')); }
        }, { once: true });
      }

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data: Buffer) => {
        const chunk = data.toString();
        stdout += chunk;
        onData?.(chunk);
      });

      proc.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });

      proc.stdin.write(input);
      proc.stdin.end();

      proc.on('close', (code) => {
        settled = true;
        this.logExecutionTime(startMs);

        const authError = this.detectAuthFailure(stdout);
        if (authError) {
          reject(new Error(authError));
          return;
        }

        if (code !== 0 && !stdout) {
          reject(new Error(`Claude CLI exited with code ${code}: ${stderr}`));
          return;
        }
        resolveProm({ result: stdout, tokenUsage: 0, raw: null });
      });
    });
  }
}
