import { spawn } from 'child_process';
import { appendFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import type { Config } from '../shared/config/Config.js';

export interface ClaudeOptions {
  outputFormat?: 'json' | 'text';
  appendSystemPromptFile?: string;
  allowedTools?: string;
  cwd?: string;
}

export interface ClaudeResult {
  result: string;
  tokenUsage: number;
  raw: any;
}

export class ClaudeService {
  private signal?: AbortSignal;

  constructor(private config: Config) {}

  setSignal(signal?: AbortSignal): void { this.signal = signal; }

  private logExecutionTime(startMs: number): void {
    const seconds = Math.round((Date.now() - startMs) / 1000);
    try {
      mkdirSync(this.config.logsDir, { recursive: true });
      appendFileSync(resolve(this.config.logsDir, 'claude-execution-timer.log'), `Claude executed for ${seconds}s\n`, 'utf-8');
    } catch { /* swallow — never break a Claude call due to logging */ }
  }

  async prompt(input: string, options: ClaudeOptions = {}): Promise<ClaudeResult> {
    const args = ['-p'];

    if (options.outputFormat) args.push('--output-format', options.outputFormat);
    if (options.appendSystemPromptFile) args.push('--append-system-prompt-file', options.appendSystemPromptFile);
    if (options.allowedTools) args.push('--allowedTools', options.allowedTools);

    const cwd = options.cwd || this.config.projectDir;
    const startMs = Date.now();

    return new Promise((resolveProm, reject) => {
      const proc = spawn('claude', args, {
        cwd,
        stdio: ['pipe', 'pipe', 'pipe'],
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
        if (code !== 0 && !stdout) {
          reject(new Error(`Claude CLI exited with code ${code}: ${stderr}`));
          return;
        }

        if (options.outputFormat === 'json') {
          try {
            const parsed = JSON.parse(stdout);
            const usage = parsed.usage || {};
            const tokenUsage = (usage.input_tokens || 0) + (usage.cache_read_input_tokens || 0) + (usage.output_tokens || 0);
            resolveProm({ result: parsed.result || '', tokenUsage, raw: parsed });
          } catch {
            resolveProm({ result: stdout, tokenUsage: 0, raw: null });
          }
        } else {
          resolveProm({ result: stdout, tokenUsage: 0, raw: null });
        }
      });
    });
  }

  promptStreaming(input: string, options: ClaudeOptions = {}, onData?: (chunk: string) => void): Promise<ClaudeResult> {
    const args = ['-p'];

    if (options.outputFormat) args.push('--output-format', options.outputFormat);
    if (options.appendSystemPromptFile) args.push('--append-system-prompt-file', options.appendSystemPromptFile);
    if (options.allowedTools) args.push('--allowedTools', options.allowedTools);

    const cwd = options.cwd || this.config.projectDir;
    const startMs = Date.now();

    return new Promise((resolveProm, reject) => {
      const proc = spawn('claude', args, {
        cwd,
        stdio: ['pipe', 'pipe', 'pipe'],
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
        if (code !== 0 && !stdout) {
          reject(new Error(`Claude CLI exited with code ${code}: ${stderr}`));
          return;
        }
        resolveProm({ result: stdout, tokenUsage: 0, raw: null });
      });
    });
  }
}
