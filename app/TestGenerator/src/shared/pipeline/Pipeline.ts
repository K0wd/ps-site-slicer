import { writeFileSync, readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { resolve } from 'path';
import { createStep } from './StepRegistry.js';
import type { StepContext, StepOutput } from './Step.js';
import type { Database } from '../data/Database.js';
import type { Config } from '../config/Config.js';
import type { StoryLogger } from '../logger/StoryLogger.js';
import type { JiraService } from '../../services/JiraService.js';
import type { ClaudeService } from '../../services/ClaudeService.js';
import type { GitService } from '../../services/GitService.js';
import type { GitLabService } from '../../services/GitLabService.js';
import type { PlaywrightService } from '../../services/PlaywrightService.js';
import type { ContextBuilder } from '../../services/ContextBuilder.js';
import { STEP_DEFINITIONS } from '../data/models.js';

export interface PipelineServices {
  jira: JiraService;
  claude: ClaudeService;
  git: GitService;
  gitlab: GitLabService;
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
    const testrunDir = resolve(this.config.projectDir, 'tests', 'testrun');

    const listTestFiles = (): string[] => {
      try {
        return readdirSync(testrunDir).filter((f: string) => f.endsWith('.test')).sort();
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
      const fmtDur = (s: number) => Pipeline.formatDuration(s * 1000);

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

  async runSingleStep(stepNumber: number, ticketKey?: string, options?: { parallel?: boolean; debugHeal?: boolean; runAll?: boolean; testTypes?: Array<'ui' | 'api' | 'unit'> }): Promise<StepOutput> {
    if (this.running) {
      throw new Error('Pipeline is already running');
    }

    const stepDef = STEP_DEFINITIONS.find(d => d.number === stepNumber);

    // When no ticket key and step requires one, discover tickets via Step 02 and loop
    if (stepDef?.requiresTicket && !ticketKey) {
      return this.runSingleStepAcrossTickets(stepNumber, options);
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
      this.regenerateAutomationIndex();
      this.deactivateSignal();
      this.running = false;
    }
  }

  private async runSingleStepAcrossTickets(stepNumber: number, options?: { parallel?: boolean; debugHeal?: boolean; runAll?: boolean; testTypes?: Array<'ui' | 'api' | 'unit'> }): Promise<StepOutput> {
    this.running = true;
    this.cancelRequested = false;
    const signal = this.activateSignal();
    const startTime = Date.now();
    const ts = () => new Date().toLocaleTimeString();

    this.emitSSE('run-started', { runId: null, stepStart: stepNumber, stepEnd: stepNumber, mode: 'batch' });

    try {
      // Step 02: discover tickets
      const discoverRunId = this.db.createRun(2, 2, undefined);
      this.emitSSE('log', { stepNumber: 2, level: 'info', message: 'No ticket specified — discovering tickets via Step 02...', timestamp: ts() });
      const s2 = await this.executeStep(2, discoverRunId, null, { signal });
      this.db.finishRun(discoverRunId, s2.status === 'fail' ? 'failed' : 'completed', Date.now() - startTime);

      if (s2.status === 'fail') {
        this.emitSSE('run-complete', { runId: discoverRunId, status: 'failed', message: `Step 02 failed: ${s2.message}` });
        return s2;
      }

      const tickets: string[] = (s2.data?.tickets as any[] || []).map((t: any) => t.key);
      if (s2.data?.selectedTicket && tickets.length === 0) tickets.push(s2.data.selectedTicket as string);

      if (tickets.length === 0) {
        const msg = 'No tickets found to process';
        this.emitSSE('run-complete', { status: 'completed', message: msg });
        return { status: 'warn', message: msg, artifacts: [] };
      }

      this.emitSSE('log', { stepNumber, level: 'info', message: `Running step ${stepNumber} across ${tickets.length} ticket(s): ${tickets.join(', ')}`, timestamp: ts() });

      // Loop each ticket
      const results: Array<{ ticket: string; status: string; message: string }> = [];
      let passCount = 0;
      let failCount = 0;

      for (const ticket of tickets) {
        if (this.cancelRequested) break;

        if (!options?.runAll && this.isStepDone(ticket, stepNumber)) {
          this.emitSSE('log', { stepNumber, level: 'info', message: `Step ${stepNumber} already done for ${ticket} — skipping`, timestamp: ts() });
          passCount++;
          results.push({ ticket, status: 'pass', message: 'Skipped (already done)' });
          continue;
        }

        this.emitSSE('ticket-started', { ticket, total: tickets.length });
        this.emitSSE('log', { stepNumber, level: 'info', message: `── ${ticket} ──`, timestamp: ts() });

        const ticketRunId = this.db.createRun(stepNumber, stepNumber, ticket);
        const output = await this.executeStep(stepNumber, ticketRunId, ticket, { ...options, signal });
        const ticketDuration = Date.now() - startTime;
        this.db.finishRun(ticketRunId, output.status === 'fail' ? 'failed' : 'completed', ticketDuration);

        results.push({ ticket, status: output.status, message: output.message });
        if (output.status === 'fail') failCount++;
        else passCount++;

        const icon = output.status === 'pass' ? '✓' : output.status === 'warn' ? '⚠' : '✗';
        this.emitSSE('log', { stepNumber, level: output.status === 'fail' ? 'error' : 'info', message: `${icon} ${ticket} — ${output.status}: ${output.message}`, timestamp: ts() });
        this.emitSSE('ticket-finished', { ticket });
      }

      // Summary
      const durationMs = Date.now() - startTime;
      const cancelled = this.cancelRequested;
      const summaryMsg = `${passCount} passed, ${failCount} failed across ${tickets.length} ticket(s)`;

      this.emitSSE('log', { stepNumber, level: 'info', message: `═══ BATCH COMPLETE: ${summaryMsg} ═══`, timestamp: ts() });
      for (const r of results) {
        const icon = r.status === 'pass' ? '✓' : r.status === 'warn' ? '⚠' : '✗';
        this.emitSSE('log', { stepNumber, level: r.status === 'fail' ? 'error' : 'info', message: `  ${icon} ${r.ticket} — ${r.message}`, timestamp: ts() });
      }

      const finalStatus = cancelled ? 'cancelled' : failCount > 0 ? 'failed' : 'completed';
      this.emitSSE('run-complete', { status: finalStatus, durationMs, message: summaryMsg });

      return {
        status: failCount > 0 ? 'fail' : 'pass',
        message: summaryMsg,
        artifacts: [],
        data: { results, ticketCount: tickets.length, passCount, failCount },
      };
    } finally {
      this.regenerateAutomationIndex();
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

      const PER_TC_FIRST = 6;
      const PER_TC_LAST = 9;

      for (const ticket of ticketsToProcess) {
        if (this.cancelRequested) break;
        this.emitSSE('ticket-started', { ticket, total: ticketsToProcess.length });

        let preLoopFailed = false;
        let tcIds: string[] = [];
        for (let s = step; s <= Math.min(stepEnd, PER_TC_FIRST - 1); s++) {
          if (this.cancelRequested) break;
          if (this.isStepDone(ticket, s)) {
            this.emitSSE('log', { stepNumber: s, level: 'info', message: `Step ${s} already done for ${ticket} — skipping`, timestamp: new Date().toLocaleTimeString() });
            this.stepStatuses.set(s, 'pass');
            this.emitSSE('step-status', { stepNumber: s, status: 'pass', message: 'Skipped (already done)' });
            continue;
          }
          const output = await this.executeStep(s, runId, ticket, { signal });
          if (s === 5 && output.data?.tcIds) {
            tcIds = output.data.tcIds as string[];
          }
          if (output.status === 'fail') {
            preLoopFailed = true;
            break;
          }
        }
        if (preLoopFailed || this.cancelRequested) continue;

        if (stepEnd < PER_TC_FIRST) continue;

        if (tcIds.length === 0) {
          tcIds = this.readTcIdsFromPlan(ticket);
        }

        if (tcIds.length === 0) {
          this.emitSSE('log', { stepNumber: '-', level: 'warn', message: `No TCs found for ${ticket} — falling back to multi-TC step execution`, timestamp: new Date().toLocaleTimeString() });
          for (let s = Math.max(step, PER_TC_FIRST); s <= Math.min(stepEnd, PER_TC_LAST); s++) {
            if (this.cancelRequested) break;
            if (this.isStepDone(ticket, s)) {
              this.emitSSE('log', { stepNumber: s, level: 'info', message: `Step ${s} already done for ${ticket} — skipping`, timestamp: new Date().toLocaleTimeString() });
              continue;
            }
            const output = await this.executeStep(s, runId, ticket, { signal });
            if (output.status === 'fail') break;
          }
        } else {
          this.emitSSE('log', { stepNumber: '-', level: 'info', message: `Looping ${tcIds.length} TC(s) for ${ticket}: ${tcIds.join(', ')}`, timestamp: new Date().toLocaleTimeString() });
          for (const tcId of tcIds) {
            if (this.cancelRequested) break;
            this.emitSSE('tc-started', { ticket, tcId });
            this.db.upsertTcTracker(ticket, tcId, { phase: 'queued' });
            for (let s = Math.max(step, PER_TC_FIRST); s <= Math.min(stepEnd, PER_TC_LAST); s++) {
              if (this.cancelRequested) break;
              if (this.isStepDone(ticket, s)) {
                this.emitSSE('log', { stepNumber: s, level: 'info', message: `Step ${s} already done for ${ticket} — skipping`, timestamp: new Date().toLocaleTimeString() });
                continue;
              }
              const output = await this.executeStep(s, runId, ticket, { signal, tcId });
              if (output.status === 'fail') {
                this.emitSSE('log', { stepNumber: s, level: 'warn', message: `[${ticket} ${tcId}] step ${s} failed — moving to next TC`, timestamp: new Date().toLocaleTimeString() });
                break;
              }
            }
            this.emitSSE('tc-finished', { ticket, tcId });
          }
        }

        if (stepEnd >= 10 && !this.cancelRequested) {
          await this.executeStep(10, runId, ticket, { signal });
        }

        if (stepEnd >= 11 && !this.cancelRequested) {
          await this.executeStep(11, runId, ticket, { signal });
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
      this.regenerateAutomationIndex();
      this.deactivateSignal();
      this.running = false;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 4-Thread Run-All Mode
  // Thread 1 (bootstrap): Steps 1-2, run once; failure halts everything.
  // Thread 2 (info gathering): Steps 3→4→5→6 per queued ticket.
  // Thread 3 (implementation loop): Steps 7→8 per ticket until all TCs pass.
  // Thread 4 (finalization): Steps 9→10 once per fully-automated ticket.
  // Threads 2-4 start concurrently after Thread 1 succeeds.
  // ─────────────────────────────────────────────────────────────

  // Phase order used to decide if a step's output phase has already been reached.
  private static readonly PHASE_ORDER = [
    'queued', 'info_gathered', 'code_reviewed', 'plan_drafted', 'gherkin_done',
    'impl_partial', 'fully_automated', 'results_determined', 'results_posted', 'ticket_transitioned',
  ];

  // Returns true when the step's output artifacts already exist on disk.
  // Files are the source of truth — the DB phase can be stale (e.g. 'blocked')
  // while the output files from earlier steps are still perfectly valid.
  private isStepDone(ticketKey: string, stepNum: number): boolean {
    if (!this.config.infoDir) return false;

    const ticketDir = resolve(this.config.infoDir, ticketKey);

    const requiredFiles: Record<number, string[]> = {
      3: ['3_issue.json'],
      4: ['4_commits.md'],
      5: ['5_plan.md'],
      6: ['6_gherkin_scratch'],
    };

    const files = requiredFiles[stepNum];
    if (!files) return false;

    try {
      for (const f of files) {
        const p = resolve(ticketDir, f);
        if (!existsSync(p)) return false;
        const stat = statSync(p);
        if (stat.isFile() && stat.size === 0) return false;
      }
      return true;
    } catch { return false; }
  }

  async runAll(filter?: string, options?: { parallel6?: boolean; t2Only?: boolean; resetBlocked?: boolean }): Promise<void> {
    if (this.running) throw new Error('Pipeline is already running');

    this.running = true;
    this.cancelRequested = false;
    const signal = this.activateSignal();
    const startTime = Date.now();
    const ts = () => new Date().toLocaleTimeString();
    const log = (level: 'info' | 'warn' | 'error', message: string) =>
      this.emitSSE('log', { stepNumber: '-', level, message, timestamp: ts() });

    const masterRunId = this.db.createRun(1, 10, undefined, filter);
    this.emitSSE('run-started', { runId: masterRunId, stepStart: 1, stepEnd: 10, filter, mode: 'runAll' });

    try {
      // ── Thread 1: Bootstrap (Steps 1, 2) ──
      log('info', '═══ THREAD 1: BOOTSTRAP ═══');
      const s1 = await this.executeStep(1, masterRunId, null, { signal });
      if (s1.status === 'fail' || this.cancelRequested) {
        this.db.finishRun(masterRunId, 'failed', Date.now() - startTime);
        this.emitSSE('run-complete', { runId: masterRunId, status: 'failed', message: 'Step 1 failed — halting all threads' });
        return;
      }

      const s2 = await this.executeStep(2, masterRunId, null, { signal });
      if (s2.status === 'fail' || this.cancelRequested) {
        this.db.finishRun(masterRunId, 'failed', Date.now() - startTime);
        this.emitSSE('run-complete', { runId: masterRunId, status: 'failed', message: 'Step 2 failed — halting all threads' });
        return;
      }

      const allTickets: string[] = (s2.data?.tickets as any[] | undefined || []).map((t: any) => t.key);
      if (s2.data?.selectedTicket && allTickets.length === 0) allTickets.push(s2.data.selectedTicket as string);

      if (allTickets.length === 0) {
        log('warn', 'No tickets found — nothing to process');
        this.db.finishRun(masterRunId, 'completed', Date.now() - startTime);
        this.emitSSE('run-complete', { runId: masterRunId, status: 'completed', message: 'No tickets' });
        return;
      }

      log('info', `Bootstrap complete — ${allTickets.length} ticket(s): ${allTickets.join(', ')}`);

      // Initialise new tickets; reset blocked ones to queued when resetBlocked is set.
      for (const t of allTickets) {
        const existing = this.db.getTicketTracker(t);
        if (!existing) {
          this.db.upsertTicketTracker(t, { phase: 'queued' });
        } else if (options?.resetBlocked && existing.phase === 'blocked') {
          this.db.upsertTicketTracker(t, { phase: 'queued' });
          log('info', `Reset ${t}: blocked → queued`);
        }
      }

      if (s2.data?.selectedTicket) this.emitSSE('ticket-selected', { ticketKey: s2.data.selectedTicket });

      // ── Thread 2 (info gathering: steps 3→6). Threads 3+4 skipped in t2Only mode. ──
      if (options?.t2Only) {
        log('info', '═══ T2-ONLY MODE: GHERKIN GENERATION ONLY (no step 7+) ═══');
        await this.runInfoGatheringThread(masterRunId, signal, options?.parallel6 ?? false);
      } else {
        let thread2Done = false;
        let thread3Done = false;
        await Promise.all([
          this.runInfoGatheringThread(masterRunId, signal, options?.parallel6 ?? false).finally(() => { thread2Done = true; }),
          this.runImplementationThread(signal, () => thread2Done).finally(() => { thread3Done = true; }),
          this.runFinalizationThread(masterRunId, signal, () => thread3Done),
        ]);
      }

      const durationMs = Date.now() - startTime;
      const finalStatus = this.cancelRequested ? 'cancelled' : 'completed';
      this.db.finishRun(masterRunId, finalStatus, durationMs);
      this.emitSSE('run-complete', { runId: masterRunId, status: finalStatus, durationMs });
    } catch (err) {
      const durationMs = Date.now() - startTime;
      this.db.finishRun(masterRunId, 'failed', durationMs);
      this.emitSSE('run-complete', { runId: masterRunId, status: 'failed', error: String(err), durationMs });
    } finally {
      this.regenerateAutomationIndex();
      this.deactivateSignal();
      this.running = false;
    }
  }

  // Steps 3→4→5→6 per pending ticket (any phase in ['queued','info_gathered','code_reviewed','plan_drafted']).
  // Skips steps that are already done (phase check). Overwrites partials (runAll:true).
  // Uses Sonnet explicitly so the Sonnet weekly cap exhausts first.
  // Step 6: sequential by default; batches of 3 in parallel when parallel6=true.
  // bddgen failure in step 6 → cancels ALL threads immediately.
  private async runInfoGatheringThread(masterRunId: number, signal: AbortSignal, parallel6: boolean): Promise<void> {
    const ts = () => new Date().toLocaleTimeString();
    const log = (level: 'info' | 'warn' | 'error', msg: string) =>
      this.emitSSE('log', { stepNumber: '-', level, message: `[T2] ${msg}`, timestamp: ts() });

    // Sonnet-forced clone — Thread 2 always uses Sonnet regardless of TESTGEN_CLAUDE_MODEL.
    const sonnetClaude = this.services.claude.withForcedModel('claude-sonnet-4-6');
    sonnetClaude.setSignal(signal);

    const T2_PHASES = ['queued', 'info_gathered', 'code_reviewed', 'plan_drafted'];

    log('info', '═══ INFO GATHERING STARTED ═══');

    while (!this.cancelRequested) {
      const [ticket] = this.db.getTicketsByPhases(T2_PHASES);
      if (!ticket) break;

      log('info', `Processing ${ticket} — steps 3→6`);
      this.emitSSE('ticket-started', { ticket });

      // Steps 3, 4, 5: skip if already done, otherwise overwrite partials.
      let blocked = false;
      for (const stepNum of [3, 4, 5] as const) {
        if (this.cancelRequested) break;

        if (this.isStepDone(ticket, stepNum)) {
          log('info', `${ticket} — step ${stepNum} already done — skipping`);
          continue;
        }

        const out = await this.executeStep(stepNum, masterRunId, ticket, { signal, runAll: true, claude: sonnetClaude });
        if (out.status === 'fail') {
          log('error', `Step ${stepNum} failed for ${ticket} — blocked`);
          this.db.upsertTicketTracker(ticket, { phase: 'blocked' });
          blocked = true;
          break;
        }
        const stepPhaseMap: Record<number, string> = { 3: 'info_gathered', 4: 'code_reviewed', 5: 'plan_drafted' };
        this.db.upsertTicketTracker(ticket, { phase: stepPhaseMap[stepNum] });
      }
      if (blocked || this.cancelRequested) continue;

      const tcIds = this.readTcIdsFromPlan(ticket);

      if (tcIds.length === 0) {
        // No TC plan — run step 6 for the ticket as a whole.
        const tcRunId = this.db.createRun(6, 6, ticket);
        const out = await this.executeStep(6, tcRunId, ticket, { signal, runAll: true, claude: sonnetClaude });
        this.db.finishRun(tcRunId, out.status === 'fail' ? 'failed' : 'completed', 0);
        if (out.data?.bddgenFailed) {
          this.emitSSE('log', { stepNumber: 6, level: 'error', message: '⛔ PIPELINE STOPPED — bddgen failed. Fix the feature file before continuing.', timestamp: ts() });
          this.emitSSE('pipeline-stopped', { reason: 'bddgen-failed', ticket });
          this.cancelRequested = true;
          break;
        }
        if (out.status === 'fail') { this.db.upsertTicketTracker(ticket, { phase: 'blocked' }); continue; }
      } else {
        log('info', `${ticket} — step 6 for ${tcIds.length} TC(s) (${parallel6 ? 'parallel ×3' : 'sequential'})`);
        for (const tcId of tcIds) this.db.upsertTcTracker(ticket, tcId, { phase: 'queued' });

        if (parallel6 && tcIds.length > 1) {
          // Parallel: 3 TCs at a time. Each TC gets its own runId (avoids UNIQUE constraint).
          // Individual executeStep status SSE is suppressed; we emit aggregate + per-dot events ourselves.
          const BATCH = 3;
          for (let i = 0; i < tcIds.length && !this.cancelRequested; i += BATCH) {
            const batch = tcIds.slice(i, i + BATCH);

            // Announce batch: show all 3 slots as running.
            this.stepStatuses.set(6, 'running');
            this.emitSSE('step-status', { stepNumber: 6, status: 'running' });
            this.emitSSE('tc-parallel-batch', { stepNumber: 6, tcIds: batch });

            const settled = await Promise.allSettled(batch.map(async (tcId) => {
              this.emitSSE('tc-parallel-status', { stepNumber: 6, tcId, status: 'running' });
              const tcRunId = this.db.createRun(6, 6, ticket);
              const out = await this.executeStep(6, tcRunId, ticket, { signal, runAll: true, claude: sonnetClaude, tcId, suppressStepStatus: true });
              this.db.finishRun(tcRunId, out.status === 'fail' ? 'failed' : 'completed', 0);
              this.emitSSE('tc-parallel-status', { stepNumber: 6, tcId, status: out.status });
              return out;
            }));

            // Aggregate batch result and emit single step-status.
            const batchOuts = settled.map(r => r.status === 'fulfilled' ? r.value : { status: 'fail' as const, data: {} });
            const aggStatus = batchOuts.some(o => o.status === 'fail') ? 'fail'
              : batchOuts.some(o => o.status === 'warn') ? 'warn' : 'pass';
            this.stepStatuses.set(6, aggStatus);
            this.emitSSE('step-status', { stepNumber: 6, status: aggStatus });

            for (const r of settled) {
              if (r.status === 'fulfilled' && r.value.data?.bddgenFailed) {
                this.emitSSE('log', { stepNumber: 6, level: 'error', message: '⛔ PIPELINE STOPPED — bddgen failed. Fix the feature file before continuing.', timestamp: ts() });
                this.emitSSE('pipeline-stopped', { reason: 'bddgen-failed', ticket });
                this.cancelRequested = true;
                break;
              }
            }
          }
        } else {
          // Sequential.
          for (const tcId of tcIds) {
            if (this.cancelRequested) break;
            const tcRunId = this.db.createRun(6, 6, ticket);
            const out = await this.executeStep(6, tcRunId, ticket, { signal, runAll: true, claude: sonnetClaude, tcId });
            this.db.finishRun(tcRunId, out.status === 'fail' ? 'failed' : 'completed', 0);
            if (out.data?.bddgenFailed) {
              this.emitSSE('log', { stepNumber: 6, level: 'error', message: '⛔ PIPELINE STOPPED — bddgen failed. Fix the feature file before continuing.', timestamp: ts() });
              this.emitSSE('pipeline-stopped', { reason: 'bddgen-failed', ticket });
              this.cancelRequested = true;
              break;
            }
            if (out.status === 'fail') log('warn', `Step 6 failed for ${ticket}/${tcId} — continuing other TCs`);
          }
        }
      }

      if (!this.cancelRequested) {
        this.db.upsertTicketTracker(ticket, { phase: 'gherkin_done' });
        log('info', `${ticket} — info gathering complete`);
        this.emitSSE('ticket-finished', { ticket });
      }
    }

    log('info', '═══ INFO GATHERING COMPLETE ═══');
  }

  // Steps 7→8 loop per ticket until all TCs pass. Creates a fresh runId per iteration
  // to avoid the UNIQUE(run_id, step_number, ticket_key) DB constraint.
  private async runImplementationThread(signal: AbortSignal, isThread2Done: () => boolean): Promise<void> {
    const MAX_IMPL_LOOPS = 10;
    const POLL_MS = 2000;
    const ts = () => new Date().toLocaleTimeString();
    const log = (level: 'info' | 'warn' | 'error', msg: string) =>
      this.emitSSE('log', { stepNumber: '-', level, message: `[T3] ${msg}`, timestamp: ts() });

    log('info', '═══ IMPLEMENTATION LOOP STARTED ═══');

    while (!this.cancelRequested) {
      // Also resume impl_partial tickets interrupted by an outage.
      const [ticket] = this.db.getTicketsByPhases(['gherkin_done', 'impl_partial']);

      if (!ticket) {
        if (isThread2Done()) break;
        await this.sleep(POLL_MS);
        continue;
      }

      log('info', `Implementing ${ticket} — steps 7→8 loop (max ${MAX_IMPL_LOOPS} iterations)`);
      this.db.upsertTicketTracker(ticket, { phase: 'impl_partial' });
      const tcIds = this.readTcIdsFromPlan(ticket);

      let allPassing = false;
      for (let iter = 1; iter <= MAX_IMPL_LOOPS && !this.cancelRequested; iter++) {
        const iterRunId = this.db.createRun(7, 8, ticket);
        const iterStart = Date.now();
        log('info', `${ticket} — iteration ${iter}`);

        let step7Failed = false;
        if (tcIds.length === 0) {
          const s7 = await this.executeStep(7, iterRunId, ticket, { signal });
          if (s7.status === 'fail') step7Failed = true;
        } else {
          for (const tcId of tcIds) {
            if (this.cancelRequested || step7Failed) break;
            const s7 = await this.executeStep(7, iterRunId, ticket, { signal, tcId });
            if (s7.status === 'fail') step7Failed = true;
          }
        }

        if (step7Failed) {
          this.db.finishRun(iterRunId, 'failed', Date.now() - iterStart);
          log('error', `${ticket} — step 7 failed on iteration ${iter}`);
          break;
        }

        const s8 = await this.executeStep(8, iterRunId, ticket, { signal });
        this.db.finishRun(iterRunId, s8.status === 'pass' ? 'completed' : 'failed', Date.now() - iterStart);

        if (s8.status === 'pass') {
          allPassing = true;
          log('info', `${ticket} — all tests passing after ${iter} iteration(s)`);
          break;
        }

        log('warn', `${ticket} — iteration ${iter}: not all passing — re-implementing`);
      }

      this.db.upsertTicketTracker(ticket, { phase: allPassing ? 'fully_automated' : 'blocked' });
      log(allPassing ? 'info' : 'warn', `${ticket} — ${allPassing ? 'fully automated ✓' : 'blocked after impl loop'}`);
    }

    log('info', '═══ IMPLEMENTATION LOOP COMPLETE ═══');
  }

  // Steps 9→10 once per fully-automated ticket. Posts findings to the target ticket.
  private async runFinalizationThread(masterRunId: number, signal: AbortSignal, isThread3Done: () => boolean): Promise<void> {
    const POLL_MS = 2000;
    const ts = () => new Date().toLocaleTimeString();
    const log = (level: 'info' | 'warn' | 'error', msg: string) =>
      this.emitSSE('log', { stepNumber: '-', level, message: `[T4] ${msg}`, timestamp: ts() });

    log('info', '═══ FINALIZATION STARTED ═══');

    while (!this.cancelRequested) {
      const [ticket] = this.db.getTicketsByPhase('fully_automated');

      if (!ticket) {
        if (isThread3Done()) break;
        await this.sleep(POLL_MS);
        continue;
      }

      log('info', `Finalizing ${ticket} — steps 9→10`);
      this.db.upsertTicketTracker(ticket, { phase: 'results_determined' });

      const s9 = await this.executeStep(9, masterRunId, ticket, { signal });
      if (s9.status !== 'fail' && !this.cancelRequested) {
        await this.executeStep(10, masterRunId, ticket, { signal });
      }

      log('info', `${ticket} — finalization complete`);
    }

    log('info', '═══ FINALIZATION COMPLETE ═══');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private readTcIdsFromPlan(ticketKey: string): string[] {
    try {
      const planFile = resolve(this.config.infoDir, ticketKey, '5_plan.md');
      if (!existsSync(planFile)) return [];
      const content = readFileSync(planFile, 'utf-8');
      return [...content.matchAll(/^### ((?:SC|TC|EC)-\d+)/gm)].map(m => m[1]);
    } catch { return []; }
  }

  private static formatDuration(ms: number): string {
    if (!ms || ms < 0) return '—';
    const totalSec = Math.round(ms / 1000);
    if (totalSec < 60) return `${totalSec}s`;
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return s ? `${h}h ${m}m ${s}s` : `${h}h ${m}m`;
    return s ? `${m}m ${s}s` : `${m}m`;
  }

  private regenerateAutomationIndex(): void {
    try {
      const trackers = this.db.getTicketTrackers();
      if (trackers.length === 0) return;
      const tcTrackers = this.db.getTcTrackers();
      const tcByTicket = new Map<string, typeof tcTrackers>();
      for (const tc of tcTrackers) {
        if (!tcByTicket.has(tc.ticketKey)) tcByTicket.set(tc.ticketKey, []);
        tcByTicket.get(tc.ticketKey)!.push(tc);
      }
      const durationStats = this.db.getRunDurationStatsByTicket();

      const lines: string[] = [];
      lines.push('# Automation Index');
      lines.push('');
      lines.push(`_Last regenerated: ${new Date().toISOString()}_`);
      lines.push('');
      lines.push('## Tickets');
      lines.push('');
      lines.push('| Ticket | Jira Status | Phase | Last Step | Step Result | TCs | Automated | Longest Run | Last Run | Updated |');
      lines.push('|---|---|---|:---:|:---:|:---:|:---:|:---:|:---:|---|');
      for (const t of trackers) {
        const tcs = tcByTicket.get(t.ticketKey) || [];
        const tcCount = tcs.length || (t.totalTcs ?? '—');
        const passed = tcs.filter(x => x.verdict === 'PASS').length;
        const automated = tcs.length ? `${passed}/${tcs.length}` : (t.totalTcs ? `${t.automatedTcs ?? 0}/${t.totalTcs}` : '—');
        const stats = durationStats.get(t.ticketKey);
        const longest = stats ? Pipeline.formatDuration(stats.longestMs) : '—';
        const last = stats ? Pipeline.formatDuration(stats.lastMs) : '—';
        lines.push(
          `| ${t.ticketKey} | ${t.jiraStatus ?? '—'} | ${t.phase} | ${t.lastStep ?? '—'} | ${t.lastStepStatus ?? '—'} | ${tcCount} | ${automated} | ${longest} | ${last} | ${t.lastUpdated} |`
        );
      }

      if (tcTrackers.length > 0) {
        lines.push('');
        lines.push('## Test cases');
        lines.push('');
        lines.push('| Ticket | TC | Phase | Last Step | Step Result | Verdict | Updated |');
        lines.push('|---|---|---|:---:|:---:|:---:|---|');
        for (const tc of tcTrackers) {
          lines.push(
            `| ${tc.ticketKey} | ${tc.tcId} | ${tc.phase} | ${tc.lastStep ?? '—'} | ${tc.lastStepStatus ?? '—'} | ${tc.verdict ?? '—'} | ${tc.lastUpdated} |`
          );
        }
      }

      lines.push('');
      lines.push('## Phase legend');
      lines.push('');
      lines.push('- `queued` — discovered by Step 2, not yet processed');
      lines.push('- `info_gathered` — Step 3 complete (ticket reviewed)');
      lines.push('- `code_reviewed` — Step 4 complete');
      lines.push('- `plan_drafted` — Step 5 complete');
      lines.push('- `gherkin_done` — Step 6 complete (feature file written)');
      lines.push('- `impl_partial` — Step 7 ran, some TCs still failing');
      lines.push('- `fully_automated` — Step 7 passed all TCs');
      lines.push('- `tests_executed` / `results_determined` / `results_posted` / `ticket_transitioned` — Step 8/9/10/11 complete');
      lines.push('- `blocked` — last step failed; needs review');
      const indexPath = resolve(this.config.logsDir, 'AUTOMATION_INDEX.md');
      writeFileSync(indexPath, lines.join('\n') + '\n', 'utf-8');
    } catch (err) {
      // best-effort — never fail a run because the index couldn't be written
      this.emitSSE('log', { stepNumber: '-', level: 'warn', message: `AUTOMATION_INDEX write failed: ${err instanceof Error ? err.message : String(err)}`, timestamp: new Date().toLocaleTimeString() });
    }
  }

  private async executeStep(stepNumber: number, runId: number, ticketKey: string | null, options?: { parallel?: boolean; debugHeal?: boolean; runAll?: boolean; testTypes?: Array<'ui' | 'api' | 'unit'>; signal?: AbortSignal; tcId?: string; claude?: import('../../services/ClaudeService.js').ClaudeService; suppressStepStatus?: boolean }): Promise<StepOutput> {
    const stepDef = STEP_DEFINITIONS.find(d => d.number === stepNumber);
    if (!stepDef) throw new Error(`Unknown step: ${stepNumber}`);

    if (stepDef.requiresTicket && !ticketKey) {
      const msg = 'Ticket key required for this step';
      this.stepStatuses.set(stepNumber, 'fail');
      this.emitSSE('step-status', { stepNumber, status: 'fail', message: msg });
      return { status: 'fail', message: msg, artifacts: [] };
    }

    this.currentStepNumber = stepNumber;
    if (!options?.suppressStepStatus) {
      this.stepStatuses.set(stepNumber, 'running');
      this.emitSSE('step-status', { stepNumber, status: 'running' });
    }

    const stepResultId = this.db.createStepResult(runId, stepNumber, stepDef.name, ticketKey || undefined);

    // Allow per-call claude service override (used by Thread 2 to force Sonnet).
    const activeServices = options?.claude
      ? { ...this.services, claude: options.claude }
      : this.services;

    const ctx: StepContext = {
      ticketKey,
      tcId: options?.tcId ?? null,
      runId,
      stepResultId,
      projectDir: this.config.projectDir,
      config: this.config,
      services: activeServices,
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

    if (!options?.suppressStepStatus) {
      this.stepStatuses.set(stepNumber, output.status);
      this.emitSSE('step-status', { stepNumber, status: output.status, message: output.message });
    }
    this.currentStepNumber = null;

    return output;
  }
}
