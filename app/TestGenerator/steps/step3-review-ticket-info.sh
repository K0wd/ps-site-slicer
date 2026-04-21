#!/bin/bash
# Step 3 — Review the Ticket (issue details, comments, attachments)
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BITE_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_DIR="$(dirname "$(dirname "$BITE_DIR")")"

set -a; source "$PROJECT_DIR/.env"; set +a
source "$SCRIPT_DIR/chomp-logger.sh"
chomp_resume

TICKET_KEY="${1:?Usage: $0 <TICKET_KEY>}"
chomp_ticket_dir "$TICKET_KEY"
TICKET_DIR="$CHOMP_TICKET_DIR"

chomp_step "3" "Review Ticket"
chomp_info "Ticket: **$(jira_link "$TICKET_KEY")**"

# --- Issue details ---
ISSUE_FIELDS="summary,description,issuetype,status,priority,parent,assignee,reporter,labels,attachment,environment"
ISSUE_RAW_FILE=$(mktemp)
python3 "$BITE_DIR/jira_api.py" get-issue "$TICKET_KEY" --fields "$ISSUE_FIELDS" > "$ISSUE_RAW_FILE" 2>&1
python3 -c "
import json, sys
with open(sys.argv[1]) as f:
    data = json.load(f)
f = data.get('fields', {})
def user_name(obj):
    return obj.get('displayName', '') if isinstance(obj, dict) else ''
attachments = [a.get('filename','') for a in f.get('attachment', []) if isinstance(a, dict)]
parent = {}
if isinstance(f.get('parent'), dict):
    parent = {'key': f['parent'].get('key',''), 'summary': f['parent'].get('fields',{}).get('summary','')}
trimmed = {
    'key': data.get('key'),
    'fields': {
        'summary': f.get('summary', ''),
        'description': f.get('description', ''),
        'issuetype': f.get('issuetype', {}).get('name', '') if isinstance(f.get('issuetype'), dict) else '',
        'status': f.get('status', {}).get('name', '') if isinstance(f.get('status'), dict) else '',
        'priority': f.get('priority', {}).get('name', '') if isinstance(f.get('priority'), dict) else '',
        'assignee': user_name(f.get('assignee')),
        'reporter': user_name(f.get('reporter')),
        'labels': f.get('labels', []),
        'environment': f.get('environment', ''),
        'parent': parent,
        'attachments': attachments,
    }
}
print(json.dumps(trimmed, indent=2))
" "$ISSUE_RAW_FILE" > "$TICKET_DIR/3_issue.json"
rm -f "$ISSUE_RAW_FILE"

ISSUE_SIZE=$(wc -c < "$TICKET_DIR/3_issue.json" | tr -d ' ')
SUMMARY=$(python3 -c "import json; print(json.load(open('$TICKET_DIR/3_issue.json')).get('fields',{}).get('summary',''))" 2>/dev/null || echo "")
ATTACH_COUNT=$(python3 -c "import json; print(len(json.load(open('$TICKET_DIR/3_issue.json')).get('fields',{}).get('attachments',[])))" 2>/dev/null || echo "0")
chomp_info "Issue: **$ISSUE_SIZE** bytes"

# --- Comments ---
COMMENTS_RAW=$(python3 "$BITE_DIR/jira_api.py" get-comments "$TICKET_KEY" 2>&1)
echo "$COMMENTS_RAW" | python3 -c "
import json, sys
data = json.load(sys.stdin)
comments = data.get('comments', data) if isinstance(data, dict) else data
trimmed = []
for c in (comments if isinstance(comments, list) else []):
    author = c.get('author', {}).get('displayName', '') if isinstance(c.get('author'), dict) else ''
    trimmed.append({'author': author, 'body': c.get('body', ''), 'created': c.get('created', '')})
print(json.dumps(trimmed, indent=2))
" > "$TICKET_DIR/3_comments.json" 2>/dev/null || echo "$COMMENTS_RAW" > "$TICKET_DIR/3_comments.json"

COMMENT_COUNT=$(python3 -c "import json; print(len(json.load(open('$TICKET_DIR/3_comments.json'))))" 2>/dev/null || echo "0")
chomp_info "Comments: **$COMMENT_COUNT**"

# --- Attachments ---
ATTACHMENTS_OUTPUT=$(python3 "$BITE_DIR/jira_api.py" get-attachments "$TICKET_KEY" 2>&1)
echo "$ATTACHMENTS_OUTPUT" > "$TICKET_DIR/3_attachments.md"
chomp_info "Attachments: **$ATTACH_COUNT**"
chomp_result "PASS" "$(jira_link "$TICKET_KEY") reviewed"

# --- Clean console output ---
echo "  $TICKET_KEY — $SUMMARY"
echo "  Issue: ${ISSUE_SIZE}B | Comments: $COMMENT_COUNT | Attachments: $ATTACH_COUNT"
