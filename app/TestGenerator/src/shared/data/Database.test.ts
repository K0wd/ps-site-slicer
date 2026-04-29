import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { Database } from './Database.js';

describe('Database', () => {
  let dataDir: string;
  let db: Database;

  beforeEach(() => {
    dataDir = mkdtempSync(join(tmpdir(), 'testgen-db-'));
    db = new Database(dataDir);
  });

  afterEach(() => {
    db.close();
    rmSync(dataDir, { recursive: true, force: true });
  });

  describe('pipeline runs', () => {
    it('createRun returns an auto-incrementing id', () => {
      const a = db.createRun(1, 5);
      const b = db.createRun(1, 5);
      expect(b).toBe(a + 1);
    });

    it('getRun returns the run with status=running and metadata', () => {
      const id = db.createRun(1, 5, 'SM-100', 'me');
      const run = db.getRun(id);
      expect(run).toBeDefined();
      expect(run?.status).toBe('running');
      expect(run?.stepStart).toBe(1);
      expect(run?.stepEnd).toBe(5);
      expect(run?.ticketKey).toBe('SM-100');
      expect(run?.filter).toBe('me');
    });

    it('finishRun updates status and duration', () => {
      const id = db.createRun(1, 5);
      db.finishRun(id, 'completed', 1234);
      const run = db.getRun(id);
      expect(run?.status).toBe('completed');
      expect(run?.durationMs).toBe(1234);
      expect(run?.finishedAt).not.toBeNull();
    });

    it('getRecentRuns returns runs in DESC start order', () => {
      const a = db.createRun(1, 1);
      const b = db.createRun(1, 1);
      const recent = db.getRecentRuns(10);
      expect(recent[0]?.id).toBe(b);
      expect(recent[1]?.id).toBe(a);
    });
  });

  describe('step results', () => {
    it('createStepResult links to the run with status=running', () => {
      const runId = db.createRun(1, 1);
      const srId = db.createStepResult(runId, 1, 'Verify Auth');
      const results = db.getStepResults(runId);
      expect(results).toHaveLength(1);
      expect(results[0]?.id).toBe(srId);
      expect(results[0]?.status).toBe('running');
      expect(results[0]?.stepNumber).toBe(1);
      expect(results[0]?.stepName).toBe('Verify Auth');
    });

    it('finishStepResult sets status, message, duration, tokenUsage', () => {
      const runId = db.createRun(1, 1);
      const srId = db.createStepResult(runId, 1, 'Verify Auth');
      db.finishStepResult(srId, 'pass', 'OK', 250, 100);
      const sr = db.getStepResults(runId)[0];
      expect(sr?.status).toBe('pass');
      expect(sr?.message).toBe('OK');
      expect(sr?.durationMs).toBe(250);
      expect(sr?.tokenUsage).toBe(100);
      expect(sr?.errorOutput).toBeNull();
    });

    it('finishStepResult records errorOutput when provided', () => {
      const runId = db.createRun(1, 1);
      const srId = db.createStepResult(runId, 1, 'X');
      db.finishStepResult(srId, 'fail', 'boom', 50, undefined, 'stack trace here');
      const sr = db.getStepResults(runId)[0];
      expect(sr?.status).toBe('fail');
      expect(sr?.errorOutput).toBe('stack trace here');
    });

    it('UNIQUE(run_id, step_number, ticket_key) prevents duplicate results', () => {
      const runId = db.createRun(1, 1);
      db.createStepResult(runId, 1, 'X', 'SM-1');
      expect(() => db.createStepResult(runId, 1, 'X', 'SM-1')).toThrow();
    });

    it('getStepResults orders by step_number', () => {
      const runId = db.createRun(1, 5);
      db.createStepResult(runId, 3, 'C');
      db.createStepResult(runId, 1, 'A');
      db.createStepResult(runId, 2, 'B');
      const results = db.getStepResults(runId);
      expect(results.map((r) => r.stepNumber)).toEqual([1, 2, 3]);
    });
  });

  describe('artifacts and logs', () => {
    it('addArtifact and getArtifacts roundtrip', () => {
      const runId = db.createRun(1, 1);
      const srId = db.createStepResult(runId, 1, 'X');
      db.addArtifact(srId, 'plan.md', '/tmp/plan.md', 'md', 100);
      db.addArtifact(srId, 'log.txt', '/tmp/log.txt', 'txt', 50);
      const artifacts = db.getArtifacts(srId);
      expect(artifacts).toHaveLength(2);
      expect(artifacts[0]?.name).toBe('plan.md');
      expect(artifacts[0]?.sizeBytes).toBe(100);
    });

    it('addLog and getLogs roundtrip in insertion order', () => {
      const runId = db.createRun(1, 1);
      const srId = db.createStepResult(runId, 1, 'X');
      db.addLog(srId, 'info', 'first');
      db.addLog(srId, 'warn', 'second');
      db.addLog(srId, 'error', 'third');
      const logs = db.getLogs(srId);
      expect(logs.map((l) => l.message)).toEqual(['first', 'second', 'third']);
      expect(logs[1]?.level).toBe('warn');
    });
  });

  describe('schedules', () => {
    it('createSchedule and getSchedules', () => {
      const id = db.createSchedule('nightly', 0, 2, 1, 11, 'me', undefined, undefined);
      const all = db.getSchedules();
      expect(all).toHaveLength(1);
      expect(all[0].id).toBe(id);
      expect(all[0].name).toBe('nightly');
      expect(all[0].hour).toBe(2);
      expect(all[0].enabled).toBe(1);
    });

    it('updateSchedule applies partial updates only', () => {
      const id = db.createSchedule('s', 0, 0, 1, 5);
      db.updateSchedule(id, { name: 'renamed', enabled: false });
      const s = db.getSchedule(id);
      expect(s.name).toBe('renamed');
      expect(s.enabled).toBe(0);
      expect(s.step_start).toBe(1);
    });

    it('deleteSchedule removes the row', () => {
      const id = db.createSchedule('s', 0, 0, 1, 5);
      db.deleteSchedule(id);
      expect(db.getSchedule(id)).toBeUndefined();
    });
  });

  describe('cleanupStaleRuns', () => {
    it('aborts runs and fails step_results that were left running', () => {
      const r1 = db.createRun(1, 1);
      const r2 = db.createRun(1, 1);
      db.finishRun(r1, 'completed', 100);
      const sr = db.createStepResult(r2, 1, 'X');
      db.cleanupStaleRuns();
      expect(db.getRun(r1)?.status).toBe('completed');
      expect(db.getRun(r2)?.status).toBe('aborted');
      expect(db.getStepResults(r2)[0]?.status).toBe('fail');
      expect(db.getStepResults(r2)[0]?.message).toMatch(/Aborted/);
    });
  });
});
