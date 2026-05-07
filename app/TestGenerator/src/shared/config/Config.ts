import { config as loadDotenv } from 'dotenv';
import { resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, readdirSync, statSync } from 'fs';
import { homedir } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));

export class Config {
  readonly projectDir: string;
  readonly testGeneratorDir: string;
  readonly logsDir: string;
  readonly infoDir: string;
  readonly dataDir: string;
  readonly uiDir: string;

  readonly baseUrl: string;
  readonly testUsername: string;
  readonly testPassword: string;

  readonly jiraEmail: string;
  readonly jiraApiToken: string;
  readonly jiraBaseUrl: string;

  readonly port: number;

  readonly targetRepoDirs: string[];

  readonly gitlabToken: string;
  readonly gitlabBaseUrl: string;
  readonly gitlabGroupPath: string;

  constructor() {
    this.testGeneratorDir = resolve(__dirname, '..', '..', '..');
    this.projectDir = resolve(this.testGeneratorDir, '..', '..');
    this.logsDir = resolve(this.testGeneratorDir, 'logs');
    this.infoDir = resolve(this.logsDir, 'info');
    this.dataDir = resolve(this.testGeneratorDir, 'data');
    this.uiDir = resolve(this.testGeneratorDir, 'ui');

    const envPath = resolve(this.projectDir, '.env');
    if (existsSync(envPath)) {
      loadDotenv({ path: envPath });
    }

    this.baseUrl = this.requireEnv('BASE_URL');
    this.testUsername = this.requireEnv('TEST_USERNAME');
    this.testPassword = this.requireEnv('TEST_PASSWORD');

    this.jiraEmail = this.requireEnv('JIRA_EMAIL');
    this.jiraApiToken = this.requireEnv('JIRA_API_TOKEN');
    this.jiraBaseUrl = process.env.JIRA_BASE_URL?.replace(/\/+$/, '')
      || 'https://powerslicesoftware.atlassian.net';

    this.port = parseInt(process.env.TESTGEN_PORT || '3847', 10);

    this.targetRepoDirs = this.resolveTargetRepoDirs();

    this.gitlabToken = process.env.GITLAB_TOKEN?.trim() || '';
    this.gitlabBaseUrl = (process.env.GITLAB_BASE_URL?.trim() || 'https://gitlab.com').replace(/\/+$/, '');
    this.gitlabGroupPath = process.env.GITLAB_GROUP_PATH?.trim() || 'powerslice-software-development';
  }

  private resolveTargetRepoDirs(): string[] {
    const expand = (p: string): string =>
      p.startsWith('~/') ? resolve(homedir(), p.slice(2)) : resolve(p);
    const isGitRepo = (p: string): boolean => {
      try { return statSync(resolve(p, '.git')).isDirectory(); } catch { return false; }
    };

    const env = process.env.SM_REPO_DIRS?.trim();
    if (env) {
      const dirs = env.split(',').map(s => s.trim()).filter(Boolean).map(expand).filter(isGitRepo);
      if (dirs.length > 0) return dirs;
    }

    const dirs = new Set<string>();
    if (isGitRepo(this.projectDir)) dirs.add(this.projectDir);
    const parent = resolve(this.projectDir, '..');
    try {
      for (const entry of readdirSync(parent, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        const full = resolve(parent, entry.name);
        if (full === this.projectDir) continue;
        if (isGitRepo(full)) dirs.add(full);
      }
    } catch {
      // parent unreadable — fall through
    }
    return Array.from(dirs);
  }

  repoNameOf(repoPath: string): string {
    return basename(repoPath);
  }

  private requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }
}
