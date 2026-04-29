# Changelog

All notable changes to this project are documented here. Newest entries first.

---

## 2026-04-29 — Eng04 Decalcification, Eng05 App Scraper, Vitest Suite, Rules Reorg

### Engineering Pipeline — Eng04 & Eng05 (NEW)
- **Eng 104 — Decalcification**: picks the first `tests/testrun/<ID>.flaky` file, runs the scenario `VERIFY_RUNS=3` times, and iterates rounds (`MAX_ROUNDS=2`) of Claude-driven fixes until the test is stable across all verify passes. 15-minute Claude timeout; per-round logs under `tests/testrun/<ID>/round-N/`.
- **Eng 105 — App Scraper**: parses `tests/features/sidebar-navigation.feature` for the page list, walks each page in a logged-in browser session, captures `html/<slug>.html` snapshots used to seed property files.
- Both registered in `StepRegistry` (104, 105); neither requires a Jira ticket.

### Eng02 / Eng03 Rewrites
- **Eng 102 — Run Tests** (~440 lines, was 230): per-test execution by tag (`--grep "ID\b"`), live-streamed output, Gherkin step indicators, writes `.test`/`.flaky` files on failure.
- **Eng 103 — Healing** (~932 lines, was 151): round-based iterative healing (max 5 rounds), per-round log artifacts, previous-attempt context, debug-mode toggle, 5-min Claude timeout, HTML snapshot context.

### Vitest Unit Suite (NEW)
- New `app/TestGenerator/vitest.config.ts` and 8 test files: `Config.test.ts`, `Database.test.ts`, `models.test.ts`, `StoryLogger.test.ts`, `Pipeline.test.ts`, `Step.test.ts`, `StepRegistry.test.ts`, `server.test.ts`
- Suite total: **78 tests across 8 files** (~1.7s)

### `src/` Reorganization (Option A) — split off from prior pipeline/ tree
- `src/{config,data,logger}/` and `src/pipeline/{Pipeline,Step,StepRegistry}.ts` → `src/shared/{config,data,logger,pipeline}/`
- `src/pipeline/steps/Step01–07*` → `src/generator/steps/`; `Step08–11*`, `Eng01–04*` → `src/automator/steps/`
- `src/scheduler/` → `src/automator/scheduler/`
- `app/BugCreator/` folded into `app/TestGenerator/src/createbug/` (TicketCreator.sh + template.html); BugCreator logs preserved under `app/TestGenerator/logs/createbug/`

### TestGenerator — New Feature & Step Coverage
- New Gherkin features: `purchasing-tracker.feature`, `timesheet-admin.feature`, `vendor-admin.feature`
- Matching step definitions: `purchasing-tracker.steps.ts`, `timesheet-admin.steps.ts`, `vendor-admin.steps.ts`
- Total feature files now **10** (was 5)

### Server & Services
- `server.ts` (~86 lines changed) + `server.test.ts` (vitest, 100 lines)
- `ClaudeService` / `PlaywrightService` gained `setSignal()` / `AbortController` support — cancel kills active child processes immediately
- `PlaywrightService.runTest()` runs `npx bddgen && npx playwright test` as a single shell command, `--project chromium`, with `onData` streaming callback

