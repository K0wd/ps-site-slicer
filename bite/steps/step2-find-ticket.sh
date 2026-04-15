#!/bin/bash
# Step 2 — Find eligible tickets (or validate a specific one)
#
# Filter modes (first argument):
#   me       — Only tickets assigned to Kim Bandeleon
#   all      — Testing status OR assigned to Kim (default)
#   SM-XXXX  — Validate a specific ticket
#
# Lists all matching tickets in a table, picks the first for downstream steps.
# Outputs a TICKETS: line with all keys for bite.sh to parse.
#
# Usage:
#   ./step2-find-ticket.sh              # Same as "all"
#   ./step2-find-ticket.sh me           # Only my tickets
#   ./step2-find-ticket.sh all          # Testing + assigned to me
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

ARG="${1:-all}"

echo "=== Step 2: Find Ticket ==="

# Determine JQL based on filter
case "$ARG" in
    me)
        echo "Filter: MY tickets (assigned to Kim Bandeleon)"
        JQL='project = SM AND assignee in ("kbandeleon@gmail.com", "Kim Bandeleon") AND (labels is EMPTY OR labels not in (no_ai_test)) ORDER BY priority ASC, status ASC, rank ASC'
        MAX_RESULTS=20
        ;;
    all)
        echo "Filter: ALL eligible (Testing status OR assigned to Kim)"
        JQL='project = SM AND (status = Testing OR assignee in ("kbandeleon@gmail.com", "Kim Bandeleon")) AND (labels is EMPTY OR labels not in (no_ai_test)) ORDER BY priority ASC, status ASC, rank ASC'
        MAX_RESULTS=20
        ;;
    SM-*|sm-*)
        TICKET_KEY="$ARG"
        echo "Validating specific ticket: $TICKET_KEY"
        JQL="project = SM AND key = $TICKET_KEY AND (labels is EMPTY OR labels not in (no_ai_test)) ORDER BY priority ASC, rank ASC"
        MAX_RESULTS=1
        ;;
    *)
        echo "ERROR: Invalid filter '$ARG'. Use 'me', 'all', or a ticket key (SM-XXX)."
        exit 1
        ;;
esac

RESULT=$(python3 "$BITE_DIR/jira_api.py" search \
    "$JQL" \
    --fields summary,status,assignee,reporter,priority \
    --max-results "$MAX_RESULTS" 2>&1)

# Save raw result
STAGING_RESULT="/tmp/bite_step2_result.json"
echo "$RESULT" > "$STAGING_RESULT"

# Extract all ticket keys
ALL_KEYS=$(echo "$RESULT" | grep -oE '"key":\s*"(SM(-[A-Z]+)?-[0-9]+)"' | sed 's/.*"\(SM[^"]*\)".*/\1/')

if [ -z "$ALL_KEYS" ]; then
    echo "No eligible SM tickets found. Exiting."
    exit 1
fi

TOTAL_FOUND=$(echo "$ALL_KEYS" | wc -l | tr -d ' ')

# --- Print ticket table ---

echo ""
echo "Found $TOTAL_FOUND eligible ticket(s):"
echo ""
printf "| %-10s | %-16s | %-24s | %-24s |\n" "Ticket" "Status" "Assignee" "Reporter"
printf "|%-12s|%-18s|%-26s|%-26s|\n" "------------" "------------------" "--------------------------" "--------------------------"

while IFS= read -r KEY; do
    FIELDS=$(python3 -c "
import json, sys
data = json.load(open('$STAGING_RESULT'))
issues = data.get('issues', []) if isinstance(data, dict) else []
if not issues:
    issues = data if isinstance(data, list) else [data]
for issue in issues:
    if issue.get('key') == '$KEY':
        f = issue.get('fields', {})
        status = f.get('status', {}).get('name', '—') if isinstance(f.get('status'), dict) else '—'
        assignee = f.get('assignee', {}).get('displayName', 'Unassigned') if isinstance(f.get('assignee'), dict) else 'Unassigned'
        reporter = f.get('reporter', {}).get('displayName', '—') if isinstance(f.get('reporter'), dict) else '—'
        print(f'{status}|||{assignee}|||{reporter}')
        break
" 2>/dev/null || echo "—|||—|||—")

    STATUS=$(echo "$FIELDS" | cut -d'|' -f1)
    ASSIGNEE=$(echo "$FIELDS" | cut -d'|' -f4)
    REPORTER=$(echo "$FIELDS" | cut -d'|' -f7)

    printf "| %-10s | %-16s | %-24s | %-24s |\n" "$KEY" "$STATUS" "$ASSIGNEE" "$REPORTER"
done <<< "$ALL_KEYS"

echo ""

# Output all tickets in a parseable line for bite.sh
TICKETS_CSV=$(echo "$ALL_KEYS" | tr '\n' ',' | sed 's/,$//')
echo "TICKETS: $TICKETS_CSV"

# Pick the first ticket for single-ticket mode
FOUND_KEY=$(echo "$ALL_KEYS" | head -1)
FOUND_SUMMARY=$(echo "$RESULT" | grep -oE '"summary":\s*"[^"]*"' | head -1 | sed 's/"summary":\s*"\([^"]*\)"/\1/')

echo "Selected ticket: $FOUND_KEY"
echo ""

# Create ticket dir for the selected ticket
chomp_ticket_dir "$FOUND_KEY"
TICKET_DIR="$CHOMP_TICKET_DIR"

# Retroactively log step 1 into story
AUTH_FILE="$CHOMP_RUN_DIR/1_auth.md"
if [ -f "$AUTH_FILE" ]; then
    chomp_step "1" "Verify Jira Auth"
    chomp_info "Email: $JIRA_EMAIL"
    chomp_info "Base URL: $JIRA_BASE_URL"
    chomp_result "PASS" "Jira auth verified"
    chomp_code "Auth response" "$(cat "$AUTH_FILE")"
    mv "$AUTH_FILE" "$TICKET_DIR/1_auth.md"
fi

# Log step 2
chomp_step "2" "Find Ticket"
chomp_info "Filter: **$ARG**"
chomp_info "Found **$TOTAL_FOUND** eligible ticket(s)"
chomp_info "Selected ticket: **$(jira_link "$FOUND_KEY")**"
[ -n "$FOUND_SUMMARY" ] && chomp_info "Summary: $FOUND_SUMMARY"
chomp_result "PASS" "$(jira_link "$FOUND_KEY") identified"
chomp_code "Search result" "$RESULT"

# Save search result
echo "$RESULT" > "$TICKET_DIR/2_search.json"

echo "=== Step 2: DONE — Ticket: $FOUND_KEY ==="
echo "Journey log: $CHOMP_LOG"
