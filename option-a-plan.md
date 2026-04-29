# Option A Plan — Logical split inside `app/TestGenerator/`

**Objective:** Reorganize `app/TestGenerator/src/` into 4 logical subdirectories — `generator/`, `automator/`, `ui/`, `createbug/` — by moving existing files and folding `app/BugCreator/` into `src/createbug/`. **No new top-level apps. One package.json. No external public-API changes.**

This is a refactor of file locations + import paths only. No behavioral changes.

---

## Goals

1. Group code by domain so future work doesn't grep across 15 step files
2. Fold `app/BugCreator/` into `app/TestGenerator/src/createbug/` so there's one app, not two
3. Keep `app/TestGenerator/` as the only `app/` entry; delete empty `app/BugCreator/`
4. Match the rules dirs already in place at `.claude/{test-generator,ui,automator}/rules/` (add `.claude/createbug/rules/` for symmetry)
5. Zero-downtime: `npm run dev` keeps working after each phase

## Non-goals

- No package.json split, no workspace setup, no separate node_modules
- No HTTP/IPC between modules — everything stays in-process
- No renaming of classes or public APIs
- No content edits to existing rule .mdc files

---

## Target layout

```
app/TestGenerator/
├── data/                              (unchanged — SQLite location)
├── logs/                              (unchanged)
├── ui/                                (unchanged — frontend html/css/js stays at root)
├── package.json                       (unchanged)
├── tsconfig.json                      (unchanged)
├── TestGenerator.sh                   (unchanged — top-level orchestrator)
├── chomp.sh                           (unchanged — top-level helper)
├── run-qa.sh                          (unchanged)
├── setup-scheduler.sh                 (unchanged)
├── jira_api.py                        (unchanged — used by shell steps)
├── steps/                             (unchanged — shell scripts called by .sh)
└── src/
    ├── index.ts                       (entry — wires everything together)
    ├── server.ts                      (Express routes)
    ├── shared/                        ← NEW (was: src/{config,data,logger,pipeline} core)
    │   ├── config/
    │   │   └── Config.ts              (moved from src/config/)
    │   ├── data/
    │   │   ├── Database.ts            (moved from src/data/)
    │   │   └── models.ts              (moved from src/data/)
    │   ├── logger/
    │   │   └── StoryLogger.ts         (moved from src/logger/)
    │   └── pipeline/
    │       ├── Pipeline.ts            (moved from src/pipeline/)
    │       ├── Step.ts                (moved from src/pipeline/)
    │       └── StepRegistry.ts        (moved from src/pipeline/, edited — see Phase 4)
    ├── services/                      (unchanged location — referenced by all domains)
    │   ├── ClaudeService.ts
    │   ├── JiraService.ts
    │   ├── GitService.ts
    │   ├── PlaywrightService.ts
    │   └── ContextBuilder.ts
    ├── generator/                     ← NEW (Step01-07: ticket → test plan → code)
    │   └── steps/
    │       ├── Step01VerifyAuth.ts
    │       ├── Step02FindTicket.ts
    │       ├── Step03ReviewTicket.ts
    │       ├── Step04ReviewCode.ts
    │       ├── Step05DraftTestPlan.ts
    │       ├── Step06WriteGherkin.ts
    │       └── Step07WriteAutomatedTests.ts
    ├── automator/                     ← NEW (Step08-11 + Eng01-04: run + heal + post)
    │   ├── steps/
    │   │   ├── Step08ExecuteTests.ts
    │   │   ├── Step09DetermineResults.ts
    │   │   ├── Step10PostResults.ts
    │   │   ├── Step11TransitionTicket.ts
    │   │   ├── Eng01CheckSteps.ts
    │   │   ├── Eng02RunTests.ts
    │   │   ├── Eng03HealScenario.ts
    │   │   └── Eng04AppScraper.ts
    │   └── scheduler/
    │       └── Scheduler.ts            (moved from src/scheduler/)
    └── createbug/                     ← NEW (folded from app/BugCreator/)
        ├── TicketCreator.sh           (moved from app/BugCreator/TicketCreator.sh)
        ├── template.html              (moved from app/BugCreator/template.html)
        └── (future) BugCreator.ts     (placeholder — not created yet)

app/BugCreator/                        ← DELETED after move (logs/ moved or kept-empty)
```

