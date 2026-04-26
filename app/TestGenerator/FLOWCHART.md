# TestGenerator Pipeline Flowchart

## Architecture Overview

```
TestGenerator.sh (orchestrator)
├── Parses range + filter args (e.g. ./app/TestGenerator/TestGenerator.sh 1-6 SM-864)
├── Runs steps 1-2 (single pass, no ticket required)
├── Loops steps 3-11 per ticket (supports multi-ticket via filter)
├── Tracks timing + token usage per step
└── Prints timing summary on completion or failure
```

## Pipeline Flow
### Savings Key: Do it one by one and record one small result at a time.

```
┌─────────────────────────────────────────────────────────────────────┐
│       ./app/TestGenerator/TestGenerator.sh 1-11 SM-XXX              │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
          ┌────────────────────▼────────────────────┐
          │  STEP 1 — Verify Jira Auth              │
          │  jira_api.py test                       │
          │  Saves: .staging/1_auth.md              │
          └────────────────────┬────────────────────┘
                               │ PASS
          ┌────────────────────▼────────────────────┐
          │  STEP 2 — Find Ticket                   │
          │  JQL search (filter: me/all/SM-XXX)     │
          │  Prints ticket table                    │
          │  Creates ticket dir, story.md           │
          │  Saves: 2_search.json                   │
          └────────────────────┬────────────────────┘
                               │ TICKETS found
              ┌────────────────▼────────────────┐
              │     FOR EACH TICKET (loop)      │
              └────────────────┬────────────────┘
                               │
          ┌────────────────────▼────────────────────┐
          │  STEP 3 — Review Ticket                 │
          │  get-issue (21 trimmed fields)          │
          │  get-comments                           │
          │  get-attachments                        │
          │  Saves: 3_issue.json                    │
          │         3_comments.json                 │
          │         3_attachments.txt               │
          └────────────────────┬────────────────────┘
                               │
          ┌────────────────────▼────────────────────┐
          │  STEP 4 — Review Code                   │
          │  git log --grep="SM-XXX"                │
          │  git diff (changed files)               │
          │  Saves: 4_commits.txt                   │
          │         4_changed_files.txt             │
          └────────────────────┬────────────────────┘
                               │
          ┌────────────────────▼────────────────────┐
          │  STEP 5 — Draft Test Plan       [CLAUDE]│
          │  Gathers context from steps 3-4         │
          │  Claude call 1: 5_plan.md               │
          │  Claude call 2: 5_plan_manual.md        │
          │  (Jira {code:diff} format)              │
          │  Token-tracked via --output-format json │
          └────────────────────┬────────────────────┘
                               │
          ┌────────────────────▼────────────────────┐
          │  STEP 6 — Write Gherkin Steps   [CLAUDE]│
          │  Parses TC-XX/EC-XX from plan           │
          │  Extracts each TC section               │
          │  One claude -p call per TC (PARALLEL)   │
          │  Each writes to 6_gherkin_scratch/      │
          │  Compiles in order → .feature file      │
          │  Runs npx bddgen                        │
          │  Token-tracked per TC                   │
          └────────────────────┬────────────────────┘
                               │
          ┌────────────────────▼────────────────────┐
          │  STEP 7 — Write Automated Tests [CLAUDE]│
          │  Creates timestamped test-run dir       │
          │  FOR EACH TC in feature file:           │
          │    FOR EACH Gherkin step:               │
          │      EXISTING? → skip                   │
          │      MISSING?  → claude implements step │
          │                → bddgen verify          │
          │                → BLOCKER? → stop all    │
          │    Run playwright test for TC           │
          │  Writes: 7_automation_ready.md          │
          │          7_tc_logs/<TC>_*.md            │
          └────────────────────┬────────────────────┘
                               │
          ┌────────────────────▼──────────────────────┐
          │  STEP 8 — Execute Tests         [CLAUDE]  │
          │  Claude runs full test plan via           │
          │  Playwright with Bash/Read/Write tools    │
          │  Captures screenshots per TC              │
          │  Writes: 8_results.md (with RESULT: line) │
          │          8_execution_log.md               │
          └────────────────────┬──────────────────────┘
                               │
          ┌────────────────────▼────────────────────┐
          │  STEP 9 — Determine Results     [CLAUDE]│
          │  Extracts RESULT: PASS/FAIL/NOT TESTED  │
          │  Collects screenshots                   │
          │  Claude generates structured report     │
          │  Writes: 9_test_report.md               │
          │          9_prompt.md                    │
          │          9_report_log.md                │
          └────────────────────┬────────────────────┘
                               │
          ┌────────────────────▼────────────────────┐
          │  STEP 10 — Post Results to Jira         │
          │  Uploads screenshots as attachments     │
          │  Posts 8_results.md as Jira comment     │
          │  Uses: jira_api.py upload-attachment    │
          │        jira_api.py add-comment          │
          └────────────────────┬────────────────────┘
                               │
          ┌────────────────────▼────────────────────┐
          │  STEP 11 — Transition Ticket            │
          │  Auto-detects verdict from 8_results.md │
          │  PASS   → transitions to "Verify"       │
          │  FAIL   → transitions to "QA Failed"    │
          │  Uses: jira_api.py transition           │
          └────────────────────┬────────────────────┘
                               │
              ┌────────────────▼────────────────┐
              │        END OF TICKET LOOP       │
              └────────────────┬────────────────┘
                               │
          ┌────────────────────▼──────────────────────┐
          │            TIMING SUMMARY                 │
          │  Step | Name | Duration | Tokens | Status │
          └───────────────────────────────────────────┘
```

