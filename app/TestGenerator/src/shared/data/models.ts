export type RunStatus = 'running' | 'completed' | 'failed' | 'aborted' | 'cancelled';
export type StepStatus = 'idle' | 'running' | 'pass' | 'fail' | 'warn' | 'skip';
export type LogLevel = 'info' | 'warn' | 'error' | 'debug';
export type ArtifactType = 'json' | 'md' | 'html' | 'png' | 'jpg' | 'txt';
export type Verdict = 'PASS' | 'FAIL' | 'NOT TESTED';

export interface PipelineRun {
  id: number;
  startedAt: string;
  finishedAt: string | null;
  stepStart: number;
  stepEnd: number;
  filter: string | null;
  ticketKey: string | null;
  status: RunStatus;
  durationMs: number | null;
}

export interface StepResult {
  id: number;
  runId: number;
  stepNumber: number;
  stepName: string;
  ticketKey: string | null;
  status: StepStatus;
  startedAt: string | null;
  finishedAt: string | null;
  durationMs: number | null;
  tokenUsage: number | null;
  message: string | null;
  errorOutput: string | null;
}

export interface StepArtifact {
  id: number;
  stepResultId: number;
  name: string;
  filePath: string;
  artifactType: ArtifactType;
  sizeBytes: number | null;
}

export interface StepLog {
  id: number;
  stepResultId: number;
  timestamp: string;
  level: LogLevel;
  message: string;
}

export interface TestRun {
  id: number;
  stepResultId: number;
  ticketKey: string;
  timestampDir: string;
  verdict: Verdict | null;
  totalTcs: number | null;
  passedTcs: number | null;
  failedTcs: number | null;
}

export interface TestCaseResult {
  id: number;
  testRunId: number;
  tcId: string;
  status: string;
  stepsTotal: number | null;
  stepsExisting: number | null;
  stepsAdded: number | null;
  testOutput: string | null;
  notes: string | null;
}

export interface StepDefinition {
  number: number;
  name: string;
  requiresTicket: boolean;
}

export const STEP_DEFINITIONS: StepDefinition[] = [
  { number: 1,  name: 'Verify Jira Auth',       requiresTicket: false },
  { number: 2,  name: 'Find Ticket',            requiresTicket: false },
  { number: 3,  name: 'Review Ticket',           requiresTicket: true },
  { number: 4,  name: 'Review Code',             requiresTicket: true },
  { number: 5,  name: 'Draft Test Plan',         requiresTicket: true },
  { number: 6,  name: 'Write Gherkin Steps',     requiresTicket: true },
  { number: 7,  name: 'Write Automated Tests',   requiresTicket: true },
  { number: 8,  name: 'Execute Tests',           requiresTicket: true },
  { number: 9,  name: 'Determine Results',       requiresTicket: true },
  { number: 10, name: 'Post Results',            requiresTicket: true },
  { number: 11,  name: 'Transition Ticket',         requiresTicket: true },
  { number: 101, name: 'Check Steps',                 requiresTicket: false },
  { number: 102, name: 'Run Tests',                  requiresTicket: false },
  { number: 103, name: 'Healing',              requiresTicket: false },
  { number: 104, name: 'Decalcification',           requiresTicket: false },
  { number: 105, name: 'App Scraper',               requiresTicket: false },
];
