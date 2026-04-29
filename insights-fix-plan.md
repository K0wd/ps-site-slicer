# Claude Code Insights — Fix Plan

Source: `http://localhost:3847/api/claude/insights/report` (175 messages, 14 sessions, 2026-04-20 → 2026-04-25).

## Defaults applied (no user answer needed)

- **Scope:** Cross-project rules go to **global** `~/.claude/CLAUDE.md` and `~/.claude/settings.json`. Project-specific rules stay in `ps-site-slicer/CLAUDE.md`.
- **ADO MCP (E1):** **Deferred** — no PAT supplied yet.
- **Skill granularity:** Separate skills (`/ticket`, `/testgen`, `/schedule`, `/header-refresh`, `/visual-plan`).
- **Hook aggressiveness (B2):** **Warn-only** initially (no auto-kill).

## Current state observed

- `~/.claude/CLAUDE.md` — does **not** exist (will be created).
- `~/.claude/settings.json` — exists with one-off allow entries, model=sonnet.
- `~/.claude/skills/` — does **not** exist (will be created).
- `ps-site-slicer/.claude/settings.local.json` — many one-off allow entries; good source for consolidation.

---

## Execution order

### Phase 1 — Investigation (read-only)
- **G1.** Run `fewer-permission-prompts` skill to scan transcripts for top recurring command failures and produce an allowlist proposal.

### Phase 2 — Global CLAUDE.md (single new file)
Create `~/.claude/CLAUDE.md` containing:

- **A1. Project Memory rule** — default project-level CLAUDE.md when in a project dir
- **A2. Plan-before-place rule** — for new UI panels/tabs/modals, propose placement first
- **A3. Modal-not-mailto rule** — contact CTAs default to in-page modal
- **B3. Read-before-edit rule** — always Read before Edit/Write
- **B4. No-sed-multiline rule** — no `sed`/`awk` for multi-line CSS/HTML/JSON
- **C1. Visual spec rule** — state width units, positioning, animation behavior, alternatives before editing
- **C2. CSS conventions** — `display:none` not `opacity:0`; persistent overlays outside animated containers
- **F1. Sub-agent decision rule** — spawn Plan/Explore for >5-file refactors or >3 grep/read pairs

### Phase 3 — Global settings.json
Use the `update-config` skill to add to `~/.claude/settings.json`:

- **B1. Pre-approve common write/bash scopes** based on G1 scan + observed patterns:
  - `Bash(lsof:*)`, `Bash(kill:*)`, `Bash(pkill:*)` — stale-process recovery
  - `Bash(npx prettier:*)`, `Bash(npx tsc:*)`, `Bash(npm install:*)`, `Bash(npm run dev:*)`
  - `Bash(node -e:*)`, `Bash(node -p:*)`
  - `Bash(curl -s http://localhost:*)` — local API inspection
  - `Bash(bash -n:*)` — script syntax checks
- **B2. Stale-port hook** — `SessionStart` hook that warns if known dev ports (3000, 3847, 5173, 8080) are bound, prints holding PID

### Phase 4 — Custom skills (`~/.claude/skills/<name>/SKILL.md`)
- **D1. `/ticket`** — wraps `TicketCreator.sh` with multi-ticket batches and sprint+assignee confirmation
- **D2. `/testgen`** — loads ps-site-slicer pipeline context (Eng01-04, Bite pipeline rules), defaults to engineering mode
- **D3. `/schedule`** — wraps the TypeScript scheduler with crontab idioms
- **D4. `/header-refresh`** — codifies BiteForge weekly header tooling
- **C3. `/visual-plan`** — forces 2-3 layout variants with measurements before any visual edit

### Phase 5 — Deferred
- **E1. Azure DevOps MCP** — needs PAT + org/project from user. Documented here; not installed.

---

## Per-step exit criteria

| ID | Done when |
|---|---|
| G1 | Allowlist additions list written to plan; proceeds to B1 |
| A1–C2, F1 | `~/.claude/CLAUDE.md` exists with all 8 rule sections |
| B1 | `~/.claude/settings.json` `permissions.allow` includes new entries (no duplicates) |
| B2 | `~/.claude/settings.json` `hooks.SessionStart` defined with stale-port check |
| D1–D4, C3 | Each `~/.claude/skills/<name>/SKILL.md` exists and is invokable via `/<name>` |
| E1 | Skipped (deferred); user prompted with what's needed to enable |

## Rollback plan

- All edits target `~/.claude/` and a new file in this repo. To revert: delete `~/.claude/CLAUDE.md`, restore `~/.claude/settings.json` from `~/.claude/backups/`, delete `~/.claude/skills/` subdirs, delete `insights-fix-plan.md`.
