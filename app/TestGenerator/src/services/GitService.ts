import { spawn } from 'child_process';
import type { Config } from '../config/Config.js';

export class GitService {
  constructor(private config: Config) {}

  private async exec(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const proc = spawn('git', args, {
        cwd: this.config.projectDir,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
      proc.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });

      proc.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`git exited with code ${code}: ${stderr}`));
          return;
        }
        resolve(stdout.trim());
      });
    });
  }

  async getCommitsForTicket(ticketKey: string): Promise<string> {
    return this.exec(['log', '--all', '--oneline', `--grep=${ticketKey}`]);
  }

  async getChangedFiles(firstCommit: string, lastCommit: string): Promise<string> {
    return this.exec(['diff', '--name-only', `${firstCommit}~1..${lastCommit}`]);
  }
}
