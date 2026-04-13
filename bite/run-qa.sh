#!/bin/bash
# SM QA Automation Runner (macOS)
# Runs Claude Code CLI to execute automated QA testing on Jira tickets in "Testing" status.
#
# Usage:
#   ./run-qa.sh              # Process the next Testing ticket
#   ./run-qa.sh SM-1096      # Process a specific ticket
#
# Scheduled via launchd to run periodically.

set -euo pipefail

# Paths
PROJECT_DIR="/Users/kim/projects/github.com/fulcrum/ps-site-slicer"
BITE_DIR="$PROJECT_DIR/bite"
JIRA_API="$BITE_DIR/jira_api.py"
LOG_DIR="$BITE_DIR/logs"
PROMPT_TEMPLATE="$BITE_DIR/qa-prompt.md"

# Ticket key from argument (optional)
TICKET_KEY="${1:-}"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
LOG_FILE="$LOG_DIR/qa_run_$TIMESTAMP.log"

log() {
    local line
    line="$(date +"%H:%M:%S") $1"
    echo "$line"
    echo "$line" >> "$LOG_FILE"
}

log "=== SM QA Automation Started ==="

# Step 0: Check time window (only run between 5PM and 5AM)
CURRENT_HOUR=$(date +"%H")
if [ "$CURRENT_HOUR" -ge 5 ] && [ "$CURRENT_HOUR" -lt 17 ]; then
    log "Outside testing window (5PM-5AM). Current hour: $CURRENT_HOUR. Exiting."
    exit 0
fi
log "Within testing window. Current hour: $CURRENT_HOUR"

# Step 1: Verify Jira API access
log "Checking Jira API access..."
AUTH_RESULT=$(python3 "$JIRA_API" test 2>&1) || {
    log "ERROR: Jira API auth failed. Exiting."
    log "$AUTH_RESULT"
    exit 1
}
log "Jira API OK"

# Step 2: Find a ticket to test
if [ -z "$TICKET_KEY" ]; then
    log "Searching for next Testing ticket..."
    SEARCH_RESULT=$(python3 "$JIRA_API" search "project in (SM, 'SM-PWA') AND status = Testing AND (labels is EMPTY OR labels not in (no_ai_test)) ORDER BY priority ASC, rank ASC" --fields summary,status --max-results 1 2>&1)

    # Extract ticket key from JSON
    TICKET_KEY=$(echo "$SEARCH_RESULT" | grep -oE '"key":\s*"(SM(-[A-Z]+)?-[0-9]+)"' | head -1 | sed 's/.*"\(SM[^"]*\)".*/\1/')
    if [ -z "$TICKET_KEY" ]; then
        log "No eligible Testing tickets found. Exiting."
        exit 0
    fi
fi

log "Processing ticket: $TICKET_KEY"

# Step 3: Load and prepare the QA prompt
if [ ! -f "$PROMPT_TEMPLATE" ]; then
    log "ERROR: Prompt file not found at $PROMPT_TEMPLATE"
    exit 1
fi
PROMPT=$(sed "s/{{TICKET_KEY}}/$TICKET_KEY/g" "$PROMPT_TEMPLATE")

log "Launching Claude Code CLI..."
PROMPT_FILE="$LOG_DIR/prompt_$TIMESTAMP.txt"
echo "$PROMPT" > "$PROMPT_FILE"

# Run Claude CLI in print mode
CLAUDE_OUTPUT_FILE="$LOG_DIR/claude_output_${TICKET_KEY}_$TIMESTAMP.txt"
if claude -p --allowedTools "Bash,Read,Write,Edit,Grep,Glob" -d "$PROJECT_DIR" < "$PROMPT_FILE" > "$CLAUDE_OUTPUT_FILE" 2>&1; then
    log "Claude Code CLI finished"
else
    log "ERROR: Claude Code CLI failed (exit code: $?)"
fi

log "Claude output saved to $CLAUDE_OUTPUT_FILE"
log "=== QA Automation Complete ==="