**Note on `src/ui/`:** `server.ts` already serves the frontend in `app/TestGenerator/ui/` (sibling of `src/`). Not moving the frontend into `src/ui/` because Express expects it where it is. The `.claude/ui/rules/` content covers that frontend.

---

## Phase 1 — Pre-flight (no edits)

1. Stop any running TestGenerator dev server (port 3847). The SessionStart hook flags it; kill PID first.
2. `git status` clean OR a known-staged baseline. Don't start mid-merge.
3. Snapshot baseline behavior: `npm run dev` → hit `/api/health` (or load UI) → record it works.
4. Confirm test suite runs: `cd ../..` and `npx playwright test --list` to ensure no surprise breakage upstream.

**Exit criteria:** clean git, working baseline noted, no live dev server.

---

## Phase 2 — Create new dirs (additive, no moves yet)

```bash
mkdir -p app/TestGenerator/src/{shared/{config,data,logger,pipeline},generator/steps,automator/steps,automator/scheduler,createbug}
```

**Exit criteria:** 8 new empty dirs exist. Build still works (nothing changed).

---

## Phase 3 — Move shared core (one PR/commit)

```bash
git mv app/TestGenerator/src/config/Config.ts          app/TestGenerator/src/shared/config/
git mv app/TestGenerator/src/data/Database.ts          app/TestGenerator/src/shared/data/
git mv app/TestGenerator/src/data/models.ts            app/TestGenerator/src/shared/data/
git mv app/TestGenerator/src/logger/StoryLogger.ts     app/TestGenerator/src/shared/logger/
git mv app/TestGenerator/src/pipeline/Pipeline.ts      app/TestGenerator/src/shared/pipeline/
git mv app/TestGenerator/src/pipeline/Step.ts          app/TestGenerator/src/shared/pipeline/
# StepRegistry.ts stays in src/pipeline/ for now — moved + edited in Phase 4

rmdir app/TestGenerator/src/config app/TestGenerator/src/data app/TestGenerator/src/logger
```

### Import updates required

| File(s) | Before | After |
|---|---|---|
| `src/index.ts` | `from './config/Config.js'` | `from './shared/config/Config.js'` |
| `src/index.ts` | `from './data/Database.js'` | `from './shared/data/Database.js'` |
| `src/index.ts` | `from './logger/StoryLogger.js'` | `from './shared/logger/StoryLogger.js'` |
| `src/index.ts` | `from './pipeline/Pipeline.js'` | `from './shared/pipeline/Pipeline.js'` |
| `src/server.ts` | `from './config/Config.js'` | `from './shared/config/Config.js'` |
| `src/server.ts` | `from './data/Database.js'` | `from './shared/data/Database.js'` |
| `src/server.ts` | `from './pipeline/Pipeline.js'` | `from './shared/pipeline/Pipeline.js'` |
| `src/pipeline/Pipeline.ts` (now in shared/) | imports `Step.js`, etc. | adjust within `shared/pipeline/` |
| `src/services/*.ts` | `from '../config/Config.js'` | `from '../shared/config/Config.js'` |
| `src/services/*.ts` | `from '../data/Database.js'` | `from '../shared/data/Database.js'` |
| `src/scheduler/Scheduler.ts` | `from '../pipeline/Pipeline.js'` etc. | adjust (then moved in Phase 5) |
| All step files (still in `src/pipeline/steps/`) | `from '../Step.js'` | `from '../../shared/pipeline/Step.js'` (will collapse in Phase 5) |

**Verify:**
```bash
cd app/TestGenerator && npx tsc --noEmit && npm run dev
```
Hit one endpoint to confirm runtime works.

**Exit criteria:** `tsc --noEmit` clean, dev server boots, one pipeline run completes.

---

## Phase 4 — Move pipeline steps to generator/ and automator/

