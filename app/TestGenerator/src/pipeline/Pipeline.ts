import { createStep } from './StepRegistry.js';
import type { StepContext, StepOutput } from './Step.js';
import type { Database } from '../data/Database.js';
import type { Config } from '../config/Config.js';
import type { StoryLogger } from '../logger/StoryLogger.js';
import type { JiraService } from '../services/JiraService.js';
import type { ClaudeService } from '../services/ClaudeService.js';
import type { GitService } from '../services/GitService.js';
import type { PlaywrightService } from '../services/PlaywrightService.js';
import type { ContextBuilder } from '../services/ContextBuilder.js';
import { STEP_DEFINITIONS } from '../data/models.js';

export interface PipelineServices {
  jira: JiraService;
  claude: ClaudeService;
  git: GitService;
  playwright: PlaywrightService;
  context: ContextBuilder;
}

type SSEEmitter = (event: string, data: unknown) => void;

export class Pipeline {
  private running = false;
  private currentStepNumber: number | null = null;
  private stepStatuses: Map<number, string> = new Map();

  constructor(
    private db: Database,
    private config: Config,
    private logger: StoryLogger,
    private services: PipelineServices,
    private emitSSE: SSEEmitter,
  ) {
    for (const def of STEP_DEFINITIONS) {
      this.stepStatuses.set(def.number, 'idle');
    }
  }

  get isRunning(): boolean {
    return this.running;
  }

  getState(): Array<{ stepNumber: number; stepName: string; status: string }> {
    return STEP_DEFINITIONS.map(def => ({
      stepNumber: def.number,
      stepName: def.name,
      status: this.stepStatuses.get(def.number) || 'idle',
    }));
  }

  async runSingleStep(stepNumber: number, ticketKey?: string, options?: { parallel?: boolean }): Promise<StepOutput> {
    if (this.running) {
      throw new Error('Pipeline is already running');
    }

    this.running = true;
    const startTime = Date.now();

    this.emitSSE('run-started', { runId: null, stepStart: stepNumber, stepEnd: stepNumber, ticketKey });

    try {
      const runId = this.db.createRun(stepNumber, stepNumber, ticketKey);
      const output = await this.executeStep(stepNumber, runId, ticketKey || null, options);
      const durationMs = Date.now() - startTime;

      if (stepNumber === 2 && output.status === 'pass' && output.data?.selectedTicket) {
        this.emitSSE('ticket-selected', { ticketKey: output.data.selectedTicket });
      }

      const status = output.status === 'fail' ? 'failed' : 'completed';
      this.db.finishRun(runId, status, durationMs);

      this.emitSSE('run-complete', { runId, status, durationMs, message: output.message });
      return output;
    } finally {
      this.running = false;
    }
  }