## Data Flow

```
Step 1 ──→ .staging/1_auth.md
Step 2 ──→ <TICKET>/2_search.json
                │
Step 3 ──→ <TICKET>/3_issue.json ──────┐
       ──→ <TICKET>/3_comments.json ───┤
       ──→ <TICKET>/3_attachments.txt──│
                                       │ context
Step 4 ──→ <TICKET>/4_commits.txt ─────┤
       ──→ <TICKET>/4_changed_files.txt┤
                                       │
Step 5 ──→ <TICKET>/5_plan.md ◀────────┘
       ──→ <TICKET>/5_plan_manual.md
                │
Step 6 ──→ <TICKET>/6_gherkin_scratch/<TC>.gherkin
       ──→ tests/features/<TICKET>.feature
                │
Step 7 ──→ <TICKET>/test-runs/<TS>/7_tc_logs/<TC>_*.md
       ──→ <TICKET>/test-runs/<TS>/7_automation_ready.md
                │
Step 8 ──→ <TICKET>/test-runs/<TS>/8_results.md
       ──→ <TICKET>/test-runs/<TS>/8_execution_log.md
                │
Step 9 ──→ <TICKET>/test-runs/<TS>/9_test_report.md
                │
Step 10 ─→ Jira (attachments + comment)
Step 11 ─→ Jira (status transition)
```

## Claude CLI Usage by Step

| Step | Claude Calls | Mode | Tools | Parallelism |
|------|-------------|------|-------|-------------|
| 5 | 2 (plan + manual) | -p, --output-format json | None (text gen) | Sequential |
| 6 | 1 per TC (10-18 calls) | -p, --output-format json | Read, Write, Glob | Parallel (all TCs at once) |
| 7 | 1 per missing step def | -p (realtime stdout) | Bash, Read, Write, Edit, Grep, Glob | Sequential per TC, per step |
| 8 | 1 (full plan execution) | -p | Bash, Read, Write, Edit, Grep, Glob | Single call |
| 9 | 1 (report generation) | -p | Read, Write, Glob | Single call |

## Bug Creator (Integrated)

```
Header [Bug] button → Bug Creator side panel
    │
    ├── User enters brief description
    │   e.g. "SM-1234 Save button disabled in Vendor Admin"
    │
    ├── POST /api/bug-draft { brief }
    │   ├── Loads rules/jira-ticket-creation.md
    │   ├── Loads template.html (Jira-paste-ready)
    │   ├── Claude fills placeholders → TYPE + HTML
    │   └── Saves to data/bug-drafts/<ticket>_<type>-<ts>.html
    │
    └── Preview renders in iframe → past drafts listed below
```

