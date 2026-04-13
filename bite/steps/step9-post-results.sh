#!/bin/bash
# Step 9 — Post Results to Jira (upload screenshots + comment)
# Usage: ./step9-post-results.sh SM-1096

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
RESULTS_FILE="$TICKET_DIR/7_results.txt"
SCREENSHOTS_DIR="$TICKET_DIR/test-results"

chomp_step "9" "Post Results to Jira"
chomp_info "Ticket: **$(jira_link "$TICKET_KEY")**"

echo "=== Step 9: Post Results to Jira for $TICKET_KEY ==="

if [ ! -f "$RESULTS_FILE" ]; then
    chomp_result "FAIL" "Results file not found. Run steps 7-8 first."
    echo "ERROR: Results file not found at $RESULTS_FILE"
    exit 1
fi

# Upload screenshots if they exist
if [ -d "$SCREENSHOTS_DIR" ]; then
    SCREENSHOT_COUNT=$(find "$SCREENSHOTS_DIR" -name "*.png" -o -name "*.jpg" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$SCREENSHOT_COUNT" -gt 0 ]; then
        echo "Uploading $SCREENSHOT_COUNT screenshot(s)..."
        chomp_info "Uploading **$SCREENSHOT_COUNT** screenshot(s)"
        for screenshot in "$SCREENSHOTS_DIR"/*.{png,jpg}; do
            [ -f "$screenshot" ] || continue
            BASENAME=$(basename "$screenshot")
            echo "  Uploading: $BASENAME"
            python3 "$BITE_DIR/jira_api.py" upload-attachment "$TICKET_KEY" "$screenshot"
            chomp_info "Uploaded: \`$BASENAME\`"
        done
    else
        echo "No screenshots found to upload."
        chomp_info "No screenshots found to upload"
    fi
else
    echo "No test-results directory found."
    chomp_info "No test-results directory found"
fi

# Post results as comment
echo ""
echo "Posting results comment..."
python3 "$BITE_DIR/jira_api.py" add-comment "$TICKET_KEY" --file "$RESULTS_FILE"
chomp_info "Results comment posted to Jira"

chomp_result "PASS" "Results posted to $(jira_link "$TICKET_KEY")"

echo ""
echo "=== Step 9: DONE ==="
echo "Journey log: $CHOMP_LOG"
