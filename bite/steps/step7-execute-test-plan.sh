#!/bin/bash
# Step 7 — Execute the Test Plan (uses Claude CLI + Playwright)
# Usage: ./step7-execute-test-plan.sh SM-1096

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
RESULTS_FILE="$TICKET_DIR/7_results.txt"
SCREENSHOTS_DIR="$TICKET_DIR/test-results"
mkdir -p "$SCREENSHOTS_DIR"

chomp_step "7" "Execute Test Plan"
chomp_info "Ticket: **$(jira_link "$TICKET_KEY")**"

echo "=== Step 7: Execute Test Plan for $TICKET_KEY ==="

if [ ! -f "$PLAN_FILE" ]; then
    chomp_result "FAIL" "Test plan not found at \`$PLAN_FILE\`. Run step 5 first."
    echo "ERROR: Test plan not found at $PLAN_FILE"
    exit 1
fi

chomp_info "Test plan loaded from \`$PLAN_FILE\`"
chomp_info "Screenshots dir: \`$SCREENSHOTS_DIR\`"

PROMPT=$(cat <<EOF
You are an automated QA tester. Execute the test plan below using Playwright against the test server.

Test environment:
- SM project URL: ${BASE_URL}spa
- SM-PWA project URL: ${BASE_URL}testpwa
- Certmgr React app: ${BASE_URL}main/cmdist/
- Credentials: username: ${TEST_USERNAME} / password: ${TEST_PASSWORD}

For each test case:
1. Run the test steps in a browser using Playwright
2. Capture a screenshot to: $SCREENSHOTS_DIR/<test-case-name>.png
3. Record the actual result (PASS/FAIL + brief note)

After all tests, write the full results to: $RESULTS_FILE
Use this format:

Test Results for $TICKET_KEY
============================
Environment: ${BASE_URL}
Tested by: Claude Code + Playwright
Date: $(date +"%Y-%m-%d")

TEST CASES
----------
[PASS] <test case name> - <brief note>
[FAIL] <test case name> - <brief note>

SUMMARY
-------
<2-3 sentence summary of findings>

RESULT: PASS
(or RESULT: FAIL or RESULT: NOT TESTED)

--- Test Plan ---
$(cat "$PLAN_FILE")
EOF
)

echo "$PROMPT" | claude -p \
    --allowedTools "Bash,Read,Write,Edit,Grep,Glob" \
    -d "$PROJECT_DIR" > "$TICKET_DIR/7_execution_log.txt" 2>&1

chomp_info "Execution log: \`$TICKET_DIR/7_execution_log.txt\`"
chomp_info "Results file: \`$RESULTS_FILE\`"
chomp_result "PASS" "Test execution complete for $(jira_link "$TICKET_KEY")"

echo "Execution log: $TICKET_DIR/7_execution_log.txt"
echo "Results file:  $RESULTS_FILE"
echo "Screenshots:   $SCREENSHOTS_DIR/"
echo ""
echo "=== Step 7: DONE ==="
echo "Journey log: $CHOMP_LOG"
