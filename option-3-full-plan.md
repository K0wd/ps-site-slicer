# Option 3 — Full Coverage Plan

**Scope:** ~30 test files covering all of `app/TestGenerator/src/`. Production-grade mocking. ~10-15 hours.

## Setup

Builds on Option 2, plus:
- `npm install -D supertest @types/supertest` (Express route tests)
- `npm install -D @vitest/coverage-v8` (coverage reports)
- `npm install -D nock` (HTTP/CLI capture)
- Test fixtures dir: `app/TestGenerator/src/__fixtures__/`
- Mock helpers: `app/TestGenerator/src/__mocks__/{fs,child_process,better-sqlite3}.ts`

## Test files

### `shared/` (7 files)
Same as Option 2.

### `services/` (5 files)
Same as Option 2.

### `generator/steps/` (7 files)
| File | Coverage |
|---|---|
| `Step01VerifyAuth.test.ts` | mock GitService + ClaudeService → verify auth flow |
| `Step02FindTicket.test.ts` | mock JiraService → verify JQL, error on no match |
| `Step03ReviewTicket.test.ts` | mock fs.write + ClaudeService → verify summary file |
| `Step04ReviewCode.test.ts` | mock GitService.diff + ClaudeService |
| `Step05DraftTestPlan.test.ts` | mock ClaudeService → verify prompt construction, output parsing |
| `Step06WriteGherkin.test.ts` | mock fs + ClaudeService → verify .feature file output |
| `Step07WriteAutomatedTests.test.ts` | mock fs.read/write → verify .steps.ts + .properties.ts generation |

### `automator/steps/` (9 files)
| File | Coverage |
|---|---|
| `Step08ExecuteTests.test.ts` | mock PlaywrightService → verify command, exit handling |
| `Step09DetermineResults.test.ts` | parse Playwright JSON output → pass/fail logic |
| `Step10PostResults.test.ts` | mock JiraService → verify comment payload |
| `Step11TransitionTicket.test.ts` | mock JiraService → verify transition ID lookup |
| `Eng01CheckSteps.test.ts` | mock spawn(npx bddgen) → parse missing-step output |
| `Eng02RunTests.test.ts` | mock PlaywrightService → chunked run, log parsing |
| `Eng03HealScenario.test.ts` | mock fs + ClaudeService → property file patching, retry logic |
| `Eng04AppScraper.test.ts` | mock spawn → page snapshot capture |

### `automator/scheduler/` (1 file)
`Scheduler.test.ts` — fake timers, verify cron computation, start/stop, computeAllNextRuns

### `server.ts` (1 file)
`server.test.ts` — supertest against createServer, hit each endpoint with mocked Pipeline + DB + ClaudeService

### `createbug/` (1 file)
`TicketCreator.test.sh` (bats or shell) — syntax + dry-run flag handling. **Optional** since it's bash.

## Coverage targets

- shared/: ≥85% line
- services/: ≥80% line
- generator/steps/: ≥70% line
- automator/steps/: ≥70% line
- server.ts: ≥60% line (Express handler complexity)

## Pre-work required

1. Fix 7 tsc errors in server.ts (string|string[] coercion, step_number→stepNumber typo)
2. Add `__mocks__/` directory with reusable mock factories
3. Document fixture conventions in CONTRIBUTING-tests.md

## Exit criteria

- `npm test` runs all 30+ files
- Coverage thresholds met per directory
- CI integration suggested (GitHub Actions workflow)
- Pre-existing bugs found & filed as separate Jira tickets
