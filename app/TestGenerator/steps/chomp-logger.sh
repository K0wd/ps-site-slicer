#!/bin/bash
# Shared journey logger for all QA steps.
# Source this file in each step script to get logging functions.
#
# Directory structure:
#   TestGenerator/logs/<TICKET_KEY>/        ← ticket-level (stable across runs)
#     story.md
#     1_auth.md
#     2_search.json
#     3_issue.json
#     3_comments.json
#     3_attachments.txt
#     4_commits.txt
#     4_changed_files.txt
#     5_plan.md
#     6_gherkin_scratch/
#     test-runs/                            ← per-run (timestamped)
#       <DDMMMYY_HHMMSS>/
#         7_tc_logs/
#           TC-1_steps.md
#           TC-1_step_1_prompt.md
#           ...
#         7_automation_ready.md
#         8_execution_log.md
#         8_results.md
#         9_prompt.md
#         9_report_log.md
#         9_test_report.md

BITE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CHOMP_POINTER="$BITE_DIR/logs/.current_ticket"
CHOMP_TEST_RUN_POINTER="$BITE_DIR/logs/.current_test_run"
JIRA_BROWSE_URL="https://powerslicesoftware.atlassian.net/browse"

# Helper: wrap a ticket key as a Jira link
jira_link() {
    local key="$1"
    echo "[$key]($JIRA_BROWSE_URL/$key)"
}

# Start a new journey (call from step 1 only).
# Creates a staging area for pre-ticket outputs (1_auth.md).
chomp_start() {
    local staging="$BITE_DIR/logs/.staging"
    mkdir -p "$staging"

    # Clear pointers
    echo "" > "$CHOMP_POINTER"
    echo "" > "$CHOMP_TEST_RUN_POINTER"

    export CHOMP_RUN_DIR="$staging"
    export CHOMP_LOG=""
}

# Resume existing journey (call from steps 2+).
# Restores CHOMP_TICKET_DIR and CHOMP_LOG from the pointer.
chomp_resume() {
    if [ -f "$CHOMP_POINTER" ]; then
        local ticket_key
        ticket_key=$(cat "$CHOMP_POINTER" | tr -d '[:space:]')
        if [ -n "$ticket_key" ]; then
            export CHOMP_TICKET_DIR="$BITE_DIR/logs/$ticket_key"
            export CHOMP_LOG="$CHOMP_TICKET_DIR/story.md"
        fi
    fi

    # Also set staging dir for step 2 (to find 1_auth.md)
    export CHOMP_RUN_DIR="$BITE_DIR/logs/.staging"
}

# Initialize the ticket directory and set CHOMP_LOG.
# Usage: chomp_ticket_dir "SM-1105"
chomp_ticket_dir() {
    local ticket_key="$1"
    export CHOMP_TICKET_DIR="$BITE_DIR/logs/$ticket_key"
    mkdir -p "$CHOMP_TICKET_DIR"

    # Save ticket key as pointer for subsequent steps
    echo "$ticket_key" > "$CHOMP_POINTER"

    # Point story log to ticket dir
    export CHOMP_LOG="$CHOMP_TICKET_DIR/story.md"

    # Create story.md header if it doesn't exist yet
    if [ ! -f "$CHOMP_LOG" ]; then
        cat > "$CHOMP_LOG" << EOF
# Chomp Story — $(date +"%d %b %Y, %I:%M %p")

> Automated QA journey for **$(jira_link "$ticket_key")**

---

EOF
    fi
}

# Create a new timestamped test-run directory (call from step 7).
# Steps 8-11 resume this via chomp_resume_test_run.
chomp_test_run() {
    local timestamp
    timestamp=$(date +"%d%b%y_%H%M%S")
    export CHOMP_TEST_RUN_DIR="$CHOMP_TICKET_DIR/test-runs/$timestamp"
    mkdir -p "$CHOMP_TEST_RUN_DIR"

    # Save pointer so steps 8-11 find this run
    echo "$CHOMP_TEST_RUN_DIR" > "$CHOMP_TEST_RUN_POINTER"
}

# Resume the current test-run directory (call from steps 8-11).
chomp_resume_test_run() {
    if [ -f "$CHOMP_TEST_RUN_POINTER" ]; then
        export CHOMP_TEST_RUN_DIR="$(cat "$CHOMP_TEST_RUN_POINTER" | tr -d '[:space:]')"
    else
        echo "ERROR: No test-run pointer found. Run step 7 first."
        exit 1
    fi

    if [ ! -d "$CHOMP_TEST_RUN_DIR" ]; then
        echo "ERROR: Test-run dir not found: $CHOMP_TEST_RUN_DIR"
        exit 1
    fi
}

# Log a step header
chomp_step() {
    local step_num="$1"
    local step_name="$2"
    # If CHOMP_LOG isn't set yet (step 1 before ticket known), buffer to temp
    if [ -z "$CHOMP_LOG" ]; then
        export CHOMP_PENDING_STEP="$step_num|$step_name|$(date +"%I:%M:%S %p")"
        return
    fi
    cat >> "$CHOMP_LOG" << EOF

## Step $step_num — $step_name
**Time:** $(date +"%I:%M:%S %p")

EOF
}

# Flush any pending step header (call after chomp_ticket_dir in step 1)
chomp_flush_pending() {
    if [ -n "${CHOMP_PENDING_STEP:-}" ]; then
        local num name time
        IFS='|' read -r num name time <<< "$CHOMP_PENDING_STEP"
        cat >> "$CHOMP_LOG" << EOF

## Step $num — $name
**Time:** $time

EOF
        unset CHOMP_PENDING_STEP
    fi
}

# Log an info line
chomp_info() {
    [ -z "$CHOMP_LOG" ] && return
    echo "- $1" >> "$CHOMP_LOG"
}

# Log a result/outcome
chomp_result() {
    [ -z "$CHOMP_LOG" ] && return
    local status="$1"
    local message="$2"
    cat >> "$CHOMP_LOG" << EOF

> **$status** — $message

EOF
}

# Log a code block (for command output)
chomp_code() {
    [ -z "$CHOMP_LOG" ] && return
    local label="$1"
    local content="$2"
    cat >> "$CHOMP_LOG" << EOF

<details>
<summary>$label</summary>

\`\`\`
$content
\`\`\`

</details>

EOF
}

# Log a separator
chomp_separator() {
    [ -z "$CHOMP_LOG" ] && return
    echo "---" >> "$CHOMP_LOG"
}
