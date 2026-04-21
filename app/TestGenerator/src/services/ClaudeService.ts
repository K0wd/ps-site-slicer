import { spawn } from 'child_process';
import type { Config } from '../config/Config.js';

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
  constructor(private config: Config) {}

  async prompt(input: string, options: ClaudeOptions = {}): Promise<ClaudeResult> {
    const args = ['-p'];

    if (options.outputFormat) args.push('--output-format', options.outputFormat);
    if (options.appendSystemPromptFile) args.push('--append-system-prompt-file', options.appendSystemPromptFile);
    if (options.allowedTools) args.push('--allowedTools', options.allowedTools);

    const cwd = options.cwd || this.config.projectDir;

    return new Promise((resolve, reject) => {
      const proc = spawn('claude', args, {
        cwd,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
      proc.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });

      proc.stdin.write(input);
      proc.stdin.end();

      proc.on('close', (code) => {
        if (code !== 0 && !stdout) {
          reject(new Error(`Claude CLI exited with code ${code}: ${stderr}`));
          return;
        }

        if (options.outputFormat === 'json') {
          try {
            const parsed = JSON.parse(stdout);
            const usage = parsed.usage || {};
            const tokenUsage = (usage.input_tokens || 0) + (usage.cache_read_input_tokens || 0) + (usage.output_tokens || 0);
            resolve({ result: parsed.result || '', tokenUsage, raw: parsed });
          } catch {
            resolve({ result: stdout, tokenUsage: 0, raw: null });
          }
        } else {
          resolve({ result: stdout, tokenUsage: 0, raw: null });
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

    return new Promise((resolve, reject) => {
      const proc = spawn('claude', args, {
        cwd,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

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
        if (code !== 0 && !stdout) {
          reject(new Error(`Claude CLI exited with code ${code}: ${stderr}`));
          return;
        }
        resolve({ result: stdout, tokenUsage: 0, raw: null });
      });
    });
  }
}
