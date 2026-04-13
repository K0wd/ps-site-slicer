#!/usr/bin/env bash
# Bite — Sequential QA step runner
#
# Usage:
#   ./bite.sh 1-3                  # Run steps 1 through 3 (auto-find ticket)
#   ./bite.sh 1-3 SM-754           # Run steps 1 through 3 on a specific ticket
#   ./bite.sh 2 SM-754             # Run a single step
#   ./bite.sh 5-10 SM-754          # Run steps 5 through 10
#   ./bite.sh 1-10                 # Full run, auto-find ticket
#
# Steps:
#   1  Verify Jira auth
#   2  Find/validate ticket
#   3  Review ticket (issue, comments, attachments)
#   4  Review code (commits, changed files)
#   5  Draft test plan
#   6  Write test code (feature + steps + properties)
#   7  Execute test plan
#   8  Determine final result
#   9  Post results to Jira
#  10  Transition ticket
#
# Each step passes its output (ticket key) to the next step automatically.

set -euo pipefail

BITE_DIR="$(cd "$(dirname "$0")" && pwd)"
STEPS_DIR="$BITE_DIR/steps"

# --- Parse arguments ---
RANGE="${1:?Usage: ./bite.sh <step|range> [TICKET_KEY]  (e.g. ./bite.sh 1-3 SM-754)}"
TICKET_KEY="${2:-}"

# Parse range: "3" -> start=3 end=3, "1-3" -> start=1 end=3
if [[ "$RANGE" =~ ^([0-9]+)-([0-9]+)$ ]]; then
    START="${BASH_REMATCH[1]}"
    END="${BASH_REMATCH[2]}"
elif [[ "$RANGE" =~ ^([0-9]+)$ ]]; then
    START="${BASH_REMATCH[1]}"
    END="$START"
else
    echo "ERROR: Invalid range '$RANGE'. Use a number (3) or range (1-3)."
    exit 1
fi

if [ "$START" -gt "$END" ] || [ "$START" -lt 1 ] || [ "$END" -gt 10 ]; then
    echo "ERROR: Range must be 1-10 and start <= end. Got: $RANGE"
    exit 1
fi

# Map step numbers to scripts (bash 3 compatible)
step_script() {
    case "$1" in
        1)  echo "step1-verify-auth.sh" ;;
        2)  echo "step2-find-ticket.sh" ;;
        3)  echo "step3-review-ticket.sh" ;;
        4)  echo "step4-review-code.sh" ;;
        5)  echo "step5-draft-test-plan.sh" ;;
        6)  echo "step6-write-tests.sh" ;;
        7)  echo "step7-execute-test-plan.sh" ;;
        8)  echo "step8-determine-result.sh" ;;
        9)  echo "step9-post-results.sh" ;;
        10) echo "step10-transition-ticket.sh" ;;
        *)  echo "" ;;
    esac
}

needs_ticket() {
    case "$1" in
        3|4|5|6|7|8|9|10) return 0 ;;
        *) return 1 ;;
    esac
}

echo "=========================================="
echo "  BITE — QA Automation Runner"
echo "  Steps: $START → $END"
[ -n "$TICKET_KEY" ] && echo "  Ticket: $TICKET_KEY"
echo "  Started: $(date +'%d %b %Y, %I:%M %p')"
echo "=========================================="
echo ""

step=$START
while [ "$step" -le "$END" ]; do
    SCRIPT=$(step_script "$step")
    SCRIPT_PATH="$STEPS_DIR/$SCRIPT"

    if [ -z "$SCRIPT" ] || [ ! -f "$SCRIPT_PATH" ]; then
        echo "ERROR: Script not found for step $step"
        exit 1
    fi

    echo ""
    echo ">>> Running step $step: $SCRIPT"
    echo ""

    # Build arguments
    ARGS=""

    # Step 2 can take an optional ticket key
    if [ "$step" -eq 2 ] && [ -n "$TICKET_KEY" ]; then
        ARGS="$TICKET_KEY"
    fi

    # Steps 3+ require ticket key
    if needs_ticket "$step"; then
        if [ -z "$TICKET_KEY" ]; then
            echo "ERROR: Step $step requires a ticket key."
            echo "Either provide one (./bite.sh $RANGE SM-XXX) or start from step 1-2 to auto-find."
            exit 1
        fi
        ARGS="$TICKET_KEY"
    fi

    # Run the step
    if [ -n "$ARGS" ]; then
        OUTPUT=$("$SCRIPT_PATH" "$ARGS" 2>&1) || {
            EXIT_CODE=$?
            echo "$OUTPUT"
            echo ""
            echo "=========================================="
            echo "  BITE STOPPED — Step $step failed (exit $EXIT_CODE)"
            echo "=========================================="
            exit $EXIT_CODE
        }
    else
        OUTPUT=$("$SCRIPT_PATH" 2>&1) || {
            EXIT_CODE=$?
            echo "$OUTPUT"
            echo ""
            echo "=========================================="
            echo "  BITE STOPPED — Step $step failed (exit $EXIT_CODE)"
            echo "=========================================="
            exit $EXIT_CODE
        }
    fi

    echo "$OUTPUT"

    # After step 2, extract the ticket key from output for subsequent steps
    if [ "$step" -eq 2 ] && [ -z "$TICKET_KEY" ]; then
        FOUND=$(echo "$OUTPUT" | grep -oE 'Ticket: (SM(-[A-Z]+)?-[0-9]+)' | head -1 | sed 's/Ticket: //')
        if [ -n "$FOUND" ]; then
            TICKET_KEY="$FOUND"
            echo ""
            echo ">>> Auto-detected ticket: $TICKET_KEY (passing to next steps)"
        fi
    fi

    step=$((step + 1))
done

echo ""
echo "=========================================="
echo "  BITE COMPLETE — Steps $START-$END finished"
[ -n "$TICKET_KEY" ] && echo "  Ticket: $TICKET_KEY"
echo "  Finished: $(date +'%d %b %Y, %I:%M %p')"
echo "=========================================="
