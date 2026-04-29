# QA Dashboard (TestGenerator) — Client Deployment Guide

> One-time setup playbook for deploying this AI-powered QA automation dashboard to a new client project. Hand this document to a fresh Claude session along with the new client's project repo.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture Summary](#2-architecture-summary)
3. [Prerequisites](#3-prerequisites)
4. [Step-by-Step Deployment](#4-step-by-step-deployment)
5. [Client-Specific Customization Checklist](#5-client-specific-customization-checklist)
6. [Pipeline Steps Reference](#6-pipeline-steps-reference)
7. [Database Schema](#7-database-schema)
8. [UI Overview](#8-ui-overview)
9. [Services & Integrations](#9-services--integrations)
10. [File Tree Reference](#10-file-tree-reference)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. System Overview

**What this is:** A full-stack QA automation dashboard that converts Jira tickets into AI-generated test plans, Gherkin scenarios, and automated Playwright tests — with persistent execution tracking, scheduling, and a real-time web UI.

**What it does (the pipeline):**
1. Verifies Jira API credentials
2. Finds/selects tickets from Jira (JQL search)
3. Reviews ticket details (issue, comments, attachments)
4. Reviews related code changes (git log/diff)
5. Drafts an ISTQB-aligned test plan via Claude AI
6. Writes Gherkin BDD scenarios via Claude AI
7. Generates Playwright automated test code via Claude AI
8. Executes the tests via Playwright
9. Analyzes and determines results
10. Posts results back to Jira as a comment
11. Transitions the Jira ticket to the next workflow status

**Plus 4 engineering utility steps (101-104):** step validation, test execution, scenario healing, and app scraping.

**Stack:**
- **Backend:** Node.js + Express 5 + TypeScript (ES Modules, run via `tsx`)
- **Database:** SQLite (better-sqlite3, WAL mode)
- **Frontend:** Vanilla HTML/CSS/JS single-page app (no framework)
- **Real-time:** Server-Sent Events (SSE)
- **AI:** Claude CLI (`claude -p` subprocess)
- **Tests:** Playwright + playwright-bdd (Cucumber/Gherkin)
- **Issue Tracker:** Jira Cloud REST API v3

---

## 2. Architecture Summary

```
┌─────────────────────────────────────────────────────┐
│                   Browser (UI)                       │
│  index.html + app.js + style.css                     │
│  SSE connection ← /api/stream                        │
└───────────────────────┬─────────────────────────────┘
                        │ HTTP REST + SSE
┌───────────────────────▼─────────────────────────────┐
│               Express Server (server.ts)             │
│  Port 3847 (configurable)                            │
│  Endpoints: /api/run, /api/status, /api/stream, etc. │
└───────────┬───────────┬──────────────┬──────────────┘
            │           │              │
     ┌──────▼──┐  ┌─────▼────┐  ┌─────▼──────┐
     │Pipeline │  │Scheduler │  │  Database   │
     │11+4 stp │  │cron-like │  │  SQLite     │
     └────┬────┘  └──────────┘  └────────────┘
          │
    ┌─────┼──────────┬──────────────┬───────────┐
    │     │          │              │            │
┌───▼──┐ ┌▼───────┐ ┌▼──────────┐ ┌▼─────────┐ ┌▼──────────┐
│ Jira │ │Claude  │ │Playwright │ │   Git    │ │ Context   │
│ API  │ │CLI     │ │BDD runner │ │ log/diff │ │ Builder   │
└──────┘ └────────┘ └───────────┘ └──────────┘ └───────────┘
```

**Data Flow:**
1. User opens `http://localhost:3847`, UI connects to `/api/stream` (SSE)
2. User enters a ticket key (e.g., `SM-1100`) and clicks Run
3. Server creates a `pipeline_run` record, iterates through steps
4. Each step logs to DB + emits SSE events to the UI in real-time
5. AI steps spawn `claude -p` subprocesses with project context files
6. Test steps spawn `npx playwright test` subprocesses
7. Artifacts (plans, gherkin files, test results) saved to `logs/<TICKET>/`
8. Final results posted to Jira, ticket transitioned

---

## 3. Prerequisites

### On the deployment machine:

| Requirement | Version | Why |
|---|---|---|
| Node.js | 18+ | Runtime |
| npm | 9+ | Package manager |
| Claude CLI | Latest | AI engine (`claude -p` must work) |
| Playwright | 1.50+ | Browser automation |
| Git | 2.30+ | Code review steps |
| MS Edge (optional) | Latest | Default browser channel |

### Accounts needed:

| Service | What you need |
|---|---|
| **Jira Cloud** | Email + API token (generate at https://id.atlassian.com/manage-profile/security/api-tokens) |
| **Claude** | Authenticated CLI session (`claude` command must work) |
| **Test server** | URL + login credentials for the application under test |

---

## 4. Step-by-Step Deployment

### 4.1. Clone/copy the project

```bash
# If starting from the template repo:
git clone <repo-url> /path/to/<client-project>
cd /path/to/<client-project>
```

The expected directory structure is:

```
<client-project>/              # Root = projectDir
├── .env                       # Credentials (create from template)
├── .env.example               # Template
├── playwright.config.ts       # Playwright configuration
├── tsconfig.json              # Root TS config
├── package.json               # Root dependencies (Playwright, BDD)
├── CLAUDE.md                  # AI instructions
├── .claude/                   # AI context files
│   ├── quality.md
│   ├── wiki.md
│   ├── qa-expert/             # ISTQB knowledge base
│   └── client-<name>/         # Client-specific context
├── rules/                     # QA rule files (.mdc)
├── tests/
│   ├── features/*.feature     # Gherkin scenarios
│   ├── steps/*.steps.ts       # Step definitions
│   └── properties/*.properties.ts  # XPath locators (POM)
├── app/
│   └── TestGenerator/         # << THE DASHBOARD APP
│       ├── src/               # TypeScript backend
│       ├── ui/                # Web frontend
│       ├── data/              # SQLite DB (auto-created)
│       ├── logs/              # Per-ticket execution logs
│       ├── package.json
│       └── tsconfig.json
└── scripts/                   # Utility scripts
```

### 4.2. Install dependencies

```bash
# Root project (Playwright + BDD)
npm install

# TestGenerator app
cd app/TestGenerator
npm install
cd ../..

# Install Playwright browsers
npx playwright install
```

### 4.3. Create the .env file

Create `.env` in the **project root** (NOT inside TestGenerator):

```env
# Application under test
BASE_URL=https://<client-test-server>/
TEST_USERNAME=<test-account-username>
TEST_PASSWORD=<test-account-password>

# Jira Cloud
JIRA_EMAIL=<your-jira-email>
JIRA_API_TOKEN=<your-jira-api-token>
JIRA_BASE_URL=https://<client-org>.atlassian.net

# Optional
TESTGEN_PORT=3847
```

**Critical:** The `.env` file lives at the project root. `Config.ts` resolves it as `resolve(testGeneratorDir, '..', '..', '.env')`.

### 4.4. Verify Claude CLI

```bash
# Must return a response (not an error)
echo "Hello" | claude -p
```

If this fails, run `claude` interactively first to authenticate.

### 4.5. Start the dashboard

```bash
cd app/TestGenerator
npm run dev    # Development mode (auto-reload)
# OR
npm start      # Production mode
```

Open `http://localhost:3847` in your browser.

### 4.6. Verify the setup

1. Open the dashboard UI
2. Click "Run Step 1" (Verify Jira Auth) — should show green PASS
3. Enter a ticket key and run Step 2 (Find Ticket) — should find tickets
4. Run Step 3 (Review Ticket) — should pull issue details

---

## 5. Client-Specific Customization Checklist

These are the items that MUST change per client. Everything else is generic.

### 5.1. Environment & Credentials

| Item | File | What to change |
|---|---|---|
| Test server URL | `.env` → `BASE_URL` | New client's test environment URL |
| Login credentials | `.env` → `TEST_USERNAME`, `TEST_PASSWORD` | New client's test account |
| Jira instance | `.env` → `JIRA_BASE_URL` | New client's Atlassian org URL |
| Jira auth | `.env` → `JIRA_EMAIL`, `JIRA_API_TOKEN` | Your Jira credentials for that org |

### 5.2. Jira Configuration

| Item | File | What to change |
|---|---|---|
| Default Jira base URL | `src/shared/config/Config.ts:43-44` | Change the fallback URL from `powerslicesoftware.atlassian.net` |
| Ticket prefix | Pipeline steps that reference `SM-` | Change to client's project key (e.g., `PROJ-`, `QA-`) |
| JQL queries | `Step02FindTicket.ts` | Update JQL to match client's project, issue types, workflow |
| Workflow transitions | `Step11TransitionTicket.ts` | Map to client's Jira workflow status names |

### 5.3. Project Context Files

These files feed the AI with client-specific knowledge:

| File | Purpose | Action |
|---|---|---|
| `.claude/wiki.md` | Project overview, URLs, team info | **Rewrite** for new client |
| `.claude/client-<name>/wiki.md` | Client workspace context | **Create new** directory |
| `.claude/client-<name>/brain.md` | Client domain knowledge | **Create new** |
| `CLAUDE.md` | AI behavior instructions | **Update** project context section |
| `rules/brain.md` | Domain rules for AI | **Rewrite** for new client's domain |

### 5.4. Test Framework

| Item | File | What to change |
|---|---|---|
| Browser channel | `playwright.config.ts` | Change `msedge` to client's preferred browser |
| Base URL | `playwright.config.ts` | Update fallback URL |
| Login flow | `tests/steps/login.steps.ts` | Adapt to client's auth flow (SPA, SSO, etc.) |
| Page selectors | `tests/properties/*.properties.ts` | **All new** — XPaths for client's app |
| Feature files | `tests/features/*.feature` | **All new** — Gherkin for client's features |
| Step definitions | `tests/steps/*.steps.ts` | **All new** — Playwright code for client's app |

### 5.5. UI Branding (Optional)

| Item | File | What to change |
|---|---|---|
| Page title | `ui/index.html` | Change "TestGenerator" to client name |
| Favicon | `ui/favicon.svg` | Replace with client logo |
| Header text | `ui/index.html` | Update dashboard title |
| Accent color | `ui/style.css` → `--accent` | Match client brand |

### 5.6. ContextBuilder Paths

The `ContextBuilder` service loads AI context from specific paths. Update these if you rename directories:

```typescript
// src/services/ContextBuilder.ts — paths to update:
buildBaseContext():
  .claude/wiki.md
  .claude/client-<name>/wiki.md      // ← rename directory
  .claude/client-<name>/brain.md     // ← rename directory
  rules/brain.md

buildStep6Context():
  .claude/qa-expert/                  // Keep as-is (generic ISTQB knowledge)

buildStep7Context():
  .claude/test-automation-expert/     // Keep as-is (generic automation knowledge)
```

---

## 6. Pipeline Steps Reference

### Quality Pipeline (Steps 1-11)

| # | Name | Needs Ticket | What It Does |
|---|---|---|---|
| 1 | Verify Jira Auth | No | Tests Jira API credentials, returns display name |
| 2 | Find Ticket | No | JQL search for tickets, selects one |
| 3 | Review Ticket | Yes | Fetches issue details, comments, attachments → saves to `logs/<KEY>/` |
| 4 | Review Code | Yes | `git log --grep=<KEY>`, gets changed files → saves to `logs/<KEY>/` |
| 5 | Draft Test Plan | Yes | Claude AI generates ISTQB test scenarios (SC-XX, EC-XX) |
| 6 | Write Gherkin | Yes | Claude AI converts plan to BDD Gherkin `.feature` syntax |
| 7 | Write Automated Tests | Yes | Claude AI generates Playwright `.steps.ts` code |
| 8 | Execute Tests | Yes | Runs `npx bddgen` then `npx playwright test` |
| 9 | Determine Results | Yes | Analyzes pass/fail/skip from test output |
| 10 | Post Results | Yes | Comments structured results on Jira ticket |
| 11 | Transition Ticket | Yes | Moves ticket to next Jira workflow status |

### Engineering Pipeline (Steps 101-104)

| # | Name | Purpose |
|---|---|---|
| 101 | Check Steps | Validate step implementations are complete |
| 102 | Run Tests | Execute test suite (independent of ticket) |
| 103 | Healing | AI-assisted repair of broken/failing tests |
| 104 | App Scraper | Extract application data/structure |

### Step Execution Flow

```
Pipeline.runSteps(1, 11, "PROJ-123")
  │
  ├─ Creates pipeline_run record in DB
  ├─ For each step 1..11:
  │   ├─ Creates step_result record
  │   ├─ Calls step.execute(context)
  │   ├─ Step logs via this.log() → DB + SSE
  │   ├─ Step returns StepOutput { status, message, artifacts }
  │   ├─ Updates step_result with final status
  │   └─ Emits SSE: step-status event
  └─ Finishes pipeline_run record
```

### Step Prerequisites

Steps 6 and 7 have automatic prerequisites — if you run Step 6 directly, it will auto-run Step 5 first (test plan needed for Gherkin). Similarly, Step 7 may auto-run Step 6.

---

## 7. Database Schema

SQLite database at `app/TestGenerator/data/testgen.db` (auto-created on first run).

```sql
-- Pipeline execution records
pipeline_runs (
  id INTEGER PRIMARY KEY,
  started_at TEXT,
  finished_at TEXT,
  step_start INTEGER,
  step_end INTEGER,
  filter TEXT,
  ticket_key TEXT,
  status TEXT,           -- 'running' | 'completed' | 'failed' | 'aborted' | 'cancelled'
  duration_ms INTEGER
)

-- Per-step execution details
step_results (
  id INTEGER PRIMARY KEY,
  run_id INTEGER REFERENCES pipeline_runs(id),
  step_number INTEGER,
  step_name TEXT,
  ticket_key TEXT,
  status TEXT,           -- 'idle' | 'running' | 'pass' | 'fail' | 'warn' | 'skip'
  started_at TEXT,
  finished_at TEXT,
  duration_ms INTEGER,
  token_usage INTEGER,
  message TEXT,
  error_output TEXT,
  UNIQUE(run_id, step_number, ticket_key)
)

-- Generated files per step
step_artifacts (
  id INTEGER PRIMARY KEY,
  step_result_id INTEGER REFERENCES step_results(id),
  name TEXT,
  file_path TEXT,
  artifact_type TEXT,    -- 'json' | 'md' | 'html' | 'png' | 'jpg' | 'txt'
  size_bytes INTEGER
)

-- Detailed logging
step_logs (
  id INTEGER PRIMARY KEY,
  step_result_id INTEGER REFERENCES step_results(id),
  timestamp TEXT,
  level TEXT,            -- 'info' | 'warn' | 'error' | 'debug'
  message TEXT
)

-- Playwright test execution records
test_runs (
  id INTEGER PRIMARY KEY,
  step_result_id INTEGER REFERENCES step_results(id),
  ticket_key TEXT,
  timestamp_dir TEXT,
  verdict TEXT,          -- 'PASS' | 'FAIL' | 'NOT TESTED'
  total_tcs INTEGER,
  passed_tcs INTEGER,
  failed_tcs INTEGER
)

-- Individual test case results
test_case_results (
  id INTEGER PRIMARY KEY,
  test_run_id INTEGER REFERENCES test_runs(id),
  tc_id TEXT,
  status TEXT,
  steps_total INTEGER,
  steps_existing INTEGER,
  steps_added INTEGER,
  test_output TEXT,
  notes TEXT
)

-- Cron schedules for automated runs
schedules (
  id INTEGER PRIMARY KEY,
  name TEXT,
  minute INTEGER,
  hour INTEGER,
  interval_hours INTEGER,
  step_start INTEGER,
  step_end INTEGER,
  filter TEXT,
  ticket_key TEXT,
  enabled INTEGER,
  last_run_at TEXT,
  next_run_at TEXT,
  created_at TEXT
)
```

The database is auto-created with WAL mode enabled. Delete `data/testgen.db*` to reset.

---

## 8. UI Overview

Single-page app served from `ui/` directory. No build step required.

### Layout

```
┌──────────────────────────────────────────────────┐
│ Header: [Ticket Input] [Filter] [Step Range] [Run]│
├──────────────────────────────────────────────────┤
│ Ticket Info Bar: KEY | Summary | Status | Assignee│
├──────────────────────────────────────────────────┤
│                                                    │
│  Quality Pipeline Grid (Steps 1-11)                │
│  ┌────┐ ┌────┐ ┌────┐ ... ┌─────┐                │
│  │ 1  │ │ 2  │ │ 3  │     │ 11  │                │
│  │PASS│ │PASS│ │RUN │     │IDLE │                │
│  └────┘ └────┘ └────┘     └─────┘                │
│                                                    │
│  Engineering Pipeline Grid (Steps 101-104)         │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                │
│  │ 101 │ │ 102 │ │ 103 │ │ 104 │                │
│  └─────┘ └─────┘ └─────┘ └─────┘                │
│                                                    │
├──────────────────────────────────────────────────┤
│ Bottom Panel (resizable, tabbed):                  │
│ [Live Logs] [Step Logs] [Ticket Creator] [History] │
│                                                    │
│  > Step 1 — Verify Jira Auth                       │
│  > Checking Jira API access...                     │
│  > PASS — Authenticated as Kim Bandeleon           │
│                                                    │
└──────────────────────────────────────────────────┘
```

### Key UI Features
- **Real-time SSE updates** — steps change color as they run (blue=running, green=pass, red=fail, yellow=warn)
- **Click any step card** to run just that step
- **Schedule modal** — set automated runs on intervals (1h, 2h, 4h, 6h, 8h, 12h, daily)
- **Ticket Creator tab** — generates bug ticket drafts via Claude AI
- **Run History tab** — drill into past executions with per-step detail
- **Claude Insights** — generates AI analysis reports of test trends

### Theme
- Dark theme (GitHub-inspired: `#0d1117` background, `#388bfd` accent)
- Easily customizable via CSS variables in `style.css`

---

## 9. Services & Integrations

### JiraService (`src/services/JiraService.ts`)

Connects to Jira Cloud REST API v3 using Basic Auth.

**Methods:**
| Method | Purpose |
|---|---|
| `testAuth()` | Verify credentials, returns display name |
| `getIssue(key, fields?)` | Fetch full issue |
| `search(jql, fields?, maxResults)` | JQL search with pagination |
| `getComments(key)` | Get issue comments |
| `addComment(key, text)` | Post ADF-formatted comment |
| `getTransitions(key)` | Get available workflow transitions |
| `transition(key, statusName)` | Move ticket to new status |
| `getAttachments(key)` | List attachments |
| `uploadAttachment(key, filePath)` | Upload file to issue |

**Client-specific changes:** The Jira base URL defaults to `powerslicesoftware.atlassian.net` — override via `JIRA_BASE_URL` env var.

### ClaudeService (`src/services/ClaudeService.ts`)

Wraps the Claude CLI as a subprocess. Sends prompts via stdin, captures stdout.

**Methods:**
| Method | Purpose |
|---|---|
| `prompt(input, options)` | One-shot prompt, returns `{result, tokenUsage, raw}` |
| `promptStreaming(input, options, onData?)` | Streaming variant with chunk callback |

**Options:**
- `outputFormat`: `'json'` or `'text'` — JSON mode returns token usage stats
- `appendSystemPromptFile`: Path to context file (injected as system prompt)
- `allowedTools`: Claude tools to enable
- `cwd`: Working directory for the subprocess

**No client-specific changes needed** — this service is generic. The context comes from `ContextBuilder`.

### GitService (`src/services/GitService.ts`)

Runs git commands in the project directory.

**Methods:**
| Method | Purpose |
|---|---|
| `getCommitsForTicket(ticketKey)` | `git log --oneline --grep=<KEY>` |
| `getChangedFiles(first, last)` | `git diff --name-only` between commits |

### PlaywrightService (`src/services/PlaywrightService.ts`)

Spawns Playwright test processes.

**Methods:**
| Method | Purpose |
|---|---|
| `runBddgen()` | Generate step definitions from features |
| `runTest(grepPattern, project?)` | Run tests matching grep pattern |

### ContextBuilder (`src/services/ContextBuilder.ts`)

Assembles markdown context from project files to feed Claude AI.

**Methods:**
| Method | Purpose |
|---|---|
| `buildBaseContext()` | Loads wiki.md + brain.md files |
| `buildStep6Context()` | Base + QA expert knowledge (ISTQB) |
| `buildStep7Context()` | Base + test automation expert knowledge |
| `writeToTempFile(content, name)` | Writes context to temp file for Claude's `--append-system-prompt-file` |
| `cleanup()` | Removes temp directory |

**Client-specific changes:** Update file paths if you rename the `.claude/client-<name>/` directory.

---

## 10. File Tree Reference

### What to COPY as-is (generic infrastructure):

```
app/TestGenerator/
├── src/
│   ├── index.ts                    # Entry point — no changes needed
│   ├── server.ts                   # Express server — no changes needed
│   ├── config/Config.ts            # Update default Jira URL
│   ├── data/Database.ts            # No changes needed
│   ├── data/models.ts              # No changes needed
│   ├── logger/StoryLogger.ts       # No changes needed
│   ├── pipeline/Pipeline.ts        # No changes needed
│   ├── pipeline/Step.ts            # No changes needed
│   ├── pipeline/StepRegistry.ts    # No changes needed
│   ├── scheduler/Scheduler.ts      # No changes needed
│   ├── services/ClaudeService.ts   # No changes needed
│   ├── services/GitService.ts      # No changes needed
│   ├── services/PlaywrightService.ts # No changes needed
│   └── services/ContextBuilder.ts  # Update paths if directory names change
├── ui/
│   ├── index.html                  # Optional: update branding
│   ├── app.js                      # No changes needed
│   ├── style.css                   # Optional: update colors
│   └── favicon.svg                 # Optional: replace logo
├── package.json                    # No changes needed
└── tsconfig.json                   # No changes needed
```

### What to CUSTOMIZE per client:

```
app/TestGenerator/src/generator/steps/
├── Step01VerifyAuth.ts             # Usually no changes
├── Step02FindTicket.ts             # UPDATE: JQL queries, project key
├── Step03ReviewTicket.ts           # Usually no changes
├── Step04ReviewCode.ts             # Usually no changes
├── Step05DraftTestPlan.ts          # UPDATE: prompt context, domain terms
├── Step06WriteGherkin.ts           # UPDATE: prompt context, naming conventions
└── Step07WriteAutomatedTests.ts    # UPDATE: prompt context, framework patterns

app/TestGenerator/src/automator/steps/
├── Step08ExecuteTests.ts           # Usually no changes
├── Step09DetermineResults.ts       # Usually no changes
├── Step10PostResults.ts            # UPDATE: comment format, fields
├── Step11TransitionTicket.ts       # UPDATE: workflow status names
├── Eng01CheckSteps.ts              # Usually no changes
├── Eng02RunTests.ts                # Usually no changes
├── Eng03HealScenario.ts            # Usually no changes
└── Eng04AppScraper.ts              # UPDATE: scraping targets
```

### What to CREATE from scratch per client:

```
.env                                # Client credentials
.claude/wiki.md                     # Client project overview
.claude/client-<name>/wiki.md       # Client workspace context
.claude/client-<name>/brain.md      # Client domain knowledge
rules/brain.md                      # Domain rules
tests/features/*.feature            # Client's test scenarios
tests/steps/*.steps.ts              # Client's step definitions
tests/properties/*.properties.ts    # Client's XPath locators
```

---

## 11. Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| `Missing required environment variable` | `.env` not found or incomplete | Ensure `.env` is in project root (2 levels up from TestGenerator) |
| `Claude CLI exited with code 1` | Claude not authenticated | Run `claude` interactively to log in |
| `Jira API error: HTTP 401` | Bad Jira credentials | Regenerate API token, check email matches |
| `Jira API error: HTTP 403` | No project access | Verify Jira user has access to the project |
| SSE connection drops | Server restart | UI auto-reconnects (built-in) |
| DB locked errors | Concurrent access | WAL mode should handle this; restart if persistent |
| `npx playwright test` fails | Browsers not installed | Run `npx playwright install` |
| Steps 5-7 produce poor output | Missing context files | Ensure `.claude/wiki.md` and `qa-expert/` exist |
| Port already in use | Another instance running | Set `TESTGEN_PORT` to a different port in `.env` |

### Reset database

```bash
rm app/TestGenerator/data/testgen.db*
# Restart the server — DB recreates automatically
```

### Reset logs

```bash
rm -rf app/TestGenerator/logs/*/
```

---

## Quick Start Recap (Copy-Paste for New Client)

```bash
# 1. Copy project structure
cp -r /path/to/template /path/to/new-client-project
cd /path/to/new-client-project

# 2. Install deps
npm install
cd app/TestGenerator && npm install && cd ../..
npx playwright install

# 3. Create .env
cat > .env << 'EOF'
BASE_URL=https://client-test-server.example.com/
TEST_USERNAME=testuser
TEST_PASSWORD=testpass
JIRA_EMAIL=you@example.com
JIRA_API_TOKEN=your-token-here
JIRA_BASE_URL=https://clientorg.atlassian.net
EOF

# 4. Update client context
# Edit: .claude/wiki.md (project overview)
# Edit: CLAUDE.md (project context section)
# Edit: src/shared/config/Config.ts (default Jira URL)
# Edit: Step02FindTicket.ts (JQL queries, project key)
# Edit: Step11TransitionTicket.ts (workflow statuses)

# 5. Clear template data
rm -rf app/TestGenerator/data/testgen.db* app/TestGenerator/logs/*/

# 6. Start
cd app/TestGenerator
npm run dev
# → Open http://localhost:3847
# → Run Step 1 to verify Jira auth
```
