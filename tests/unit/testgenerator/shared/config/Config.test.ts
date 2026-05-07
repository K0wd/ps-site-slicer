import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync } from 'fs';
import { resolve, join } from 'path';
import { tmpdir } from 'os';

vi.mock('dotenv', () => ({ config: () => ({ parsed: {} }) }));

const { Config } = await import('../../../../../app/TestGenerator/src/shared/config/Config.js');

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

  it('constructs successfully when all required vars are present', () => {
    Object.assign(process.env, requiredEnv);
    const cfg = new Config();
    expect(cfg.baseUrl).toBe(requiredEnv.BASE_URL);
    expect(cfg.testUsername).toBe(requiredEnv.TEST_USERNAME);
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
});
