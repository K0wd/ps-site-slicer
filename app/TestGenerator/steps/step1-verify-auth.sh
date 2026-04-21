#!/bin/bash
# Step 1 — Verify Jira Auth
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BITE_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_DIR="$(dirname "$(dirname "$BITE_DIR")")"

set -a; source "$PROJECT_DIR/.env"; set +a
source "$SCRIPT_DIR/chomp-logger.sh"
chomp_start

OUTPUT=$(python3 "$BITE_DIR/jira_api.py" test 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
    echo "  FAIL — Jira auth failed"
    exit 1
fi

# Extract display name
DISPLAY_NAME=$(echo "$OUTPUT" | sed -n 's/.*Display name: //p' | head -1)
[ -z "$DISPLAY_NAME" ] && DISPLAY_NAME="unknown"

{
    echo "# Jira Auth — Step 1"
    echo "**Date:** $(date +"%Y-%m-%d %H:%M:%S")"
    echo '```'
    echo "$OUTPUT"
    echo '```'
} > "$CHOMP_RUN_DIR/1_auth.md"

echo "  OK — Authenticated as $DISPLAY_NAME"
