import { config as loadDotenv } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

export class Config {
  readonly projectDir: string;
  readonly testGeneratorDir: string;
  readonly logsDir: string;
  readonly dataDir: string;
  readonly uiDir: string;

  readonly baseUrl: string;
  readonly testUsername: string;
  readonly testPassword: string;

  readonly jiraEmail: string;
  readonly jiraApiToken: string;
  readonly jiraBaseUrl: string;

  readonly port: number;

  constructor() {
    this.testGeneratorDir = resolve(__dirname, '..', '..', '..');
    this.projectDir = resolve(this.testGeneratorDir, '..', '..');
    this.logsDir = resolve(this.testGeneratorDir, 'logs');
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
  }

  private requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }
}