  async runSteps(stepStart: number, stepEnd: number, ticketKey?: string, filter?: string): Promise<void> {
    if (this.running) {
      throw new Error('Pipeline is already running');
    }

    this.running = true;
    const startTime = Date.now();
    const runId = this.db.createRun(stepStart, stepEnd, ticketKey, filter);

    this.emitSSE('run-started', { runId, stepStart, stepEnd, ticketKey, filter });

    try {
      // Tool steps (100+) run directly — no ticket discovery needed
      if (stepStart >= 100) {
        for (let s = stepStart; s <= stepEnd; s++) {
          const output = await this.executeStep(s, runId, ticketKey || null);
          if (output.status === 'fail') break;
        }
        const durationMs = Date.now() - startTime;
        this.db.finishRun(runId, 'completed', durationMs);
        this.emitSSE('run-complete', { runId, status: 'completed', durationMs });
        return;
      }

      let currentTicket = ticketKey || null;
      let allTickets: string[] = [];
      let step = stepStart;

      while (step <= Math.min(stepEnd, 2)) {
        const output = await this.executeStep(step, runId, currentTicket);

        if (step === 2 && output.status === 'pass' && output.data) {
          if (output.data.selectedTicket) {
            currentTicket = output.data.selectedTicket as string;
            this.emitSSE('ticket-selected', { ticketKey: currentTicket });
          }
          if (output.data.tickets) {
            allTickets = (output.data.tickets as any[]).map(t => t.key);
          }
        }

        if (output.status === 'fail') {
          const durationMs = Date.now() - startTime;
          this.db.finishRun(runId, 'failed', durationMs);
          this.emitSSE('run-complete', { runId, status: 'failed', durationMs });
          return;
        }

        step++;
      }

      if (step > stepEnd) {
        const durationMs = Date.now() - startTime;
        this.db.finishRun(runId, 'completed', durationMs);
        this.emitSSE('run-complete', { runId, status: 'completed', durationMs });
        return;
      }

      const ticketsToProcess = ticketKey ? [ticketKey] : (allTickets.length > 0 ? allTickets : (currentTicket ? [currentTicket] : []));

      if (ticketsToProcess.length === 0) {
        const durationMs = Date.now() - startTime;
        this.db.finishRun(runId, 'completed', durationMs);
        this.emitSSE('run-complete', { runId, status: 'completed', durationMs });
        return;
      }

      for (const ticket of ticketsToProcess) {
        this.emitSSE('ticket-started', { ticket, total: ticketsToProcess.length });

        for (let s = step; s <= stepEnd; s++) {
          const output = await this.executeStep(s, runId, ticket);
          if (output.status === 'fail') {
            break;
          }
        }
      }

      const durationMs = Date.now() - startTime;
      this.db.finishRun(runId, 'completed', durationMs);
      this.emitSSE('run-complete', { runId, status: 'completed', durationMs });
    } catch (err) {
      const durationMs = Date.now() - startTime;
      this.db.finishRun(runId, 'failed', durationMs);
      this.emitSSE('run-complete', { runId, status: 'failed', error: String(err) });
    } finally {
      this.running = false;
    }
  }

  private async executeStep(stepNumber: number, runId: number, ticketKey: string | null, options?: { parallel?: boolean }): Promise<StepOutput> {
    const stepDef = STEP_DEFINITIONS.find(d => d.number === stepNumber);
    if (!stepDef) throw new Error(`Unknown step: ${stepNumber}`);

    if (stepDef.requiresTicket && !ticketKey) {
      const msg = 'Ticket key required for this step';
      this.stepStatuses.set(stepNumber, 'fail');
      this.emitSSE('step-status', { stepNumber, status: 'fail', message: msg });
      return { status: 'fail', message: msg, artifacts: [] };
    }

    this.currentStepNumber = stepNumber;
    this.stepStatuses.set(stepNumber, 'running');
    this.emitSSE('step-status', { stepNumber, status: 'running' });

    const stepResultId = this.db.createStepResult(runId, stepNumber, stepDef.name, ticketKey || undefined);

    const ctx: StepContext = {
      ticketKey,
      runId,
      stepResultId,
      projectDir: this.config.projectDir,
      config: this.config,
      services: this.services,
      db: this.db,
      logger: this.logger,
      emitSSE: this.emitSSE,
      options,
      runPrerequisite: async (prereqStep: number) => {
        this.emitSSE('step-status', { stepNumber: prereqStep, status: 'running', message: 'Auto-running prerequisite...' });
        const prereqResultId = this.db.createStepResult(runId, prereqStep, STEP_DEFINITIONS.find(d => d.number === prereqStep)?.name || `Step ${prereqStep}`, ticketKey || undefined);
        const prereqCtx = { ...ctx, stepResultId: prereqResultId, runPrerequisite: undefined };
        const prereqStepImpl = createStep(prereqStep);
        const prereqOutput = await prereqStepImpl.run(prereqCtx);
        this.stepStatuses.set(prereqStep, prereqOutput.status);
        this.emitSSE('step-status', { stepNumber: prereqStep, status: prereqOutput.status, message: prereqOutput.message });
        return prereqOutput;
      },
    };

    const step = createStep(stepNumber);
    const output = await step.run(ctx);

    this.stepStatuses.set(stepNumber, output.status);
    this.emitSSE('step-status', { stepNumber, status: output.status, message: output.message });
    this.currentStepNumber = null;

    return output;
  }
}
