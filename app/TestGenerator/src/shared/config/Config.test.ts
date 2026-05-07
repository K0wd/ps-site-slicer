import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync } from 'fs';
import { resolve, join } from 'path';
import { tmpdir } from 'os';

// Stub dotenv so tests don't load the project's real .env
vi.mock('dotenv', () => ({ config: () => ({ parsed: {} }) }));

const { Config } = await import('./Config.js');

describe('Config', () => {
  const requiredEnv = {
    BASE_URL: 'https://test.example.com',
    TEST_USERNAME: 'tester',
    TEST_PASSWORD: 'pw',
    JIRA_EMAIL: 'a@b.com',
    JIRA_API_TOKEN: 'token123',
  };
  const originalEnv = { ...process.env };

  beforeEach(() => {
    for (const k of Object.keys(requiredEnv)) delete process.env[k];
    delete process.env.JIRA_BASE_URL;
    delete process.env.TESTGEN_PORT;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('throws when BASE_URL is missing', () => {
    expect(() => new Config()).toThrow(/Missing required environment variable: BASE_URL/);
  });

  it('throws on the first missing required env (in declaration order)', () => {
    process.env.BASE_URL = requiredEnv.BASE_URL;
    expect(() => new Config()).toThrow(/Missing required environment variable: TEST_USERNAME/);
  });

  it('constructs successfully when all required vars are present', () => {
    Object.assign(process.env, requiredEnv);
    const cfg = new Config();
    expect(cfg.baseUrl).toBe(requiredEnv.BASE_URL);
    expect(cfg.testUsername).toBe(requiredEnv.TEST_USERNAME);
    expect(cfg.jiraEmail).toBe(requiredEnv.JIRA_EMAIL);
  });

  it('defaults JIRA_BASE_URL to powerslicesoftware atlassian when unset', () => {
    Object.assign(process.env, requiredEnv);
    expect(new Config().jiraBaseUrl).toBe('https://powerslicesoftware.atlassian.net');
  });

  it('strips trailing slashes from JIRA_BASE_URL', () => {
    Object.assign(process.env, requiredEnv);
    process.env.JIRA_BASE_URL = 'https://example.atlassian.net///';
    expect(new Config().jiraBaseUrl).toBe('https://example.atlassian.net');
  });

  it('defaults port to 3847 when TESTGEN_PORT is unset', () => {
    Object.assign(process.env, requiredEnv);
    expect(new Config().port).toBe(3847);
  });

  it('parses TESTGEN_PORT as integer', () => {
    Object.assign(process.env, requiredEnv);
    process.env.TESTGEN_PORT = '4000';
    expect(new Config().port).toBe(4000);
  });

  it('exposes resolved derived directories', () => {
    Object.assign(process.env, requiredEnv);
    const cfg = new Config();
    expect(cfg.testGeneratorDir).toMatch(/app\/TestGenerator$/);
    expect(cfg.logsDir).toMatch(/logs$/);
    expect(cfg.infoDir).toMatch(/logs\/info$/);
    expect(cfg.dataDir).toMatch(/data$/);
    expect(cfg.uiDir).toMatch(/ui$/);
  });

  describe('GitLab config', () => {
    it('defaults gitlabBaseUrl to https://gitlab.com', () => {
      Object.assign(process.env, requiredEnv);
      expect(new Config().gitlabBaseUrl).toBe('https://gitlab.com');
    });

    it('strips trailing slashes from GITLAB_BASE_URL', () => {
      Object.assign(process.env, requiredEnv);
      process.env.GITLAB_BASE_URL = 'https://gitlab.example.com///';
      expect(new Config().gitlabBaseUrl).toBe('https://gitlab.example.com');
    });

    it('defaults gitlabGroupPath to powerslice-software-development', () => {
      Object.assign(process.env, requiredEnv);
      expect(new Config().gitlabGroupPath).toBe('powerslice-software-development');
    });

    it('honors GITLAB_GROUP_PATH override', () => {
      Object.assign(process.env, requiredEnv);
      process.env.GITLAB_GROUP_PATH = 'my-org/sub';
      expect(new Config().gitlabGroupPath).toBe('my-org/sub');
    });

    it('defaults gitlabToken to empty string when GITLAB_TOKEN unset', () => {
      Object.assign(process.env, requiredEnv);
      delete process.env.GITLAB_TOKEN;
      expect(new Config().gitlabToken).toBe('');
    });

    it('reads GITLAB_TOKEN from env', () => {
      Object.assign(process.env, requiredEnv);
      process.env.GITLAB_TOKEN = 'secret-pat';
      expect(new Config().gitlabToken).toBe('secret-pat');
    });

    it('trims whitespace from GITLAB_TOKEN', () => {
      Object.assign(process.env, requiredEnv);
      process.env.GITLAB_TOKEN = '  secret  ';
      expect(new Config().gitlabToken).toBe('secret');
    });
  });

  describe('targetRepoDirs', () => {
    let tmpRoot: string;
    let originalCwd: string;

    beforeEach(() => {
      Object.assign(process.env, requiredEnv);
      delete process.env.SM_REPO_DIRS;
      tmpRoot = mkdtempSync(join(tmpdir(), 'config-targets-'));
      originalCwd = process.cwd();
    });

    afterEach(() => {
      process.chdir(originalCwd);
      try { rmSync(tmpRoot, { recursive: true, force: true }); } catch { /* best effort */ }
      delete process.env.SM_REPO_DIRS;
    });

    it('uses SM_REPO_DIRS env override when set, with .git dirs filtered in', () => {
      const a = resolve(tmpRoot, 'repo-a');
      const b = resolve(tmpRoot, 'repo-b');
      const c = resolve(tmpRoot, 'not-a-repo');
      mkdirSync(resolve(a, '.git'), { recursive: true });
      mkdirSync(resolve(b, '.git'), { recursive: true });
      mkdirSync(c, { recursive: true });

      process.env.SM_REPO_DIRS = `${a},${b},${c}`;
      const dirs = new Config().targetRepoDirs;
      expect(dirs).toContain(a);
      expect(dirs).toContain(b);
      expect(dirs).not.toContain(c);
    });

    it('filters out non-existent paths in SM_REPO_DIRS', () => {
      const a = resolve(tmpRoot, 'real');
      mkdirSync(resolve(a, '.git'), { recursive: true });
      process.env.SM_REPO_DIRS = `${a},${tmpRoot}/does-not-exist`;
      const dirs = new Config().targetRepoDirs;
      expect(dirs).toEqual([a]);
    });

    it('falls through to auto-discovery when SM_REPO_DIRS yields no valid dirs', () => {
      process.env.SM_REPO_DIRS = '/nonexistent-1,/nonexistent-2';
      // Falls back to default auto-discovery (relative to projectDir, the repo we're in).
      // Just check we get *some* result without throwing.
      const dirs = new Config().targetRepoDirs;
      expect(Array.isArray(dirs)).toBe(true);
    });

    it('SM_REPO_DIRS handles whitespace and empty entries gracefully', () => {
      const a = resolve(tmpRoot, 'r');
      mkdirSync(resolve(a, '.git'), { recursive: true });
      process.env.SM_REPO_DIRS = `  ${a}  ,, ,  `;
      const dirs = new Config().targetRepoDirs;
      expect(dirs).toEqual([a]);
    });

    it('repoNameOf returns the basename of a repo path', () => {
      Object.assign(process.env, requiredEnv);
      const cfg = new Config();
      expect(cfg.repoNameOf('/Users/me/Projects/sm-spa')).toBe('sm-spa');
      expect(cfg.repoNameOf('/Users/me/Projects/sm-pwa/')).toBe('sm-pwa');
    });
  });
});
