# PS Site Slicer — Claude Instructions

## Mandatory: Read Before Any Test Activity

Before writing, reviewing, modifying, or planning any test-related code (features, steps, properties, config), you MUST read:

1. **`.claude-self/quality.md`** — ISTQB QA principles, testing fundamentals, test levels, techniques
2. **`.claude-self/rules/automation.mdc`** — Project automation conventions (structure, selectors, Gherkin, logging)
3. **`.claude-self/rules/effective-rules-summary.mdc`** — Condensed QA rules (scope, navigation, assertions, exports)
4. **`.claude-self/rules/ai-test-verification.mdc`** — AI test verification standard (5 gates: positive, negative, mutation, assertion cross-ref, selector quality)
5. **`.claude-self/rules/engineer-checkpoints.mdc`** — Three engineer approval checkpoints (curated requirements → Gherkin draft → evidence pack)
6. **`.claude-self/rules/qa-requirements-reference-points.mdc`** — Cross-cutting concerns evaluated at Phase 1 curation (security, error handling, accessibility, API contracts, etc.)

## Project-Specific Rules

- **POM layer for this repo** — selectors live in `tests/properties/*.properties.ts`.
- **Bite pipeline steps** — each step does one clear job; no speculative features.

## Read On Demand (When Relevant)

### ISTQB Certification References
Read the relevant ISTQB rule file when working on that specific testing domain:

| Domain | Rule File |
|---|---|
| Test Automation Strategy | `.claude-self/rules/istqb-ct-tas-test-automation-strategy-aide-context.mdc` |
| Test Automation Engineering | `.claude-self/rules/istqb-ctal-tae-test-automation-engineering-aide-context.mdc` |
| Test Analyst | `.claude-self/rules/istqb-ctal-ta-v4-test-analyst-aide-context.mdc` |
| Technical Test Analyst | `.claude-self/rules/istqb-ctal-tta-technical-test-analyst-aide-context.mdc` |
| Test Management | `.claude-self/rules/istqb-ctal-tm-test-management-aide-context.mdc` |
| Agile Testing | `.claude-self/rules/istqb-ctal-att-agile-technical-tester-aide-context.mdc` |
| Agile Tester (Foundation) | `.claude-self/rules/istqb-ctfl-agile-tester-aide-context.mdc` |
| Security Testing | `.claude-self/rules/istqb-ct-sec-security-testing-aide-context.mdc` |
| Security Test Engineer | `.claude-self/rules/istqb-ste-security-test-engineer-aide-context.mdc` |
| Performance Testing | `.claude-self/rules/istqb-ct-pt-performance-testing-aide-context.mdc` |
| Usability Testing | `.claude-self/rules/istqb-ct-ut-usability-testing-aide-context.mdc` |
| Mobile App Testing | `.claude-self/rules/istqb-ct-mat-mobile-application-testing-aide-context.mdc` |
| Acceptance Testing | `.claude-self/rules/istqb-ct-act-acceptance-testing-aide-context.mdc` |
| AI Testing | `.claude-self/rules/istqb-ct-ai-ai-testing-aide-context.mdc` |
| Testing with GenAI | `.claude-self/rules/istqb-ct-genai-testing-with-genai-aide-context.mdc` |
| Model-Based Testing | `.claude-self/rules/istqb-ct-mbt-model-based-testing-aide-context.mdc` |
| Agile Test Leadership | `.claude-self/rules/istqb-ct-atlas-agile-test-leadership-aide-context.mdc` |
| Game Testing | `.claude-self/rules/istqb-ct-game-game-testing-aide-context.mdc` |
| Gambling Industry Testing | `.claude-self/rules/istqb-ct-gt-gambling-industry-tester-aide-context.mdc` |
| Improving Test Process | `.claude-self/rules/istqb-ctel-itp-improving-test-process-aide-context.mdc` |
| Expert Test Management | `.claude-self/rules/istqb-ctel-tm-expert-test-management-aide-context.mdc` |
| Quality (Foundation) | `.claude-self/rules/istqb-ctfl-quality-context.mdc` |
| Test Artifacts | `.claude-self/rules/istqb-ctfl-test-artifact-aide-context.mdc` |
| Test Analyst v3.1.2 | `.claude-self/rules/istqb-ctal-ta-v312-test-analyst-aide-context.mdc` |

### Project-Specific Rules
| Purpose | Rule File |
|---|---|
| Page XPath inventory (POM) | `.claude-self/rules/page-xpath-inventory.mdc` |
| Sidebar navigation reliability | `.claude-self/rules/sidebar-navigation-reliability.mdc` |
| Headless dashboard readiness | `.claude-self/rules/headless-dashboard-readiness.mdc` |
| Cross-project context | `.claude-self/rules/sibling-projects-context.mdc` |

## Project Context

- **App:** Site Manager (SM) by Powerslice Software
- **Test target:** `https://testserver.betacom.com/` (SPA login at `/spa/auth/login`)
- **Stack:** Playwright + playwright-bdd (Cucumber/Gherkin) + TypeScript
- **Browser:** MS Edge (`msedge` channel)
- **Jira:** See `.claude-self/wiki.md` for project details
- **Credentials:** Stored in `.env` (never commit)

## Project Structure

```
tests/
├── features/*.feature        — Gherkin scenarios (plain English)
├── steps/*.steps.ts          — Step definitions (Playwright code)
└── properties/*.properties.ts — XPath locators per page (POM)
html/                          — htmlBody snapshots (gitignored)
.claude-self/rules/             — QA and ISTQB rule files (mirrored across .claude/, .claude-self/, .claude-atmail/)
.claude-self/                   — quality.md, wiki.md, expert/app contexts
app/TestGenerator/             — single-app monolith (see Module map below)
```

## Module map (`app/TestGenerator/src/`)

| Domain | Path | Owns |
|---|---|---|
| `shared/` | infra | Config, Database, models, StoryLogger, Pipeline, Step, StepRegistry |
| `services/` | external integrations | ClaudeService, JiraService, GitService, PlaywrightService, ContextBuilder |
| `generator/steps/` | Step01–07 | ticket lookup → review → test plan → Gherkin → automated tests |
| `automator/steps/` | Step08–11 + Eng01–04 | execute → results → post → transition; healing pipeline |
| `automator/scheduler/` | scheduling | Scheduler (cron-like for engineering loops) |
| `createbug/` | bug filing | TicketCreator.sh + template.html (folded from former `app/BugCreator/`) |
