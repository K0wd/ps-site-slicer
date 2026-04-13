#!/bin/bash
# Step 10 — Transition the Ticket based on result
# Usage:
#   ./step10-transition-ticket.sh SM-1096           # Auto-detect from results file
#   ./step10-transition-ticket.sh SM-1096 PASS      # Explicit verdict

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

TICKET_KEY="${1:?Usage: $0 <TICKET_KEY> [PASS|FAIL|NOT TESTED]}"
VERDICT="${2:-}"
chomp_ticket_dir "$TICKET_KEY"
TICKET_DIR="$CHOMP_TICKET_DIR"
RESULTS_FILE="$TICKET_DIR/7_results.txt"

chomp_step "10" "Transition Ticket"
chomp_info "Ticket: **$(jira_link "$TICKET_KEY")**"

echo "=== Step 10: Transition Ticket $TICKET_KEY ==="

# Auto-detect verdict from results file if not provided
if [ -z "$VERDICT" ]; then
    if [ ! -f "$RESULTS_FILE" ]; then
        chomp_result "FAIL" "No verdict provided and results file not found"
        echo "ERROR: No verdict provided and results file not found at $RESULTS_FILE"
        exit 1
    fi
    VERDICT=$(grep -oE 'RESULT:\s*(PASS|FAIL|NOT TESTED)' "$RESULTS_FILE" | head -1 | sed 's/RESULT:\s*//')
    if [ -z "$VERDICT" ]; then
        chomp_result "FAIL" "Could not extract verdict from results file"
        echo "ERROR: Could not extract verdict from results file."
        exit 1
    fi
    echo "Auto-detected verdict: $VERDICT"
    chomp_info "Auto-detected verdict: **$VERDICT**"
else
    chomp_info "Explicit verdict: **$VERDICT**"
fi

# Show available transitions first
echo ""
echo "Available transitions:"
TRANSITIONS=$(python3 "$BITE_DIR/jira_api.py" get-transitions "$TICKET_KEY" 2>&1)
echo "$TRANSITIONS"
chomp_code "Available transitions" "$TRANSITIONS"
echo ""

case "$VERDICT" in
    PASS)
        TARGET="Verify"
        ;;
    FAIL|"NOT TESTED")
        TARGET="QA Failed"
        ;;
    *)
        chomp_result "FAIL" "Unknown verdict '$VERDICT'"
        echo "ERROR: Unknown verdict '$VERDICT'. Expected PASS, FAIL, or NOT TESTED."
        exit 1
        ;;
esac

echo "Transitioning $TICKET_KEY -> $TARGET"
python3 "$BITE_DIR/jira_api.py" transition "$TICKET_KEY" "$TARGET"

chomp_result "PASS" "$(jira_link "$TICKET_KEY") transitioned to **$TARGET**"
chomp_separator

echo ""
echo "=== Step 10: DONE ==="
echo "Journey log: $CHOMP_LOG"
