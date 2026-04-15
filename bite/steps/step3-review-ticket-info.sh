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

# Issue details (trimmed — only fields needed for test planning)
ISSUE_FIELDS="summary,description,issuetype,status,priority,parent,assignee,reporter,labels,components,duedate,created,updated,attachment,environment,comment,fixVersions,versions,issuelinks,subtasks,customfield_10000"

echo ""
echo "--- Issue Details ---"
ISSUE_RAW_FILE=$(mktemp)
python3 "$BITE_DIR/jira_api.py" get-issue "$TICKET_KEY" --fields "$ISSUE_FIELDS" > "$ISSUE_RAW_FILE" 2>&1
python3 -c "
import json, sys
with open(sys.argv[1]) as f:
    data = json.load(f)
trimmed = {'key': data.get('key'), 'fields': data.get('fields', {})}
print(json.dumps(trimmed, indent=2))
" "$ISSUE_RAW_FILE" > "$TICKET_DIR/3_issue.json"
rm -f "$ISSUE_RAW_FILE"

ISSUE_SIZE=$(wc -c < "$TICKET_DIR/3_issue.json" | tr -d ' ')
ISSUE_FIELDS_COUNT=$(python3 -c "import json; print(len(json.load(open('$TICKET_DIR/3_issue.json')).get('fields',{})))")
echo "Saved $TICKET_DIR/3_issue.json ($ISSUE_SIZE bytes, $ISSUE_FIELDS_COUNT fields)"
chomp_info "Fetched issue details — trimmed to **$ISSUE_FIELDS_COUNT** fields (**$ISSUE_SIZE** bytes)"

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
