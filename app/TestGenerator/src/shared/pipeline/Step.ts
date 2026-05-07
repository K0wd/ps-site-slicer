import { writeFileSync } from 'fs';
import { resolve } from 'path';
import type { Database } from '../data/Database.js';
import type { Config } from '../config/Config.js';
import type { StoryLogger } from '../logger/StoryLogger.js';
import type { JiraService } from '../../services/JiraService.js';
import type { ClaudeService } from '../../services/ClaudeService.js';
import type { GitService } from '../../services/GitService.js';
import type { GitLabService } from '../../services/GitLabService.js';
import type { PlaywrightService } from '../../services/PlaywrightService.js';
import type { ContextBuilder } from '../../services/ContextBuilder.js';
import type { StepStatus, ArtifactType } from '../data/models.js';

// Maps step number + status → tracker phase.
// Any 'fail' status → 'blocked'. Step 2 is handled inside Step02FindTicket itself.
const PHASE_MAP: Record<number, { pass: string; warn?: string }> = {
  3: { pass: 'info_gathered' },
  4: { pass: 'code_reviewed' },
  5: { pass: 'plan_drafted' },
  6: { pass: 'gherkin_done' },
  7: { pass: 'fully_automated', warn: 'impl_partial' },
  8: { pass: 'tests_executed' },
  9: { pass: 'results_determined' },
  10: { pass: 'results_posted' },
  11: { pass: 'ticket_transitioned' },
};

export interface StepContext {
  ticketKey: string | null;
  tcId?: string | null;
  runId: number;
  stepResultId: number;
  projectDir: string;
  config: Config;
  services: {
    jira: JiraService;
    claude: ClaudeService;
    git: GitService;
    gitlab: GitLabService;
    playwright: PlaywrightService;
    context: ContextBuilder;
  };
  db: Database;
  logger: StoryLogger;
  emitSSE: (event: string, data: unknown) => void;
  signal?: AbortSignal;
  options?: { parallel?: boolean; debugHeal?: boolean; runAll?: boolean; testTypes?: Array<'ui' | 'api' | 'unit'> };
  runPrerequisite?: (stepNumber: number) => Promise<StepOutput>;
}

export interface StepOutput {
  status: StepStatus;
  message: string;
  artifacts: Array<{ name: string; path: string; type: ArtifactType; sizeBytes?: number }>;
  tokenUsage?: number;
  data?: Record<string, unknown>;
}

export abstract class Step {
  abstract readonly stepNumber: number;
  abstract readonly stepName: string;
  abstract readonly requiresTicket: boolean;

  protected ctx!: StepContext;

  async run(ctx: StepContext): Promise<StepOutput> {
    this.ctx = ctx;
    const startTime = Date.now();

    this.log(`Starting step ${this.stepNumber}: ${this.stepName}`);

    try {
      const output = await this.execute(ctx);
      const durationMs = Date.now() - startTime;

      for (const artifact of output.artifacts) {
        ctx.db.addArtifact(ctx.stepResultId, artifact.name, artifact.path, artifact.type, artifact.sizeBytes);
      }

      ctx.db.finishStepResult(
        ctx.stepResultId,
        output.status,
        output.message,
        durationMs,
        output.tokenUsage,
        undefined
      );

      this.writeReviewArtifact(ctx, output, durationMs);
      this.updateTracker(ctx, output);

      this.log(`Step ${this.stepNumber} finished: ${output.status} — ${output.message} (${this.formatDuration(durationMs)})`);

      return output;
    } catch (err) {
      const durationMs = Date.now() - startTime;
      const errorMsg = err instanceof Error ? err.message : String(err);
      const errorStack = err instanceof Error ? err.stack : undefined;

      ctx.db.finishStepResult(ctx.stepResultId, 'fail', errorMsg, durationMs, undefined, errorStack);

      this.writeReviewArtifact(ctx, { status: 'fail', message: errorMsg, artifacts: [] }, durationMs);
      this.updateTracker(ctx, { status: 'fail', message: errorMsg, artifacts: [] });

      this.log(`Step ${this.stepNumber} FAILED: ${errorMsg}`);

      return {
        status: 'fail',
        message: errorMsg,
        artifacts: [],
      };
    }
  }

