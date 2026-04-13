#!/bin/bash
# Shared journey logger for all QA steps.
# Source this file in each step script to get logging functions.
#
# Directory structure:
#   bite/logs/<dd-MMM-yy>/<HH:MM-AM/PM>/
#     <TICKET_KEY>/
#       story.md
#       1_auth.txt
#       2_search.json
#       3_issue.json
#       3_comments.json
#       3_attachments.txt
#       4_commits.txt
#       4_changed_files.txt
#       5_plan.md
#       6_prompt.txt
#       6_generation_log.txt
#       7_execution_log.txt
#       7_results.txt
#       test-results/

BITE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CHOMP_POINTER="$BITE_DIR/logs/.current_chomp"
JIRA_BROWSE_URL="https://powerslicesoftware.atlassian.net/browse"

# Helper: wrap a ticket key as a Jira link
jira_link() {
    local key="$1"
    echo "[$key]($JIRA_BROWSE_URL/$key)"
}

# Start a new journey (call from step 1 only)
# The story.md is created once the ticket is known (in chomp_init_story)
chomp_start() {
    local date_dir timestamp run_dir
    date_dir=$(date +"%d-%b-%y")
    timestamp=$(date +"%I:%M-%p")
    run_dir="$BITE_DIR/logs/$date_dir/$timestamp"

    mkdir -p "$run_dir"

    # Save pointer so subsequent steps find this run
    echo "$run_dir" > "$CHOMP_POINTER"
    export CHOMP_RUN_DIR="$run_dir"
    export CHOMP_LOG=""
}

# Resume existing journey (call from steps 2+)
chomp_resume() {
    if [ -f "$CHOMP_POINTER" ]; then
        export CHOMP_RUN_DIR="$(cat "$CHOMP_POINTER")"
        export CHOMP_LOG=""
    else
        chomp_start
    fi
}

# Initialize the ticket directory for this run and set CHOMP_LOG.
# IMPORTANT: Do NOT call via $() — it must run in the current shell to export vars.
# Usage: chomp_ticket_dir "SM-754"
#        Then use $CHOMP_TICKET_DIR for the path.
chomp_ticket_dir() {
    local ticket_key="$1"
    export CHOMP_TICKET_DIR="$CHOMP_RUN_DIR/$ticket_key"
    mkdir -p "$CHOMP_TICKET_DIR"

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
