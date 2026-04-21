#!/bin/bash
# Step 4 — Review the Code (find commits linked to ticket)
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BITE_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_DIR="$(dirname "$(dirname "$BITE_DIR")")"

source "$SCRIPT_DIR/chomp-logger.sh"
chomp_resume

TICKET_KEY="${1:?Usage: $0 <TICKET_KEY>}"
chomp_ticket_dir "$TICKET_KEY"
TICKET_DIR="$CHOMP_TICKET_DIR"

chomp_step "4" "Review Code"
chomp_info "Ticket: **$(jira_link "$TICKET_KEY")**"

cd "$PROJECT_DIR"

COMMITS=$(git log --all --oneline --grep="$TICKET_KEY" 2>&1 | head -20)
echo "$COMMITS" > "$TICKET_DIR/4_commits.md"

COMMIT_COUNT=$(echo "$COMMITS" | grep -c . || true)
chomp_info "Found **$COMMIT_COUNT** commit(s)"
chomp_code "Commits" "$COMMITS"

CHANGED_COUNT=0
if [ "$COMMIT_COUNT" -gt 0 ]; then
    FIRST_COMMIT=$(echo "$COMMITS" | tail -1 | awk '{print $1}')
    LAST_COMMIT=$(echo "$COMMITS" | head -1 | awk '{print $1}')
    CHANGED=$(git diff --name-only "$FIRST_COMMIT~1".."$LAST_COMMIT" 2>/dev/null | head -20)
    echo "$CHANGED" > "$TICKET_DIR/4_changed_files.md"
    CHANGED_COUNT=$(echo "$CHANGED" | grep -c . || true)
    chomp_info "Changed files: **$CHANGED_COUNT**"
    chomp_code "Changed files" "$CHANGED"
fi

chomp_result "PASS" "Code review complete for $(jira_link "$TICKET_KEY")"

echo "  Commits: $COMMIT_COUNT | Changed files: $CHANGED_COUNT"
