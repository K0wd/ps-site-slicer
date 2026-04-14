# PS Site Slicer

Automated QA test suite for **Site Manager** using Playwright with BDD (Cucumber/Gherkin) via `playwright-bdd`.

## Platform-Specific Setup

- **macOS** — [README-MAC.md](README-MAC.md)
- **Windows** — [README-WIN.md](README-WIN.md)

## Bite — Automated QA Runner

CLI-driven QA pipeline using Claude Code + Jira API. Run from the project root:

```bash
./bite.sh 1-11 SM-754       # Full run on a specific ticket
./bite.sh 1-6 SM-754        # Write Gherkin steps only
./bite.sh 6-8 SM-754        # Write + implement + execute
./bite/chomp.sh summary     # View journey log summary
```

| Step | Name | Description |
|------|------|-------------|
| 1 | Verify Jira Auth | Check Jira credentials |
| 2 | Find Ticket | JQL search for next SM Testing ticket |
| 3 | Review Ticket | Fetch issue, comments, attachments |
| 4 | Review Code | Find commits and changed files |
| 5 | Draft Test Plan | Claude generates `5_plan.md` |
| 6 | Write Gherkin Steps | One Claude call per TC in parallel → compiled `.feature` + `bddgen` |
| 7 | Write Automated Tests | Wire step definitions, verify compilation |
| 8 | Execute Tests | Run Playwright-BDD suite |
| 9 | Determine Results | Generate `9_test_report.md` with structured table |
| 10 | Post Results | Upload screenshots + comment to Jira |
| 11 | Transition Ticket | Move to Verify or QA Failed |

## Test Coverage

**122 scenarios** across 5 feature files. `npm run test` runs `@smoke` tagged scenarios only.

See [TestCoverage.md](TestCoverage.md) for the full breakdown.