---

## Tool01 — Automated Steps Crawler

An autonomous hourly tool that crawls all feature files, finds unmatched Gherkin steps, and implements them one at a time. Runs independently from the main pipeline on a 1-hour schedule. Each run produces a report for human review.

### How It Differs From Step 7

| | Step 7 | Tool01 |
|---|---|---|
| Trigger | Manual (per ticket) | Scheduled every hour |
| Scope | One ticket's feature file | ALL feature files |
| Steps per run | All missing steps for that ticket | **One step per run** |
| Ticket required | Yes | No |
| Output | `7_automation_ready.md` | `logs/tool01/<timestamp>/crawler_report.md` |

### Flow

```
SCHEDULE: every 1 hour
──────────────────────────────────────────────────────────────────────────────

  1. SCAN — run npx bddgen across ALL tests/features/*.feature
            parse output for unmatched step definitions
            save full list to logs/tool01/<TS>/unmatched_steps.txt

            NONE FOUND → write "all clear" report → done for this hour

  2. PICK — take the FIRST unmatched step only
            (remaining steps are deferred to future hourly runs)

  3. IMPLEMENT — Claude writes ONE step definition
                 reads tests/properties/*.ts for XPath selectors
                 appends to appropriate tests/steps/*.steps.ts file

  4. VERIFY — npx bddgen
              FAIL → retry once with error context
              FAIL again → write BLOCKER report → done for this hour

  5. RUN — npx playwright test --grep @TC-XX
           runs the TC that contains the newly implemented step

  6. REPORT — write logs/tool01/<TS>/crawler_report.md
              ┌── PASS ──→ "★ RECORDED: <step text>" — N steps remaining
              └── FAIL ──→ "Step implemented but TC still failing" — detail included

  → Human reviews report. Next hour: pick next unmatched step.
──────────────────────────────────────────────────────────────────────────────
```

### Scheduling (via TestGenerator UI)

Configure a schedule in the TestGenerator UI with:
- **Step range:** 101 → 101
- **Interval:** 1 hour
- **Ticket key:** _(leave blank — Tool01 scans all feature files)_

Or trigger manually from the UI by running step 101.

### Reports

Each run writes to `logs/tool01/<YYYYMMDD_HHMMSS>/`:

| File | Contents |
|---|---|
| `crawler_report.md` | Human-readable summary: what was attempted, outcome, Claude output, remaining list |
| `unmatched_steps.txt` | Full list of all unmatched steps at scan time |
| `bddgen_scan.txt` | Raw bddgen output from initial scan |
| `bddgen_verify.txt` | Raw bddgen output after implementation |
| `playwright_output.txt` | Playwright run output for the target TC |
| `claude_output.md` | Full Claude implementation transcript |

### Compound Effect Over Time

```
Hour 1  → implements 1 step → library: +1
Hour 2  → implements 1 step → library: +2
...
Hour N  → all steps implemented → "all clear" report every hour
```

---

## Shared Infrastructure

| Component | Purpose |
|---|---|
| `TestGenerator.sh` | Orchestrator: range parsing, step routing, timing, token tracking |
| `chomp-logger.sh` | Journey log: step headers, info, results, code blocks → story.md |
| `build-context.sh` | Assembles context files for Claude --append-system-prompt-file |
| `jira_api.py` | Jira REST API: get-issue, search, comments, transitions, uploads |
| `chomp.sh` | Journey log viewer: summary, list, tree, latest |

---

## Steps 6 → 7: Gherkin-to-Automation Build Strategy

### Goal
Build a growing reference library of reusable Playwright step definitions. Every step that passes a real test gets recorded once, and never has to be written again for any future ticket.

### Token Budget Strategy — Scheduled Sessions

Rather than running all 11 steps in one sitting (which exhausts the token budget on a single context window), the pipeline is divided into four **isolated sessions**. Each session resumes from the checkpoint files left by the previous one.

```
SESSION A — Data Gathering          (Steps 1–5)
SESSION B — Gherkin Writing         (Step 6 only)
SESSION C — Step Implementation     (Step 7 only)   ← most token-intensive
SESSION D — Execution & Transition  (Steps 8–11)
```

