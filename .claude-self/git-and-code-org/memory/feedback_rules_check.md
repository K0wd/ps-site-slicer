---
name: Always read rules before generating test code
description: Must read rules/ folder and .claude/*.md before writing or modifying any test scripts, steps, or properties
type: feedback
---

Always read the rules/ folder (especially automation.mdc, effective-rules-summary.mdc) and .claude/*.md files before generating or modifying test scripts, step definitions, or properties files.

**Why:** The user has invested significant effort creating QA rules (KISS, double-check work, XPath strategy, self-heal patterns, etc.) and expects Claude to follow them consistently. Skipping the rules leads to avoidable rework — e.g., writing XPaths that don't match the real DOM, or not running tests after changes.

**How to apply:**
- Before writing any test-related code, read the relevant rules files first
- After every code change that affects tests, run the tests to verify (double-check your work)
- Use the simplest locator that works (KISS) — prefer Playwright's error-context page snapshots over complex HTML parsing
- When XPaths fail, check the error-context.md that Playwright generates — it has the exact ARIA tree