```bash
# Generator (Steps 01-07)
git mv app/TestGenerator/src/pipeline/steps/Step0{1,2,3,4,5,6,7}*.ts app/TestGenerator/src/generator/steps/

# Automator (Steps 08-11 + Eng01-04)
git mv app/TestGenerator/src/pipeline/steps/Step0{8,9}*.ts app/TestGenerator/src/automator/steps/
git mv app/TestGenerator/src/pipeline/steps/Step1{0,1}*.ts app/TestGenerator/src/automator/steps/
git mv app/TestGenerator/src/pipeline/steps/Eng0{1,2,3,4}*.ts app/TestGenerator/src/automator/steps/

# Move scheduler
git mv app/TestGenerator/src/scheduler/Scheduler.ts app/TestGenerator/src/automator/scheduler/

# Move StepRegistry to shared/pipeline/ and rewrite imports inside it
git mv app/TestGenerator/src/pipeline/StepRegistry.ts app/TestGenerator/src/shared/pipeline/

rmdir app/TestGenerator/src/pipeline/steps app/TestGenerator/src/pipeline app/TestGenerator/src/scheduler
```

### `StepRegistry.ts` import rewrite

Before:
```ts
import { Step01VerifyAuth } from './steps/Step01VerifyAuth.js';
// ... 14 more lines
```

After:
```ts
import { Step01VerifyAuth } from '../../generator/steps/Step01VerifyAuth.js';
import { Step02FindTicket } from '../../generator/steps/Step02FindTicket.js';
import { Step03ReviewTicket } from '../../generator/steps/Step03ReviewTicket.js';
import { Step04ReviewCode } from '../../generator/steps/Step04ReviewCode.js';
import { Step05DraftTestPlan } from '../../generator/steps/Step05DraftTestPlan.js';
import { Step06WriteGherkin } from '../../generator/steps/Step06WriteGherkin.js';
import { Step07WriteAutomatedTests } from '../../generator/steps/Step07WriteAutomatedTests.js';
import { Step08ExecuteTests } from '../../automator/steps/Step08ExecuteTests.js';
import { Step09DetermineResults } from '../../automator/steps/Step09DetermineResults.js';
import { Step10PostResults } from '../../automator/steps/Step10PostResults.js';
import { Step11TransitionTicket } from '../../automator/steps/Step11TransitionTicket.js';
import { Eng01CheckSteps } from '../../automator/steps/Eng01CheckSteps.js';
import { Eng02RunTests } from '../../automator/steps/Eng02RunTests.js';
import { Eng03HealScenario } from '../../automator/steps/Eng03HealScenario.js';
import { Eng04AppScraper } from '../../automator/steps/Eng04AppScraper.js';
```

### Step file import rewrites

All step files currently use `from '../Step.js'`. New depth changes from `src/pipeline/steps/StepXX.ts` → `src/{generator|automator}/steps/StepXX.ts`. Same depth (2 from `src/`), but path target moved:

Before: `from '../Step.js'`
After:  `from '../../shared/pipeline/Step.js'`

Apply this rewrite to all 15 step files. One sed-style sweep with the Edit tool — **no actual `sed` per project CLAUDE.md rule "no sed for multi-line"**, use Edit with `replace_all: true` per file.

### Other import updates

| File | Old import | New import |
|---|---|---|
| `src/index.ts` | `from './pipeline/Pipeline.js'` | `from './shared/pipeline/Pipeline.js'` |
| `src/index.ts` | `from './scheduler/Scheduler.js'` | `from './automator/scheduler/Scheduler.js'` |
| `src/server.ts` | `from './pipeline/Pipeline.js'` | `from './shared/pipeline/Pipeline.js'` |
| Any file importing `StepRegistry` | `from './pipeline/StepRegistry.js'` | `from './shared/pipeline/StepRegistry.js'` |
| `Pipeline.ts` (now in `shared/pipeline/`) | references to `StepRegistry` | sibling import OK |
| `Scheduler.ts` (now in `automator/scheduler/`) | references to Pipeline | `from '../../shared/pipeline/Pipeline.js'` |

**Verify after Phase 4:**
```bash
cd app/TestGenerator && npx tsc --noEmit && npm run dev
# Run one short pipeline (e.g., Steps 1-2) to confirm
./TestGenerator.sh 1-2
```

**Exit criteria:** `tsc --noEmit` clean, dev server boots, Steps 1-2 + one Eng step both run successfully.

---

## Phase 5 — Fold `app/BugCreator/` into `src/createbug/`