Each session is independently runnable:
```
./TestGenerator.sh 1-5  SM-XXX   # Session A
./TestGenerator.sh 6    SM-XXX   # Session B  (reads 5_plan.md)
./TestGenerator.sh 7    SM-XXX   # Session C  (reads .feature file)
./TestGenerator.sh 8-11 SM-XXX   # Session D  (reads feature + steps)
```

The `.feature` file written at the end of Step 6 is the **checkpoint** between Session B and C. Step 7 reads only that file — it does not need the Claude context from Session B.

---

### Step 6 — Write Gherkin Steps (Session B)

**Primary job: write Gherkin sentences that reuse existing step definitions as much as possible.**
Step 6 reads `tests/steps/*.steps.ts` first and extracts every known step text pattern. Those patterns drive how Gherkin sentences are phrased — so that when Step 7 runs, most steps already have implementations and only genuinely new steps remain.

```
BOOT: extract the full known-steps catalogue
──────────────────────────────────────────────────────────────────────────────
  Read: tests/steps/*.steps.ts
  Extract: every Given/When/Then pattern text → known_steps[]
    e.g. "I am logged in and on the dashboard"
         "I navigate to the Cascade Templates admin screen"
         "I should see the {string} menu item"
         ...
  Read: tests/features/*.feature     → known scenario titles (avoid collision)
  Read: tests/properties/*.ts        → available XPath selectors
──────────────────────────────────────────────────────────────────────────────

FOR EACH TC-XX in plan  ──── PARALLEL Claude calls ────────────────────────────┐
                                                                                │
  ┌─────────────────────────────────────────────────────────────────────────┐  │
  │  Claude prompt: "Write Gherkin for TC-XX"                              │  │
  │                                                                         │  │
  │  INSTRUCTION: for each step you want to write, check known_steps[]     │  │
  │    → if the intent can be expressed with an existing step text:         │  │
  │        USE THAT EXACT TEXT — do not paraphrase                          │  │
  │    → only invent new step text when no existing step covers the intent  │  │
  │                                                                         │  │
  │  Output: logs/<TICKET>/6_gherkin_scratch/TC-XX.gherkin                 │  │
  └─────────────────────────────────────────────────────────────────────────┘  │
                                                                                │
└── All TC scratch files compiled in order ──────────────────────────────────┘
           │
           ▼
  tests/features/<TICKET>.feature       ← compiled feature file
           │
           ▼
  npx bddgen                            ← dry-run: identifies unmatched steps
           │
           ├── UNMATCHED steps → saved to 6_unmatched_steps.txt
           │                     (these are the only work for Step 7)
           │
           └── MATCHED steps   → already have implementations; Step 7 skips them
           │
           ▼
  OUTPUT CHECKPOINT ✓                   ← Session C starts with a known gap list
```

---

### Step 7 — Write Automated Tests (Session C)

**Step 7 only works on the gaps — steps that have no matching implementation (bddgen lint errors).**
Every step that already has an implementation from Step 6's reuse pass is skipped entirely.
For the remaining unmatched steps: one at a time, crawl forward.

