---
name: BiteForge project name and app structure
description: The app/ directory houses BiteForge — the QA automation suite with TestGenerator (pipeline UI + CLI) and BugCreator (Jira ticket drafter). TestGenerator UI is under active development — do not modify without permission.
type: project
---

The QA automation suite under `app/` is named **BiteForge** (evolved from the original "bite" pipeline).

Two tools:
- **TestGenerator** — 11-step QA pipeline (Jira → test plan → Gherkin → Playwright → results → Jira). Has both a CLI (`TestGenerator.sh`) and a web UI (Express + vanilla JS on port 3847). The UI is actively being built — do not touch without explicit permission.
- **BugCreator** — Jira ticket draft generator (`TicketCreator.sh`). Uses Claude CLI to produce HTML drafts from brief descriptions.

**Why:** Kim is building a full QA automation workbench. The CLI came first (bite/chomp), the TypeScript rewrite + web UI is the current evolution.

**How to apply:** When working in `app/`, respect the two-tool structure. TestGenerator has its own rules under `app/TestGenerator/rules/`. Never modify TestGenerator code unless Kim explicitly asks for it.
