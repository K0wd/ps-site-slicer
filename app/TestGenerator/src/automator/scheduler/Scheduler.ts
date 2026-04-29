import type { Database } from '../../shared/data/Database.js';
import type { Pipeline } from '../../shared/pipeline/Pipeline.js';

export interface Schedule {
  id: number;
  name: string;
  minute: number;
  hour: number;
  interval_hours: number | null;
  step_start: number;
  step_end: number;
  filter: string | null;
  ticket_key: string | null;
  enabled: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  created_at: string;
  // camelCase aliases for compatibility
  [key: string]: any;
}

export class Scheduler {
  private timers: Map<number, ReturnType<typeof setTimeout>> = new Map();
  private checkInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private db: Database,
    private pipeline: Pipeline,
    private emitSSE: (event: string, data: unknown) => void,
  ) {}

  start(): void {
    this.computeAllNextRuns();
    this.checkInterval = setInterval(() => this.tick(), 30_000);
    this.tick();
    console.log('Scheduler started — checking every 30s');
  }

  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    for (const timer of this.timers.values()) clearTimeout(timer);
    this.timers.clear();
  }

  private tick(): void {
    const now = new Date();
    const schedules = this.db.getSchedules();

    for (const sched of schedules) {
      if (!sched.enabled) continue;

      const nextRun = sched.next_run_at ? new Date(sched.next_run_at) : null;
      if (nextRun && now >= nextRun) {
        if (!this.pipeline.isRunning) {
          this.fire(sched);
        }
      }
    }
  }

  private fire(sched: Schedule): void {
    console.log(`[Scheduler] Firing schedule "${sched.name}" (${sched.hour}:${String(sched.minute).padStart(2, '0')}) — steps ${sched.step_start}-${sched.step_end}`);

    this.emitSSE('schedule-fired', {
      id: sched.id,
      name: sched.name,
      time: `${sched.hour}:${String(sched.minute).padStart(2, '0')}`,
    });

    this.db.markScheduleRun(sched.id);
    this.computeNextRun(sched.id);

    this.pipeline.runSteps(
      sched.step_start,
      sched.step_end,
      sched.ticket_key || undefined,
      sched.filter || undefined,
    ).catch(err => {
      console.error(`[Scheduler] Run failed for "${sched.name}":`, err);
      this.emitSSE('error', { message: `Scheduled run "${sched.name}" failed: ${err}` });
    });
  }

  computeNextRun(scheduleId: number): void {
    const sched = this.db.getSchedule(scheduleId);
    if (!sched || !sched.enabled) return;

    const now = new Date();
    let next: Date;

    if (sched.interval_hours && sched.interval_hours < 24) {
      next = new Date(now);
      next.setMinutes(sched.minute, 0, 0);
      if (next <= now) {
        next.setTime(next.getTime() + sched.interval_hours * 3600_000);
      }
    } else {
      next = new Date(now);
      next.setHours(sched.hour, sched.minute, 0, 0);
      if (next <= now) {
        next.setDate(next.getDate() + 1);
      }
    }

    this.db.updateNextRun(scheduleId, next.toISOString());
    this.emitSSE('schedule-updated', { id: scheduleId, nextRunAt: next.toISOString() });
  }

  computeAllNextRuns(): void {
    const schedules = this.db.getSchedules();
    for (const sched of schedules) {
      if (sched.enabled) this.computeNextRun(sched.id);
    }
  }
}
