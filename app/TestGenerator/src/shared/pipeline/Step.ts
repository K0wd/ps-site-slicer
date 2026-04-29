import type { Database } from '../data/Database.js';
import type { Config } from '../config/Config.js';
import type { StoryLogger } from '../logger/StoryLogger.js';
import type { JiraService } from '../../services/JiraService.js';
import type { ClaudeService } from '../../services/ClaudeService.js';
import type { GitService } from '../../services/GitService.js';
import type { PlaywrightService } from '../../services/PlaywrightService.js';
import type { ContextBuilder } from '../../services/ContextBuilder.js';
import type { StepStatus, ArtifactType } from '../data/models.js';

export interface StepContext {
  ticketKey: string | null;
  runId: number;
  stepResultId: number;
  projectDir: string;
  config: Config;
  services: {
    jira: JiraService;
    claude: ClaudeService;
    git: GitService;
    playwright: PlaywrightService;
    context: ContextBuilder;
  };
  db: Database;
  logger: StoryLogger;
  emitSSE: (event: string, data: unknown) => void;
  signal?: AbortSignal;
  options?: { parallel?: boolean; debugHeal?: boolean };
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

      this.log(`Step ${this.stepNumber} finished: ${output.status} — ${output.message} (${this.formatDuration(durationMs)})`);

      return output;
    } catch (err) {
      const durationMs = Date.now() - startTime;
      const errorMsg = err instanceof Error ? err.message : String(err);
      const errorStack = err instanceof Error ? err.stack : undefined;

      ctx.db.finishStepResult(ctx.stepResultId, 'fail', errorMsg, durationMs, undefined, errorStack);

      this.log(`Step ${this.stepNumber} FAILED: ${errorMsg}`);

      return {
        status: 'fail',
        message: errorMsg,
        artifacts: [],
      };
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
