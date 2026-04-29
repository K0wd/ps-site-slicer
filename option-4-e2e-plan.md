# Option 4 — Site E2E Augmentation Plan

**Scope:** Strengthen existing Playwright + BDD scenarios in `tests/`. **No unit tests — different category of work.** ~3-6 hours per feature.

## Premise

The `tests/` directory tests the **target SUT (Site Manager web app)**, not the TestGenerator code. These are end-to-end behavioral tests, not unit tests. "Unit tests" don't apply at the page level — Gherkin scenarios are the unit of work.

## What this option means

Extend / harden existing `.feature` files and step definitions for better coverage of SM behavior:

| Area | Action |
|---|---|
| Coverage gaps | Run `npx bddgen` to identify missing step definitions; backfill |
| Negative paths | Add scenarios for invalid input, network errors, permission denied |
| Cross-feature flows | Compose scenarios that span login → dashboard → action → verify |
| Visual regression | Add Playwright screenshot assertions for key pages |
| Performance | Add `expect(loadTime).toBeLessThan(N)` assertions |
| Accessibility | Add `@axe-core/playwright` integration for a11y checks |

## Files involved (per the project)

- `tests/features/*.feature` — extend with new scenarios
- `tests/steps/*.steps.ts` — add new step definitions
- `tests/properties/*.properties.ts` — extend XPath inventories
- `playwright.config.ts` — add visual regression project, perf budgets

## Mandatory reads (per project CLAUDE.md)

Before any test changes:
1. `.claude/quality.md` — ISTQB QA principles
2. `rules/automation.mdc` — automation conventions
3. `rules/effective-rules-summary.mdc` — condensed QA rules

## Exit criteria

- New scenarios pass against `https://testserver.betacom.com/`
- No regressions in existing scenarios
- XPath properties documented in property files (POM convention)
- All new steps follow Gherkin best practices (Given/When/Then per ISTQB CTAL-TA)

## When to choose this

- You actually want SM web app coverage extended, not TestGenerator code coverage.
- You're testing user-facing behavior, not internal logic.
- This is what the existing `tests/` infrastructure is for.
