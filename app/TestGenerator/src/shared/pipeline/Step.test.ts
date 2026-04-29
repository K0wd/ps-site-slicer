import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { Database } from '../data/Database.js';
import { Step, type StepContext, type StepOutput } from './Step.js';

class PassingStep extends Step {
  readonly stepNumber = 99;
  readonly stepName = 'Test Pass';
  readonly requiresTicket = false;
  protected async execute(): Promise<StepOutput> {
    return {
      status: 'pass',
      message: 'all good',
      artifacts: [{ name: 'a', path: '/tmp/a', type: 'txt', sizeBytes: 10 }],
      tokenUsage: 42,
    };
  }
}

class ThrowingStep extends Step {
  readonly stepNumber = 98;
  readonly stepName = 'Test Throw';
  readonly requiresTicket = false;
  protected async execute(): Promise<StepOutput> {
    throw new Error('boom');
  }
}

function makeCtx(db: Database, stepResultId: number): StepContext {
  const sseEvents: Array<{ event: string; data: unknown }> = [];
  const ctx = {
    ticketKey: null,
    runId: 1,
    stepResultId,
    projectDir: '/tmp',
    config: {} as any,
    services: {} as any,
    db,
    logger: {} as any,
    emitSSE: (event: string, data: unknown) => { sseEvents.push({ event, data }); },
  } as StepContext;
  (ctx as any)._sseEvents = sseEvents;
  return ctx;
}

describe('Step (base class)', () => {
  let dataDir: string;
  let db: Database;
  let runId: number;
  let stepResultId: number;

  beforeEach(() => {
    dataDir = mkdtempSync(join(tmpdir(), 'testgen-step-'));
    db = new Database(dataDir);
    runId = db.createRun(1, 1);
    stepResultId = db.createStepResult(runId, 99, 'Test');
  });

  afterEach(() => {
    db.close();
    rmSync(dataDir, { recursive: true, force: true });
  });

  describe('happy path', () => {
    it('returns the execute() output unchanged', async () => {
      const out = await new PassingStep().run(makeCtx(db, stepResultId));
      expect(out.status).toBe('pass');
      expect(out.message).toBe('all good');
      expect(out.tokenUsage).toBe(42);
    });

    it('persists artifacts via db.addArtifact', async () => {
      await new PassingStep().run(makeCtx(db, stepResultId));
      const artifacts = db.getArtifacts(stepResultId);
      expect(artifacts).toHaveLength(1);
      expect(artifacts[0]?.name).toBe('a');
      expect(artifacts[0]?.filePath).toBe('/tmp/a');
    });

    it('finalizes the step_result row with status, message, duration', async () => {
      await new PassingStep().run(makeCtx(db, stepResultId));
      const sr = db.getStepResults(runId)[0];
      expect(sr?.status).toBe('pass');
      expect(sr?.message).toBe('all good');
      expect(sr?.durationMs).toBeGreaterThanOrEqual(0);
      expect(sr?.tokenUsage).toBe(42);
    });

    it('emits log SSE events', async () => {
      const ctx = makeCtx(db, stepResultId);
      await new PassingStep().run(ctx);
      const events = (ctx as any)._sseEvents as Array<{ event: string; data: any }>;
      const logEvents = events.filter((e) => e.event === 'log');
      expect(logEvents.length).toBeGreaterThanOrEqual(2);
      expect(logEvents[0]?.data.stepNumber).toBe(99);
    });
  });

  describe('error path', () => {
    it('returns a fail StepOutput when execute() throws', async () => {
      const out = await new ThrowingStep().run(makeCtx(db, stepResultId));
      expect(out.status).toBe('fail');
      expect(out.message).toBe('boom');
      expect(out.artifacts).toEqual([]);
    });

    it('finalizes the step_result row with fail status and error stack', async () => {
      await new ThrowingStep().run(makeCtx(db, stepResultId));
      const sr = db.getStepResults(runId)[0];
      expect(sr?.status).toBe('fail');
      expect(sr?.message).toBe('boom');
      expect(sr?.errorOutput).toContain('Error: boom');
    });

    it('does not throw to the caller', async () => {
      await expect(new ThrowingStep().run(makeCtx(db, stepResultId))).resolves.toBeDefined();
    });
  });
});
