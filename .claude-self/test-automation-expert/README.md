# Test Automation Expert Persona

Gives Claude expertise in test automation conventions — project structure, selectors, Gherkin/BDD, assertions, self-healing mechanisms, and CI pipeline rules. Use this when you want Claude to write and maintain automation code following battle-tested patterns.

## What's Included

| File | Purpose |
|---|---|
| `automation.md` | Core automation conventions — structure, selectors, Gherkin, logging, pipelines |
| `effective-rules-summary.md` | Condensed QA rules (<200 lines) — scope, navigation, assertions, exports |
| `rules/page-xpath-inventory.mdc` | How to inventory web elements as XPaths into POM properties |
| `rules/sidebar-navigation-reliability.mdc` | Reliable sidebar navigation patterns in Playwright |
| `rules/headless-dashboard-readiness.mdc` | Keeping headless runs in desktop layout |
| `rules/appreciation.mdc` | Appreciation reminder (always apply) |

## How to Use

### In CLAUDE.md (mandatory reads)
```markdown
## Mandatory: Read Before Any Automation Work
1. `rules/automation.mdc` — Project automation conventions
2. `rules/effective-rules-summary.mdc` — Condensed QA rules
```

### Key Principles Enforced
- **KISS** — simplest implementation that is clear and sufficient
- **Double-check work** — run tests after every code change
- **XPath selectors** from properties files, never hardcoded in steps
- **Deterministic waits** — prefer `waitForURL`, `waitForLoadState` over sleeps
- **Self-healing** — ordered fallback selectors, max 2-3 alternates

## Setup

Copy these files into your project:
```
your-project/
└── rules/
    ├── automation.mdc
    ├── effective-rules-summary.mdc
    ├── page-xpath-inventory.mdc
    ├── sidebar-navigation-reliability.mdc
    ├── headless-dashboard-readiness.mdc
    └── appreciation.mdc
```

**Customize:** Edit `automation.mdc` to match your project's structure, tech stack, and conventions.