  private writeReviewArtifact(ctx: StepContext, output: StepOutput, durationMs: number): void {
    if (!ctx.ticketKey) return;
    try {
      const ticketDir = ctx.logger.initTicket(ctx.ticketKey);
      const tcSuffix = ctx.tcId ? `_${ctx.tcId}` : '';
      const reviewPath = resolve(ticketDir, `step${this.stepNumber}_review${tcSuffix}.md`);
      const lines: string[] = [];
      lines.push(`# Step ${this.stepNumber} — ${this.stepName}${ctx.tcId ? ` (${ctx.tcId})` : ''}`);
      lines.push('');
      lines.push(`- **Ticket:** ${ctx.ticketKey}`);
      if (ctx.tcId) lines.push(`- **TC:** ${ctx.tcId}`);
      lines.push(`- **Status:** ${output.status.toUpperCase()}`);
      lines.push(`- **Duration:** ${this.formatDuration(durationMs)}`);
      lines.push(`- **Generated:** ${new Date().toISOString()}`);
      lines.push('');
      lines.push('## Outcome');
      lines.push('');
      lines.push(output.message || '(no message)');
      if (output.artifacts.length > 0) {
        lines.push('');
        lines.push('## Artifacts');
        lines.push('');
        for (const a of output.artifacts) {
          lines.push(`- ${a.name} — \`${a.path}\``);
        }
      }
      if (output.status === 'fail' || output.status === 'warn') {
        lines.push('');
        lines.push('## Flags');
        lines.push('');
        lines.push(`- ${output.status === 'fail' ? '🔴 BLOCKED' : '🟡 PARTIAL'} — review the outcome above and decide whether to retry, edit inputs, or escalate.`);
      }
      writeFileSync(reviewPath, lines.join('\n') + '\n', 'utf-8');
    } catch {
      // best-effort — never fail a step because the review file couldn't be written
    }
  }

  private updateTracker(ctx: StepContext, output: StepOutput): void {
    if (!ctx.ticketKey) return;
    if (this.stepNumber === 2) return;  // Step02 manages its own tracker rows for the discovery list
    try {
      const mapping = PHASE_MAP[this.stepNumber];
      let phase: string | undefined;
      if (output.status === 'fail') phase = 'blocked';
      else if (output.status === 'pass') phase = mapping?.pass;
      else if (output.status === 'warn') phase = mapping?.warn ?? mapping?.pass;

      // In per-TC mode, write to tc_tracker scoped to the TC; also update the ticket-level last_step.
      if (ctx.tcId) {
        ctx.db.upsertTcTracker(ctx.ticketKey, ctx.tcId, {
          phase,
          lastStep: this.stepNumber,
          lastStepStatus: output.status,
          verdict: typeof output.data?.verdict === 'string' ? output.data.verdict as string : undefined,
        });
        ctx.db.upsertTicketTracker(ctx.ticketKey, {
          lastStep: this.stepNumber,
          lastStepStatus: output.status,
        });
        return;
      }

      const totalTcs = typeof output.data?.totalTCs === 'number' ? output.data.totalTCs as number : undefined;
      const automatedTcs = typeof output.data?.passCount === 'number' ? output.data.passCount as number : undefined;

      ctx.db.upsertTicketTracker(ctx.ticketKey, {
        phase,
        lastStep: this.stepNumber,
        lastStepStatus: output.status,
        totalTcs,
        automatedTcs,
      });
    } catch {
      // best-effort — never fail a step because tracker write failed
    }
  }

  protected abstract execute(ctx: StepContext): Promise<StepOutput>;

  // Strip ANSI escape sequences (terminal color/cursor codes) so logs are humanly readable.
  // Pattern: ESC [ <numbers;separators> <letter>  → SGR colors, cursor moves, line clears.
  protected stripAnsi(text: string): string {
    return String(text).replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');
  }

  protected log(message: string, level: 'info' | 'warn' | 'error' | 'debug' = 'info'): void {
    const clean = this.stripAnsi(message);
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `[${timestamp}] [Step ${this.stepNumber}]`;

    this.ctx.db.addLog(this.ctx.stepResultId, level, clean);
    this.ctx.emitSSE('log', {
      stepNumber: this.stepNumber,
      level,
      message: clean,
      timestamp,
    });

    const consoleMsg = `${prefix} ${clean}`;
    if (level === 'error') console.error(consoleMsg);
    else if (level === 'warn') console.warn(consoleMsg);
    else console.log(consoleMsg);
  }

  protected emitProgress(data: Record<string, unknown>): void {
    this.ctx.emitSSE('step-progress', {
      stepNumber: this.stepNumber,
      ...data,
    });
  }

  private formatDuration(ms: number): string {
    const secs = Math.floor(ms / 1000);
    if (secs < 60) return `${secs}s`;
    const mins = Math.floor(secs / 60);
    const remainSecs = secs % 60;
    if (mins < 60) return `${mins}m ${remainSecs}s`;
    const hrs = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return `${hrs}h ${remainMins}m ${remainSecs}s`;
  }
}