```bash
git mv app/BugCreator/TicketCreator.sh app/TestGenerator/src/createbug/
git mv app/BugCreator/template.html    app/TestGenerator/src/createbug/

# Optional: preserve logs/ history (BugCreator/logs/ is gitignored anyway per .gitignore)
# If logs are wanted: mkdir -p app/TestGenerator/logs/createbug && mv app/BugCreator/logs/* app/TestGenerator/logs/createbug/
# Otherwise: rm -rf app/BugCreator/logs

rm -f app/BugCreator/.DS_Store
rmdir app/BugCreator/rules 2>/dev/null   # already empty from prior move
rmdir app/BugCreator                     # should be empty now
```

### Update references

| File | Old | New |
|---|---|---|
| `.claude/projects/.../memory/project_biteforge.md` | `app/BugCreator/...` mentions | `app/TestGenerator/src/createbug/...` |
| `.claude-self/projects/.../memory/project_biteforge.md` | same | mirror update |
| `app/TestGenerator/CLIENT-DEPLOYMENT-GUIDE.md` | any `BugCreator` mention | `createbug` module reference |
| `app/TestGenerator/CHANGELOG.md` | append "BugCreator folded into src/createbug/" entry |
| `~/.claude/skills/ticket/SKILL.md` (locate path priority) | add `./app/TestGenerator/src/createbug/TicketCreator.sh` as the **first** lookup path |
| `~/.claude-self/skills/ticket/SKILL.md` | same mirror update |
| Project root `package.json` if it has a `bugcreator` script | rewire path |
| Any cron entry / CI step calling `app/BugCreator/TicketCreator.sh` | new path |

### TicketCreator.sh path adjustments

Currently it likely runs with `cd app/BugCreator` working dir assumptions. Read the script and patch any hardcoded `BugCreator` strings (paths to logs, template). Test with one ticket creation in dry-run mode if available.

**Verify:**
```bash
bash -n app/TestGenerator/src/createbug/TicketCreator.sh   # syntax check
ls app/BugCreator 2>/dev/null && echo "ERROR: app/BugCreator still exists" || echo "✓ app/BugCreator removed"
```

**Exit criteria:** `app/BugCreator/` gone from tree, `TicketCreator.sh` runs from new location, ticket skill points at new path.

---

## Phase 6 — Sync rules dirs and add `createbug` rules context

```bash
mkdir -p .claude/createbug/rules .claude-self/createbug/rules

# Move BugCreator rules already mirrored in .claude/bug-creator/rules/ → .claude/createbug/rules/
# (Since "createbug" is now the canonical module name)
git mv .claude/bug-creator/rules/jira-ticket-creation.md      .claude/createbug/rules/
git mv .claude-self/bug-creator/rules/jira-ticket-creation.md .claude-self/createbug/rules/
rmdir .claude/bug-creator/rules .claude/bug-creator
rmdir .claude-self/bug-creator/rules .claude-self/bug-creator

# Verify mirror
diff -rq .claude .claude-self
```

**Exit criteria:** `.claude/createbug/rules/jira-ticket-creation.md` exists, mirrored in `.claude-self/`, no `bug-creator` dir remains.

---

## Phase 7 — Update CLAUDE.md and docs

### Project root `CLAUDE.md`

Add a "Module map" section under "Project Context" (or update existing structure tree):

```markdown
## Module map (app/TestGenerator/src/)

| Domain | Path | Owns |
|---|---|---|
| `shared/` | infra | Config, Database, models, logger, Pipeline base, Step base, StepRegistry |
| `services/` | external integrations | Claude, Jira, Git, Playwright, ContextBuilder |
| `generator/` | Step01-07 | ticket lookup → test plan → Gherkin → automated test code |
| `automator/` | Step08-11 + Eng01-04 + scheduler | execute → results → post → transition; healing pipeline |
| `createbug/` | bug filing | TicketCreator.sh (folded from former app/BugCreator/) |
```

Also update the structure tree at line ~88 of CLAUDE.md to reflect new src/ layout.

### `app/TestGenerator/CHANGELOG.md`

Append entry:
```markdown
## [Unreleased]
- Reorganized src/ into shared/, generator/, automator/, createbug/ subdirs
- Folded former app/BugCreator/ into src/createbug/
- All imports updated to new paths; no behavioral changes
```

