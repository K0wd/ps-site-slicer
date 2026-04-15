#!/bin/bash
# Step 3 — Review the Ticket (issue details, comments, attachments)
# Usage: ./step3-review-ticket-info.sh SM-1096

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

TICKET_KEY="${1:?Usage: $0 <TICKET_KEY>}"
chomp_ticket_dir "$TICKET_KEY"
TICKET_DIR="$CHOMP_TICKET_DIR"

chomp_step "3" "Review Ticket"
chomp_info "Ticket: **$(jira_link "$TICKET_KEY")**"

echo "=== Step 3: Review Ticket $TICKET_KEY ==="

# Issue details
echo ""
echo "--- Issue Details ---"
ISSUE_OUTPUT=$(python3 "$BITE_DIR/jira_api.py" get-issue "$TICKET_KEY" 2>&1)
echo "$ISSUE_OUTPUT" | tee "$TICKET_DIR/3_issue.json"
chomp_info "Fetched issue details"
chomp_code "Issue details" "$ISSUE_OUTPUT"

# Comments
echo ""
echo "--- Comments ---"
COMMENTS_OUTPUT=$(python3 "$BITE_DIR/jira_api.py" get-comments "$TICKET_KEY" 2>&1)
echo "$COMMENTS_OUTPUT" | tee "$TICKET_DIR/3_comments.json"

COMMENT_COUNT=$(echo "$COMMENTS_OUTPUT" | grep -c '"id"' || true)
chomp_info "Fetched comments ($COMMENT_COUNT found)"
chomp_code "Comments" "$COMMENTS_OUTPUT"

# Attachments
echo ""
echo "--- Attachments ---"
ATTACHMENTS_OUTPUT=$(python3 "$BITE_DIR/jira_api.py" get-attachments "$TICKET_KEY" 2>&1)
echo "$ATTACHMENTS_OUTPUT" | tee "$TICKET_DIR/3_attachments.txt"

chomp_info "Fetched attachments"
chomp_code "Attachments" "$ATTACHMENTS_OUTPUT"

chomp_result "PASS" "$(jira_link "$TICKET_KEY") reviewed — issue, comments, and attachments collected"

echo ""
echo "=== Step 3: DONE ==="
echo "Journey log: $CHOMP_LOG"