```
BOOT: load the gap list from Step 6
──────────────────────────────────────────────────────────────────────────────
  Read: logs/<TICKET>/6_unmatched_steps.txt   ← only these steps need work
  Read: tests/steps/*.steps.ts               ← current implementations
  Read: tests/properties/*.ts                ← XPath selectors
  If 6_unmatched_steps.txt is empty → skip to full-TC run immediately
──────────────────────────────────────────────────────────────────────────────

FOR EACH TC-XX in <TICKET>.feature  ──── SEQUENTIAL ────────────────────────┐
                                                                             │
  FOR EACH Gherkin step in TC-XX  ──── ONE AT A TIME ──────────────────────┐│
                                                                            ││
    ┌──────────────────────────────────────────────────────────────────┐   ││
    │  Is this step in 6_unmatched_steps.txt?                          │   ││
    │                                                                  │   ││
    │  NO  → already implemented; log "✓ matched: <step text>"        │   ││
    │         skip — do not touch the step file                        │   ││
    │                                                                  │   ││
    │  YES → IMPLEMENT (one step only)                                 │   ││
    │         Claude writes ONE step definition                        │   ││
    │         reads properties/*.ts for XPath selectors               │   ││
    │         appends to appropriate *.steps.ts file                   │   ││
    │                                                                  │   ││
    │         VERIFY: npx bddgen                                       │   ││
    │           FAIL → retry once with the lint error as context       │   ││
    │           FAIL again → STOP TC; log blocker; skip TC             │   ││
    │                                                                  │   ││
    │         PASS bddgen →                                            │   ││
    │         RUN: npx playwright test --grep "<this step's TC tag>"   │   ││
    │              scoped to just this TC so the step runs in context  │   ││
    │                                                                  │   ││
    │         PLAYWRIGHT RESULT:                                       │   ││
    │           PASS → ★ RECORD ★                                     │   ││
    │                  remove from unmatched list                      │   ││
    │                  log "★ recorded: <step text>"                   │   ││
    │                  → next step                                     │   ││
    │                                                                  │   ││
    │           FAIL → log failure detail                              │   ││
    │                  STOP this TC                                    │   ││
    │                  do NOT record; do NOT continue to next step     │   ││
    │                                                                  │   ││
    └──────────────────────────────────────────────────────────────────┘   ││
                                                                            ││
  └── END step loop ────────────────────────────────────────────────────────┘│
                                                                             │
  [all unmatched steps in TC-XX are now resolved]                            │
           │                                                                 │
           ▼                                                                 │
  RUN FULL TC: npx playwright test --grep @TC-XX                             │
           │                                                                 │
    ┌── PASS ──→ 7_tc_logs/TC-XX_pass.md  "TC-XX CONFIRMED"                 │
    └── FAIL ──→ 7_tc_logs/TC-XX_fail.md  (log which step broke)            │
                                                                             │
└── END TC loop ─────────────────────────────────────────────────────────────┘
           │
           ▼
  7_automation_ready.md    ← TC summary table (passed / failed / blocked)
  OUTPUT CHECKPOINT ✓      ← Session D can start
```

---

### What "Record" Means

A step is **recorded** the moment it passes its individual playwright run. That means:

1. The step definition is already written in `tests/steps/*.steps.ts` (it was appended in the implement phase)
2. It is added to `known_steps[]` in memory so the current session can reuse it immediately for later TCs in the same ticket
3. On the next ticket, the boot phase loads `tests/steps/*.steps.ts` and it is available again from the start

**The feature files in `tests/features/` are the reuse signal for Gherkin** — before writing a new scenario in Step 6, Claude reads all existing `.feature` files to see what scenario patterns already exist and what step text was previously used. This closes the loop: proven step text from past tickets flows back into Gherkin generation for new ones.

---

### Reference Library Growth Model

```
Ticket 1  →  known_steps = 0   →  writes 12 steps  →  library: 12
Ticket 2  →  known_steps = 12  →  reuses 8, writes 4  →  library: 16
Ticket 3  →  known_steps = 16  →  reuses 14, writes 2  →  library: 18
...
Ticket N  →  nearly all steps reused  →  Session C cost ≈ near zero
```

**The crawl is the compound interest.** Each proven step reduces future build cost permanently.

---

## Process Document — For Review

> How we automate test server testing and transition tickets to merge-to-stage.

### Overview

Each Jira ticket in QA status triggers an 11-step automated pipeline. The pipeline runs in four isolated sessions to manage AI token costs. Every session reads checkpoint files from the previous one, so work is never repeated.

### End-to-End Flow

