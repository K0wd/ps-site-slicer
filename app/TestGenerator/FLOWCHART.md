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

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ./app/TestGenerator/TestGenerator.sh 1-11 SM-XXX                        │
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
              │     FOR EACH TICKET (loop)       │
              └────────────────┬────────────────┘
                               │
          ┌────────────────────▼────────────────────┐
          │  STEP 3 — Review Ticket                 │
          │  get-issue (21 trimmed fields)           │
          │  get-comments                            │
          │  get-attachments                         │
          │  Saves: 3_issue.json                     │
          │         3_comments.json                  │
          │         3_attachments.txt                │
          └────────────────────┬────────────────────┘
                               │
          ┌────────────────────▼────────────────────┐
          │  STEP 4 — Review Code                   │
          │  git log --grep="SM-XXX"                │
          │  git diff (changed files)               │
          │  Saves: 4_commits.txt                    │
          │         4_changed_files.txt              │
          └────────────────────┬────────────────────┘
                               │
          ┌────────────────────▼────────────────────┐
          │  STEP 5 — Draft Test Plan       [CLAUDE]│
          │  Gathers context from steps 3-4          │
          │  Claude call 1: 5_plan.md                │
          │  Claude call 2: 5_plan_manual.md         │
          │  (Jira {code:diff} format)               │
          │  Token-tracked via --output-format json  │
          └────────────────────┬────────────────────┘
                               │
          ┌────────────────────▼────────────────────┐
          │  STEP 6 — Write Gherkin Steps   [CLAUDE]│
          │  Parses TC-XX/EC-XX from plan            │
          │  Extracts each TC section                │
          │  One claude -p call per TC (PARALLEL)    │
          │  Each writes to 6_gherkin_scratch/       │
          │  Compiles in order → .feature file       │
          │  Runs npx bddgen                         │
          │  Token-tracked per TC                    │
          └────────────────────┬────────────────────┘
                               │
          ┌────────────────────▼────────────────────┐
          │  STEP 7 — Write Automated Tests [CLAUDE]│
          │  Creates timestamped test-run dir         │
          │  FOR EACH TC in feature file:             │
          │    FOR EACH Gherkin step:                 │
          │      EXISTING? → skip                     │
          │      MISSING?  → claude implements step   │
          │                → bddgen verify            │
          │                → BLOCKER? → stop all      │
          │    Run playwright test for TC              │
          │  Writes: 7_automation_ready.md             │
          │          7_tc_logs/<TC>_*.md               │
          └────────────────────┬────────────────────┘
                               │
          ┌────────────────────▼────────────────────┐
          │  STEP 8 — Execute Tests         [CLAUDE]│
          │  Claude runs full test plan via           │
          │  Playwright with Bash/Read/Write tools    │
          │  Captures screenshots per TC              │
          │  Writes: 8_results.md (with RESULT: line)│
          │          8_execution_log.md               │
          └────────────────────┬────────────────────┘
                               │
          ┌────────────────────▼────────────────────┐
          │  STEP 9 — Determine Results     [CLAUDE]│
          │  Extracts RESULT: PASS/FAIL/NOT TESTED   │
          │  Collects screenshots                    │
          │  Claude generates structured report       │
          │  Writes: 9_test_report.md                │
          │          9_prompt.md                      │
          │          9_report_log.md                  │
          └────────────────────┬────────────────────┘
                               │
          ┌────────────────────▼────────────────────┐
          │  STEP 10 — Post Results to Jira         │
          │  Uploads screenshots as attachments       │
          │  Posts 8_results.md as Jira comment       │
          │  Uses: jira_api.py upload-attachment      │
          │        jira_api.py add-comment            │
          └────────────────────┬────────────────────┘
                               │
          ┌────────────────────▼────────────────────┐
          │  STEP 11 — Transition Ticket            │
          │  Auto-detects verdict from 8_results.md  │
          │  PASS   → transitions to "Verify"        │
          │  FAIL   → transitions to "QA Failed"     │
          │  Uses: jira_api.py transition             │
          └────────────────────┬────────────────────┘
                               │
              ┌────────────────▼────────────────┐
              │        END OF TICKET LOOP        │
              └────────────────┬────────────────┘
                               │
          ┌────────────────────▼────────────────────┐
          │            TIMING SUMMARY               │
          │  Step | Name | Duration | Tokens | Status│
          └─────────────────────────────────────────┘
```

## Data Flow

```
Step 1 ──→ .staging/1_auth.md
Step 2 ──→ <TICKET>/2_search.json
                │
Step 3 ──→ <TICKET>/3_issue.json ──────┐
       ──→ <TICKET>/3_comments.json ───┤
       ──→ <TICKET>/3_attachments.txt  │
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

## Shared Infrastructure

| Component | Purpose |
|---|---|
| `TestGenerator.sh` | Orchestrator: range parsing, step routing, timing, token tracking |
| `chomp-logger.sh` | Journey log: step headers, info, results, code blocks → story.md |
| `build-context.sh` | Assembles context files for Claude --append-system-prompt-file |
| `jira_api.py` | Jira REST API: get-issue, search, comments, transitions, uploads |
| `chomp.sh` | Journey log viewer: summary, list, tree, latest |
