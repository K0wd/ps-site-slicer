# Option 2 — Tier 1 Plan (shared/ + services/)

**Scope:** ~12 test files covering shared/ infrastructure and services/. Heavy mocking. ~4 hours.

## Setup

Same as Option 1, plus:
- `npm install -D vitest @vitest/ui happy-dom`
- Optional: `msw` for HTTP mocks in JiraService
- In-memory SQLite via `better-sqlite3` with `':memory:'` path

## Test files

### `shared/`
| File | Coverage |
|---|---|
| `Config.test.ts` | requireEnv, defaults, env override, dataDir resolution |
| `data/Database.test.ts` | open in-memory, schema migrations, CRUD on runs/steps tables, cleanupStaleRuns |
| `data/models.test.ts` | STEP_DEFINITIONS structure |
| `logger/StoryLogger.test.ts` | mock fs, verify file path, append behavior, cleanup |
| `pipeline/Pipeline.test.ts` | mock createStep + DB; verify run lifecycle, step ordering, error paths |
| `pipeline/Step.test.ts` | base class behavior |
| `pipeline/StepRegistry.test.ts` | factory mapping (15 numbers), error case |

### `services/`
| File | Coverage |
|---|---|
| `ClaudeService.test.ts` | mock spawn → verify args, parse stdout, timeout handling |
| `JiraService.test.ts` | mock python3 spawn → verify ticket lookup, JQL escaping |
| `GitService.test.ts` | mock spawn → branch ops, commit, status |
| `PlaywrightService.test.ts` | mock spawn → command construction, exit code parsing |
| `ContextBuilder.test.ts` | tmp-dir fixture; verify file collection, cleanup |

## What we skip in Option 2

- All step classes (Step01–11, Eng01–04) — depend on real services
- Scheduler (cron timing)
- server.ts Express routes (would need supertest)
- End-to-end pipeline runs

## Exit criteria

- `npm test` runs ≥12 test files, all passing
- Coverage report ≥70% line on shared/ and services/
- Mocks documented in test file headers
- Pre-existing 7 tsc errors in server.ts addressed or excluded
