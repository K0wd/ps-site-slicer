#!/bin/bash
# Step 2 — Find the next Testing ticket (or validate a specific one)
# Usage:
#   ./step2-find-ticket.sh              # Find next eligible ticket
#   ./step2-find-ticket.sh SM-1096      # Validate a specific ticket

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BITE_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_DIR="$(dirname "$BITE_DIR")"

# Load .env
set -a
source "$PROJECT_DIR/.env"
set +a

# Resume journey
source "$SCRIPT_DIR/chomp-logger.sh"
chomp_resume

TICKET_KEY="${1:-}"

echo "=== Step 2: Find Ticket ==="

if [ -n "$TICKET_KEY" ]; then
    echo "Validating specific ticket: $TICKET_KEY"
    RESULT=$(python3 "$BITE_DIR/jira_api.py" search \
        "project in (SM, 'SM-PWA') AND key = $TICKET_KEY AND status = Testing AND (labels is EMPTY OR labels not in (no_ai_test)) ORDER BY priority ASC, rank ASC" \
        --fields summary,description,status,labels,priority,attachment \
        --max-results 1 2>&1)
else
    echo "Searching for next eligible Testing ticket..."
    RESULT=$(python3 "$BITE_DIR/jira_api.py" search \
        "project in (SM, 'SM-PWA') AND status = Testing AND (labels is EMPTY OR labels not in (no_ai_test)) ORDER BY priority ASC, rank ASC" \
        --fields summary,description,status,labels,priority,attachment \
        --max-results 1 2>&1)
fi

# Extract ticket key
FOUND_KEY=$(echo "$RESULT" | grep -oE '"key":\s*"(SM(-[A-Z]+)?-[0-9]+)"' | head -1 | sed 's/.*"\(SM[^"]*\)".*/\1/')

# Extract summary
FOUND_SUMMARY=$(echo "$RESULT" | grep -oE '"summary":\s*"[^"]*"' | head -1 | sed 's/"summary":\s*"\([^"]*\)"/\1/')

if [ -z "$FOUND_KEY" ]; then
    echo "No eligible SM tickets found. Exiting."
    exit 1
fi

# Now we know the ticket — create its directory and init story.md
chomp_ticket_dir "$FOUND_KEY"
TICKET_DIR="$CHOMP_TICKET_DIR"

# Retroactively log step 1 into story
AUTH_FILE="$CHOMP_RUN_DIR/1_auth.txt"
if [ -f "$AUTH_FILE" ]; then
    chomp_step "1" "Verify Jira Auth"
    chomp_info "Email: $JIRA_EMAIL"
    chomp_info "Base URL: $JIRA_BASE_URL"
    chomp_result "PASS" "Jira auth verified"
    chomp_code "Auth response" "$(cat "$AUTH_FILE")"
    # Move auth file into ticket dir
    mv "$AUTH_FILE" "$TICKET_DIR/1_auth.txt"
fi

# Log step 2
chomp_step "2" "Find Ticket"
if [ -n "$TICKET_KEY" ]; then
    chomp_info "Mode: Validate specific ticket **$(jira_link "$FOUND_KEY")**"
else
    chomp_info "Mode: Auto-search for next eligible Testing ticket"
fi
chomp_info "Found ticket: **$(jira_link "$FOUND_KEY")**"
[ -n "$FOUND_SUMMARY" ] && chomp_info "Summary: $FOUND_SUMMARY"
chomp_result "PASS" "$(jira_link "$FOUND_KEY") identified"
chomp_code "Search result" "$RESULT"

# Save search result
echo "$RESULT" > "$TICKET_DIR/2_search.json"

echo "Found ticket: $FOUND_KEY"
echo "$RESULT"
echo ""
echo "=== Step 2: DONE — Ticket: $FOUND_KEY ==="
echo "Journey log: $CHOMP_LOG"
