# What's Next — TestGenerator Roadmap

## Priority 1: Healing Reliability

> Source: `heal-scenario.fix.md`

The heal loop works end-to-end but wastes time on unfixable errors and gives poor visibility during Claude calls. These fixes make it production-usable.

### 1.1 Error Classifier + Fail-Fast Triage

**Problem:** Every failure goes to Claude, even config errors and infrastructure issues. User waits 5 minutes for something that can't be fixed by code.

**Fix:** Classify the error before calling Claude. Abort immediately on unfixable errors.

| Error Type | Action |
|---|---|
| `No tests found` | Abort — grep/bddgen config issue |
| `CONFIG ERROR: Project not found` | Abort — Playwright config |
| `Missing steps: 20+` | Abort — too systemic for Claude |
| `Missing steps: 1-19` | Heal |
| `Locator timeout / element not found` | Heal — XPath fix via HTML snapshot |
| `Navigation / login timeout` | Abort — infrastructure, server may be down |
| `Assertion failure (expected vs received)` | Heal — logic fix |
| `bddgen non-step error` | Abort — build/config issue |

**Impact:** Unhealable errors abort in <1s instead of 5 minutes.

### 1.2 Progress Heartbeat During Claude Calls

**Problem:** User sees "Calling Claude..." then silence for minutes. No way to tell if it's working or stuck.

**Fix:** Log every 30 seconds during the Claude call:
```
│ Claude working... (30s elapsed)
│ Claude working... (60s, 2 tool calls)
│ Claude working... (90s, 4 tool calls)
```

**Impact:** User always knows what's happening.

### 1.3 Exhausted Test Marking

**Problem:** After max rounds fail, the `.test` file stays. On next cycle, step 102 might re-create it, and step 103 tries the same failing scenario again.

**Fix:** Rename to `.test.exhausted` after max rounds. Step 102 skips exhausted tests. Step 103 ignores them. User can review and manually fix.

**Impact:** Prevents infinite re-processing of unfixable scenarios.

### 1.4 Trim HTML Context

**Problem:** Full page HTML snapshots are 30KB+. Prompt hits 48KB. Claude is slower and more expensive.

**Fix:** Parse the error to find the failing XPath/locator, search the HTML for the relevant DOM section, send only that section (2-5KB). Fallback: first 10KB.

**Impact:** Faster Claude responses, lower cost, same fix quality.

---

## Priority 2: Claude Code Insights Integration

> Source: `insights-fix-plan.md`

### 2.1 Global CLAUDE.md

Create `~/.claude-self/CLAUDE.md` with cross-project rules:
- **Plan-before-place** — propose UI placement before editing
- **Modal-not-mailto** — contact CTAs default to in-page modal
- **Read-before-edit** — always Read before Edit/Write
- **No-sed-multiline** — no `sed`/`awk` for multi-line CSS/HTML/JSON
- **Visual spec** — state width, positioning, animation before editing CSS
- **CSS conventions** — `display:none` not `opacity:0`
- **Sub-agent decision** — spawn Plan/Explore for large refactors

### 2.2 Permission Consolidation

Scan transcripts for recurring permission prompts. Add pre-approved scopes to `~/.claude/settings.json`:
- `npx prettier`, `npx tsc`, `npm install`, `npm run dev`
- `lsof`, `kill`, `pkill` for stale-process recovery
- `curl -s http://localhost:*` for local API inspection
- Stale-port `SessionStart` hook (warn if dev ports are bound)

### 2.3 Custom Skills

| Skill | Purpose |
|---|---|
| `/ticket` | Batch Jira ticket creation with sprint + assignee |
| `/testgen` | Load engineering pipeline context, default to Eng mode |
| `/schedule` | Wrap TypeScript scheduler with crontab idioms |
| `/header-refresh` | BiteForge weekly header tooling |
| `/visual-plan` | Force layout variants with measurements before visual edits |

### 2.4 Azure DevOps MCP (Deferred)

Needs PAT + org/project from user. Documented but not installed.

---

## Priority 3: Pipeline Improvements

### 3.1 Step 102 — Smarter Test Ordering

Currently runs tests alphabetically by tag. Could be smarter:
- Run previously-passing tests first (regression detection)
- Run recently-healed tests first (verify stability)
- Skip tests whose feature file hasn't changed since last pass

### 3.2 Step 103 — Heal Quality

- Track heal success rate per error type → learn which errors are worth attempting
- Save successful fix patterns to a knowledge base → reuse in future prompts
- Add `error-context.md` from Playwright as additional Claude context (page snapshot at failure point)

### 3.3 Step 104 — App Scraper Automation

- Schedule regular HTML snapshot refreshes (pages change as the app evolves)
- Detect stale snapshots — compare DOM structure before/after scrape
- Auto-trigger scrape when a heal attempt fails due to outdated XPath

### 3.4 Cancel Improvements

- Cancel should abort mid-Claude-call (currently waits for Claude to finish)
- Show "Cancelling..." state in UI with elapsed time
- Clean up partial round logs on cancel

---

## Priority 4: UI & Reporting

### 4.1 Heal Dashboard

Dedicated view showing:
- All scenarios and their heal status (healthy / healing / exhausted / never-run)
- Round history per scenario with expandable logs
- Success rate trends over time

### 4.2 Test Coverage Matrix

Visual grid: features × test IDs, colored by last-run status (pass/fail/skip/not-run).

### 4.3 Notification System

- Browser notifications when a heal completes (pass or fail)
- Optional Slack/email webhook on pipeline completion

---

## Implementation Order

| # | Item | Effort | Impact |
|---|------|--------|--------|
| 1 | Error classifier + fail-fast (1.1) | Small | High — stops wasting 5min on unfixable errors |
| 2 | Progress heartbeat (1.2) | Small | High — user visibility |
| 3 | Exhausted test marking (1.3) | Small | Medium — prevents re-processing |
| 4 | Trim HTML context (1.4) | Medium | Medium — faster + cheaper Claude calls |
| 5 | Global CLAUDE.md (2.1) | Small | Medium — better Claude behavior across sessions |
| 6 | Permission consolidation (2.2) | Small | Medium — fewer interruptions |
| 7 | Custom skills (2.3) | Medium | Medium — workflow shortcuts |
| 8 | Smart test ordering (3.1) | Medium | Medium — faster feedback loops |
| 9 | Heal quality improvements (3.2) | Large | High — better fix rate over time |
| 10 | Heal dashboard (4.1) | Medium | Medium — visibility |
