# PS Site Slicer — Claude Instructions

## Mandatory: Read Before Any Test Activity

Before writing, reviewing, modifying, or planning any test-related code (features, steps, properties, config), you MUST read:

1. **`.claude/quality.md`** — ISTQB QA principles, testing fundamentals, test levels, techniques
2. **`rules/automation.mdc`** — Project automation conventions (structure, selectors, Gherkin, logging)
3. **`rules/effective-rules-summary.mdc`** — Condensed QA rules (scope, navigation, assertions, exports)

## Project-Specific Rules

- **POM layer for this repo** — selectors live in `tests/properties/*.properties.ts`.

## Read On Demand (When Relevant)

### ISTQB Certification References
Read the relevant ISTQB rule file when working on that specific testing domain:

| Domain | Rule File |
|---|---|
| Test Automation Strategy | `rules/istqb-ct-tas-test-automation-strategy-aide-context.mdc` |
| Test Automation Engineering | `rules/istqb-ctal-tae-test-automation-engineering-aide-context.mdc` |
| Test Analyst | `rules/istqb-ctal-ta-v4-test-analyst-aide-context.mdc` |
| Technical Test Analyst | `rules/istqb-ctal-tta-technical-test-analyst-aide-context.mdc` |
| Test Management | `rules/istqb-ctal-tm-test-management-aide-context.mdc` |
| Agile Testing | `rules/istqb-ctal-att-agile-technical-tester-aide-context.mdc` |
| Agile Tester (Foundation) | `rules/istqb-ctfl-agile-tester-aide-context.mdc` |
| Security Testing | `rules/istqb-ct-sec-security-testing-aide-context.mdc` |
| Security Test Engineer | `rules/istqb-ste-security-test-engineer-aide-context.mdc` |
| Performance Testing | `rules/istqb-ct-pt-performance-testing-aide-context.mdc` |
| Usability Testing | `rules/istqb-ct-ut-usability-testing-aide-context.mdc` |
| Mobile App Testing | `rules/istqb-ct-mat-mobile-application-testing-aide-context.mdc` |
| Acceptance Testing | `rules/istqb-ct-act-acceptance-testing-aide-context.mdc` |
| AI Testing | `rules/istqb-ct-ai-ai-testing-aide-context.mdc` |
| Testing with GenAI | `rules/istqb-ct-genai-testing-with-genai-aide-context.mdc` |
| Model-Based Testing | `rules/istqb-ct-mbt-model-based-testing-aide-context.mdc` |
| Agile Test Leadership | `rules/istqb-ct-atlas-agile-test-leadership-aide-context.mdc` |
| Game Testing | `rules/istqb-ct-game-game-testing-aide-context.mdc` |
| Gambling Industry Testing | `rules/istqb-ct-gt-gambling-industry-tester-aide-context.mdc` |
| Improving Test Process | `rules/istqb-ctel-itp-improving-test-process-aide-context.mdc` |
| Expert Test Management | `rules/istqb-ctel-tm-expert-test-management-aide-context.mdc` |
| Quality (Foundation) | `rules/istqb-ctfl-quality-context.mdc` |
| Test Artifacts | `rules/istqb-ctfl-test-artifact-aide-context.mdc` |
| Test Analyst v3.1.2 | `rules/istqb-ctal-ta-v312-test-analyst-aide-context.mdc` |

### Project-Specific Rules
| Purpose | Rule File |
|---|---|
| Page XPath inventory (POM) | `rules/page-xpath-inventory.mdc` |
| Sidebar navigation reliability | `rules/sidebar-navigation-reliability.mdc` |
| Headless dashboard readiness | `rules/headless-dashboard-readiness.mdc` |
| Cross-project context | `rules/sibling-projects-context.mdc` |

## Project Context

- **App:** Site Manager (SM) by Powerslice Software
- **Test target:** `https://testserver.betacom.com/` (SPA login at `/spa/auth/login`)
- **Stack:** Playwright + playwright-bdd (Cucumber/Gherkin) + TypeScript
- **Browser:** MS Edge (`msedge` channel)
- **Jira:** See `.claude/wiki.md` for project details
- **Credentials:** Stored in `.env` (never commit)

## Project Structure

```
tests/
├── features/*.feature        — Gherkin scenarios (plain English)
├── steps/*.steps.ts          — Step definitions (Playwright code)
└── properties/*.properties.ts — XPath locators per page (POM)
html/                          — htmlBody snapshots (gitignored)
rules/                         — QA and ISTQB rule files
.claude/                       — quality.md, wiki.md
```
