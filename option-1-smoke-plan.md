# Option 1 — Smoke Tests Plan

**Scope:** ~5-10 test files for pure-logic units. No I/O mocks. ~1 hour.

## Setup

1. `cd app/TestGenerator && npm install -D vitest @vitest/ui`
2. Add to `package.json`:
   ```json
   "scripts": {
     "test": "vitest run",
     "test:watch": "vitest",
     "test:ui": "vitest --ui"
   }
   ```
3. Create `vitest.config.ts`:
   ```ts
   import { defineConfig } from 'vitest/config';
   export default defineConfig({
     test: {
       include: ['src/**/*.test.ts'],
       environment: 'node',
       globals: false,
     },
   });
   ```

## Test files (next to source as `*.test.ts`)

| Source | Test focus |
|---|---|
| `shared/config/Config.test.ts` | requireEnv throws on missing, returns env when present, defaults applied |
| `shared/pipeline/StepRegistry.test.ts` | createStep returns correct class for 1-11, 101-104; throws on unknown number; getStepNumbers returns sorted list |
| `shared/pipeline/Step.test.ts` | base class abstract surface — has expected methods |
| `shared/data/models.test.ts` | only if STEP_DEFINITIONS has helpers; otherwise skip |
| `services/ContextBuilder.test.ts` | pure helpers only (string formatters, path joining); skip if all stateful |

## What we skip in Option 1

- Database (needs SQLite setup)
- StoryLogger (fs writes)
- Services that call child_process or network
- All step files (depend on services + DB + fs)
- Pipeline orchestration
- Scheduler
- server.ts (Express routes)

## Exit criteria

- `npm test` runs and passes ≥5 test files
- No new tsc errors
- README snippet added to CHANGELOG noting test setup
