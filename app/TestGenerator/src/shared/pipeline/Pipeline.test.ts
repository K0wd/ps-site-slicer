import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

// Mock createStep so we can substitute deterministic step impls
vi.mock('./StepRegistry.js', () => ({
  createStep: (n: number) => stepFactories[n](),
  getStepNumbers: () => Object.keys(stepFactories).map(Number).sort((a, b) => a - b),
}));

const { Pipeline } = await import('./Pipeline.js');
const { Database } = await import('../data/Database.js');
const { Step } = await import('./Step.js');
type StepOutput = import('./Step.js').StepOutput;

// Per-step factories — tests reassign before runs to control behavior
const stepFactories: Record<number, () => any> = {};

function makeStep(num: number, name: string, requiresTicket: boolean, output: StepOutput): any {
  return new (class extends (Step as any) {
    readonly stepNumber = num;
    readonly stepName = name;
    readonly requiresTicket = requiresTicket;
    protected async execute(): Promise<StepOutput> { return output; }
  })();
}

describe('Pipeline', () => {
  let dataDir: string;
  let db: InstanceType<typeof Database>;
  let sseEvents: Array<{ event: string; data: any }>;
  let pipeline: InstanceType<typeof Pipeline>;
  const config = { projectDir: '/tmp', port: 3847 } as any;
  const services = {
    claude: { setSignal: vi.fn() },
    playwright: { setSignal: vi.fn() },
    jira: {},
    git: {},
    context: {},
  } as any;

  beforeEach(() => {
    dataDir = mkdtempSync(join(tmpdir(), 'testgen-pipe-'));
    db = new Database(dataDir);
    sseEvents = [];
    const emit = (event: string, data: unknown) => { sseEvents.push({ event, data }); };
    pipeline = new Pipeline(db, config, {} as any, services, emit);
    // Reset factories between tests
    for (const k of Object.keys(stepFactories)) delete stepFactories[Number(k)];
  });

  afterEach(() => {
    db.close();
    rmSync(dataDir, { recursive: true, force: true });
  });

  describe('runSingleStep', () => {
    it('runs one step and emits run-started + run-complete', async () => {
      stepFactories[1] = () => makeStep(1, 'X', false, { status: 'pass', message: 'ok', artifacts: [] });
      const out = await pipeline.runSingleStep(1);
      expect(out.status).toBe('pass');
      expect(sseEvents.find((e) => e.event === 'run-started')).toBeTruthy();
      const complete = sseEvents.find((e) => e.event === 'run-complete');
      expect(complete?.data.status).toBe('completed');
    });

    it('rejects when already running', async () => {
      stepFactories[1] = () => makeStep(1, 'X', false, { status: 'pass', message: 'ok', artifacts: [] });
      const p = pipeline.runSingleStep(1);
      await expect(pipeline.runSingleStep(1)).rejects.toThrow(/already running/);
      await p;
    });

    it('marks status=failed when step returns fail', async () => {
      stepFactories[1] = () => makeStep(1, 'X', false, { status: 'fail', message: 'nope', artifacts: [] });
      const out = await pipeline.runSingleStep(1);
      expect(out.status).toBe('fail');
      const complete = sseEvents.find((e) => e.event === 'run-complete');
      expect(complete?.data.status).toBe('failed');
    });

    it('clears running flag after completion (can run again)', async () => {
      stepFactories[1] = () => makeStep(1, 'X', false, { status: 'pass', message: 'ok', artifacts: [] });
      await pipeline.runSingleStep(1);
      expect(pipeline.isRunning).toBe(false);
      await expect(pipeline.runSingleStep(1)).resolves.toBeDefined();
    });
  });

  describe('runSteps (engineering range 100+)', () => {
    it('runs sequential steps and finishes completed', async () => {
      stepFactories[101] = () => makeStep(101, 'A', false, { status: 'pass', message: 'a', artifacts: [] });
      stepFactories[102] = () => makeStep(102, 'B', false, { status: 'pass', message: 'b', artifacts: [] });
      await pipeline.runSteps(101, 102);
      const complete = sseEvents.find((e) => e.event === 'run-complete');
      expect(complete?.data.status).toBe('completed');
      const runs = db.getRecentRuns(1);
      expect(runs[0]?.status).toBe('completed');
    });

    it('stops on first fail and does not run subsequent steps', async () => {
      const step102 = vi.fn(async () => ({ status: 'pass' as const, message: 'b', artifacts: [] }));
      stepFactories[101] = () => makeStep(101, 'A', false, { status: 'fail', message: 'broken', artifacts: [] });
      stepFactories[102] = () => {
        const s = makeStep(102, 'B', false, { status: 'pass', message: 'b', artifacts: [] });
        s.execute = step102;
        return s;
      };
      await pipeline.runSteps(101, 102);
      expect(step102).not.toHaveBeenCalled();
    });
  });

  describe('runSingleStep (ticket required)', () => {
    it('returns fail when requiresTicket=true and no ticket provided', async () => {
      stepFactories[3] = () => makeStep(3, 'Review', true, { status: 'pass', message: 'ok', artifacts: [] });
      const out = await pipeline.runSingleStep(3);
      expect(out.status).toBe('fail');
      expect(out.message).toMatch(/ticket/i);
    });
  });

  describe('runSteps (1-11 range — ticket flow)', () => {
    it('passes ticketKey through to the step (requiresTicket satisfied)', async () => {
      let receivedTicket: string | null = null;
      stepFactories[3] = () => {
        const s = makeStep(3, 'Review', true, { status: 'pass', message: 'ok', artifacts: [] });
        s.execute = async (ctx: any) => { receivedTicket = ctx.ticketKey; return { status: 'pass', message: 'ok', artifacts: [] }; };
        return s;
      };
      await pipeline.runSteps(3, 3, 'SM-500');
      expect(receivedTicket).toBe('SM-500');
    });
  });

  describe('cancel', () => {
    it('isRunning reflects state', async () => {
      stepFactories[1] = () => makeStep(1, 'X', false, { status: 'pass', message: 'ok', artifacts: [] });
      const p = pipeline.runSingleStep(1);
      expect(pipeline.isRunning).toBe(true);
      await p;
      expect(pipeline.isRunning).toBe(false);
    });

    it('cancel() is a no-op when not running', () => {
      expect(() => pipeline.cancel()).not.toThrow();
    });
  });

  describe('getState', () => {
    it('returns 16 step entries with initial status=idle', () => {
      const state = pipeline.getState();
      expect(state).toHaveLength(16);
      for (const s of state) expect(s.status).toBe('idle');
    });
  });
});
