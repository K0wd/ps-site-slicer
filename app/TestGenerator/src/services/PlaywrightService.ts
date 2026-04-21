import { spawn } from 'child_process';
import type { Config } from '../config/Config.js';

export class PlaywrightService {
  constructor(private config: Config) {}

  private async exec(command: string, args: string[]): Promise<{ stdout: string; exitCode: number }> {
    return new Promise((resolve) => {
      const proc = spawn(command, args, {
        cwd: this.config.projectDir,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = '';
      proc.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
      proc.stderr.on('data', (data: Buffer) => { stdout += data.toString(); });

      proc.on('close', (code) => {
        resolve({ stdout: stdout.trim(), exitCode: code || 0 });
      });
    });
  }

  async runBddgen(): Promise<{ output: string; success: boolean }> {
    const result = await this.exec('npx', ['bddgen']);
    return { output: result.stdout, success: result.exitCode === 0 };
  }

  async runTest(grepPattern: string, project = 'chromium'): Promise<{ output: string; success: boolean }> {
    const result = await this.exec('npx', ['playwright', 'test', '--grep', grepPattern, '--project', project]);
    return { output: result.stdout, success: result.exitCode === 0 };
  }
}
