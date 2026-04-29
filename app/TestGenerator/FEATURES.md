# TestGenerator — Features

## Overview

TestGenerator is a QA automation pipeline for **Site Manager (SM)** by Powerslice Software. It automates the full lifecycle: Jira ticket → test plan → Gherkin scenarios → Playwright tests → execution → results → ticket transition. A separate Engineering pipeline maintains test health through automated step checking, test execution, and self-healing.

**Target:** `https://testserver.betacom.com/spa`
**Stack:** Playwright + playwright-bdd (Cucumber/Gherkin) + TypeScript
**Browser:** Chromium (with Edge project available)
**UI:** Web dashboard at `http://localhost:3000`

---

## Two Pipelines

### Quality Pipeline (Steps 1–11)

Ticket-driven QA automation. Takes a Jira ticket through the full test lifecycle.

| Step | Name | What it does |
|------|------|-------------|
| 1 | Verify Jira Auth | Confirms Jira API credentials work |
| 2 | Find Ticket | Discovers eligible tickets (by key or filter: all/mine) |
| 3 | Review Ticket | Reads Jira ticket details, acceptance criteria, comments |
| 4 | Review Code | Analyzes related codebase for test targets |
| 5 | Draft Test Plan | Creates test plan from ticket + code context |
| 6 | Write Gherkin Steps | Generates `.feature` files with Cucumber scenarios (parallel mode available) |
| 7 | Write Automated Tests | Implements step definitions + XPath properties using Claude |
| 8 | Execute Tests | Runs Playwright tests against the target |
| 9 | Determine Results | Analyzes pass/fail, generates verdict |
| 10 | Post Results | Posts results back to Jira |
| 11 | Transition Ticket | Moves ticket to appropriate status |

### Engineering Pipeline (Steps 101–104)

Codebase-level test maintenance. No ticket required.

| Step | Name | What it does |
|------|------|-------------|
| 101 | Check Steps | Runs `bddgen`, detects missing step definitions, writes `.test` files |
| 102 | Run Tests | Executes tests one-by-one by tag, streams results live, stops on first failure |
| 103 | Healing | Iterative self-healing: runs test → Claude fix → verify → repeat up to 5 rounds |
| 104 | App Scraper | Scrapes application pages for HTML snapshots |

---

## Engineering Pipeline — Detailed

### Step 101: Check Steps

Runs `npx bddgen` to generate Playwright spec files from feature files. Parses the output for missing step definitions and creates a `.test` diagnostic file per scenario.

**Output:** `tests/testrun/{TEST-ID}.test` for each scenario with missing steps.

### Step 102: Run Tests

Runs each test scenario individually by its tag (e.g., `@CASCADE-1`). Uses `npx bddgen && npx playwright test --grep 'CASCADE-1\b' --project chromium`.

**Live reporting:**
- Scenario info (feature file, tags, Gherkin steps) logged before each run
- Playwright output streamed to UI in real time
- On failure: Gherkin step-by-step pass/fail report (`✓`/`✗`/`-`)
- Progress counter: `[3/68] DASH-3: Display sidebar...`

**On failure:** Writes `.test` file and stops — designed to hand off to step 103.

### Step 103: Healing

Self-healing loop that fixes failing tests using Claude CLI.

**Flow (per scenario):**
1. Pick the first `.test` file from `tests/testrun/`
2. Run the targeted test to get a real, current error
3. Build a prompt with: error output + HTML page snapshot + project context + previous attempts
4. Call Claude to analyze and fix (with 5-minute timeout)
5. Verify the fix by running the test again
6. If still failing → advance to next round (up to 5)
7. If healed → write summary, delete `.test` file

**Prerequisite auto-chain:** If no `.test` files exist, auto-runs 101 → 102 first.

**Round-based logs:**
```
tests/testrun/CASCADE-1/
├── round-1/
│   ├── 01-test-before.log
│   ├── 02-claude-prompt.log
│   ├── 03-claude-response.log
│   └── 04-test-after.log
├── round-2/
│   ├── 01-test-before.log    ← copied from round-1/04-test-after.log
│   ├── ...
├── heal-state.json            ← tracks round/phase for debug mode
└── summary.md                 ← final report
```

**Debug mode:** Toggle on step 103's card (yellow crosshair icon). Breaks each round into 3 clicks:
- Click 1: Run test (phase 1)
- Click 2: Call Claude (phase 2)
- Click 3: Verify fix (phase 3)

**Claude context includes:**
- The `.test` file content (scenario, gherkin, error output)
- HTML page snapshot from `html/` directory (DOM reference for XPaths)
- ISTQB test automation knowledge base
- Previous round summaries (from round 2+)

### Step 104: App Scraper

