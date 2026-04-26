# PS Site Slicer

Automated QA test suite for **Site Manager** using Playwright with BDD (Cucumber/Gherkin) via `playwright-bdd`.

## Platform-Specific Setup

- **macOS** — [README-MAC.md](README-MAC.md)
- **Windows** — [README-WIN.md](README-WIN.md)

## Quick Start

```bash
npm install
npm run dev                                         # Start TestGenerator UI
npm run test                                        # Run @smoke tests
```

## TestGenerator — Automated QA Runner

Web UI and pipeline for automated QA using Claude Code + Jira API. Start the server with `npm run dev` and open `http://localhost:3000`.

### Quality Pipeline (Steps 1–11)

| Step | Name | Description |
|------|------|-------------|
| 1 | Verify Jira Auth | Check Jira credentials |
| 2 | Find Ticket | JQL search for next SM Testing ticket |
| 3 | Review Ticket | Fetch issue (trimmed to 21 fields), comments, attachments |
| 4 | Review Code | Find commits and changed files |
| 5 | Draft Test Plan | Claude generates `5_plan.md` + `5_plan_manual.html` (token-tracked) |
| 6 | Write Gherkin Steps | Reads `tests/steps/*.steps.ts` → reuses existing step text → compiles `.feature` → `bddgen` saves unmatched steps to `6_unmatched_steps.txt`. Parallel/sequential toggle. |
| 7 | Write Automated Tests | Works only on `6_unmatched_steps.txt` gaps — one step at a time: implement → bddgen → playwright pass → record → next. Parallel/sequential toggle. |
| 8 | Execute Tests | Run Playwright-BDD suite |
| 9 | Determine Results | Generate `9_test_report.md` with structured table |
| 10 | Post Results | Upload screenshots + comment to Jira |
| 11 | Transition Ticket | Move to Verify or QA Failed |

Steps auto-run prerequisites when inputs are missing (e.g. step 8 auto-runs step 7 if no test-run directory exists).

### Engineering Pipeline (Steps 101–103)

| Step | Name | Description |
|------|------|-------------|
| 101 | Check Steps | Run `bddgen`, parse missing step definitions, write `.test` files to `tests/testrun/` |
| 102 | Run Tests | Run Playwright, parse failures, write `.test` files |
| 103 | Heal Scenario | Auto-chains 101→102, calls Claude to fix the first failing `.test` file, verifies the fix |

Engineering steps do not require a Jira ticket — they operate on the current test suite.

### UI Features

- **Pipeline tabs**: Quality (1–11) and Engineering (101–103) in separate tabs
- **Ticket Creator**: Draft Jira tickets via Claude from the bottom panel
- **Ticket autocomplete**: Known tickets from log directories populate the ticket input
- **Claude Status & Insights**: Check CLI version and generate usage insights
- **Resizable bottom panel**: Drag handle to adjust log area height
- **Parallel toggle**: Steps 6 and 7 have per-step parallel/sequential mode buttons

Timing summary printed at run end: `Step | Name | Duration | Tokens Used | Status`

## Test Coverage

**122 scenarios** across 5 feature files. `npm run test` runs `@smoke` tagged scenarios only.

See [TestCoverage.md](TestCoverage.md) for the full breakdown.
