#!/bin/bash
# Step 4 — Review the Code (find commits linked to ticket)
# Usage: ./step4-review-ticket-code-change.sh SM-1096

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BITE_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_DIR="$(dirname "$BITE_DIR")"

# Resume journey log
source "$SCRIPT_DIR/chomp-logger.sh"
chomp_resume

TICKET_KEY="${1:?Usage: $0 <TICKET_KEY>}"
chomp_ticket_dir "$TICKET_KEY"
TICKET_DIR="$CHOMP_TICKET_DIR"

chomp_step "4" "Review Code"
chomp_info "Ticket: **$(jira_link "$TICKET_KEY")**"

echo "=== Step 4: Review Code for $TICKET_KEY ==="

cd "$PROJECT_DIR"

echo ""
echo "--- Commits mentioning $TICKET_KEY ---"
COMMITS=$(git log --all --oneline --grep="$TICKET_KEY" 2>&1 | head -20)
echo "$COMMITS" | tee "$TICKET_DIR/4_commits.txt"

COMMIT_COUNT=$(echo "$COMMITS" | grep -c . || true)
chomp_info "Found **$COMMIT_COUNT** commit(s) referencing $(jira_link "$TICKET_KEY")"
chomp_code "Commits" "$COMMITS"

if [ "$COMMIT_COUNT" -gt 0 ]; then
    echo ""
    echo "--- Changed files ---"
    FIRST_COMMIT=$(echo "$COMMITS" | tail -1 | awk '{print $1}')
    LAST_COMMIT=$(echo "$COMMITS" | head -1 | awk '{print $1}')
    CHANGED=$(git diff --name-only "$FIRST_COMMIT~1".."$LAST_COMMIT" 2>/dev/null | head -20)
    echo "$CHANGED" | tee "$TICKET_DIR/4_changed_files.txt"
    chomp_info "Changed files identified"
    chomp_code "Changed files" "$CHANGED"
fi

chomp_result "PASS" "Code review complete for $(jira_link "$TICKET_KEY")"

echo ""
echo "=== Step 4: DONE ==="
echo "Journey log: $CHOMP_LOG"
