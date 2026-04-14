# PS Site Slicer

Automated QA test suite for **Site Manager** using Playwright with BDD (Cucumber/Gherkin) via `playwright-bdd`.

## Platform-Specific Setup

- **macOS** — [README-MAC.md](README-MAC.md)
- **Windows** — [README-WIN.md](README-WIN.md)

## Bite — Automated QA Runner

The `bite/` folder contains a CLI-driven QA automation pipeline that uses Claude Code + Jira API to automatically test tickets.

```bash
./bite.sh 1-10              # Full run: find ticket → test → post results
./bite.sh 1-6 SM-754        # Run steps 1-6 on a specific ticket
./bite/chomp.sh summary     # View journey log summary
```

See [bite/QA_AUTOMATION_SETUP_GUIDE.md](bite/QA_AUTOMATION_SETUP_GUIDE.md) for setup instructions.

## Test Coverage

**122 scenarios** across 5 feature files. See [TestCoverage.md](TestCoverage.md) for the full breakdown.
