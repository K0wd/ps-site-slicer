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
# Timing data is collected per step and printed as a summary at the end.

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BITE_DIR="$PROJECT_DIR/bite"
STEPS_DIR="$BITE_DIR/steps"

# --- Timing helpers ---
# Uses epoch seconds for bash 3 compatibility (macOS default)

now_epoch() {
    date +%s
}

format_duration() {
    local total_secs="$1"
    local hrs=$((total_secs / 3600))
    local mins=$(( (total_secs % 3600) / 60 ))
    local secs=$((total_secs % 60))
    if [ "$hrs" -gt 0 ]; then
        printf "%dh %dm %ds" "$hrs" "$mins" "$secs"
    elif [ "$mins" -gt 0 ]; then
        printf "%dm %ds" "$mins" "$secs"
    else
        printf "%ds" "$secs"
    fi
}

# Arrays to store timing data (parallel indexed)
TIMING_STEPS=()
TIMING_NAMES=()
TIMING_STARTS=()
TIMING_ENDS=()
TIMING_DURATIONS=()
TIMING_STATUSES=()

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

step_name() {
    case "$1" in
        1)  echo "Verify Jira Auth" ;;
        2)  echo "Find Ticket" ;;
        3)  echo "Review Ticket" ;;
        4)  echo "Review Code" ;;
        5)  echo "Draft Test Plan" ;;
        6)  echo "Write Tests" ;;
        7)  echo "Execute Test Plan" ;;
        8)  echo "Determine Result" ;;
        9)  echo "Post Results" ;;
        10) echo "Transition Ticket" ;;
        *)  echo "Unknown" ;;
    esac
}

needs_ticket() {
    case "$1" in
        3|4|5|6|7|8|9|10) return 0 ;;
        *) return 1 ;;
    esac
}

RUN_START_EPOCH=$(now_epoch)
RUN_START_DISPLAY=$(date +'%d %b %Y, %I:%M:%S %p')

echo "=========================================="
echo "  BITE — QA Automation Runner"
echo "  Steps: $START → $END"
[ -n "$TICKET_KEY" ] && echo "  Ticket: $TICKET_KEY"
echo "  Started: $RUN_START_DISPLAY"
echo "=========================================="
echo ""

