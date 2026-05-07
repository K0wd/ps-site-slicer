import { spawn } from 'child_process';
import type { Config } from '../shared/config/Config.js';

export interface Commit {
  repoPath: string;
  repoName: string;
  hash: string;
  subject: string;
}

export class GitService {
  constructor(private config: Config) {}

  private async exec(args: string[], cwd: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const proc = spawn('git', args, {
        cwd,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
      proc.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });

      proc.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`git ${args.join(' ')} (cwd=${cwd}) exited ${code}: ${stderr.trim()}`));
          return;
        }
        resolve(stdout.trim());
      });
      proc.on('error', err => reject(err));
    });
  }

  get repoDirs(): string[] {
    return this.config.targetRepoDirs;
  }

  async getCommitsForTicket(ticketKey: string): Promise<Commit[]> {
    const commits: Commit[] = [];
    for (const repoPath of this.repoDirs) {
      const out = await this.exec(
        ['log', '--all', '--oneline', `--grep=${ticketKey}`],
        repoPath,
      );
      if (!out) continue;
      const repoName = this.config.repoNameOf(repoPath);
      for (const line of out.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const idx = trimmed.indexOf(' ');
        const hash = idx === -1 ? trimmed : trimmed.slice(0, idx);
        const subject = idx === -1 ? '' : trimmed.slice(idx + 1);
        commits.push({ repoPath, repoName, hash, subject });
      }
    }
    return commits;
  }

  async getChangedFiles(repoPath: string, firstHash: string, lastHash: string): Promise<string> {
    return this.exec(['diff', '--name-only', `${firstHash}~1..${lastHash}`], repoPath);
  }

  async getCommitDetails(repoPath: string, commitHash: string): Promise<string> {
    return this.exec(['show', '--stat', '--no-color', commitHash], repoPath);
  }
}
