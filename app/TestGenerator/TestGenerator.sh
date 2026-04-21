#!/usr/bin/env bash
# TestGenerator — Sequential QA step runner
#
# Usage (run from project root):
#   ./app/TestGenerator/TestGenerator.sh 1-3                  # Run steps 1-3, filter=all (default)
#   ./app/TestGenerator/TestGenerator.sh 1-3 SM-754           # Run steps 1-3 on a specific ticket
#   ./app/TestGenerator/TestGenerator.sh 1-6 me               # Run steps 1-6 for ALL tickets assigned to me
#   ./app/TestGenerator/TestGenerator.sh 1-6 all              # Run steps 1-6 for Testing + assigned to me
#   ./app/TestGenerator/TestGenerator.sh 2 SM-754             # Run a single step
#   ./app/TestGenerator/TestGenerator.sh 5-11 SM-754          # Run steps 5-11 on a specific ticket
#
# Filters (second argument):
#   me       — Only tickets assigned to Kim Bandeleon
#   all      — Testing status OR assigned to Kim (default)
#   SM-XXXX  — A specific ticket key
#
# Steps:
#   1  Verify Jira auth
#   2  Find/validate ticket
#   3  Review ticket (issue, comments, attachments)
#   4  Review code (commits, changed files)
#   5  Draft test plan
#   6  Write Gherkin steps (one Claude call per TC, parallel, compiled in order)
#   7  Write automated tests (per-step implementation + verify)
#   8  Execute tests (run Playwright-BDD suite)
#   9  Determine results (generate .md report)
#  10  Post results to Jira
#  11  Transition ticket
#
# With "me" or "all" filters, steps 3+ loop through each found ticket.
# Timing data is collected per step and printed as a summary at the end.

set -euo pipefail

BITE_DIR="$(cd "$(dirname "$0")" && pwd)"
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
TIMING_DURATIONS=()
TIMING_STATUSES=()

# --- Print timing summary ---

print_timing_summary() {
    local title="$1"
    local run_total="$2"

    echo ""
    echo "  TIMING SUMMARY"
    echo "  ─────────────────────────────────────────"
    printf "  %-6s %-22s %-10s %s\n" "Step" "Name" "Duration" "Status"
    echo "  ─────────────────────────────────────────"
    for i in "${!TIMING_STEPS[@]}"; do
        printf "  %-6s %-22s %-10s %s\n" \
            "${TIMING_STEPS[$i]}" \
            "${TIMING_NAMES[$i]}" \
            "$(format_duration "${TIMING_DURATIONS[$i]}")" \
            "${TIMING_STATUSES[$i]}"
    done
    echo "  ─────────────────────────────────────────"
    printf "  %-6s %-22s %-10s\n" "" "TOTAL" "$(format_duration "$run_total")"
    echo "=========================================="
}

# --- Parse arguments ---
RANGE="${1:?Usage: ./app/TestGenerator/TestGenerator.sh <step|range> [me|all|SM-XXX]  (e.g. ./app/TestGenerator/TestGenerator.sh 1-6 me)}"
ARG2="${2:-}"

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

if [ "$START" -gt "$END" ] || [ "$START" -lt 1 ] || [ "$END" -gt 11 ]; then
    echo "ERROR: Range must be 1-11 and start <= end. Got: $RANGE"
    exit 1
fi

# Determine if ARG2 is a filter (me/all) or a ticket key
FILTER=""
TICKET_KEY=""
case "$ARG2" in
    me|all)   FILTER="$ARG2" ;;
    SM-*|sm-*) TICKET_KEY="$ARG2" ;;
    "")       FILTER="all" ;;
    *)
        echo "ERROR: Invalid argument '$ARG2'. Use 'me', 'all', or a ticket key (SM-XXX)."
        exit 1
        ;;
esac