### Email Notifications Scaffold (Eng05 prep)
- `.env.example` adds SMTP block: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`, `EMAIL_TO`, `EMAIL_DRY_RUN`
- Defaults to dry-run; real sends require a Gmail App Password

### Rules & Memory Reorganization (`.claude/`, `.claude-self/`)
- Rules moved out of `app/TestGenerator/rules/` and `app/BugCreator/rules/` into top-level `.claude/` and `.claude-self/`:
  - `automator/rules/backend-conventions.mdc`
  - `createbug/rules/jira-ticket-creation.md`
  - `test-generator/rules/architecture.mdc`
  - `ui/rules/{design-system,frontend-conventions}.mdc`
- New project memory under `.claude/projects/<project>/memory/` (`MEMORY.md`, `project_biteforge.md`)
- Added `.claude/settings.json` and `.claude-self/settings.json`

### Documentation
- New `app/TestGenerator/CHANGELOG.md` — module-local change log
- New `app/TestGenerator/CLIENT-DEPLOYMENT-GUIDE.md` — deployment instructions for client environments
- New `app/TestGenerator/FEATURES.md` — feature inventory of the runner
- New `app/TestGenerator/whats-next.md` — roadmap notes
- New `app/TestGenerator/heal-scenario.fix.md` — heal scenario fix notes

### CLAUDE.md
- Added **Module map** table for `app/TestGenerator/src/` (`shared/`, `services/`, `generator/steps/`, `automator/steps/`, `automator/scheduler/`, `createbug/`)
- Added KISS / terse-output rule to global instructions

### SM-754 Logs
- Refreshed `5_plan.md`, `5_plan_manual.html`, and `story.md` with the latest pipeline outputs

### Housekeeping
- Removed obsolete ticket-specific feature files: `SM-742`, `SM-754`, `SM-775`, `SM-803`
- Removed `app/BugCreator/rules/jira-ticket-creation.md` (rules now live under `.claude/`)
- Regenerated `.features-gen/` for the renamed/added features

---

## 2026-04-27 — Monorepo Restructure, Restart Control, Dual-Remote Publishing

### TestGenerator Module Reorganization
- `src/pipeline/steps/Step01–07*` → `src/generator/steps/`
- `src/pipeline/steps/Step08–11*`, `Eng01–03*` → `src/automator/steps/`
- `src/scheduler/` → `src/automator/scheduler/`
- `src/config/`, `src/data/`, `src/logger/`, `src/pipeline/` → `src/shared/{config,data,logger,pipeline}/`
- `app/BugCreator/` (template, TicketCreator.sh, logs) folded into `app/TestGenerator/src/createbug/` and `app/TestGenerator/logs/createbug/`
- Old `app/TestGenerator/rules/ui-*.mdc` removed (consolidated into `.claude/`)

### Server — Restart Endpoint
- New `POST /api/restart` — responds 200, then spawns a detached child of the current process (`process.argv`) and `process.exit(0)`. Works with or without an external supervisor.
- Added `src/server.test.ts` (vitest) with 2 tests covering response shape and the spawn+exit sequence. Suite total: **78 tests across 8 files**.

### UI — Restart Button + White Action Buttons
- New **Restart** button in the bottom-panel actions row, between **Insights** and **Clear**. Confirms before firing, polls `/api/status` until the new process is up, then reloads.
- `.btn-clear` restyled: white border + white text on transparent background, subtle translucent fill on hover. Applies to all 3 panel-action buttons.

### Test Suite — New Feature Coverage
- New Gherkin features: `cascade-templates`, `import-costs`, `maintenance-admin`, `purchasing-tracker`, `search`, `timesheet-admin`, `vendor-admin`
- New step definitions for each, plus additions to `dashboard.steps.ts`, `login.steps.ts`, `cascade-templates.steps.ts`
- `tests/properties/maintenance-admin.properties.ts` updated
- Removed obsolete `.features-gen/tests/features/SM-1105.feature.spec.js`

### Publishing — Dual Remote
- New `scripts/push-both.sh` — pushes the current branch to both `origin` (GitHub) and `gitlab`, forcing `~/.ssh/fulcrum` via `GIT_SSH_COMMAND` (no global SSH config changes). Supports `-y` to skip the confirmation prompt.
- One-time setup required before first GitLab push: `git remote add gitlab git@gitlab.com:powerslice-software-development/sm-test-artifacts.git`

---

## 2026-04-26 — Engineering Pipeline, Prerequisite Auto-Run, UI Overhaul

### Engineering Steps (NEW — Steps 101–103)
- **Eng 101 — Check Steps**: runs `npx bddgen`, parses missing step definitions, writes structured `.test` files to `tests/testrun/` grouped by scenario
- **Eng 102 — Run Tests**: runs Playwright with `--project=edge`, parses test failures, writes `.test` files with error output and Gherkin context
- **Eng 103 — Healing**: auto-chains 101→102, picks the first `.test` file, calls Claude with streaming to analyze and fix the failure, verifies the fix with a targeted test run, removes the `.test` file on success
- Engineering steps do not require a Jira ticket — registered in `StepRegistry` at numbers 101–103
- Pipeline handles step numbers ≥100 as "tool steps" that skip ticket discovery

### Prerequisite Auto-Running
- Steps 6–11 now auto-run prerequisite steps when required inputs are missing
- `StepContext` gained `runPrerequisite(stepNumber)` callback — runs a prerequisite step inline with full SSE status updates
- Step 6 auto-runs step 5 if `5_plan.md` is missing; step 7 auto-runs step 6; step 8 auto-runs steps 5 and 7; steps 9–11 auto-run step 7/8/9 as needed
- Each prerequisite emits its own `step-status` SSE events so the UI reflects the chain in real time

### Parallel/Sequential Toggle
- Steps 6 and 7 now accept a `parallel` option via `ctx.options`
- UI shows a toggle button on step 6 and 7 cards — parallel (default for step 6) or sequential (default for step 7)
- Step 6: Claude calls per test case run in parallel or sequentially based on the toggle
- Step 7: test case processing runs in parallel or sequentially based on the toggle

### UI — Pipeline Tabs
- Pipeline grid split into two tabs: **Quality** (steps 1–11) and **Engineering** (steps 101–103)
- Tab switching with dedicated icons (checkmark for Quality, wrench for Engineering)
- Step cards now use `data-step-number` attribute for reliable selection instead of index-based lookup

### UI — Ticket Creator Tab
- New bottom panel tab for creating Jira tickets via Claude
- Form: type selector (Bug/Task/Story/Epic), component input, title, description
- Queue system: add multiple tickets, then batch-create via `POST /api/bug-draft`
- Uses BugCreator rules and HTML template for field-accurate Jira drafts
- Queue items show status (pending → processing → done/error) with color-coded type badges

### UI — Ticket Autocomplete
- Ticket input now has a `<datalist>` populated from `GET /api/tickets`
- API scans `TestGenerator/logs/` directories for known ticket keys with plan/feature status

### UI — Claude Status & Insights
- **Status button**: checks Claude CLI version via `GET /api/claude/status`
- **Insights button**: triggers `claude -p "/insights"` via `POST /api/claude/insights/generate`
- **Insights link**: appears when report exists, links to `GET /api/claude/insights/report`

### UI — Resizable Bottom Panel
- Added drag handle between main content and bottom panel
- Mouse drag resizes panel height (clamped between 100px and 80vh)
- Bottom panel now uses `flex-shrink: 0` with explicit height instead of `min-height`

### Server API Additions
- `GET /api/tickets` — returns ticket directories from logs with plan/feature metadata
- `POST /api/bug-draft` — Claude drafts a Jira ticket from a brief, saves HTML to `data/bug-drafts/`
- `GET /api/bug-drafts` — lists saved drafts
- `GET /api/bug-drafts/:filename` — serves a draft HTML file
- `GET /api/claude/status` — returns Claude CLI version
- `POST /api/claude/insights/generate` — runs insights generation
- `GET /api/claude/insights` — checks if insights report exists
- `GET /api/claude/insights/report` — serves the insights HTML report

### Pipeline & SSE Improvements
- `run-complete` SSE event now includes the step's `message` field
- `executeStep` emits `step-status` with `fail` status when a ticket-required step has no ticket key
- `runSingleStep` accepts `options` parameter (passed through to step context)

### Scheduler Fix
- Fixed `Scheduler.tick()` condition: `!nextRun || now >= nextRun` → `nextRun && now >= nextRun`
- Previously, schedules with `null` next_run_at would fire on every 30s tick

### Startup
- Sets `claude config set reasoning_effort low` on server startup
- `npm run dev` shortcut added to root `package.json`

### Rules
- **automation.mdc** — added "Gherkin Writing Rule" (reuse existing step text first) and "Step Implementation Rule" (one step at a time, prove-then-record loop)
- **effective-rules-summary.mdc** — added condensed versions of both rules

### Log Cleanup
- Deleted completed ticket log directories: SM-1030, SM-1032, SM-1049, SM-1053, SM-1064, SM-1077, SM-1103, SM-864, SM-934, SM-939
- Deleted staging and state files (`.current_chomp`, `.current_test_run`, `.current_ticket`)
- Updated SM-754 and SM-1085 logs with latest pipeline outputs

### Gitignore
- Added `.DS_Store`, `html/`, `.features-gen/`, `test-archives/`, `tests/testrun/`, `logs/`, `app/TestGenerator/data/`, `app/TestGenerator/logs/`, `app/BugCreator/logs/`
- Fixed paths from `TestGenerator/logs/` to `app/TestGenerator/logs/`
- Removed tracked `.DS_Store` files from git index

### FLOWCHART.md
- Comprehensive rewrite with full architecture documentation

---

## 2026-04-21 — TestGenerator UI: Bug Creator, Scheduler Frequency, Run History, Step Logs

### Ticket Creator (NEW — integrated from BugCreator app)
- Bottom panel split-screen: left = Live Logs / Step Logs / Run History, right = Ticket Creator
- Always visible alongside logs — enter a brief, Claude drafts a Jira-ready HTML ticket
- Uses company rules (`jira-ticket-creation.md`) + HTML template for field-accurate Jira drafts
- Preview renders in iframe, past drafts listed below
- Drafts saved to `data/bug-drafts/` as HTML files
- API: `POST /api/bug-draft`, `GET /api/bug-drafts`, `GET /api/bug-drafts/:filename`

### Schedule Modal Redesign
- Removed Steps range fields (auto-set from the step card clicked)
- Added frequency pill selector: 1h, 2h, 4h, 6h, 8h, 12h, Daily
- Time preview dynamically updates based on frequency mode
- Backend: added `interval_hours` column to schedules table with auto-migration
- Scheduler `computeNextRun` handles interval-based schedules (not just daily)

### Run History + Step Logs
- History rows now show **step result circles** (green/red/yellow) per step
- Clicking a history row opens **drill-down view** with step-by-step results, logs, errors
- New **Step Logs** tab — click any step card to see its full execution history
- Selected card gets blue highlight border and retains last pass/fail/warn status
- `/api/status` merges last run's step results so cards persist across server restarts

### Step Status Improvements
- "No eligible tickets found" changed from fail (red) to warn (yellow)
- Pipeline no longer marks "no tickets to process" as failed — completes gracefully
- `run-started` no longer resets all step statuses to idle — each step retains last result

### Scheduler Bug Fix
- Fixed snake_case vs camelCase mismatch in Scheduler.ts — `better-sqlite3` returns `next_run_at` but code read `nextRunAt` (always undefined), causing every enabled schedule to fire on every 30s tick

### Run Button Fix
- Main Run button is never disabled — server rejects with 409 if pipeline is busy
- `runSingleStep` now emits `run-started` SSE event for UI consistency

### UI Polish
- Filter defaults to "My Tickets"
- Favicon: red "O" from PowerSlice logo as SVG
- Warn status styled yellow throughout (detail view, history, step logs)

---

## 2026-04-15 — Bite: Trimmed Jira Payload, Token Tracking, Step 6 Fix

### Step 3 — Review Ticket (`bite/steps/step3-review-ticket-info.sh`)
- Added `--fields` filter to `get-issue` API call — requests only 21 fields instead of all 93
- Strips top-level Jira keys down to `key` + `fields` (drops `expand`, `id`, `self`)
- Uses temp files instead of shell variables to avoid zsh encoding issues with unicode in Jira responses
- Removed `chomp_code` for issue details to stop dumping full JSON into the journey log
- Prints human-readable summary line (field count + byte size)
- **Payload reduction:** 28–47% smaller depending on ticket (SM-1105: 114 KB → 80 KB, SM-864: 152 KB → 78 KB)
- Kept fields: `summary`, `description`, `issuetype`, `status`, `priority`, `parent`, `assignee`, `reporter`, `labels`, `components`, `duedate`, `created`, `updated`, `attachment`, `environment`, `comment`, `fixVersions`, `versions`, `issuelinks`, `subtasks`, `customfield_10000`
- Dropped: `worklog` (25 KB), 48 null fields, all time-tracking fields, votes, watches, progress counters

### Step 5 — Draft Test Plan (`bite/steps/step5-draft-test-plan.sh`)
- Both Claude CLI calls (`5_plan.md` and `5_plan_manual.md`) now use `--output-format json` to capture token usage
- Token counts extracted and reported per call and as step total
- Writes token total to `$BITE_TOKEN_FILE` for the orchestrator timing summary

### Step 6 — Write Gherkin Steps (`bite/steps/step6-write-gherkin-steps.sh`)
- **Fixed FAIL bug**: `npx bddgen` non-zero exit now handled with `|| BDDGEN_EXIT=$?` instead of bare assignment — prevents `set -e` from aborting the script before the exit code is captured
- Parallel Claude CLI calls now use `--output-format json` for token tracking
- Each background process writes token count to `6_gherkin_scratch/<TC-ID>_tokens.txt`
- Token totals aggregated after all processes complete and reported to orchestrator

### Bite Runner (`bite.sh`)
- **Timing summary redesigned**: removed Start and End columns, added Tokens Used column
- New columns: `Step | Name | Duration | Tokens Used | Status`
- Token tracking infrastructure: each step receives `$BITE_TOKEN_FILE` env var; steps that call Claude write their token total to this file
- Steps without Claude usage show `-` in the Tokens Used column

---

## 2026-04-14 — Bite Pipeline Cleanup: Gitignore Logs, Markdown Log Files, Consolidate Steps

### Bite Logs
- Added `bite/logs/` to `.gitignore` — log artifacts are no longer tracked in git
- Removed all previously tracked log files (4 SM-754 runs across 13-Apr and 14-Apr)

### Log File Naming (`chomp-logger.sh`)
- Renamed all log file extensions from `.txt` to `.md` for markdown consistency:
  - `1_auth.txt` → `1_auth.md`, `3_attachments.txt` → `3_attachments.md`, `4_commits.txt` → `4_commits.md`, `4_changed_files.txt` → `4_changed_files.md`
  - Gherkin scratch files: `TC-01_prompt.txt` → `TC-01_prompt.md`, `TC-01.log` → `TC-01_log.md`, added `TC-01_section.md`
  - Execution/results: `7_execution_log.txt` → `8_execution_log.md`, `7_results.txt` → `8_results.md`
  - Report: `8_test_report.md` → `9_test_report.md`, `8_prompt.txt` → `9_prompt.md`, `8_report_log.txt` → `9_report_log.md`
  - New automation step files: `7_prompt.md`, `7_automation_log.md`, `7_automation_ready.md`

### Step Script Changes
- **step1-verify-auth.sh** — Auth output now written as structured markdown with date header and fenced code block
- **step2-find-ticket.sh** — Removed raw JSON echo to terminal (JSON goes to log file only)
- **step7-write-automated-tests.sh** — Refactored with updated log paths for the `.md` naming scheme
- **step8-execute-tests.sh** — Updated result/log file references to `.md`
- **step9-determine-results.sh** — Updated file references to `.md`
- **step10-post-results.sh** — Results file path updated to `.md`
- **step11-transition-ticket.sh** — Results file path updated to `.md`

### Steps Removed
- **step3-review-ticket.sh** — Deleted (functionality consolidated into renamed `step3-review-ticket-info.sh`)
- **step4-review-code.sh** — Deleted (functionality consolidated into renamed `step4-review-ticket-code-change.sh`)
- **bite.sh** — Updated step 3/4 references to new script names

### Documentation
- **CLAUDE.md** — Added "Bite Pipeline Rules" section: no raw JSON to terminal, KISS on step scripts

---

## 2026-04-14 — Bite Pipeline Overhaul, Login Scenario Merge, Chromium-Only

### Bite Runner (`bite.sh`)
- Moved `bite/bite.sh` → `bite.sh` (project root) — run as `./bite.sh 1-11 SM-XXX`
- `BITE_DIR` now resolved as `$PROJECT_DIR/bite` to support root-level invocation
- Extended pipeline from 10 to **11 steps** with range validator updated to `1-11`
- Added per-step timing instrumentation (epoch seconds, bash 3 / macOS compatible):
  - Each step prints its start time and elapsed duration inline after completion
  - Tabular timing summary at run end and on failure: Step | Name | Start | End | Duration | Status
  - `now_epoch()` / `format_duration()` helpers (auto-scales: `42s`, `3m 12s`, `1h 5m 30s`)

### Step 2 — Find Ticket (`bite/steps/step2-find-ticket.sh`)
- Project filter changed from `project in (SM, 'SM-PWA')` → `project = SM` only
- `--max-results 1` restored as hardcoded default

### Step 6 — Write Gherkin Steps (`bite/steps/step6-write-gherkin-steps.sh`) *(renamed + rewritten)*
- Renamed from `step6-write-tests.sh`
- **Parallel per-TC execution**: extracts each `TC-XX` / `EC-XX` test case from `5_plan.md` and launches one focused `claude -p` call per test case in parallel (background `&`)
- Each prompt is minimal: single test case content + existing step signatures (not full file content) → avoids 500 API errors from oversized prompts
- Results stored in `6_gherkin_scratch/<TC-ID>.gherkin` scratch files per test case
- Waits for all PIDs, tracks pass/fail per TC
- **Compile pass**: merges all scenario blocks in strict chronological order (TC-01…TC-NN then EC-01…EC-NN) into `tests/features/<page>.feature`; appends to existing file if present, otherwise creates with `Feature:` header
- Failed TCs get a `TODO` placeholder so chronological position is preserved
- **`npx bddgen` runs automatically** at the end of the step to regenerate `.features-gen/` test files
- Per-TC prompts include the canonical `login.feature` → `login.steps.ts` pattern as a reference example
- IMPORTANT RULES: always read `tests/features/` and `tests/steps/` before writing new steps; reuse existing phrasings exactly

### Step 7 — Write Automated Tests (`bite/steps/step7-write-automated-tests.sh`) *(new)*
- New step between Gherkin generation (6) and test execution (8)
- Reads generated feature + properties files, checks every Gherkin step has a matching step definition
- Fixes missing imports, adds missing step definitions, verifies compilation via `npx bddgen`
- Writes `7_automation_ready.txt` summary: step coverage (DEFINED / ADDED / MISSING), compile check, run check

### Steps 8–11 — Renamed
- `step7-execute-test-plan.sh` → `step8-execute-tests.sh` (results file: `8_results.txt`)
- `step8-determine-result.sh` → `step9-determine-results.sh` (report: `9_test_report.md`)
- `step9-post-results.sh` → `step10-post-results.sh`
- `step10-transition-ticket.sh` → `step11-transition-ticket.sh`
- All internal step numbers, chomp_step calls, echo strings, and file references updated

### VS Code — Cucumber Extension Fix (`.vscode/settings.json`)
- Added `cucumber.features` and `cucumber.glue` settings for the official `CucumberOpen.cucumber-official` extension
- Fixes "Undefined step" squiggles that appeared on every step in feature files — the official extension uses different config keys from `cucumberautocomplete.*`

### Playwright Config (`playwright.config.ts`)
- Reduced browser projects from 5 (firefox, chromium, edge, webkit, edge-mobile) to **chromium only**
- Removes dependency on `msedge` channel which is not installed on this machine

### Login Feature (`tests/features/login.feature`)
- Merged 3 separate scenarios into **1 combined scenario** to reduce test time
- All 3 scenarios tagged `@smoke`
- Comments added to separate UI branding checks from functional navigation steps

### Login Steps (`tests/steps/login.steps.ts`)
- **Soft assertions** (`expect.soft`) applied to all UI visibility checks (`I should see...`) — failures are recorded but do not abort the test, isolating visual regressions from functional failures
- **Hard assertions** kept for navigation and functional steps (`I should be redirected`, `I should be on the dashboard`) — these abort immediately on failure
- Sections labelled: Navigation | UI branding checks | Actions

### npm Scripts (`package.json`)
- `npm run test` now runs only `@smoke` tagged scenarios via `--grep @smoke`

---

## 2026-04-14 — Bite: Timing Summary, Step 6b Implementation Pass, Structured Test Report

### Bite Runner (`bite/bite.sh`)
- Added per-step timing instrumentation using epoch seconds (bash 3 / macOS compatible)
- `now_epoch()` / `format_duration()` helpers format durations as `Xh Ym Zs`
- Each step prints its start time and elapsed duration inline after completion
- `step_name()` function maps step numbers to human-readable names (e.g. "Write Tests")
- Tabular timing summary printed at run end (and on failure) with columns: Step | Name | Start | End | Duration | Status
- Total run duration shown in the footer

### Step 6 — Write Tests (`bite/steps/step6-write-tests.sh`)
- **Step 6a** (code generation): Changed ticket context from inlined JSON (too large) to file path references; Claude reads them on demand via the Read tool when the test plan lacks detail
- **Step 6b** (Playwright implementation): New second pass that reads 6a-generated features, properties, and step stubs, then rewrites step definitions with proper Playwright logic — correct imports, locator patterns, assertions (`toBeVisible`, `toHaveURL`, `toContainText`), deterministic waits (`waitForURL`, `waitForLoadState`), and login step reuse
- Journey log entries now prefixed `6a`/`6b` for clarity; 6b skips automatically if 6a produced no files

### Step 8 — Determine Result (`bite/steps/step8-determine-result.sh`)
- Renamed scope: now "Determine Final Result & Generate Test Report"
- Loads `.env` for `BASE_URL` (used in report header)
- Collects available screenshots from `test-results/` directory
- Uses Claude CLI to generate `8_test_report.md` — a structured Markdown report with table: Test Name | Test Steps | Results per Step | Image Proof
- Report prompt enforces per-step result numbering, relative screenshot paths, and "NOT TESTED" for unexecuted cases
- Saves prompt to `8_prompt.txt` and generation log to `8_report_log.txt`

### Chomp Logger (`bite/steps/chomp-logger.sh`)
- Updated artifact list comment to include new step 6b files (`6b_prompt.txt`, `6b_implementation_log.txt`) and step 8 report files (`8_test_report.md`, `8_prompt.txt`, `8_report_log.txt`)

### Housekeeping
- Removed stale SM-754 run log artifacts from `bite/logs/13-Apr-26/` (three partial runs from 08:56, 08:59, 09:01)

---

## 2026-04-13 — Bite: Automated QA Pipeline via Claude CLI

### Bite Pipeline (`bite/`)
- Created `bite/` — a CLI-driven QA automation pipeline that uses Claude Code CLI + Jira API to test tickets end-to-end
- 10-step pipeline: auth → find ticket → review → code review → test plan → write tests → execute → determine result → post to Jira → transition ticket
- `bite/bite.sh` — sequential step runner with range support (`./bite.sh 1-6 SM-754`)
- `bite/chomp.sh` — journey log viewer (`summary`, `list`, `tree`, `latest`)
- `bite/jira_api.py` — portable Jira REST API helper (reads credentials from `.env` or `.jira-config.json`, certifi SSL fix for macOS)
- `bite/steps/chomp-logger.sh` — shared journey logger with Jira link support, collapsible code blocks
- Journey logs stored as `bite/logs/<dd-MMM-yy>/<HH:MM-AM/PM>/<TICKET>/story.md` with all artifacts (issue, comments, attachments, commits, plan, test results) bundled per ticket with step-number prefixes

### Step Scripts (`bite/steps/`)
- `step1-verify-auth.sh` — Jira API authentication check
- `step2-find-ticket.sh` — JQL search for next Testing ticket or validate specific key
- `step3-review-ticket.sh` — fetch issue details, comments, attachments
- `step4-review-code.sh` — find git commits and changed files for ticket
- `step5-draft-test-plan.sh` — Claude CLI generates test plan from ticket context
- `step5b-write-tests.sh` — Claude CLI generates Playwright-BDD test code (feature + steps + properties) following POM conventions from `.claude/test-automation-expert/rules/`
- `step6-execute-test-plan.sh` — Claude CLI + Playwright executes test plan
- `step7-determine-result.sh` — extracts PASS/FAIL/NOT TESTED from results
- `step8-post-results.sh` — uploads screenshots and posts results comment to Jira
- `step9-transition-ticket.sh` — transitions ticket (Verify or QA Failed)

### macOS Scheduler
- `bite/run-qa.sh` — hourly runner with 5PM-5AM time window
- `bite/setup-scheduler.sh` — installs macOS launchd agent (`com.fulcrum.sm-qa-automation`)

### Configuration
- Added Jira credentials (`JIRA_EMAIL`, `JIRA_API_TOKEN`, `JIRA_BASE_URL`) to `.env`
- Added Claude CLI reference section to `.claude/test-automation-expert/rules/automation.mdc`
- Added markdown preview as default for `.md` files in VS Code settings

### Documentation
- Created `bite/QA_AUTOMATION_SETUP_GUIDE.md` — macOS setup guide
- Updated `README.md` with Bite section

---

## 2026-04-12 — Workspace Cleanup & Mac Migration

### Workspace Configuration Overhaul
- Renamed workspace from "PWA - sm-pwa (Next.js)" to "PS Site Slicer"
- Moved editor/file/TypeScript/git settings from `ps-site-slicer.code-workspace` into `.vscode/settings.json` (workspace file now delegates to folder settings)
- Removed all legacy PHP, CakePHP, Next.js, Tailwind, and PowerShell configuration
- Removed legacy MCP servers (`cakephp-sm`, `filesystem`) from `.vscode/mcp.json`

### Extension Recommendations Cleanup
- Removed PHP extensions (`intelephense`, `php-debug`, `php-namespace-resolver`, `php-docblocker`)
- Removed React/Tailwind extensions (`es7-react-js-snippets`, `tailwindcss`)
- Removed Windows-specific extensions (`ms-vscode.powershell`)
- Removed unused extensions (`auto-rename-tag`, `todo-highlight`, `mysql-client2`, `gitlab-workflow`)
- Fixed Claude Code extension ID: `anthropics.claude-code` → `anthropic.claude-code`

### Mac Platform Adaptation
- Changed terminal default profile from Windows PowerShell to macOS zsh
- Changed `start` (Windows) to `open` (macOS) for URL-opening tasks
- Simplified task commands to use npm scripts (`npm run test:ui`, `npm run test:report`)
- Removed Next.js and PHP XDebug launch configurations

### Documentation Split
- Split `README.md` into platform-specific files:
  - `README-MAC.md` — bash commands, `cp`, `&&` chaining, `open` for URLs, `mac-setup.sh` reference
  - `README-WIN.md` — PowerShell commands, `Copy-Item`, `if ($?)` chaining, `start` for URLs
- `README.md` is now a slim pointer to both platform READMEs and test coverage

### VS Code Settings Enhancements
- Added `editor.formatOnSave`, `editor.tabSize: 2`, `editor.rulers: [100]`
- Added ESLint auto-fix on save
- Added `files.autoSave: onFocusChange`
- Added file exclusions for `node_modules`, `.git`, `test-results`, `playwright-report`, `.features-gen`
- Added `typescript.tsdk` and workspace TypeScript SDK prompt
- Added `chat.agent.enabled` and `chat.defaultProvider: claude`

---

## 2026-04-12 — Nav Bar Feature, Sidebar Navigation Merge, Full Page Snapshots

### Nav Bar Feature (13 new scenarios)
- Created `tests/features/nav-bar.feature` with 13 dashboard-focused scenarios:
  - **7 display checks**: sidebar toggle button, navbar brand link, refresh icon, dashboard icon, notifications icon + badge, contact support icon, search input + button
  - **6 interaction tests**: toggle sidebar collapse/expand, navigate via brand, refresh, open notifications panel, open contact support panel, search from navbar
- Created `tests/steps/nav-bar.steps.ts`:
  - Generic `I should see the {string} in the nav bar` step using element map lookup
  - Generic `I click the {string} in the nav bar` step with `dispatchEvent` fallback
  - Sidebar toggle validation via sidebar width measurement (< 200px = collapsed)
  - Notifications/contact support panel visibility checks
  - Navbar search with URL verification
- Created `tests/properties/nav-bar.properties.ts`:
  - 10 XPath selectors for all navbar elements (sidebar toggle, brand, refresh, dashboard icon, notifications, badge, contact support, search input, search button)
  - `NAV_BAR_ELEMENTS` map for Gherkin-facing element name → XPath lookup

### Sidebar Navigation & Nav Bar Merge
- Merged redundant per-page Scenario Outlines: sidebar navigation now verifies nav bar persistence (toggle, search, notifications) on every page visit — no duplicate navigation across features
- `sidebar-navigation.feature` handles all per-page testing (navigate + verify route + check nav bar + save snapshot)
- `nav-bar.feature` handles only dashboard-specific navbar display and interaction tests
- Removed duplicate `I navigate to` step and nav bar snapshot step from `nav-bar.steps.ts`

### Sidebar Navigation Updates
- Added **Cascade Templates** (`/spa/main/cascade-template-admin`) — new sidebar item discovered from live app HTML
- Fixed **Report DB** route: `/spa/admins/pma` → `/spa/pma3` (server redirects to `/spa/pma3/`)
- Fixed **Account Management** route: `/spa/users/vendorselfedit` → `/spa/dashboard/index` (permission-based redirect for test user)
- Improved sidebar click step: added direct `page.goto(href)` fallback when sidebar click doesn't change the URL
- Total sidebar pages: **75** navigable + **3** parent menus = **78 scenarios**
- Created `tests/properties/cascade-templates.properties.ts` with sidebar navigation XPaths

### Full Page htmlBody Snapshots (75 pages captured)
- Ran full sidebar navigation suite on Edge — captured htmlBody for all 75 navigable sidebar pages
- All snapshots saved to `html/<slug>.html` with complete page DOM
- Total HTML snapshots in `html/`: **81** (75 sidebar pages + 6 pre-existing: login, password, forgot-password, home, home-with-modal, dashboard)
- All snapshots ready for next phase: building page-specific properties files with real inputs, buttons, tables, and forms

### Sidebar Page Surfing Scripts
- Created `scripts/surf-sidebar.ts`:
  - Launches Edge browser, logs in, surfs all navigable sidebar pages
  - Captures full HTML snapshots and extracts actionable elements (inputs, buttons, tables, etc.)
  - Auto-generates stub properties files with XPaths derived from element attributes
  - Generates `sidebar-surfing-report.md` with success/error/skipped summary
- Created `scripts/generate-sidebar-properties.ts`:
  - Offline generator that creates stub properties files from the sidebar items list
  - Produces sidebar navigation XPaths, icon XPaths, text XPaths, and Gherkin-facing element maps
  - Skips existing files to avoid overwriting curated properties

### Properties Files (Page Object Model)
- Generated individual properties files for all sidebar pages in `tests/properties/`:
  - 75 navigable page stubs + 3 parent menu stubs + `nav-bar.properties.ts`
  - Each sidebar file exports: sidebar XPath, icon XPath, text XPath, and an element map
  - Marked with TODO for page-specific elements to be populated from htmlBody snapshots
- Total properties files: **82** (4 existing + 78 new)

### Claude Agent Configurations
- Added `.claude/client-powerslice/` — client-specific agent config with brain and wiki files
- Added `.claude/qa-expert/` — QA domain expert agent with ISTQB reference materials
- Added `.claude/test-automation-expert/` — test automation agent with specialized rules
- Added `.claude/git-and-code-org/` — git workflow and code organization agent
- Removed `.claude/quality.md` (content moved to `qa-expert` agent)

### Documentation
- Updated `README.md`:
  - Test coverage updated from 31 to **122 scenarios**
  - Added Nav Bar section (13 scenarios)
  - Updated Sidebar Navigation section (78 scenarios, including nav bar persistence checks)
  - Updated project structure with all new files, steps, and properties
  - Added nav bar and sidebar navigation run examples
- Updated `CHANGELOG.md`

---

## 2026-04-09 — Test Runner, Lint Fixes, Multi-Machine Sync

### Cucumber Test Runner Integration
- Added `alexkrechik.cucumberautocomplete` and `CucumberOpen.cucumber-official` extensions
- Configured `.vscode/settings.json` with Cucumber autocomplete for steps and features
- Added `.feature` → `cucumber` file association for Gherkin syntax highlighting
- Added "Generate BDD Specs" and "Run Playwright Tests (Edge Only)" tasks to workspace
- Tests now visible in VS Code Testing sidebar (Playwright Test Explorer)

### Lint Fixes
- Installed `@types/node` to resolve `Cannot find name 'process'` TypeScript errors in `playwright.config.ts`

### Flakiness Detection
- Enabled 1 retry locally (`retries: 1`) to detect flaky tests
- Flaky tests show as yellow in the HTML report (pass on retry)
- CI retains 2 retries

### Documentation
- Added "Flakiness Detection", "Multi-Machine Sync", and "VS Code Integration" sections to README
- Updated CHANGELOG

---

## 2026-04-08 — Dashboard Widgets, Forgot Password, Multi-Browser & Archiving

### Dashboard Widget Tests (20 new scenarios)
- Added 20 widget test scenarios to `dashboard.feature`, one per widget option:
  - Site Manager Performance, Known Employee Locations, Announcements, Favorites, Alerts, Clocked In, Materials Over Budget, Subcontractors Over Budget, Equipment Over Budget, Profitability By Department, Past Due Tickets, Timesheet/WO discrepancies, Scheduled Tickets, Vendor Announcements, Manager Announcements, Weather Widget, TEST HTML, Add Client Shares, View Client Shares, Vendor PO List
- Each scenario: login → add widget → verify widget visible → remove all widgets
- Widget removal flow: force-show hidden `.widget-icons` → click → select "Remove" from dropdown
- Used exact `normalize-space()` match for widget titles to avoid substring collisions (e.g. "Announcements" vs "Manager Announcements")
- Added `WIDGET_MENU_ITEM_XPATH`, `WIDGET_TITLE_XPATH`, `WIDGET_ICONS_CSS`, `WIDGET_REMOVE_XPATH` to `dashboard.properties.ts`
- Created `capture-widget.spec.ts` for investigating widget add/delete DOM structure

### Forgot Password Feature (3 new scenarios)
- Created `tests/features/forgot-password.feature`:
  - Display page branding (title, section heading, instructions)
  - Display reset form elements (username, email, send access link button)
  - Display navigation links (login link, version info)
- Created `tests/steps/forgot-password.steps.ts` — navigates via "Forgot Password" link from login page
- Created `tests/properties/forgot-password.properties.ts` — page title, section title, instructions, form inputs, send button, login link, version
- Captured `html/forgot-password.html` + `.png` for element discovery

### Renamed Home → Dashboard
- Renamed `home.feature` → `dashboard.feature` (Feature name: "Dashboard")
- Renamed `home.steps.ts` → `dashboard.steps.ts`
- Renamed `home.properties.ts` → `dashboard.properties.ts`
- Updated all import paths

### Multi-Browser Support
- Added 5 browser projects to `playwright.config.ts`:
  - `firefox` (Desktop Firefox)
  - `chromium` (Desktop Chrome)
  - `edge` (Desktop Edge via `msedge` channel)
  - `webkit` (Desktop Safari)
  - `edge-mobile` (Pixel 5 viewport via `msedge` channel)
- `npm test` runs all browsers; `npm run test:edge` runs Edge only

### Video Recording
- Enabled `video: 'on'` in Playwright config — every test records a `.webm` video as evidence

### Test Run Archiving
- Created `scripts/archive-results.js`:
  - Copies `test-results/` and `playwright-report/` into timestamped folder under `test-archives/`
  - Keeps only the last 5 archives, deletes older ones automatically
- Integrated into `npm test` and `npm run test:edge` (auto-archive after each run)
- Added `npm run test:archive` for manual archiving
- Added `test-archives/` to `.gitignore`

### CLAUDE.md (Project Instructions)
- Created `CLAUDE.md` as the master instruction file (auto-loaded every conversation)
- References mandatory pre-read files: `.claude/quality.md`, `rules/automation.mdc`, `rules/effective-rules-summary.mdc`
- Indexes all 23 ISTQB certification reference files by domain
- Indexes all project-specific rule files
- Documents project context, structure, and conventions

### XPath Selector Fixes
- Fixed dashboard properties to match actual DOM in Edge (previously captured from Chromium):
  - `ADD_WIDGET_BUTTON_XPATH` — use `normalize-space()` instead of `contains(text())`
  - `USER_PROFILE_XPATH` — use `a[@title='My Profile' and @href='/spa/profile']` for uniqueness
  - `LOGOUT_ICON_XPATH` — use `mat-icon[@title='Log out']` instead of text match
  - `REFRESH_ICON_XPATH` — union XPath for img and mat-icon variants
  - `menuItemXpath` — use `//ul//li//p[normalize-space()]` with `.first()` for duplicates
  - `VERSION_XPATH` — use `//*[contains(text(), 'SM VERSION')]` for paragraph element