```
Jira Ticket enters QA
         │
         ▼
SESSION A — UNDERSTAND (Steps 1–5, ~5 min)
  1. Verify Jira auth
  2. Find ticket by key or filter
  3. Pull full ticket: description, comments, attachments
  4. Pull related git commits and changed files
  5. Claude drafts a test plan (TC-01, TC-02 … with pass/fail criteria)
         │
         ▼  checkpoint: 5_plan.md
         │
SESSION B — DESIGN (Step 6, ~3 min)
  6. Claude writes Gherkin scenarios — one per TC
     Each scenario is plain English: Given / When / Then
     Compiled into a .feature file and syntax-validated
         │
         ▼  checkpoint: tests/features/<TICKET>.feature
         │
SESSION C — BUILD (Step 7, ~10–20 min)
  7. For each Gherkin step:
       - If already in the step library → reuse (no tokens spent)
       - If new → Claude writes a Playwright implementation
       - Each step is verified with bddgen before the next begins
     After all steps exist, Playwright runs each TC on the test server
         │
         ▼  checkpoint: 7_automation_ready.md
         │
SESSION D — REPORT & CLOSE (Steps 8–11, ~5 min)
  8.  Execute full test plan on test server (testserver.betacom.com)
  9.  Claude generates structured test report
  10. Report + screenshots posted to Jira ticket as comment
  11. Ticket auto-transitioned:
        PASS → "Verify"       (ready to merge to stage)
        FAIL → "QA Failed"    (returned to dev with failure detail)
```

### Why Four Sessions?

Each session starts with a fresh token budget. This means:
- No single ticket can exhaust the daily AI budget
- Any session can be re-run independently if it fails (e.g., test server is down)
- Steps 1–5 are cheap (mostly API calls); Step 7 is the expensive one and runs alone

### What Gets Recorded

| Artifact | Where | Survives ticket close? |
|---|---|---|
| Step definitions | `tests/steps/*.steps.ts` | Yes — permanent library |
| Test plan | `logs/<TICKET>/5_plan.md` | Yes — gitignored archive |
| Feature file | `tests/features/<TICKET>.feature` | Yes — committed |
| Test report | `logs/<TICKET>/test-runs/<TS>/8_results.md` | Yes — posted to Jira |
| Jira transition | Jira ticket status | Yes — audit trail |

### Transition Rules

| Test Outcome | Jira Transition | Next Action |
|---|---|---|
| All TCs pass | → **Verify** | Dev lead reviews; merges to stage |
| Any TC fails | → **QA Failed** | Failure detail in Jira comment; back to dev |
| Blocker (step can't be written) | → **QA Failed** | Manual review required |

---

## JSON Process Summary

```json
{
  "pipeline": "TestGenerator QA Pipeline",
  "version": "2.0",
  "sessions": [
    {
      "id": "A",
      "steps": [1, 2, 3, 4, 5],
      "label": "Understand",
      "input": "Jira ticket key",
      "output": "5_plan.md",
      "token_cost": "low",
      "duration_est": "5 min"
    },
    {
      "id": "B",
      "steps": [6],
      "label": "Design",
      "input": "5_plan.md",
      "output": "tests/features/<TICKET>.feature",
      "token_cost": "medium",
      "duration_est": "3 min"
    },
    {
      "id": "C",
      "steps": [7],
      "label": "Build",
      "input": "<TICKET>.feature + tests/features/*.feature + tests/steps/*.steps.ts",
      "output": "7_automation_ready.md + tests/steps/*.steps.ts",
      "token_cost": "high",
      "duration_est": "10–20 min",
      "crawl_model": "one Gherkin step at a time — implement → bddgen → playwright → PASS → record → next",
      "reuse_check": "boot phase loads all known_steps[] from *.steps.ts and all scenario patterns from *.feature files",
      "note": "Token cost drops per ticket as reference library grows; reused steps cost zero tokens"
    },
    {
      "id": "D",
      "steps": [8, 9, 10, 11],
      "label": "Report and Close",
      "input": "7_automation_ready.md",
      "output": "Jira comment + ticket transition",
      "token_cost": "medium",
      "duration_est": "5 min"
    }
  ],
  "reference_library": {
    "location": "tests/steps/*.steps.ts",
    "grows_at": "Step 7 — each new passing step is appended",
    "reuse_check": "Step 7 reads all existing signatures before writing",
    "compounding": true
  },
  "transitions": {
    "all_pass": "Verify",
    "any_fail": "QA Failed",
    "blocker": "QA Failed"
  },
  "test_target": "https://testserver.betacom.com",
  "browser": "msedge"
}
```