### `app/TestGenerator/CLIENT-DEPLOYMENT-GUIDE.md`

Audit and update any path references (search for `src/pipeline`, `src/config`, `src/scheduler`, `BugCreator`).

### Skills

- `~/.claude/skills/ticket/SKILL.md` and `~/.claude-self/skills/ticket/SKILL.md`: prepend `./app/TestGenerator/src/createbug/TicketCreator.sh` to the lookup list, demote the old `./app/BugCreator/TicketCreator.sh` (or remove).
- `~/.claude/skills/testgen/SKILL.md` and mirror: update Eng01-04 read paths from `./app/TestGenerator/src/pipeline/steps/EngXXX.ts` → `./app/TestGenerator/src/automator/steps/EngXXX.ts`.

---

## Phase 8 — Final verification

```bash
# 1. Full TS check
cd app/TestGenerator && npx tsc --noEmit

# 2. Boot dev server, hit health endpoint
npm run dev &
sleep 3
curl -s http://localhost:3847/api/health || echo "no health endpoint — try /api/stream"
kill %1

# 3. Run a generator pipeline (Steps 1-3)
./TestGenerator.sh 1-3 SM-754

# 4. Run an automator/eng cycle
./TestGenerator.sh 101-103 SM-754

# 5. Confirm createbug works
bash -n src/createbug/TicketCreator.sh
# (manual test: create one ticket end-to-end)

# 6. Mirror sync sanity
diff -rq .claude .claude-self

# 7. Project-wide grep for stale paths
grep -rln "src/pipeline/steps\|src/config\|src/data/Database\|src/scheduler\|app/BugCreator" \
  --include="*.md" --include="*.ts" --include="*.js" --include="*.sh" --include="*.json" \
  2>/dev/null | grep -v "node_modules\|\.features-gen\|\.git/\|CHANGELOG.md"
# Should return empty
```

---

## Rollback

Each phase is one logical commit. To revert any phase:
```bash
git reset --hard <pre-phase-commit-sha>
# or for a single move
git mv <new-path> <old-path>
```

Phases 3-5 each touch ≤25 files. Phase 4 is the largest (15 step files + StepRegistry + 3 entry-point files = ~20 edits).

---

## Estimated effort

| Phase | Risk | Time |
|---|---|---|
| 1 — Pre-flight | none | 5 min |
| 2 — Create dirs | none | 1 min |
| 3 — Move shared core | low | 15 min |
| 4 — Move pipeline steps | medium | 25 min |
| 5 — Fold BugCreator | low | 10 min |
| 6 — Rules dirs sync | none | 3 min |
| 7 — Docs/skills update | low | 15 min |
| 8 — Final verification | low | 10 min |
| **Total** | | **~85 min** |

---

## Open decisions before executing

1. **`logs/` from BugCreator** — discard, or move under `app/TestGenerator/logs/createbug/`?
2. **Frontend `ui/` location** — leave at `app/TestGenerator/ui/` (current), or also move under `src/ui/`? Recommendation: leave it. Express config is wired to current path.
3. **Are there cron entries** referencing `app/BugCreator/TicketCreator.sh`? Run `crontab -l | grep BugCreator` before Phase 5.
4. **Commit granularity** — one commit per phase (recommended) vs. one big "refactor" commit.

---

## Files touched (estimate)

- **Moved:** ~24 files (3 config/data/logger + 3 pipeline core + 15 steps + 1 scheduler + 2 BugCreator)
- **Edited:** ~22 files (15 steps for Step.js import + 4 entry/server/registry/scheduler + ~3 docs)
- **Deleted (empty dirs):** `src/config/`, `src/data/`, `src/logger/`, `src/pipeline/steps/`, `src/pipeline/`, `src/scheduler/`, `app/BugCreator/`, `.claude/bug-creator/`, `.claude-self/bug-creator/`
- **Created (new dirs):** `src/shared/{config,data,logger,pipeline}/`, `src/generator/steps/`, `src/automator/steps/`, `src/automator/scheduler/`, `src/createbug/`, `.claude/createbug/rules/`, `.claude-self/createbug/rules/`
