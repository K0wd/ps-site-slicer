import BetterSqlite3 from 'better-sqlite3';
import { resolve } from 'path';
import { mkdirSync } from 'fs';
import type {
  PipelineRun, StepResult, StepArtifact, StepLog,
  TestRun, TestCaseResult, RunStatus, StepStatus, LogLevel, ArtifactType
} from './models.js';

export class Database {
  private db: BetterSqlite3.Database;

  constructor(dataDir: string) {
    mkdirSync(dataDir, { recursive: true });
    const dbPath = resolve(dataDir, 'testgen.db');
    this.db = new BetterSqlite3(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    this.migrate();
  }

  private migrate(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS pipeline_runs (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        started_at  TEXT NOT NULL DEFAULT (datetime('now')),
        finished_at TEXT,
        step_start  INTEGER NOT NULL,
        step_end    INTEGER NOT NULL,
        filter      TEXT,
        ticket_key  TEXT,
        status      TEXT NOT NULL DEFAULT 'running',
        duration_ms INTEGER
      );

      CREATE TABLE IF NOT EXISTS step_results (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        run_id        INTEGER NOT NULL REFERENCES pipeline_runs(id),
        step_number   INTEGER NOT NULL,
        step_name     TEXT NOT NULL,
        ticket_key    TEXT,
        status        TEXT NOT NULL DEFAULT 'idle',
        started_at    TEXT,
        finished_at   TEXT,
        duration_ms   INTEGER,
        token_usage   INTEGER,
        message       TEXT,
        error_output  TEXT,
        UNIQUE(run_id, step_number, ticket_key)
      );

      CREATE TABLE IF NOT EXISTS step_artifacts (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        step_result_id  INTEGER NOT NULL REFERENCES step_results(id),
        name            TEXT NOT NULL,
        file_path       TEXT NOT NULL,
        artifact_type   TEXT NOT NULL,
        size_bytes      INTEGER
      );

      CREATE TABLE IF NOT EXISTS step_logs (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        step_result_id  INTEGER NOT NULL REFERENCES step_results(id),
        timestamp       TEXT NOT NULL DEFAULT (datetime('now')),
        level           TEXT NOT NULL DEFAULT 'info',
        message         TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS test_runs (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        step_result_id  INTEGER NOT NULL REFERENCES step_results(id),
        ticket_key      TEXT NOT NULL,
        timestamp_dir   TEXT NOT NULL,
        verdict         TEXT,
        total_tcs       INTEGER,
        passed_tcs      INTEGER,
        failed_tcs      INTEGER
      );

      CREATE TABLE IF NOT EXISTS test_case_results (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        test_run_id  INTEGER NOT NULL REFERENCES test_runs(id),
        tc_id        TEXT NOT NULL,
        status       TEXT NOT NULL,
        steps_total  INTEGER,
        steps_existing INTEGER,
        steps_added  INTEGER,
        test_output  TEXT,
        notes        TEXT
      );

      CREATE TABLE IF NOT EXISTS schedules (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        name           TEXT NOT NULL,
        minute         INTEGER NOT NULL DEFAULT 0,
        hour           INTEGER NOT NULL DEFAULT 0,
        interval_hours INTEGER,
        step_start     INTEGER NOT NULL DEFAULT 1,
        step_end       INTEGER NOT NULL DEFAULT 11,
        filter         TEXT,
        ticket_key     TEXT,
        enabled        INTEGER NOT NULL DEFAULT 1,
        last_run_at    TEXT,
        next_run_at    TEXT,
        created_at     TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    // Add interval_hours to existing databases
    try {
      this.db.exec(`ALTER TABLE schedules ADD COLUMN interval_hours INTEGER`);
    } catch { /* column already exists */ }
  }

  // --- Pipeline Runs ---

  createRun(stepStart: number, stepEnd: number, ticketKey?: string, filter?: string): number {
    const stmt = this.db.prepare(
      `INSERT INTO pipeline_runs (step_start, step_end, ticket_key, filter) VALUES (?, ?, ?, ?)`
    );
    return Number(stmt.run(stepStart, stepEnd, ticketKey || null, filter || null).lastInsertRowid);
  }

  finishRun(id: number, status: RunStatus, durationMs: number): void {
    this.db.prepare(
      `UPDATE pipeline_runs SET finished_at = datetime('now'), status = ?, duration_ms = ? WHERE id = ?`
    ).run(status, durationMs, id);
  }

  getRun(id: number): PipelineRun | undefined {
    return this.db.prepare(`SELECT * FROM pipeline_runs WHERE id = ?`).get(id) as PipelineRun | undefined;
  }

  getRecentRuns(limit = 50): PipelineRun[] {
    return this.db.prepare(
      `SELECT * FROM pipeline_runs ORDER BY started_at DESC LIMIT ?`
    ).all(limit) as PipelineRun[];
  }

  // --- Step Results ---

  createStepResult(runId: number, stepNumber: number, stepName: string, ticketKey?: string): number {
    const stmt = this.db.prepare(
      `INSERT INTO step_results (run_id, step_number, step_name, ticket_key, status, started_at)
       VALUES (?, ?, ?, ?, 'running', datetime('now'))`
    );
    return Number(stmt.run(runId, stepNumber, stepName, ticketKey || null).lastInsertRowid);
  }

  finishStepResult(id: number, status: StepStatus, message: string, durationMs: number, tokenUsage?: number, errorOutput?: string): void {
    this.db.prepare(
      `UPDATE step_results SET status = ?, message = ?, finished_at = datetime('now'), duration_ms = ?, token_usage = ?, error_output = ? WHERE id = ?`
    ).run(status, message, durationMs, tokenUsage || null, errorOutput || null, id);
  }

  getStepResults(runId: number): StepResult[] {
    return this.db.prepare(
      `SELECT * FROM step_results WHERE run_id = ? ORDER BY step_number`
    ).all(runId) as StepResult[];
  }

  // --- Step Artifacts ---

  addArtifact(stepResultId: number, name: string, filePath: string, artifactType: ArtifactType, sizeBytes?: number): number {
    const stmt = this.db.prepare(
      `INSERT INTO step_artifacts (step_result_id, name, file_path, artifact_type, size_bytes) VALUES (?, ?, ?, ?, ?)`
    );
    return Number(stmt.run(stepResultId, name, filePath, artifactType, sizeBytes || null).lastInsertRowid);
  }

  getArtifacts(stepResultId: number): StepArtifact[] {
    return this.db.prepare(
      `SELECT * FROM step_artifacts WHERE step_result_id = ?`
    ).all(stepResultId) as StepArtifact[];
  }

  // --- Step Logs ---

  addLog(stepResultId: number, level: LogLevel, message: string): void {
    this.db.prepare(
      `INSERT INTO step_logs (step_result_id, level, message) VALUES (?, ?, ?)`
    ).run(stepResultId, level, message);
  }

  getLogs(stepResultId: number, limit = 500): StepLog[] {
    return this.db.prepare(
      `SELECT * FROM step_logs WHERE step_result_id = ? ORDER BY id LIMIT ?`
    ).all(stepResultId, limit) as StepLog[];
  }

  getStepHistory(stepNumber: number, limit = 20): any[] {
    return this.db.prepare(
      `SELECT sr.*, pr.started_at as run_started_at, pr.status as run_status
       FROM step_results sr
       JOIN pipeline_runs pr ON sr.run_id = pr.id
       WHERE sr.step_number = ?
       ORDER BY sr.id DESC LIMIT ?`
    ).all(stepNumber, limit);
  }

  // --- Test Runs ---

  createTestRun(stepResultId: number, ticketKey: string, timestampDir: string): number {
    const stmt = this.db.prepare(
      `INSERT INTO test_runs (step_result_id, ticket_key, timestamp_dir) VALUES (?, ?, ?)`
    );
    return Number(stmt.run(stepResultId, ticketKey, timestampDir).lastInsertRowid);
  }

  finishTestRun(id: number, verdict: string, totalTcs: number, passedTcs: number, failedTcs: number): void {
    this.db.prepare(
      `UPDATE test_runs SET verdict = ?, total_tcs = ?, passed_tcs = ?, failed_tcs = ? WHERE id = ?`
    ).run(verdict, totalTcs, passedTcs, failedTcs, id);
  }

  // --- Test Case Results ---

  addTestCaseResult(testRunId: number, tcId: string, status: string, stepsTotal?: number, stepsExisting?: number, stepsAdded?: number, testOutput?: string, notes?: string): number {
    const stmt = this.db.prepare(
      `INSERT INTO test_case_results (test_run_id, tc_id, status, steps_total, steps_existing, steps_added, test_output, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    return Number(stmt.run(testRunId, tcId, status, stepsTotal || null, stepsExisting || null, stepsAdded || null, testOutput || null, notes || null).lastInsertRowid);
  }

  // --- Schedules ---

  createSchedule(name: string, minute: number, hour: number, stepStart: number, stepEnd: number, filter?: string, ticketKey?: string, intervalHours?: number): number {
    const stmt = this.db.prepare(
      `INSERT INTO schedules (name, minute, hour, interval_hours, step_start, step_end, filter, ticket_key) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    return Number(stmt.run(name, minute, hour, intervalHours ?? null, stepStart, stepEnd, filter || null, ticketKey || null).lastInsertRowid);
  }

  getSchedules(): any[] {
    return this.db.prepare(`SELECT * FROM schedules ORDER BY hour, minute`).all();
  }

  getSchedule(id: number): any | undefined {
    return this.db.prepare(`SELECT * FROM schedules WHERE id = ?`).get(id);
  }

  updateSchedule(id: number, fields: { name?: string; minute?: number; hour?: number; stepStart?: number; stepEnd?: number; filter?: string; ticketKey?: string; enabled?: boolean }): void {
    const sets: string[] = [];
    const vals: any[] = [];
    if (fields.name !== undefined) { sets.push('name = ?'); vals.push(fields.name); }
    if (fields.minute !== undefined) { sets.push('minute = ?'); vals.push(fields.minute); }
    if (fields.hour !== undefined) { sets.push('hour = ?'); vals.push(fields.hour); }
    if (fields.stepStart !== undefined) { sets.push('step_start = ?'); vals.push(fields.stepStart); }
    if (fields.stepEnd !== undefined) { sets.push('step_end = ?'); vals.push(fields.stepEnd); }
    if (fields.filter !== undefined) { sets.push('filter = ?'); vals.push(fields.filter || null); }
    if (fields.ticketKey !== undefined) { sets.push('ticket_key = ?'); vals.push(fields.ticketKey || null); }
    if (fields.enabled !== undefined) { sets.push('enabled = ?'); vals.push(fields.enabled ? 1 : 0); }
    if (sets.length === 0) return;
    vals.push(id);
    this.db.prepare(`UPDATE schedules SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
  }

  deleteSchedule(id: number): void {
    this.db.prepare(`DELETE FROM schedules WHERE id = ?`).run(id);
  }

  markScheduleRun(id: number): void {
    this.db.prepare(`UPDATE schedules SET last_run_at = datetime('now') WHERE id = ?`).run(id);
  }

  updateNextRun(id: number, nextRunAt: string): void {
    this.db.prepare(`UPDATE schedules SET next_run_at = ? WHERE id = ?`).run(nextRunAt, id);
  }

  close(): void {
    this.db.close();
  }
}