### Configuration Updates
- Updated `BASE_URL` from `/testpwa` to `https://testserver.betacom.com/` (SPA direct access)
- Updated `playwright.config.ts` fallback baseURL to match
- Updated `login-username.properties.ts` for SPA login elements (was PWA/Next.js)
- Increased global test timeout from 30s to 60s (login flow needs ~25s in Background step)
- Updated `playwright.capture.config.ts` to match all `capture-*.spec.ts` files and use Edge

### Documentation
- Updated `README.md` with full test coverage summary, video/archiving docs, browser projects table
- Updated `CHANGELOG.md`

---

## 2026-04-07 — Project Setup and BDD Integration

### Project Initialization
- Created `package.json` with Playwright as the core test framework
- Added `playwright.config.ts` with multi-browser support (Chromium, Firefox, WebKit)
- Created `.gitignore` for `node_modules/`, `test-results/`, `playwright-report/`, `.env`, `html/`, `.features-gen/`
- Created `.env` and `.env.example` with `BASE_URL`, `TEST_USERNAME`, `TEST_PASSWORD`
  - Fixed `USERNAME` → `TEST_USERNAME` to avoid conflict with Windows reserved env var

### BDD Framework Integration
- Installed `playwright-bdd` and `@cucumber/cucumber` for Gherkin/Cucumber syntax
- Updated `playwright.config.ts` to use `defineBddConfig` for feature/step discovery
- Updated `npm test` and `npm run test:ui` scripts to run `bddgen` before Playwright
- Created `playwright.capture.config.ts` for standalone page capture tests

