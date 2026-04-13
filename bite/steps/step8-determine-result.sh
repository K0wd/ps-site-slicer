#!/bin/bash
# Step 8 — Determine Final Result (reads results file from step 7)
# Usage: ./step8-determine-result.sh SM-1096

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BITE_DIR="$(dirname "$SCRIPT_DIR")"

# Resume journey log
source "$SCRIPT_DIR/chomp-logger.sh"
chomp_resume

TICKET_KEY="${1:?Usage: $0 <TICKET_KEY>}"
chomp_ticket_dir "$TICKET_KEY"
TICKET_DIR="$CHOMP_TICKET_DIR"
RESULTS_FILE="$TICKET_DIR/7_results.txt"

chomp_step "8" "Determine Final Result"
chomp_info "Ticket: **$(jira_link "$TICKET_KEY")**"

echo "=== Step 8: Determine Final Result for $TICKET_KEY ==="

if [ ! -f "$RESULTS_FILE" ]; then
    chomp_result "FAIL" "Results file not found. Run step 7 first."
    echo "ERROR: Results file not found at $RESULTS_FILE"
    exit 1
fi

VERDICT=$(grep -oE 'RESULT:\s*(PASS|FAIL|NOT TESTED)' "$RESULTS_FILE" | head -1 | sed 's/RESULT:\s*//')

if [ -z "$VERDICT" ]; then
    chomp_result "FAIL" "Could not extract verdict from results file"
    echo "WARNING: Could not extract verdict from results file."
    cat "$RESULTS_FILE"
    exit 1
fi

chomp_info "Verdict extracted: **$VERDICT**"
chomp_result "$VERDICT" "Final result for $(jira_link "$TICKET_KEY") is $VERDICT"

echo "Verdict: $VERDICT"
echo ""
cat "$RESULTS_FILE"
echo ""
echo "=== Step 8: DONE — Result: $VERDICT ==="
echo "Journey log: $CHOMP_LOG"
