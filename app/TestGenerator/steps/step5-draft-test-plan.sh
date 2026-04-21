#!/bin/bash
# Step 5 — Draft the Test Plan (uses Claude CLI)
# Gathers context from steps 3-4 (issue JSON, comments, commits, changed files),
# pipes it into `claude -p` with a QA test analyst prompt to produce 5_plan.md.
# The plan includes: summary, pre-conditions, step-by-step test cases (TC-XX/EC-XX),
# edge cases, and a blank results section.
# Usage: ./step5-draft-test-plan.sh SM-1096

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BITE_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_DIR="$(dirname "$(dirname "$BITE_DIR")")"

# Load .env
set -a
source "$PROJECT_DIR/.env"
set +a

# Load context builder for Claude CLI calls
source "$SCRIPT_DIR/build-context.sh"
STEP5_CONTEXT=$(build_step6_context)
trap cleanup_context EXIT

# Resume journey log
source "$SCRIPT_DIR/chomp-logger.sh"
chomp_resume

TICKET_KEY="${1:?Usage: $0 <TICKET_KEY>}"
chomp_ticket_dir "$TICKET_KEY"
TICKET_DIR="$CHOMP_TICKET_DIR"
PLAN_FILE="$TICKET_DIR/5_plan.md"

chomp_step "5" "Draft Test Plan"
chomp_info "Ticket: **$(jira_link "$TICKET_KEY")**"

echo "  Drafting test plan..."

# Gather context from previous steps
CONTEXT=""
[ -f "$TICKET_DIR/3_issue.json" ] && CONTEXT="$CONTEXT\n--- Issue Details ---\n$(cat "$TICKET_DIR/3_issue.json")"
[ -f "$TICKET_DIR/3_comments.json" ] && CONTEXT="$CONTEXT\n--- Comments ---\n$(cat "$TICKET_DIR/3_comments.json")"
[ -f "$TICKET_DIR/4_commits.md" ] && CONTEXT="$CONTEXT\n--- Commits ---\n$(cat "$TICKET_DIR/4_commits.md")"
[ -f "$TICKET_DIR/4_changed_files.md" ] && CONTEXT="$CONTEXT\n--- Changed Files ---\n$(cat "$TICKET_DIR/4_changed_files.md")"

chomp_info "Context gathered from previous step outputs"

PROMPT=$(cat <<EOF
You are a senior QA test analyst applying ISTQB principles. Based on the Jira ticket data below, write a test plan using TEST SCENARIOS — not individual test cases.

## ISTQB PRINCIPLES TO APPLY

- **Exhaustive testing is impossible** — focus effort on the highest-risk flows
- **Defects cluster together** — concentrate scenarios around the changed functionality
- **Testing is context-dependent** — match scenarios to the feature under test
- A test SCENARIO is an end-to-end flow that verifies multiple related checks in a single logical sequence
- Group related verifications into one scenario instead of splitting each into a separate test case
- Aim for **3-7 scenarios total** — not 10-17 individual test cases

## SCENARIO STRUCTURE

Each scenario MUST follow this format:

### SC-XX: <Scenario Title>

**Objective:** What this scenario proves
**Pre-conditions:** What must be true before starting

**Steps:**
1. <Action> → **Expected:** <result>
2. <Action> → **Expected:** <result>
3. <Action> → **Expected:** <result>

A single scenario can have 5-10 steps. Each step includes the action AND its expected result inline.

## PLAN STRUCTURE

The plan must include:
- **Summary** of what is being tested (1-2 sentences)
- **Pre-conditions** (shared across all scenarios)
- **Scenarios** (SC-01 through SC-XX) — the main test flows
- **Edge cases** (EC-01 through EC-XX) — boundary/negative flows (keep to 2-3 max)

## TEST ENVIRONMENT

- SM project URL: ${BASE_URL}spa
- SM-PWA project URL: ${BASE_URL}testpwa
- Credentials: username: ${TEST_USERNAME} / password: ${TEST_PASSWORD}

## TICKET DATA

Ticket: $TICKET_KEY

$(echo -e "$CONTEXT")

Write the test plan now. Output only the markdown content.
EOF
)

PLAN_JSON=$(echo "$PROMPT" | claude -p --output-format json --append-system-prompt-file "$STEP5_CONTEXT")
echo "$PLAN_JSON" | python3 -c "import json,sys; print(json.load(sys.stdin).get('result',''))" > "$PLAN_FILE"

