#!/bin/bash
# Step 1 — Verify Jira Auth
# Usage: ./step1-verify-auth.sh

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BITE_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_DIR="$(dirname "$BITE_DIR")"

# Load .env
set -a
source "$PROJECT_DIR/.env"
set +a

# Start a new journey log
source "$SCRIPT_DIR/chomp-logger.sh"
chomp_start

echo "=== Step 1: Verify Jira Auth ==="

OUTPUT=$(python3 "$BITE_DIR/jira_api.py" test 2>&1)
EXIT_CODE=$?

echo "$OUTPUT"

if [ $EXIT_CODE -ne 0 ]; then
    echo "Jira auth failed. Exiting."
    exit 1
fi

# Save auth output to run dir (no ticket dir yet)
echo "$OUTPUT" > "$CHOMP_RUN_DIR/1_auth.txt"

echo "=== Step 1: DONE ==="
echo "Run dir: $CHOMP_RUN_DIR"
