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

### Engineering Pipeline (Steps 101–105)

| Step | Name | Description |
|------|------|-------------|
| 101 | Check Steps | Run `bddgen`, parse missing step definitions, write `.test` files to `tests/testrun/` |
| 102 | Run Tests | Per-test execution by tag, live-streamed output, writes `.test`/`.flaky` files on failure |
| 103 | Healing | Round-based iterative healing of `.test` files (max 5 rounds), per-round log artifacts |
| 104 | Decalcification | Picks first `.flaky` file, runs scenario 3× per round to verify stability, heals until stable (max 2 rounds) |
| 105 | App Scraper | Parses `sidebar-navigation.feature`, walks each page, captures `html/<slug>.html` snapshots for property-file generation |

Engineering steps do not require a Jira ticket — they operate on the current test suite.

### UI Features

- **Pipeline tabs**: Quality (1–11) and Engineering (101–105) in separate tabs
- **Ticket Creator**: Draft Jira tickets via Claude from the bottom panel
- **Ticket autocomplete**: Known tickets from log directories populate the ticket input
- **Claude Status & Insights**: Check CLI version and generate usage insights
- **Restart**: Restart the TestGenerator server in-place (detached respawn — no supervisor needed); UI auto-reloads when the new process is up
- **Resizable bottom panel**: Drag handle to adjust log area height
- **Parallel toggle**: Steps 6 and 7 have per-step parallel/sequential mode buttons

Timing summary printed at run end: `Step | Name | Duration | Tokens Used | Status`

## Test Coverage

10 feature files (login, dashboard, forgot-password, nav-bar, sidebar-navigation, import-costs, maintenance-admin, purchasing-tracker, timesheet-admin, vendor-admin). `npm run test` runs `@smoke` tagged scenarios only.

See [TestCoverage.md](TestCoverage.md) for the full breakdown.

## TestGenerator Unit Tests

Vitest-based unit tests for the TestGenerator backend (config, database, models, pipeline, step registry, story logger, server endpoints):

```bash
cd app/TestGenerator
npm test          # 78 tests across 8 files (~1.7s)
npm run test:watch
```

## Publishing — GitHub + GitLab

Push the current branch to both remotes in one shot via `scripts/push-both.sh`:

```bash
git remote add gitlab git@gitlab.com:powerslice-software-development/sm-test-artifacts.git  # one-time
./scripts/push-both.sh           # interactive
./scripts/push-both.sh -y        # skip confirmation
```

The script forces `~/.ssh/fulcrum` for both pushes via `GIT_SSH_COMMAND`, so no `~/.ssh/config` changes are needed.
