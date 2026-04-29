# Changelog — TestGenerator

## 2026-04-29 — Eng04 Decalcification + Eng05 App Scraper, Vitest Suite

### Engineering Pipeline — Eng04 / Eng05
- **Eng 104 — Decalcification (NEW)**: targets `tests/testrun/<ID>.flaky` files. `VERIFY_RUNS=3` per round, `MAX_ROUNDS=2`. Heals until 3 consecutive verify passes pass clean; otherwise records flaky outcomes and advances the round.
- **Eng 105 — App Scraper (renumbered from 104)**: parses `sidebar-navigation.feature`, walks each page in a logged-in browser, captures `html/<slug>.html` snapshots for property-file seeding.
- StepRegistry now: `101 Check, 102 RunTests, 103 Heal, 104 Decalcification, 105 AppScraper`.

### Vitest Unit Suite (NEW)
- 8 test files covering shared infra + server: `Config`, `Database`, `models`, `StoryLogger`, `Pipeline`, `Step`, `StepRegistry`, `server`
- 78 tests across 8 files, ~1.7s. New `vitest.config.ts`.

### Email Notifications Scaffold
- `.env.example` adds SMTP block (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`, `EMAIL_TO`, `EMAIL_DRY_RUN`); defaults to dry-run.

### Documentation (NEW)
- `CHANGELOG.md` (this file), `CLIENT-DEPLOYMENT-GUIDE.md`, `FEATURES.md`, `whats-next.md`, `heal-scenario.fix.md`

## 2026-04-27 — src/ reorganization (Option A)

- **Reorganized** `src/` into `shared/`, `services/`, `generator/`, `automator/`, `createbug/` subdirs
- **Folded** former `app/BugCreator/` into `app/TestGenerator/src/createbug/` (TicketCreator.sh + template.html)
- **Preserved** BugCreator log history under `app/TestGenerator/logs/createbug/`
- **Moved**:
  - `src/{config,data,logger}/*` → `src/shared/{config,data,logger}/`
  - `src/pipeline/{Pipeline,Step,StepRegistry}.ts` → `src/shared/pipeline/`
  - `src/pipeline/steps/Step01–07*` → `src/generator/steps/`
  - `src/pipeline/steps/{Step08–11,Eng01–04}*` → `src/automator/steps/`
  - `src/scheduler/Scheduler.ts` → `src/automator/scheduler/`
- **Behavior**: unchanged. All imports updated; `tsc --noEmit` produces only the 7 pre-existing `server.ts` errors. Server boots and resolves all imports.
- **External**: `app/BugCreator/` deleted. Skills updated to point at new TicketCreator path.

## 2026-04-26 (Unreleased)

### Engineering Pipeline (Steps 101–104)

#### ENG 101 — Check Steps
- Runs `npx bddgen` to detect missing Gherkin step definitions
- Creates `.test` files per scenario in `tests/testrun/` with test ID naming (`CASCADE-1.test`, not scenario name)
- Extracts test ID from tags (`@CASCADE-1`) with fallback to scenario name prefix
- Reports missing step count and scenario grouping

#### ENG 102 — Run Tests (rewritten)
- Runs tests **one at a time** by test ID tag (`--grep "CASCADE-1\b" --project=chromium`)
- Scans all feature files to collect test case tags, sorted alphabetically
- Streams Playwright output live to the UI via `onData` callback
- Reports Gherkin steps before each test run (scenario context in live log)
- On failure: shows which Gherkin step passed/failed with `✓`/`✗`/`-` indicators
- Stops on first failure and writes `.test` file — designed to hand off to step 103
- Skips tests that already have a pending `.test` file
- Progress counter: `[3/68] DASH-3: ...`

#### ENG 103 — Healing (major rewrite)
- **Round-based iterative healing** with max 5 rounds per scenario
- Each round creates `tests/testrun/{ID}/round-{N}/` with 4 log files:
  - `01-test-before.log` — test output before heal
  - `02-claude-prompt.log` — full prompt sent to Claude
  - `03-claude-response.log` — Claude's response
  - `04-test-after.log` — verification test output
- Round carry-forward: `round-N/04-test-after.log` → `round-N+1/01-test-before.log`
- **Previous attempts context**: from round 2+, Claude gets a summary of what was tried and failed, with instruction "Do NOT repeat the same fix"
- **Debug mode toggle**: breaks heal into 3 phases per round, one click each (test → fix → verify)
- **5-minute timeout on Claude calls** — if Claude hangs, logs the error and advances to next round
- **Claude failure handling** — timeout/error skips to next round instead of blocking
- **Progress heartbeat** — logs Claude tool calls in real time (`Claude → read`, `Claude → edit`, etc.)
- **HTML page snapshots** as DOM context — resolves `html/{feature-name}.html` + `nav-bar-{feature-name}.html`
- **Summary report** (`summary.md`) written on completion with round-by-round history
- **Prerequisite auto-chain**: if no `.test` files exist, auto-runs 101 → 102 → then heals
- Verbose step-log reporting: elapsed times, file sizes, error previews, tree-style formatting

#### ENG 104 — App Scraper (later renumbered to 105 on 2026-04-29)
- New step for scraping application pages (added to registry)

### Pipeline Infrastructure

#### Pipeline.ts
- Added `AbortController` support for cancelling running steps
- `signal` propagated to `ClaudeService` and `PlaywrightService` via `setSignal()`
- Cancel kills active child processes immediately
- `debugHeal` option flows through `runSingleStep` → `executeStep` → step context

#### PlaywrightService
- `runTest()` now runs `npx bddgen && npx playwright test` as a single shell command
- Always uses `--project chromium` (removed configurable project parameter)
- Added `onData` streaming callback for real-time output
- `AbortSignal` support — cancel kills the spawned process
- `shell: true` for `&&` chaining

#### ClaudeService
- Added `setSignal()` for abort support
- Existing `promptStreaming` unchanged

#### Step.ts
- Added `signal?: AbortSignal` to `StepContext`
- Added `debugHeal?: boolean` to options type

### UI Changes

#### Step Card Grid
- **Debug toggle button** on step 103 card — yellow crosshair icon, active state with yellow highlight
- Button immediately shows stop state on click (no waiting for SSE)
- Click-away deselects card blue border

#### Live Logs
- `gap: 6px` between timestamp, step tag, and message (was `gap: 0`)
- Step tag column widened from 72px to 80px for `[Step 103]`

#### Step Logs Tab (live streaming)
- **LIVE badge** (green, pulsing) when viewing a running step
- SSE log events stream into Step Logs tab in real time (not just Live Logs)
- Auto-refreshes when the viewed step finishes
- RUNNING section with live-appending log lines

#### SSE Improvements
- `step-status` handler: clears `runningStep` when step transitions from `running`
- Calls `updateRunBtn()` on every status change
- Auto-refreshes Step Logs tab on step completion

### Test Suite

#### Feature Files
- Deleted old Jira-named features: `SM-742.feature`, `SM-754.feature`, `SM-775.feature`, `SM-803.feature`
- New feature files with test ID tags:
  - `cascade-templates.feature` (1 scenario: CASCADE-1)
  - `import-costs.feature` (4 scenarios: IMPORT-1 to IMPORT-4)
  - `maintenance-admin.feature` (4 scenarios: MAINT-1 to MAINT-4)
  - `purchasing-tracker.feature` (4 scenarios: PURCHASE-1 to PURCHASE-4)
  - `search.feature` (1 scenario: SEARCH-1)
  - `timesheet-admin.feature` (7 scenarios: TIMESHEET-1 to TIMESHEET-7)
  - `vendor-admin.feature` (2 scenarios: VENDOR-1 to VENDOR-2)
- Updated existing features: `dashboard.feature` (26 scenarios), `nav-bar.feature` (13), `forgot-password.feature` (3), `login.feature` (1), `sidebar-navigation.feature` (2)
- All scenarios now have test ID tags (`@DASH-1`, `@NAV-1`, etc.)

#### Step Definitions
- New: `import-costs.steps.ts`, `maintenance-admin.steps.ts`, `purchasing-tracker.steps.ts`, `timesheet-admin.steps.ts`, `vendor-admin.steps.ts`
- Updated: `cascade-templates.steps.ts`, `dashboard.steps.ts`, `login.steps.ts`

#### Properties
- Updated: `cascade-templates.properties.ts`, `dashboard.properties.ts`, `import-costs.properties.ts`, `maintenance-admin.properties.ts`

### Config
- Added `test:chrome` npm script: `npx bddgen && npx playwright test --project=chromium`
- Added `edge` project back to `playwright.config.ts` alongside `chromium`
