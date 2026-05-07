import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { StoryLogger } from './StoryLogger.js';

describe('StoryLogger', () => {
  let logsDir: string;
  let logger: StoryLogger;

  beforeEach(() => {
    logsDir = mkdtempSync(join(tmpdir(), 'testgen-logger-'));
    logger = new StoryLogger({ logsDir } as any);
  });

  afterEach(() => {
    rmSync(logsDir, { recursive: true, force: true });
  });

  it('initTicket creates the ticket dir and story.md with header', () => {
    const dir = logger.initTicket('SM-100');
    expect(dir).toBe(resolve(logsDir, 'info', 'SM-100'));
    const story = resolve(dir, 'story.md');
    expect(existsSync(story)).toBe(true);
    const content = readFileSync(story, 'utf-8');
    expect(content).toMatch(/# Chomp Story/);
    expect(content).toContain('[SM-100]');
  });

  it('initTicket is idempotent — does not overwrite existing story.md', () => {
    logger.initTicket('SM-100');
    const story = resolve(logsDir, 'info', 'SM-100', 'story.md');
    const original = readFileSync(story, 'utf-8');
    logger.initTicket('SM-100');
    expect(readFileSync(story, 'utf-8')).toBe(original);
  });

  it('ticketDir reflects current ticket', () => {
    expect(logger.ticketDir).toBeNull();
    logger.initTicket('SM-200');
    expect(logger.ticketDir).toBe(resolve(logsDir, 'info', 'SM-200'));
  });

  it('logStep, logInfo, logResult, logCode all append to current story', () => {
    logger.initTicket('SM-300');
    logger.logStep(1, 'Verify Auth');
    logger.logInfo('found ticket');
    logger.logResult('PASS', 'all green');
    logger.logCode('snippet', 'console.log(1)');
    const content = readFileSync(resolve(logsDir, 'info', 'SM-300', 'story.md'), 'utf-8');
    expect(content).toMatch(/## Step 1 — Verify Auth/);
    expect(content).toMatch(/- found ticket/);
    expect(content).toMatch(/\*\*PASS\*\* — all green/);
    expect(content).toContain('console.log(1)');
    expect(content).toContain('<summary>snippet</summary>');
  });

  it('logging methods are no-ops before initTicket is called', () => {
    expect(() => logger.logStep(1, 'X')).not.toThrow();
    expect(() => logger.logInfo('msg')).not.toThrow();
    expect(() => logger.logResult('PASS', 'm')).not.toThrow();
    expect(() => logger.logCode('label', 'code')).not.toThrow();
  });

  it('switching ticket re-points current dir without clobbering the previous', () => {
    logger.initTicket('SM-A');
    logger.logInfo('a-info');
    logger.initTicket('SM-B');
    logger.logInfo('b-info');
    const aContent = readFileSync(resolve(logsDir, 'info', 'SM-A', 'story.md'), 'utf-8');
    const bContent = readFileSync(resolve(logsDir, 'info', 'SM-B', 'story.md'), 'utf-8');
    expect(aContent).toContain('a-info');
    expect(aContent).not.toContain('b-info');
    expect(bContent).toContain('b-info');
    expect(bContent).not.toContain('a-info');
  });
});
