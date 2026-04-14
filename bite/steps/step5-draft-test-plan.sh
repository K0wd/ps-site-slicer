#!/bin/bash
# Step 5 — Draft the Test Plan (uses Claude CLI)
# Usage: ./step5-draft-test-plan.sh SM-1096

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BITE_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_DIR="$(dirname "$BITE_DIR")"

# Load .env
set -a
source "$PROJECT_DIR/.env"
set +a

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

echo "$PROMPT" | claude -p --output-format text > "$PLAN_FILE"

chomp_info "Test plan written to \`$PLAN_FILE\`"
chomp_result "PASS" "Test plan drafted for $(jira_link "$TICKET_KEY")"

echo "Test plan written to: $PLAN_FILE"
echo ""
echo "=== Step 5: DONE ==="
echo "Journey log: $CHOMP_LOG"
