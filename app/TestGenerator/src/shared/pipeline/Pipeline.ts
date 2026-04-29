import { createStep } from './StepRegistry.js';
import type { StepContext, StepOutput } from './Step.js';
import type { Database } from '../data/Database.js';
import type { Config } from '../config/Config.js';
import type { StoryLogger } from '../logger/StoryLogger.js';
import type { JiraService } from '../../services/JiraService.js';
import type { ClaudeService } from '../../services/ClaudeService.js';
import type { GitService } from '../../services/GitService.js';
import type { PlaywrightService } from '../../services/PlaywrightService.js';
import type { ContextBuilder } from '../../services/ContextBuilder.js';
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
  private cancelRequested = false;
  private abortController: AbortController | null = null;
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

  cancel(): void {
    if (!this.running) return;
    this.cancelRequested = true;
    this.abortController?.abort();
    this.emitSSE('log', { timestamp: new Date().toLocaleTimeString(), stepNumber: '-', level: 'warn', message: 'Cancel requested — killing active processes' });
  }

  private activateSignal(): AbortSignal {
    this.abortController = new AbortController();
    this.services.claude.setSignal(this.abortController.signal);
    this.services.playwright.setSignal(this.abortController.signal);
    return this.abortController.signal;
  }

  private deactivateSignal(): void {
    this.services.claude.setSignal(undefined);
    this.services.playwright.setSignal(undefined);
    this.abortController = null;
  }

  getState(): Array<{ stepNumber: number; stepName: string; status: string }> {
    return STEP_DEFINITIONS.map(def => ({
      stepNumber: def.number,
      stepName: def.name,
      status: this.stepStatuses.get(def.number) || 'idle',
    }));
  }

  /**
   * Loop Eng03 (Healing) repeatedly until all .test sentinels are gone,
   * a scenario refuses to heal, or MAX_ITERS is hit. Emits a structured
   * "HEAL LOOP REPORT" at the end via SSE log events.
   */
  async runHealLoop(options?: { debugHeal?: boolean }): Promise<StepOutput> {
    if (this.running) {
      throw new Error('Pipeline is already running');
    }
    this.running = true;
    this.cancelRequested = false;
    const signal = this.activateSignal();
    const startTime = Date.now();
    const MAX_ITERS = 20;
    const runId = this.db.createRun(103, 103, undefined, 'heal-loop');
    const testrunDir = (await import('path')).resolve(this.config.projectDir, 'tests', 'testrun');
    const fs = await import('fs');

    const listTestFiles = (): string[] => {
      try {
        return fs.readdirSync(testrunDir).filter((f: string) => f.endsWith('.test')).sort();
      } catch { return []; }
    };

    interface RoundLogShape { round: number; errorSummary: string; fixSummary: string; passed: boolean; }
    interface IterRecord {
      n: number;
      status: string;
      message: string;
      target: string | null;
      scenarioName?: string;
      durationSec: number;
      result: 'healed' | 'unhealable' | 'bug' | 'not-implemented' | 'noop' | 'cancelled';
      reasoning?: string;
      roundLogs?: RoundLogShape[];
      alreadyPassing?: boolean;
    }
    const iters: IterRecord[] = [];
    const healed: string[] = [];
    const failed: string[] = [];
    const bugs: Array<{ tag: string; reasoning: string }> = [];
    const notImplemented: Array<{ tag: string; reasoning: string }> = [];

    const ts = () => new Date().toLocaleTimeString();
    const logLine = (level: 'info' | 'warn' | 'error', message: string) => {
      this.emitSSE('log', { stepNumber: 103, level, message, timestamp: ts() });
    };

    this.emitSSE('run-started', { runId, stepStart: 103, stepEnd: 103, mode: 'heal-loop' });
    logLine('info', '═══ HEAL LOOP STARTED ═══');
    logLine('info', `Pending .test files at start: ${listTestFiles().length}`);

    try {
      for (let i = 1; i <= MAX_ITERS; i++) {
        if (this.cancelRequested) {
          iters.push({ n: i, status: 'cancelled', message: 'cancelled before iteration', target: null, durationSec: 0, result: 'cancelled' });
          break;
        }

        const before = listTestFiles();
        const target = before[0] ? before[0].replace(/\.test$/, '') : null;

        logLine('info', `── Iteration ${i}${target ? ` — target: ${target}` : ''} ──`);

        const iterStart = Date.now();
        const output = await this.executeStep(103, runId, null, { signal, debugHeal: options?.debugHeal });
        const iterDur = Math.round((Date.now() - iterStart) / 1000);

        const after = listTestFiles();

        const classification = output.data?.classification as string | undefined;
        const reasoning = output.data?.reasoning as string | undefined;

        let result: IterRecord['result'];
        if (output.status === 'pass' && target && after.length < before.length) {
          healed.push(target);
          result = 'healed';
        } else if (output.status === 'warn' && classification === 'bug' && target) {
          bugs.push({ tag: target, reasoning: reasoning || '' });
          result = 'bug';
        } else if (output.status === 'warn' && classification === 'not-implemented' && target) {
          notImplemented.push({ tag: target, reasoning: reasoning || '' });
          result = 'not-implemented';
        } else if (output.status === 'fail' && target) {
          failed.push(target);
          result = 'unhealable';
        } else {
          // pass with no .test files = nothing to heal (all clean), or warn cases without classification
          result = 'noop';
        }

        iters.push({
          n: i,
          status: output.status,
          message: output.message,
          target,
          scenarioName: output.data?.scenarioName as string | undefined,
          durationSec: iterDur,
          result,
          reasoning,
          roundLogs: output.data?.roundLogs as RoundLogShape[] | undefined,
          alreadyPassing: output.data?.alreadyPassing as boolean | undefined,
        });

        // Stop conditions
        if (after.length === 0) { logLine('info', 'No more .test files — all scenarios are healthy'); break; }
        if (result === 'unhealable') { logLine('warn', `Heal failed for ${target} (heal-exhausted) — stopping loop`); break; }
        if (this.cancelRequested) break;
      }

      const totalSec = Math.round((Date.now() - startTime) / 1000);
      const cancelled = this.cancelRequested;
      const remaining = listTestFiles().map((f) => f.replace(/\.test$/, ''));
      const hitMax = iters.length === MAX_ITERS && remaining.length > 0;

      // ───── Build the report ─────
      const fmtDur = (s: number) => s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;

      logLine('info', '');
      logLine('info', '═════════ HEAL LOOP REPORT ═════════');
      logLine('info', `Iterations: ${iters.length}${hitMax ? '  (HIT MAX — more healing needed)' : ''}`);
      logLine('info', `Duration:   ${fmtDur(totalSec)}`);
      logLine('info', `Healed (${healed.length}):           ${healed.join(', ') || '—'}`);
      logLine(bugs.length ? 'warn' : 'info',           `Bugs (${bugs.length}):             ${bugs.map(b => b.tag).join(', ') || '—'}`);
      logLine(notImplemented.length ? 'warn' : 'info', `Not implemented (${notImplemented.length}):  ${notImplemented.map(n => n.tag).join(', ') || '—'}`);
      logLine(failed.length ? 'error' : 'info',        `Heal-exhausted (${failed.length}):   ${failed.join(', ') || '—'}`);
      logLine(remaining.length ? 'warn' : 'info',      `Pending (${remaining.length}):          ${remaining.join(', ') || '—'}`);
      if (cancelled) logLine('warn', 'Status:     CANCELLED');
      logLine('info', '');
      // Classification details
      if (bugs.length || notImplemented.length) {
        logLine('info', '──────── Classification details ────────');
        for (const b of bugs) logLine('warn', `🐞 ${b.tag} — bug — ${b.reasoning}`);
        for (const n of notImplemented) logLine('warn', `🚧 ${n.tag} — not-implemented — ${n.reasoning}`);
        logLine('info', '');
      }
      logLine('info', '──────── Per-iteration ────────');
      for (const r of iters) {
        const icon =
          r.result === 'healed' ? '✓' :
          r.result === 'unhealable' ? '✗' :
          r.result === 'bug' ? '🐞' :
          r.result === 'not-implemented' ? '🚧' :
          r.result === 'cancelled' ? '⏸' : '·';
        const lvl = r.result === 'unhealable' ? 'error' : r.result === 'bug' || r.result === 'not-implemented' ? 'warn' : 'info';
        logLine(lvl, `${icon} Iter ${r.n} — ${r.target || '—'} — ${r.result} (${r.durationSec}s) — ${r.message}`);
      }
      logLine('info', '════════════════════════════════════');

      const finalStatus = cancelled ? 'cancelled' : (failed.length > 0 ? 'failed' : (hitMax ? 'failed' : 'completed'));
      this.db.finishRun(runId, finalStatus, Date.now() - startTime);
      this.emitSSE('run-complete', { runId, status: finalStatus, durationMs: Date.now() - startTime });
      this.emitSSE('heal-loop-report', { healed, bugs, notImplemented, failed, remaining, iterations: iters, durationSec: totalSec, hitMax, cancelled });

      // Post the run summary as a Jira comment on KB-3 (best-effort).
      // Format: per-scenario journey (Step → rounds → final outcome), summary at end.
      const lines: string[] = [];
      lines.push(`🛠 Heal loop run — ${new Date().toISOString()}`);
      lines.push(`Status: ${finalStatus.toUpperCase()}${cancelled ? ' (cancelled)' : ''}${hitMax ? ' (hit MAX iterations)' : ''}  |  Iterations: ${iters.length}  |  Duration: ${fmtDur(totalSec)}`);
      lines.push('─────────────────────────────────────────');
      lines.push('');

      const truncate = (s: string, n: number) => (s.length > n ? s.substring(0, n - 1) + '…' : s);

      for (const it of iters) {
        const stepLabel = it.scenarioName ? `${it.target} — ${it.scenarioName}` : (it.target || '—');
        lines.push(`Step: ${stepLabel}`);

        if (it.alreadyPassing) {
          lines.push(`Initial check: already passing — heal not needed`);
          lines.push(`Final: · ALREADY PASSING (${it.durationSec}s)`);
        } else if (it.roundLogs && it.roundLogs.length > 0) {
          // Initial error from round 1's errorSummary
          const initial = it.roundLogs[0]?.errorSummary || '';
          if (initial) lines.push(`Initial error: ${truncate(initial.replace(/\n/g, ' '), 240)}`);
          for (const r of it.roundLogs) {
            const verdict = r.passed ? 'PASSED' : 'FAILED';
            const fix = r.fixSummary ? ` — fix: ${truncate(r.fixSummary.replace(/\n/g, ' '), 200)}` : '';
            lines.push(`Round ${r.round} — ${verdict}${fix}`);
          }
          // Final
          const finalIcon =
            it.result === 'healed' ? '✓ HEALED' :
            it.result === 'bug' ? '🐞 BUG' :
            it.result === 'not-implemented' ? '🚧 NOT IMPLEMENTED' :
            it.result === 'unhealable' ? '✗ HEAL-EXHAUSTED' :
            it.result === 'cancelled' ? '⏸ CANCELLED' : '· ' + it.result.toUpperCase();
          const reasonSuffix = it.reasoning ? ` — ${truncate(it.reasoning, 200)}` : '';
          lines.push(`Final: ${finalIcon} (${it.durationSec}s)${reasonSuffix}`);
        } else {
          // No round data — fallback (e.g., cancelled before any round)
          lines.push(`Final: ${it.result.toUpperCase()} (${it.durationSec}s) — ${it.message}`);
        }

        lines.push('');
        lines.push('─────────────────────────────────────────');
        lines.push('');
      }

      // Trailing aggregate summary
      lines.push('Summary');
      lines.push(`  ✓ Healed (${healed.length}):           ${healed.join(', ') || '—'}`);
      lines.push(`  🐞 Bugs (${bugs.length}):              ${bugs.map(b => b.tag).join(', ') || '—'}`);
      lines.push(`  🚧 Not implemented (${notImplemented.length}):  ${notImplemented.map(n => n.tag).join(', ') || '—'}`);
      lines.push(`  ✗ Heal-exhausted (${failed.length}):   ${failed.join(', ') || '—'}`);
      lines.push(`  ⏸ Pending (${remaining.length}):       ${remaining.join(', ') || '—'}`);

      this.services.jira.addComment('KB-3', lines.join('\n'))
        .then(() => logLine('info', '✓ Posted heal-loop summary to KB-3'))
        .catch((err: unknown) => logLine('warn', `Failed to post KB-3 comment: ${err instanceof Error ? err.message : String(err)}`));

      return {
        status: failed.length > 0 || hitMax ? 'fail' : (cancelled ? 'warn' : 'pass'),
        message: `${healed.length} healed, ${bugs.length} bugs, ${notImplemented.length} not-implemented, ${failed.length} heal-exhausted, ${remaining.length} pending — ${iters.length} iterations`,
        artifacts: [],
        data: { healed, bugs, notImplemented, failed, remaining, iterations: iters, hitMax, cancelled },
      };
    } finally {
      this.deactivateSignal();
      this.running = false;
    }
  }

  async runSingleStep(stepNumber: number, ticketKey?: string, options?: { parallel?: boolean; debugHeal?: boolean }): Promise<StepOutput> {
    if (this.running) {
      throw new Error('Pipeline is already running');
    }

    this.running = true;
    this.cancelRequested = false;
    const signal = this.activateSignal();
    const startTime = Date.now();

    this.emitSSE('run-started', { runId: null, stepStart: stepNumber, stepEnd: stepNumber, ticketKey });

    try {
      const runId = this.db.createRun(stepNumber, stepNumber, ticketKey);
      const output = await this.executeStep(stepNumber, runId, ticketKey || null, { ...options, signal });
      const durationMs = Date.now() - startTime;

      if (stepNumber === 2 && output.status === 'pass' && output.data?.selectedTicket) {
        this.emitSSE('ticket-selected', { ticketKey: output.data.selectedTicket });
      }

      const cancelled = this.cancelRequested;
      const status = cancelled ? 'cancelled' : output.status === 'fail' ? 'failed' : 'completed';
      this.db.finishRun(runId, status, durationMs);

      this.emitSSE('run-complete', { runId, status, durationMs, message: cancelled ? 'Cancelled' : output.message });
      return output;
    } finally {
      this.deactivateSignal();
      this.running = false;
    }
  }

  async runSteps(stepStart: number, stepEnd: number, ticketKey?: string, filter?: string): Promise<void> {
    if (this.running) {
      throw new Error('Pipeline is already running');
    }

    this.running = true;
    this.cancelRequested = false;
    const signal = this.activateSignal();
    const startTime = Date.now();
    const runId = this.db.createRun(stepStart, stepEnd, ticketKey, filter);

    this.emitSSE('run-started', { runId, stepStart, stepEnd, ticketKey, filter });

    try {
      // Tool steps (100+) run directly — no ticket discovery needed
      if (stepStart >= 100) {
        for (let s = stepStart; s <= stepEnd; s++) {
          if (this.cancelRequested) break;
          const output = await this.executeStep(s, runId, ticketKey || null, { signal });
          if (output.status === 'fail') break;
        }
        const durationMs = Date.now() - startTime;
        const engineeringStatus = this.cancelRequested ? 'cancelled' : 'completed';
        this.db.finishRun(runId, engineeringStatus, durationMs);
        this.emitSSE('run-complete', { runId, status: engineeringStatus, durationMs });
        return;
      }

      let currentTicket = ticketKey || null;
      let allTickets: string[] = [];
      let step = stepStart;

      while (step <= Math.min(stepEnd, 2)) {
        if (this.cancelRequested) break;
        const output = await this.executeStep(step, runId, currentTicket, { signal });

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
        if (this.cancelRequested) break;
        this.emitSSE('ticket-started', { ticket, total: ticketsToProcess.length });

        for (let s = step; s <= stepEnd; s++) {
          if (this.cancelRequested) break;
          const output = await this.executeStep(s, runId, ticket, { signal });
          if (output.status === 'fail') {
            break;
          }
        }
      }

      const durationMs = Date.now() - startTime;
      const finalStatus = this.cancelRequested ? 'cancelled' : 'completed';
      this.db.finishRun(runId, finalStatus, durationMs);
      this.emitSSE('run-complete', { runId, status: finalStatus, durationMs });
    } catch (err) {
      const durationMs = Date.now() - startTime;
      const cancelled = this.cancelRequested;
      this.db.finishRun(runId, cancelled ? 'cancelled' : 'failed', durationMs);
      this.emitSSE('run-complete', { runId, status: cancelled ? 'cancelled' : 'failed', error: cancelled ? undefined : String(err) });
    } finally {
      this.deactivateSignal();
      this.running = false;
    }
  }

  private async executeStep(stepNumber: number, runId: number, ticketKey: string | null, options?: { parallel?: boolean; debugHeal?: boolean; signal?: AbortSignal }): Promise<StepOutput> {
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
      signal: options?.signal,
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