### Login Feature
- Created `tests/features/login.feature` with 3 scenarios:
  - Display the username page
  - Submit username and see password page
  - Login with valid credentials (full flow including Safe Day's Alert modal)
- Created `tests/steps/login.steps.ts` with step definitions using properties XPaths
- Created `tests/properties/login-username.properties.ts` — SPA username page elements:
  - Navbar logo, forgot password link, login card title, username icon/label/input, next button, footer links
- Created `tests/properties/login-password.properties.ts` — SPA password page elements:
  - Password icon/input, visibility toggle, back button, "Let's go" button, Safe Day's Alert modal, error notification

### Dashboard Feature (initial)
- Created initial dashboard feature with 5 scenarios:
  - Display top bar elements (search, refresh, add widget)
  - Display user profile controls (my profile, logout)
  - Display sidebar navigation (filter + menu items)
  - Filter sidebar menu
  - Display version info
- Created step definitions with full login as Background
- Created properties file with dashboard elements (top bar, user profile, sidebar, version)

### Page Capture Utility
- Created `tests/capture-page.spec.ts` for capturing htmlBody snapshots and screenshots
- Captured and saved to `html/`:
  - `login-username.html` / `.png` — SPA username step
  - `login-password.html` / `.png` — SPA password step
  - `home-with-modal.html` / `.png` — Post-login with Safe Day's Alert
  - `home.html` / `.png` — Dashboard after dismissing modal

### QA Rules (Imported and Generalized)
- Imported QA rules from previous client projects into `rules/`
- Generalized all non-ISTQB rule files to remove old client references (SMS, Inventory, TicketNest, AJTickets):
  - `sibling-projects-context.mdc` — Rewritten as generic cross-project guidance
  - `sidebar-navigation-reliability.mdc` — Replaced `TicketNest` with generic example
  - `headless-dashboard-readiness.mdc` — Removed SMS/TicketNest references
  - `effective-rules-summary.mdc` — Generalized to frontend UI / backend API terminology
  - `automation.mdc` — Generalized export flow and removed Inventory-specific examples
- ISTQB reference files left untouched

### Documentation
- Created `README.md` with setup, project structure, running tests, and writing tests guide
- Created `CHANGELOG.md`
