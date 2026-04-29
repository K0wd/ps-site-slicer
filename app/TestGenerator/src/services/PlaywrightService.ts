import { spawn } from 'child_process';
import type { Config } from '../shared/config/Config.js';

export class PlaywrightService {
  private signal?: AbortSignal;

  constructor(private config: Config) {}

  setSignal(signal?: AbortSignal): void { this.signal = signal; }

  private async exec(command: string, args: string[], shell = false): Promise<{ stdout: string; exitCode: number }> {
    return new Promise((resolve, reject) => {
      const proc = spawn(command, args, {
        cwd: this.config.projectDir,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell,
      });

      let settled = false;

      if (this.signal) {
        if (this.signal.aborted) { proc.kill(); reject(new Error('Cancelled')); return; }
        this.signal.addEventListener('abort', () => {
          if (!settled) { proc.kill(); reject(new Error('Cancelled')); }
        }, { once: true });
      }

      let stdout = '';
      proc.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
      proc.stderr.on('data', (data: Buffer) => { stdout += data.toString(); });

      proc.on('close', (code) => {
        settled = true;
        resolve({ stdout: stdout.trim(), exitCode: code || 0 });
      });
    });
  }

  async runBddgen(): Promise<{ output: string; success: boolean }> {
    const result = await this.exec('npx', ['bddgen']);
    return { output: result.stdout, success: result.exitCode === 0 };
  }

  async runTest(
    grepPattern: string,
    onData?: (chunk: string) => void,
    options?: { retries?: number },
  ): Promise<{ output: string; success: boolean }> {
    return new Promise((resolve, reject) => {
      const retriesArg = typeof options?.retries === 'number' ? ` --retries=${options.retries}` : '';
      const cmd = `npx bddgen && npx playwright test --grep '${grepPattern}' --project chromium${retriesArg}`;
      const proc = spawn(cmd, [], {
        cwd: this.config.projectDir,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true,
      });

      let settled = false;

      if (this.signal) {
        if (this.signal.aborted) { proc.kill(); reject(new Error('Cancelled')); return; }
        this.signal.addEventListener('abort', () => {
          if (!settled) { proc.kill(); reject(new Error('Cancelled')); }
        }, { once: true });
      }

      let stdout = '';
      proc.stdout.on('data', (data: Buffer) => {
        const chunk = data.toString();
        stdout += chunk;
        onData?.(chunk);
      });
      proc.stderr.on('data', (data: Buffer) => {
        const chunk = data.toString();
        stdout += chunk;
        onData?.(chunk);
      });

      proc.on('close', (code) => {
        settled = true;
        resolve({ output: stdout.trim(), success: (code || 0) === 0 });
      });
    });
  }
}