Scrapes application pages and saves HTML snapshots to the `html/` directory. These snapshots are used by step 103 as DOM reference for building XPath selectors.

---

## Test Suite

### Coverage

| Feature | File | Scenarios | Tags |
|---------|------|-----------|------|
| Cascade Templates | `cascade-templates.feature` | 1 | CASCADE-1 |
| Dashboard | `dashboard.feature` | 26 | DASH-1 to DASH-26 |
| Forgot Password | `forgot-password.feature` | 3 | FORGOT-1 to FORGOT-3 |
| Import Costs | `import-costs.feature` | 4 | IMPORT-1 to IMPORT-4 |
| Login | `login.feature` | 1 | LOGIN-1 |
| Maintenance Admin | `maintenance-admin.feature` | 4 | MAINT-1 to MAINT-4 |
| Nav Bar | `nav-bar.feature` | 13 | NAV-1 to NAV-13 |
| Purchasing Tracker | `purchasing-tracker.feature` | 4 | PURCHASE-1 to PURCHASE-4 |
| Search | `search.feature` | 1 | SEARCH-1 |
| Sidebar Navigation | `sidebar-navigation.feature` | 2 | SIDEBAR-1 to SIDEBAR-2 |
| Timesheet Admin | `timesheet-admin.feature` | 7 | TIMESHEET-1 to TIMESHEET-7 |
| Vendor Admin | `vendor-admin.feature` | 2 | VENDOR-1 to VENDOR-2 |
| **Total** | **12 feature files** | **68 scenarios** | |

### Architecture

```
tests/
├── features/*.feature              — Gherkin scenarios (plain English)
├── steps/*.steps.ts                — Step definitions (Playwright code)
└── properties/*.properties.ts      — XPath locators per page (POM)
html/                               — 169 HTML page snapshots (DOM reference)
```

- **Page Object Model via properties files** — 83 property files with 2,119 lines of XPath selectors
- **XPath only** — no CSS selectors, using `page.locator(`xpath=${SELECTOR}`)` pattern
- **createBdd pattern** — all step files use `playwright-bdd`'s `createBdd()` for Given/When/Then

---

## UI Dashboard

Web interface at `http://localhost:3000` with:

### Pipeline Grid
- Two tabs: **Quality** (steps 1–11) and **Engineering** (steps 101–104)
- Step cards show: status dot, history dots, duration, run/stop/schedule buttons
- Per-step run button with immediate play→stop transition
- Parallel mode toggle for steps 6 and 7
- Debug mode toggle for step 103 (yellow crosshair)

### Bottom Panel (4 tabs)

**Live Logs** — Real-time SSE stream of all step output. Color-coded by level (info/warn/error/debug). Clear button.

**Step Logs** — Click a step card to view its historical logs. Live streaming with green pulsing LIVE badge when the step is running. Auto-refreshes when step completes.

**Ticket Creator** — Queue-based Jira ticket drafting. Add type/component/title/description, batch-create via Claude.

**Run History** — All pipeline runs with expandable step-by-step detail, status icons, durations, and error output.

### Schedule Modal
- Per-step scheduling with frequency pills (1h/2h/4h/6h/8h/12h/Daily)
- Cron preview with time display
- Active schedule list with toggle on/off and delete

### Other UI Features
- Ticket info bar (key, summary, status, assignee)
- Claude Insights button (generates analysis report)
- Resizable bottom panel
- SSE auto-reconnect
- Card click-away deselection

---

## Services

| Service | Purpose |
|---------|---------|
| `ClaudeService` | Wraps Claude CLI (`claude -p`) with streaming + abort support |
| `PlaywrightService` | Runs `bddgen` and `playwright test` with streaming + abort |
| `JiraService` | Jira API integration for tickets |
| `GitService` | Git operations |
| `ContextBuilder` | Builds system prompts with ISTQB knowledge + project context |

---

## npm Scripts

| Script | Command |
|--------|---------|
| `npm run dev` | Start TestGenerator dev server |
| `npm test` | Run smoke tests (`@smoke` tag) |
| `npm run test:chrome` | Run all tests on chromium with bddgen |
| `npm run test:edge` | Run all tests on Edge |
| `npm run test:ui` | Open Playwright UI mode |
| `npm run test:report` | Show HTML test report |
| `npm run test:archive` | Archive test results |

---

## Planned Improvements

See `heal-scenario.fix.md` for the next iteration plan:
- Error classifier with fail-fast triage (abort unhealable errors immediately)
- Progress heartbeat during Claude calls (log every 30s)
- Trimmed HTML context (relevant DOM section only, not full page)
- Exhausted test marking (`.test.exhausted` to prevent re-processing)
