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
PROJECT_DIR="$(dirname "$BITE_DIR")"

# Load .env
set -a
source "$PROJECT_DIR/.env"
set +a

# Load context builder for Claude CLI calls
source "$SCRIPT_DIR/build-context.sh"
BASE_CONTEXT=$(build_base_context)
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

echo "=== Step 5: Draft Test Plan for $TICKET_KEY ==="

# Gather context from previous steps
CONTEXT=""
[ -f "$TICKET_DIR/3_issue.json" ] && CONTEXT="$CONTEXT\n--- Issue Details ---\n$(cat "$TICKET_DIR/3_issue.json")"
[ -f "$TICKET_DIR/3_comments.json" ] && CONTEXT="$CONTEXT\n--- Comments ---\n$(cat "$TICKET_DIR/3_comments.json")"
[ -f "$TICKET_DIR/4_commits.md" ] && CONTEXT="$CONTEXT\n--- Commits ---\n$(cat "$TICKET_DIR/4_commits.md")"
[ -f "$TICKET_DIR/4_changed_files.md" ] && CONTEXT="$CONTEXT\n--- Changed Files ---\n$(cat "$TICKET_DIR/4_changed_files.md")"

chomp_info "Context gathered from previous step outputs"

PROMPT=$(cat <<EOF
You are a QA test analyst. Based on the following Jira ticket data, write a thorough test plan in markdown.

The plan must include:
- Summary of what is being tested
- Pre-conditions
- Step-by-step test cases with expected results
- Edge cases to verify
- A results section (leave blank — will be filled during execution)

Test environment:
- SM project URL: ${BASE_URL}spa
- SM-PWA project URL: ${BASE_URL}testpwa
- Credentials: username: ${TEST_USERNAME} / password: ${TEST_PASSWORD}

Ticket: $TICKET_KEY

$(echo -e "$CONTEXT")

Write the test plan now. Output only the markdown content.
EOF
)

PLAN_JSON=$(echo "$PROMPT" | claude -p --output-format json --append-system-prompt-file "$BASE_CONTEXT")
echo "$PLAN_JSON" | python3 -c "import json,sys; print(json.load(sys.stdin).get('result',''))" > "$PLAN_FILE"

PLAN_TOKENS=$(echo "$PLAN_JSON" | python3 -c "
import json,sys
d=json.load(sys.stdin)
u=d.get('usage',{})
print(u.get('input_tokens',0) + u.get('cache_read_input_tokens',0) + u.get('output_tokens',0))
" 2>/dev/null || echo "0")
STEP_TOTAL_TOKENS="$PLAN_TOKENS"

chomp_info "Test plan written to \`$PLAN_FILE\` (**$PLAN_TOKENS** tokens)"
echo "Test plan written to: $PLAN_FILE ($PLAN_TOKENS tokens)"

# --- Generate manual test plan (Jira comment format) ---

MANUAL_PLAN_FILE="$TICKET_DIR/5_plan_manual.md"

echo "Generating manual test plan (Jira comment format)..."

MANUAL_PROMPT=$(cat <<MANUAL_EOF
You are a QA test analyst. Convert the test plan below into a manual testing checklist formatted for Jira comments.

## FORMAT — follow this exactly

*Results on TEST*

Scenario 1 – <scenario title>
* Verified <what was verified 1>
* Verified <what was verified 2>
* Verified <what was verified 3>

Scenario 2 – <scenario title>
* Verified <what was verified 1>
* Verified <what was verified 2>

...

## RULES

- Each scenario corresponds to a test case (TC-XX) or edge case (EC-XX) from the plan
- Each bullet starts with "Verified" followed by a clear, human-readable description of what to check
- Do NOT include PASSED/FAILED — leave the line ending open so the tester fills it in manually
- Keep each bullet concise — one verification per line
- Use plain text only — no markdown headers, no code blocks, no tables
- Use * for bullets (Jira wiki format)
- Number scenarios sequentially: Scenario 1, Scenario 2, etc.
- Output ONLY the formatted checklist — no preamble, no explanation

## TEST PLAN TO CONVERT

$(cat "$PLAN_FILE")
MANUAL_EOF
)

MANUAL_JSON=$(echo "$MANUAL_PROMPT" | claude -p --output-format json --append-system-prompt-file "$BASE_CONTEXT")
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

chomp_info "Manual test plan written to \`$MANUAL_PLAN_FILE\` (**$MANUAL_TOKENS** tokens)"
chomp_result "PASS" "Test plans drafted for $(jira_link "$TICKET_KEY") (**$STEP_TOTAL_TOKENS** total tokens)"

echo "Manual test plan: $MANUAL_PLAN_FILE ($MANUAL_TOKENS tokens)"
echo "Step 5 total tokens: $STEP_TOTAL_TOKENS"
echo ""
echo "=== Step 5: DONE ==="
echo "Journey log: $CHOMP_LOG"