# Map step numbers to scripts
step_script() {
    case "$1" in
        1)  echo "step1-verify-auth.sh" ;;
        2)  echo "step2-find-ticket.sh" ;;
        3)  echo "step3-review-ticket-info.sh" ;;
        4)  echo "step4-review-ticket-code-change.sh" ;;
        5)  echo "step5-draft-test-plan.sh" ;;
        6)  echo "step6-write-gherkin-steps.sh" ;;
        7)  echo "step7-write-automated-tests.sh" ;;
        8)  echo "step8-execute-tests.sh" ;;
        9)  echo "step9-determine-results.sh" ;;
        10) echo "step10-post-results.sh" ;;
        11) echo "step11-transition-ticket.sh" ;;
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
        6)  echo "Write Gherkin Steps" ;;
        7)  echo "Write Automated Tests" ;;
        8)  echo "Execute Tests" ;;
        9)  echo "Determine Results" ;;
        10) echo "Post Results" ;;
        11) echo "Transition Ticket" ;;
        *)  echo "Unknown" ;;
    esac
}

needs_ticket() {
    case "$1" in
        3|4|5|6|7|8|9|10|11) return 0 ;;
        *) return 1 ;;
    esac
}

# --- Run a single step, record timing, handle failure ---

run_step() {
    local step="$1"
    local args="${2:-}"

    local SCRIPT SCRIPT_PATH SNAME
    SCRIPT=$(step_script "$step")
    SCRIPT_PATH="$STEPS_DIR/$SCRIPT"
    SNAME=$(step_name "$step")

    if [ -z "$SCRIPT" ] || [ ! -f "$SCRIPT_PATH" ]; then
        echo "ERROR: Script not found for step $step"
        exit 1
    fi

    local STEP_START_EPOCH
    STEP_START_EPOCH=$(now_epoch)

    echo ""
    echo ">>> Running step $step: $SNAME ($SCRIPT)"
    echo "    Started: $(date +'%I:%M:%S %p')"
    echo ""

    local OUTPUT EXIT_CODE=0
    if [ -n "$args" ]; then
        OUTPUT=$("$SCRIPT_PATH" "$args" 2>&1) || EXIT_CODE=$?
    else
        OUTPUT=$("$SCRIPT_PATH" 2>&1) || EXIT_CODE=$?
    fi

    local STEP_END_EPOCH STEP_DURATION
    STEP_END_EPOCH=$(now_epoch)
    STEP_DURATION=$((STEP_END_EPOCH - STEP_START_EPOCH))

    echo "$OUTPUT" | grep -v '^TICKETS: '
    echo ""
    echo "    Finished: $(date +'%I:%M:%S %p')  Duration: $(format_duration "$STEP_DURATION")"

    if [ "$EXIT_CODE" -ne 0 ]; then
        TIMING_STEPS+=("$step")
        TIMING_NAMES+=("$SNAME")
        TIMING_DURATIONS+=("$STEP_DURATION")
        TIMING_STATUSES+=("FAIL")

        local RUN_END_EPOCH RUN_TOTAL
        RUN_END_EPOCH=$(now_epoch)
        RUN_TOTAL=$((RUN_END_EPOCH - RUN_START_EPOCH))

        echo ""
        echo "=========================================="
        echo "  TestGenerator STOPPED — Step $step failed (exit $EXIT_CODE)"
        echo "=========================================="
        print_timing_summary "STOPPED" "$RUN_TOTAL"
        exit $EXIT_CODE
    fi

    TIMING_STEPS+=("$step")
    TIMING_NAMES+=("$SNAME")
    TIMING_DURATIONS+=("$STEP_DURATION")
    TIMING_STATUSES+=("OK")

    # Return output for parsing
    STEP_OUTPUT="$OUTPUT"
}

# ═══════════════════════════════════════════════════════
# Main execution
# ═══════════════════════════════════════════════════════

RUN_START_EPOCH=$(now_epoch)
RUN_START_DISPLAY=$(date +'%d %b %Y, %I:%M:%S %p')

echo "=========================================="
echo "  TestGenerator — QA Automation Runner"
echo "  Steps: $START → $END"
[ -n "$TICKET_KEY" ] && echo "  Ticket: $TICKET_KEY"
[ -n "$FILTER" ] && echo "  Filter: $FILTER"
echo "  Started: $RUN_START_DISPLAY"
echo "=========================================="

STEP_OUTPUT=""
ALL_TICKETS=""

# --- Run steps 1-2 (single pass) ---

