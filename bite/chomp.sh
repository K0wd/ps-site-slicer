#!/bin/bash
# Chomp — Journey log viewer
#
# Usage:
#   ./chomp.sh                     # Show today's latest story
#   ./chomp.sh list                # List all stories
#   ./chomp.sh latest              # Show the most recent story (any day)
#   ./chomp.sh 13-Apr-26           # Show latest story for that date
#   ./chomp.sh path                # Print path to current story
#   ./chomp.sh summary             # Show headers and results only (compact view)
#   ./chomp.sh tree                # Show file tree of current run

set -euo pipefail

BITE_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$BITE_DIR/logs"
POINTER="$LOG_DIR/.current_chomp"

# --- Helpers ---

current_run_dir() {
    if [ -f "$POINTER" ]; then
        cat "$POINTER"
    else
        echo ""
    fi
}

current_log() {
    local run_dir
    run_dir=$(current_run_dir)
    if [ -n "$run_dir" ]; then
        # Find story.md inside any ticket subdirectory
        local story
        story=$(find "$run_dir" -name "story.md" -type f 2>/dev/null | head -1)
        if [ -n "$story" ]; then
            echo "$story"
            return
        fi
    fi
    echo ""
}

find_latest_for_date() {
    local date_dir="$LOG_DIR/$1"
    if [ -d "$date_dir" ]; then
        find "$date_dir" -name "story.md" -type f 2>/dev/null | sort -r | head -1
    fi
}

find_latest_any() {
    find "$LOG_DIR" -name "story.md" -type f 2>/dev/null | sort -r | head -1
}

show_log() {
    local file="$1"
    if [ -z "$file" ] || [ ! -f "$file" ]; then
        echo "No story found."
        exit 1
    fi
    echo "--- $file ---"
    echo ""
    cat "$file"
}

show_summary() {
    local file="$1"
    if [ -z "$file" ] || [ ! -f "$file" ]; then
        echo "No story found."
        exit 1
    fi
    local ticket_dir run_dir
    ticket_dir=$(dirname "$file")
    run_dir=$(dirname "$ticket_dir")
    local date_name time_name ticket_name
    date_name=$(basename "$(dirname "$run_dir")")
    time_name=$(basename "$run_dir")
    ticket_name=$(basename "$ticket_dir")
    echo "--- $date_name/$time_name/$ticket_name/story.md ---"
    echo ""
    grep -E '^#|^\*\*Time:\*\*|^>|^- (Ticket|Found|Verdict|Email|Mode):' "$file" 2>/dev/null || echo "(empty)"
}

# --- Commands ---

CMD="${1:-today}"

case "$CMD" in
    list)
        echo "=== All Chomp Stories ==="
        echo ""
        find "$LOG_DIR" -name "story.md" -type f 2>/dev/null | sort -r | while read -r f; do
            TICKET_DIR=$(dirname "$f")
            RUN_DIR=$(dirname "$TICKET_DIR")
            DATE_NAME=$(basename "$(dirname "$RUN_DIR")")
            TIME_NAME=$(basename "$RUN_DIR")
            TICKET_NAME=$(basename "$TICKET_DIR")
            STEP_COUNT=$(grep -c '^## Step' "$f" 2>/dev/null || true)
            FILE_COUNT=$(find "$TICKET_DIR" -type f ! -name "story.md" 2>/dev/null | wc -l | tr -d ' ')
            echo "  $DATE_NAME/$TIME_NAME/$TICKET_NAME  ($STEP_COUNT steps, $FILE_COUNT files)"
        done
        TOTAL=$(find "$LOG_DIR" -name "story.md" -type f 2>/dev/null | wc -l | tr -d ' ')
        echo ""
        echo "Total: $TOTAL stories"
        ;;

    latest)
        FILE=$(find_latest_any)
        show_log "$FILE"
        ;;

    path)
        LOG=$(current_log)
        if [ -n "$LOG" ]; then
            echo "$LOG"
        else
            echo "No active story."
            exit 1
        fi
        ;;

    summary)
        LOG=$(current_log)
        [ -z "$LOG" ] && LOG=$(find_latest_any)
        show_summary "$LOG"
        ;;

    tree)
        RUN_DIR=$(current_run_dir)
        if [ -z "$RUN_DIR" ] || [ ! -d "$RUN_DIR" ]; then
            echo "No active run directory."
            exit 1
        fi
        DATE_NAME=$(basename "$(dirname "$RUN_DIR")")
        TIME_NAME=$(basename "$RUN_DIR")
        echo "=== Run: $DATE_NAME/$TIME_NAME ==="
        echo ""
        find "$RUN_DIR" -type f | sort | while read -r f; do
            REL="${f#$RUN_DIR/}"
            SIZE=$(wc -c < "$f" | tr -d ' ')
            printf "  %-50s %sB\n" "$REL" "$SIZE"
        done
        ;;

    today)
        TODAY=$(date +"%d-%b-%y")
        FILE=$(find_latest_for_date "$TODAY")
        if [ -z "$FILE" ]; then
            LOG=$(current_log)
            if [ -n "$LOG" ] && [ -f "$LOG" ]; then
                show_log "$LOG"
            else
                echo "No story found for today ($TODAY)."
                echo "Run: ./bite.sh 1-3 to start a new journey."
            fi
        else
            show_log "$FILE"
        fi
        ;;

    *)
        FILE=$(find_latest_for_date "$CMD")
        if [ -n "$FILE" ]; then
            show_log "$FILE"
        else
            echo "No story found for date: $CMD"
            echo "Use './chomp.sh list' to see all available logs."
            exit 1
        fi
        ;;
esac