step=$START
while [ "$step" -le "$END" ]; do
    SCRIPT=$(step_script "$step")
    SCRIPT_PATH="$STEPS_DIR/$SCRIPT"
    SNAME=$(step_name "$step")

    if [ -z "$SCRIPT" ] || [ ! -f "$SCRIPT_PATH" ]; then
        echo "ERROR: Script not found for step $step"
        exit 1
    fi

    STEP_START_EPOCH=$(now_epoch)
    STEP_START_DISPLAY=$(date +'%I:%M:%S %p')

    echo ""
    echo ">>> Running step $step: $SNAME ($SCRIPT)"
    echo "    Started: $STEP_START_DISPLAY"
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
    STEP_STATUS="PASS"
    if [ -n "$ARGS" ]; then
        OUTPUT=$("$SCRIPT_PATH" "$ARGS" 2>&1) || {
            EXIT_CODE=$?
            STEP_END_EPOCH=$(now_epoch)
            STEP_DURATION=$((STEP_END_EPOCH - STEP_START_EPOCH))

            # Record failed step timing
            TIMING_STEPS+=("$step")
            TIMING_NAMES+=("$SNAME")
            TIMING_STARTS+=("$STEP_START_DISPLAY")
            TIMING_ENDS+=("$(date +'%I:%M:%S %p')")
            TIMING_DURATIONS+=("$STEP_DURATION")
            TIMING_STATUSES+=("FAIL")

            echo "$OUTPUT"
            echo ""
            echo "    Finished: $(date +'%I:%M:%S %p')  Duration: $(format_duration "$STEP_DURATION")"
            echo ""

            # Print timing summary even on failure
            RUN_END_EPOCH=$(now_epoch)
            RUN_TOTAL=$((RUN_END_EPOCH - RUN_START_EPOCH))

            echo "=========================================="
            echo "  BITE STOPPED — Step $step failed (exit $EXIT_CODE)"
            echo "=========================================="
            echo ""
            echo "  TIMING SUMMARY"
            echo "  ─────────────────────────────────────────"
            printf "  %-6s %-22s %-14s %-14s %-10s %s\n" "Step" "Name" "Start" "End" "Duration" "Status"
            echo "  ─────────────────────────────────────────"
            for i in "${!TIMING_STEPS[@]}"; do
                printf "  %-6s %-22s %-14s %-14s %-10s %s\n" \
                    "${TIMING_STEPS[$i]}" \
                    "${TIMING_NAMES[$i]}" \
                    "${TIMING_STARTS[$i]}" \
                    "${TIMING_ENDS[$i]}" \
                    "$(format_duration "${TIMING_DURATIONS[$i]}")" \
                    "${TIMING_STATUSES[$i]}"
            done
            echo "  ─────────────────────────────────────────"
            printf "  %-6s %-22s %-14s %-14s %-10s\n" "" "TOTAL" "$RUN_START_DISPLAY" "$(date +'%I:%M:%S %p')" "$(format_duration "$RUN_TOTAL")"
            echo "=========================================="
            exit $EXIT_CODE
        }
    else
        OUTPUT=$("$SCRIPT_PATH" 2>&1) || {
            EXIT_CODE=$?
            STEP_END_EPOCH=$(now_epoch)
            STEP_DURATION=$((STEP_END_EPOCH - STEP_START_EPOCH))

            # Record failed step timing
            TIMING_STEPS+=("$step")
            TIMING_NAMES+=("$SNAME")
            TIMING_STARTS+=("$STEP_START_DISPLAY")
            TIMING_ENDS+=("$(date +'%I:%M:%S %p')")
            TIMING_DURATIONS+=("$STEP_DURATION")
            TIMING_STATUSES+=("FAIL")

            echo "$OUTPUT"
            echo ""
            echo "    Finished: $(date +'%I:%M:%S %p')  Duration: $(format_duration "$STEP_DURATION")"
            echo ""

            # Print timing summary even on failure
            RUN_END_EPOCH=$(now_epoch)
            RUN_TOTAL=$((RUN_END_EPOCH - RUN_START_EPOCH))

            echo "=========================================="
            echo "  BITE STOPPED — Step $step failed (exit $EXIT_CODE)"
            echo "=========================================="
            echo ""
            echo "  TIMING SUMMARY"
            echo "  ─────────────────────────────────────────"
            printf "  %-6s %-22s %-14s %-14s %-10s %s\n" "Step" "Name" "Start" "End" "Duration" "Status"
            echo "  ─────────────────────────────────────────"
            for i in "${!TIMING_STEPS[@]}"; do
                printf "  %-6s %-22s %-14s %-14s %-10s %s\n" \
                    "${TIMING_STEPS[$i]}" \
                    "${TIMING_NAMES[$i]}" \
                    "${TIMING_STARTS[$i]}" \
                    "${TIMING_ENDS[$i]}" \
                    "$(format_duration "${TIMING_DURATIONS[$i]}")" \
                    "${TIMING_STATUSES[$i]}"
            done
            echo "  ─────────────────────────────────────────"
            printf "  %-6s %-22s %-14s %-14s %-10s\n" "" "TOTAL" "$RUN_START_DISPLAY" "$(date +'%I:%M:%S %p')" "$(format_duration "$RUN_TOTAL")"
            echo "=========================================="
            exit $EXIT_CODE
        }
    fi

    STEP_END_EPOCH=$(now_epoch)
    STEP_DURATION=$((STEP_END_EPOCH - STEP_START_EPOCH))

    # Record successful step timing
    TIMING_STEPS+=("$step")
    TIMING_NAMES+=("$SNAME")
    TIMING_STARTS+=("$STEP_START_DISPLAY")
    TIMING_ENDS+=("$(date +'%I:%M:%S %p')")
    TIMING_DURATIONS+=("$STEP_DURATION")
    TIMING_STATUSES+=("OK")

    echo "$OUTPUT"
    echo ""
    echo "    Finished: $(date +'%I:%M:%S %p')  Duration: $(format_duration "$STEP_DURATION")"

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

RUN_END_EPOCH=$(now_epoch)
RUN_TOTAL=$((RUN_END_EPOCH - RUN_START_EPOCH))
RUN_END_DISPLAY=$(date +'%d %b %Y, %I:%M:%S %p')

echo ""
echo "=========================================="
echo "  BITE COMPLETE — Steps $START-$END finished"
[ -n "$TICKET_KEY" ] && echo "  Ticket: $TICKET_KEY"
echo "  Finished: $RUN_END_DISPLAY"
echo "  Total duration: $(format_duration "$RUN_TOTAL")"
echo "=========================================="
echo ""
echo "  TIMING SUMMARY"
echo "  ─────────────────────────────────────────"
printf "  %-6s %-22s %-14s %-14s %-10s %s\n" "Step" "Name" "Start" "End" "Duration" "Status"
echo "  ─────────────────────────────────────────"
for i in "${!TIMING_STEPS[@]}"; do
    printf "  %-6s %-22s %-14s %-14s %-10s %s\n" \
        "${TIMING_STEPS[$i]}" \
        "${TIMING_NAMES[$i]}" \
        "${TIMING_STARTS[$i]}" \
        "${TIMING_ENDS[$i]}" \
        "$(format_duration "${TIMING_DURATIONS[$i]}")" \
        "${TIMING_STATUSES[$i]}"
done
echo "  ─────────────────────────────────────────"
printf "  %-6s %-22s %-14s %-14s %-10s\n" "" "TOTAL" "$RUN_START_DISPLAY" "$(date +'%I:%M:%S %p')" "$(format_duration "$RUN_TOTAL")"
echo "=========================================="