PLAN_TOKENS=$(echo "$PLAN_JSON" | python3 -c "
import json,sys
d=json.load(sys.stdin)
u=d.get('usage',{})
print(u.get('input_tokens',0) + u.get('cache_read_input_tokens',0) + u.get('output_tokens',0))
" 2>/dev/null || echo "0")
STEP_TOTAL_TOKENS="$PLAN_TOKENS"

PLAN_SIZE=$(wc -c < "$PLAN_FILE" | tr -d ' ')
SC_COUNT=$(grep -cE '^### (SC|TC|EC)-' "$PLAN_FILE" 2>/dev/null || echo "0")
chomp_info "Test plan: \`$PLAN_FILE\` ($SC_COUNT scenarios, $PLAN_SIZE bytes)"
echo "  Plan: $SC_COUNT scenarios ($PLAN_SIZE bytes)"
echo "  Generating HTML checklist..."

# --- Generate manual test plan (rich HTML for Jira copy-paste) ---

MANUAL_PLAN_FILE="$TICKET_DIR/5_plan_manual.html"

MANUAL_PROMPT=$(cat <<MANUAL_EOF
You are a QA test analyst. Convert the test plan below into a self-contained HTML snippet designed to be copy-pasted into a Jira comment editor. The rich formatting (bold, inline code, bulleted list, colored PASSED markers, screenshot placeholders) must survive the paste into Jira.

## OUTPUT REQUIREMENTS

- Output raw HTML only — no markdown code fences, no preamble, no trailing commentary
- Use inline styles only (Jira strips <style> blocks and <script>)
- Use semantic tags: <h4>, <ul>, <li>, <b>, <code>, <span>, <div>
- Produce the two sections shown in the STRUCTURE template below

## STRUCTURE (follow exactly)

<div>
  <div style="background:#e3fcef;color:#006644;padding:8px 12px;border-left:4px solid #006644;font-weight:bold;margin-bottom:12px;">&#10003; PASSED in TEST</div>

  <h4 style="margin:12px 0 4px 0;"><b>Testing on TEST</b></h4>
  <ul>
    <li><b>Verify</b> &lt;concise action, present tense&gt; &mdash; should &lt;expected outcome&gt;.</li>
    <!-- one <li> per check, 3-8 total -->
  </ul>

  <h4 style="margin:16px 0 4px 0;"><b>Results on TEST</b></h4>
  <ul>
    <li>
      <b>Verified</b> &lt;same action, past tense&gt; &mdash; should &lt;expected outcome&gt;. <span style="color:#006644;font-weight:bold;">PASSED</span>
      <div style="color:#888;font-style:italic;padding:8px 0;">[screenshot placeholder]</div>
    </li>
    <!-- repeat for each check in the same order as the Testing section -->
  </ul>
</div>

## STYLING RULES

- Inline code (file paths, URLs, CLI commands, technical identifiers) wrap in:
  <code style="background:#f4f5f7;padding:1px 4px;border-radius:3px;font-family:monospace;">...</code>
- Button labels, module names, and UI element names wrap in <b> within the sentence
- Use &mdash; (em-dash) between action and expected result, not a hyphen
- The top banner is a placeholder (tester edits to FAILED if needed)
- The green PASSED span in each Results <li> is also a placeholder

## CHECKLIST WRITING RULES

- Each <li> is a single end-to-end check — one assertion per bullet
- Start with <b>Verify</b> (Testing section) or <b>Verified</b> (Results section)
- Aim for 3-8 bullets total — derive from the scenarios (SC-XX) and edge cases (EC-XX) in the plan
- The Results section mirrors the Testing section one-for-one, in the same order

## TEST PLAN TO CONVERT

$(cat "$PLAN_FILE")
MANUAL_EOF
)

MANUAL_JSON=$(echo "$MANUAL_PROMPT" | claude -p --output-format json --append-system-prompt-file "$STEP5_CONTEXT")
echo "$MANUAL_JSON" | python3 -c "import json,sys; print(json.load(sys.stdin).get('result',''))" > "$MANUAL_PLAN_FILE"

MANUAL_TOKENS=$(echo "$MANUAL_JSON" | python3 -c "
import json,sys
d=json.load(sys.stdin)
u=d.get('usage',{})
print(u.get('input_tokens',0) + u.get('cache_read_input_tokens',0) + u.get('output_tokens',0))
" 2>/dev/null || echo "0")
STEP_TOTAL_TOKENS=$((STEP_TOTAL_TOKENS + MANUAL_TOKENS))

# Report token total to bite orchestrator
if [ -n "${BITE_TOKEN_FILE:-}" ]; then
    echo "$STEP_TOTAL_TOKENS" > "$BITE_TOKEN_FILE"
fi

MANUAL_SIZE=$(wc -c < "$MANUAL_PLAN_FILE" | tr -d ' ')
chomp_info "HTML checklist: \`$MANUAL_PLAN_FILE\` ($MANUAL_SIZE bytes) — open in browser, select all, copy, paste into Jira"
chomp_result "PASS" "Test plans drafted for $(jira_link "$TICKET_KEY")"

echo "  HTML checklist: ${MANUAL_SIZE}B"
