import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

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
    expect(cfg.dataDir).toMatch(/data$/);
    expect(cfg.uiDir).toMatch(/ui$/);
  });
});