step=$START
while [ "$step" -le "$END" ] && [ "$step" -le 2 ]; do
    case "$step" in
        1)
            run_step 1
            ;;
        2)
            if [ -n "$TICKET_KEY" ]; then
                run_step 2 "$TICKET_KEY"
            else
                run_step 2 "$FILTER"
            fi

            # Extract ticket list from step 2 output
            TICKETS_LINE=$(echo "$STEP_OUTPUT" | grep '^TICKETS:' | head -1 | sed 's/TICKETS: //')
            if [ -n "$TICKETS_LINE" ]; then
                ALL_TICKETS="$TICKETS_LINE"
            fi

            # Extract selected ticket for single-ticket mode
            if [ -z "$TICKET_KEY" ]; then
                FOUND=$(echo "$STEP_OUTPUT" | grep -oE 'Selected: (SM(-[A-Z]+)?-[0-9]+)' | head -1 | sed 's/Selected: //')
                if [ -n "$FOUND" ]; then
                    TICKET_KEY="$FOUND"
                    echo ""
                    echo ">>> Auto-selected ticket: $TICKET_KEY"
                fi
            fi
            ;;
    esac
    step=$((step + 1))
done

# --- Run steps 3+ ---

# If we haven't reached step 3 yet, nothing more to do
if [ "$step" -gt "$END" ]; then
    # Done — print summary
    RUN_END_EPOCH=$(now_epoch)
    RUN_TOTAL=$((RUN_END_EPOCH - RUN_START_EPOCH))
    RUN_END_DISPLAY=$(date +'%d %b %Y, %I:%M:%S %p')

    echo ""
    echo "=========================================="
    echo "  TestGenerator COMPLETE — Steps $START-$END finished"
    [ -n "$TICKET_KEY" ] && echo "  Ticket: $TICKET_KEY"
    echo "  Finished: $RUN_END_DISPLAY"
    echo "  Total duration: $(format_duration "$RUN_TOTAL")"
    echo "=========================================="
    print_timing_summary "COMPLETE" "$RUN_TOTAL"
    exit 0
fi

# Determine which tickets to process for steps 3+
if [ -n "$FILTER" ] && [ "$FILTER" != "all" ] || [ "$FILTER" = "all" ]; then
    # In filter mode with multiple tickets — build ticket list
    if [ -n "$ALL_TICKETS" ]; then
        # Convert CSV to array
        IFS=',' read -ra TICKET_LIST <<< "$ALL_TICKETS"
    elif [ -n "$TICKET_KEY" ]; then
        TICKET_LIST=("$TICKET_KEY")
    else
        echo "ERROR: No tickets found. Cannot continue to step $step."
        exit 1
    fi
else
    TICKET_LIST=("$TICKET_KEY")
fi

# For specific ticket key (SM-XXX), only process that one
if [[ "$ARG2" =~ ^(SM|sm)- ]]; then
    TICKET_LIST=("$TICKET_KEY")
fi

TICKET_TOTAL=${#TICKET_LIST[@]}

echo ""
echo "=========================================="
echo "  Processing $TICKET_TOTAL ticket(s) for steps $step-$END"
echo "=========================================="

TICKET_INDEX=0
for TK in "${TICKET_LIST[@]}"; do
    TICKET_INDEX=$((TICKET_INDEX + 1))
    TICKET_KEY="$TK"

    echo ""
    echo "╔══════════════════════════════════════════╗"
    echo "  Ticket $TICKET_INDEX/$TICKET_TOTAL: $TICKET_KEY"
    echo "╚══════════════════════════════════════════╝"

    s=$step
    while [ "$s" -le "$END" ]; do
        if needs_ticket "$s"; then
            run_step "$s" "$TICKET_KEY"
        else
            run_step "$s"
        fi
        s=$((s + 1))
    done
done

# --- Final summary ---

RUN_END_EPOCH=$(now_epoch)
RUN_TOTAL=$((RUN_END_EPOCH - RUN_START_EPOCH))
RUN_END_DISPLAY=$(date +'%d %b %Y, %I:%M:%S %p')

echo ""
echo "=========================================="
echo "  TestGenerator COMPLETE — Steps $START-$END finished"
echo "  Tickets processed: $TICKET_TOTAL"
echo "  Finished: $RUN_END_DISPLAY"
echo "  Total duration: $(format_duration "$RUN_TOTAL")"
echo "=========================================="
print_timing_summary "COMPLETE" "$RUN_TOTAL"
