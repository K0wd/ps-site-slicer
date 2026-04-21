#!/bin/bash
# Step 8 — Execute Tests (runs the Playwright-BDD automated test suite)
#
# Sends the test plan to `claude -p` with Bash/Read/Write/Edit/Grep/Glob tools.
# Claude runs each test case via Playwright, captures screenshots to test-results/,
# and writes 8_results.md with a PASS/FAIL/SKIP table + machine-readable RESULT: line.
#
# Inputs:  5_plan.md
# Outputs: 8_execution_log.md, 8_results.md, test-results/*.png
#
# Usage: ./step8-execute-tests.sh SM-1096

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
BASE_CONTEXT=$(build_base_context)
trap cleanup_context EXIT

# Resume journey log
source "$SCRIPT_DIR/chomp-logger.sh"
chomp_resume

TICKET_KEY="${1:?Usage: $0 <TICKET_KEY>}"
chomp_ticket_dir "$TICKET_KEY"
TICKET_DIR="$CHOMP_TICKET_DIR"
chomp_resume_test_run
RUN_DIR="$CHOMP_TEST_RUN_DIR"
PLAN_FILE="$TICKET_DIR/5_plan.md"
RESULTS_FILE="$RUN_DIR/8_results.md"
SCREENSHOTS_DIR="$RUN_DIR/7_tc_logs"
mkdir -p "$SCREENSHOTS_DIR"

chomp_step "8" "Execute Tests"
chomp_info "Ticket: **$(jira_link "$TICKET_KEY")**"

echo "=== Step 8: Execute Tests for $TICKET_KEY ==="

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
Use this exact markdown format:

# Test Results — $TICKET_KEY

| Field | Value |
|-------|-------|
| **Environment** | ${BASE_URL} |
| **Tested by** | Claude Code + Playwright |
| **Date** | $(date +"%Y-%m-%d") |

## Test Cases

| Test Case | Result | Notes |
|-----------|--------|-------|
| \`<test case name>\` | ✅ PASS / ❌ FAIL / ⏭️ SKIP | <brief note> |

## Summary

<2-3 sentence summary of findings>

## Verdict

\`\`\`
RESULT: PASS
\`\`\`
(or RESULT: FAIL or RESULT: NOT TESTED — keep the RESULT: line machine-readable)

--- Test Plan ---
$(cat "$PLAN_FILE")
EOF
)

echo "$PROMPT" | claude -p \
    --allowedTools "Bash,Read,Write,Edit,Grep,Glob" \
    --append-system-prompt-file "$BASE_CONTEXT" \
    -d "$PROJECT_DIR" > "$RUN_DIR/8_execution_log.md" 2>&1

chomp_info "Execution log: \`$RUN_DIR/8_execution_log.md\`"
chomp_info "Results file: \`$RESULTS_FILE\`"
chomp_result "PASS" "Test execution complete for $(jira_link "$TICKET_KEY")"

echo "Execution log: $RUN_DIR/8_execution_log.md"
echo "Results file:  $RESULTS_FILE"
echo "Screenshots:   $SCREENSHOTS_DIR/"
echo ""
echo "=== Step 8: DONE ==="
echo "Journey log: $CHOMP_LOG"
