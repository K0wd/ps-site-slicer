#!/bin/bash
# Step 7 — Write Automated Tests (per-step implementation within each TC)
#
# For each @TC-X @SM-XXXX tag in the feature file:
#   1. Extracts every Gherkin step line from that scenario
#   2. For each step, checks if a definition already exists
#      - EXISTING → skip, log it
#      - MISSING  → Claude implements that ONE step + XPath selector
#                  → bddgen to verify compile
#                  → BLOCKER if compile fails → stop step 7 entirely
#   3. After all steps implemented, runs playwright test for the TC
#   4. Logs per-step and per-TC results to 7_tc_logs/
#
# All output streams to terminal in realtime AND saves to .md files.
#
# Inputs:  tests/features/<TICKET_KEY>.feature, 5_plan.md
# Outputs: 7_tc_logs/<TC_ID>_*.md, 7_automation_ready.md
#
# Usage: ./step7-write-automated-tests.sh SM-1096

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BITE_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_DIR="$(dirname "$(dirname "$BITE_DIR")")"

# Load .env
set -a
source "$PROJECT_DIR/.env"
set +a

# Load context builder for Claude CLI calls
source "$SCRIPT_DIR/build-context.sh"
STEP7_CONTEXT=$(build_step7_context)
trap cleanup_context EXIT

# Resume journey log
source "$SCRIPT_DIR/chomp-logger.sh"
chomp_resume

TICKET_KEY="${1:?Usage: $0 <TICKET_KEY>}"
chomp_ticket_dir "$TICKET_KEY"
TICKET_DIR="$CHOMP_TICKET_DIR"
PLAN_FILE="$TICKET_DIR/5_plan.md"
TESTS_DIR="$PROJECT_DIR/tests"
FEATURE_FILE="$TESTS_DIR/features/${TICKET_KEY}.feature"

# Create a timestamped test-run directory for this run's outputs
chomp_test_run
RUN_DIR="$CHOMP_TEST_RUN_DIR"
TC_LOGS_DIR="$RUN_DIR/7_tc_logs"
READY_FILE="$RUN_DIR/7_automation_ready.md"

chomp_step "7" "Write Automated Tests"
chomp_info "Ticket: **$(jira_link "$TICKET_KEY")**"
chomp_info "Strategy: per-step implementation within each TC"

echo "=== Step 7: Write Automated Tests for $TICKET_KEY ==="

# --- Validate inputs ---

if [ ! -f "$FEATURE_FILE" ]; then
    chomp_result "FAIL" "Feature file not found at \`$FEATURE_FILE\`. Run step 6 first."
    echo "ERROR: Feature file not found at $FEATURE_FILE"
    exit 1
fi

mkdir -p "$TC_LOGS_DIR"

# ═══════════════════════════════════════════════════════
# Helpers
# ═══════════════════════════════════════════════════════

# Check if a step definition already exists in any .steps.ts file.
# Replaces "quoted strings" with .* for fuzzy matching.
step_def_exists() {
    local step_text="$1"
    # Strip leading keyword (Given/When/Then/And/But) to get raw text
    local raw_text
    raw_text=$(echo "$step_text" | sed 's/^\s*\(Given\|When\|Then\|And\|But\)\s\+//')
    # Replace "quoted strings" with .* for grep
    local pattern
    pattern=$(echo "$raw_text" | sed 's/"[^"]*"/.*/g' | sed 's/[()]/\\&/g')
    grep -rq "$pattern" "$TESTS_DIR/steps/" --include="*.steps.ts" 2>/dev/null
}

# Extract a single TC's scenario block from the feature file.
extract_tc_scenario() {
    local tc_id="$1"
    awk "
        /^  @${tc_id} @${TICKET_KEY}/ { p=1 }
        p && /^  @(SC|TC|EC)-[0-9]+/ && !/^  @${tc_id} @/ { p=0 }
        p
    " "$FEATURE_FILE"
}

# Extract Gherkin step lines from a scenario block (Given/When/Then/And/But).
extract_step_lines() {
    echo "$1" | grep -E '^\s+(Given|When|Then|And|But) ' | sed 's/^\s*//'
}

# Resolve And/But to the actual keyword (Given/When/Then).
resolve_keyword() {
    local keyword="$1"
    local last_real="$2"
    case "$keyword" in
        And|But) echo "$last_real" ;;
        *)       echo "$keyword" ;;
    esac
}

# Blocker detection — build/compile errors mean the codebase is broken.
is_blocker() {
    local output_file="$1"
    grep -qi "error.*bddgen\|bddgen.*error\|Cannot find module\|SyntaxError\|TypeError.*compile" "$output_file" 2>/dev/null && return 0
    grep -qi "error TS[0-9]\|Cannot find name\|has no exported member\|is not assignable" "$output_file" 2>/dev/null && return 0
    grep -qi "Missing step definition\|Undefined step\|does not match any" "$output_file" 2>/dev/null && return 0
    return 1
}

# Write blocker error and exit step 7 entirely.
write_blocker_and_exit() {
    local tc_id="$1"
    local step_num="$2"
    local step_text="$3"
    local error_file="$4"
    local error_output
    error_output=$(tail -40 "$error_file")

    echo ""
    echo "  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
    echo "  BLOCKER on $tc_id step $step_num"
    echo "  Step: $step_text"
    echo "  Step 7 stopped. Fix the build before re-running."
    echo "  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
    echo ""

    chomp_info "**BLOCKER** on $tc_id step $step_num: \`$step_text\`"
    chomp_code "Blocker error" "$error_output"
    chomp_result "FAIL" "BLOCKER on $tc_id step $step_num — step 7 stopped"

    SUMMARY_TC_IDS+=("$tc_id")
    SUMMARY_STATUSES+=("BLOCKER")
    SUMMARY_STEPS_TOTAL+=("?")
    SUMMARY_STEPS_EXISTING+=("?")
    SUMMARY_STEPS_ADDED+=("?")
    SUMMARY_TEST_RESULTS+=("—")
    SUMMARY_NOTES+=("Blocker at step $step_num: $step_text")

    write_summary_report
    exit 1
}

# Write the final summary report.
write_summary_report() {
    cat > "$READY_FILE" << SUMMARY_HEADER_EOF
# Automation Ready — $TICKET_KEY

**Date:** $(date +"%Y-%m-%d %H:%M")
**Feature:** \`tests/features/${TICKET_KEY}.feature\`
**Strategy:** per-step implementation

## Test Case Results

| TC | Status | Steps (total) | Existing | Added | Test Run | Notes |
|----|--------|:---:|:---:|:---:|--------|-------|
SUMMARY_HEADER_EOF

    for i in "${!SUMMARY_TC_IDS[@]}"; do
        printf "| %s | %s | %s | %s | %s | %s | %s |\n" \
            "${SUMMARY_TC_IDS[$i]}" \
            "${SUMMARY_STATUSES[$i]}" \
            "${SUMMARY_STEPS_TOTAL[$i]}" \
            "${SUMMARY_STEPS_EXISTING[$i]}" \
            "${SUMMARY_STEPS_ADDED[$i]}" \
            "${SUMMARY_TEST_RESULTS[$i]}" \
            "${SUMMARY_NOTES[$i]}" >> "$READY_FILE"

        printf "  %-8s %-8s  steps: %s (existing: %s, added: %s)  test: %s  %s\n" \
            "${SUMMARY_TC_IDS[$i]}" \
            "${SUMMARY_STATUSES[$i]}" \
            "${SUMMARY_STEPS_TOTAL[$i]}" \
            "${SUMMARY_STEPS_EXISTING[$i]}" \
            "${SUMMARY_STEPS_ADDED[$i]}" \
            "${SUMMARY_TEST_RESULTS[$i]}" \
            "${SUMMARY_NOTES[$i]}"
    done

    cat >> "$READY_FILE" << SUMMARY_FOOTER_EOF

## Summary

- **Total TCs:** $TC_COUNT
- **Passed:** $PASS_COUNT
- **Failed:** $FAIL_COUNT

## Evidence

Per-TC and per-step logs are in \`$TC_LOGS_DIR/\`:
- \`<TC>_steps.md\` — per-step implementation log (EXISTING / ADDED / BLOCKER)
- \`<TC>_step_<N>_prompt.md\` — Claude prompt for step N
- \`<TC>_step_<N>_log.md\` — Claude output for step N
- \`<TC>_step_<N>_bddgen.md\` — bddgen output after step N
- \`<TC>_test_output.md\` — playwright test output
- \`<TC>_result.md\` — per-TC result summary
SUMMARY_FOOTER_EOF
}

# ═══════════════════════════════════════════════════════
# Extract TCs from feature file
# ═══════════════════════════════════════════════════════

TAG_PAIRS=$(grep -oE '@(SC|TC|EC)-[0-9]+ @'"$TICKET_KEY" "$FEATURE_FILE")

if [ -z "$TAG_PAIRS" ]; then
    chomp_result "FAIL" "No @TC-X/@EC-X tags found in \`$FEATURE_FILE\`"
    echo "ERROR: No test case tags found in $FEATURE_FILE"
    exit 1
fi

TC_COUNT=$(echo "$TAG_PAIRS" | wc -l | tr -d ' ')
chomp_info "Found **$TC_COUNT** test case(s)"
echo "Found $TC_COUNT test cases:"
echo "$TAG_PAIRS"
echo ""

# Collect existing test files
EXISTING_STEPS_FILES=""
for f in "$TESTS_DIR/steps"/*.steps.ts; do
    [ -f "$f" ] || continue
    EXISTING_STEPS_FILES="$EXISTING_STEPS_FILES
- $f"
done

EXISTING_PROPERTIES_FILES=""
for f in "$TESTS_DIR/properties"/*.properties.ts; do
    [ -f "$f" ] || continue
    EXISTING_PROPERTIES_FILES="$EXISTING_PROPERTIES_FILES
- $f"
done

PLAYWRIGHT_CONFIG=""
for cfg in "$PROJECT_DIR/playwright.config.ts" "$PROJECT_DIR/playwright.config.js"; do
    [ -f "$cfg" ] && PLAYWRIGHT_CONFIG="$cfg" && break
done

# ═══════════════════════════════════════════════════════
# Main loop: per-TC, per-step
# ═══════════════════════════════════════════════════════

PASS_COUNT=0
FAIL_COUNT=0

SUMMARY_TC_IDS=()
SUMMARY_STATUSES=()
SUMMARY_STEPS_TOTAL=()
SUMMARY_STEPS_EXISTING=()
SUMMARY_STEPS_ADDED=()
SUMMARY_TEST_RESULTS=()
SUMMARY_NOTES=()

while IFS= read -r TAG_PAIR; do
    TC_ID=$(echo "$TAG_PAIR" | grep -oE '(SC|TC|EC)-[0-9]+')
    TC_LOG_PREFIX="$TC_LOGS_DIR/${TC_ID}"
    TC_SCENARIO=$(extract_tc_scenario "$TC_ID")
    STEP_LINES=$(extract_step_lines "$TC_SCENARIO")

    TOTAL_STEPS=$(echo "$STEP_LINES" | wc -l | tr -d ' ')

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  $TC_ID — $TOTAL_STEPS steps to process"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    chomp_info ""
    chomp_info "### $TC_ID ($TOTAL_STEPS steps)"

    # Per-step implementation log for this TC
    STEPS_LOG="${TC_LOG_PREFIX}_steps.md"
    cat > "$STEPS_LOG" << STEPS_HEADER_EOF
# $TC_ID — Step Implementation Log

**Ticket:** $TICKET_KEY
**Date:** $(date +"%Y-%m-%d %H:%M")

| # | Keyword | Step Text | Status |
|---|---------|-----------|--------|
STEPS_HEADER_EOF

    STEP_NUM=0
    EXISTING_COUNT=0
    ADDED_COUNT=0
    LAST_REAL_KEYWORD="Given"
    TC_BLOCKER=false

    while IFS= read -r STEP_LINE; do
        STEP_NUM=$((STEP_NUM + 1))

        # Parse keyword and text
        KEYWORD=$(echo "$STEP_LINE" | awk '{print $1}')
        STEP_TEXT=$(echo "$STEP_LINE" | sed 's/^\S*\s*//')
        REAL_KEYWORD=$(resolve_keyword "$KEYWORD" "$LAST_REAL_KEYWORD")
        case "$KEYWORD" in
            Given|When|Then) LAST_REAL_KEYWORD="$KEYWORD" ;;
        esac

        echo ""
        echo "  [$TC_ID] Step $STEP_NUM/$TOTAL_STEPS: $KEYWORD $STEP_TEXT"

        # --- Check if step definition already exists ---

        if step_def_exists "$STEP_LINE"; then
            echo "  → EXISTING (already defined)"
            chomp_info "Step $STEP_NUM: \`$KEYWORD $STEP_TEXT\` — **EXISTING**"
            printf "| %s | %s | %s | EXISTING |\n" "$STEP_NUM" "$KEYWORD" "$STEP_TEXT" >> "$STEPS_LOG"
            EXISTING_COUNT=$((EXISTING_COUNT + 1))
            continue
        fi

        echo "  → MISSING — implementing..."
        chomp_info "Step $STEP_NUM: \`$KEYWORD $STEP_TEXT\` — implementing..."

        # --- Build prompt for this ONE step ---

        STEP_PROMPT="${TC_LOG_PREFIX}_step_${STEP_NUM}_prompt.md"
        STEP_LOG="${TC_LOG_PREFIX}_step_${STEP_NUM}_log.md"

        cat > "$STEP_PROMPT" << STEP_PROMPT_EOF
You are a senior test automation engineer. Implement exactly ONE Playwright-BDD step definition.

## STEP TO IMPLEMENT

Keyword: **$REAL_KEYWORD**
Full Gherkin line: \`$KEYWORD $STEP_TEXT\`

This step is part of the following scenario (for context only — implement ONLY the step above):

\`\`\`gherkin
$TC_SCENARIO
\`\`\`

## EXISTING FILES

Step definition files (READ these first to avoid duplicates):
$EXISTING_STEPS_FILES

Properties files (XPath selectors):
$EXISTING_PROPERTIES_FILES

Feature file: $FEATURE_FILE
Ticket context: $TICKET_DIR/3_issue.json

## YOUR TASK

1. **READ** the existing step definition files
2. **CONFIRM** this exact step text is not already defined (it may exist with different wording)
3. **ADD** the step definition to the appropriate .steps.ts file using this pattern:
   \`\`\`typescript
   ${REAL_KEYWORD}('$STEP_TEXT', async ({ page }) => {
     // implementation
   });
   \`\`\`
4. **ADD** any missing XPath selectors to the appropriate .properties.ts file
5. **DO NOT** create new files if an appropriate one exists
6. **DO NOT** modify the feature file
7. **DO NOT** redefine existing steps

## RULES

- XPath ONLY — no CSS selectors
- Use \`page.locator(\\\`xpath=\\\${SELECTOR}\\\`)\` pattern
- Deterministic waits: waitForURL, waitForLoadState('networkidle'), toBeVisible
- Test URL: ${BASE_URL}spa
- Keep it KISS — implement this one step, nothing more
STEP_PROMPT_EOF

        # --- Call Claude (realtime) ---

        echo ""
        claude -p \
            --allowedTools "Bash,Read,Write,Edit,Grep,Glob" \
            --append-system-prompt-file "$STEP7_CONTEXT" \
            -d "$PROJECT_DIR" \
            < "$STEP_PROMPT" \
            2>&1 | tee "$STEP_LOG"

        # --- Run bddgen to verify compile ---

        echo ""
        echo "  [$TC_ID] Verifying compile (bddgen)..."
        BDDGEN_FILE="${TC_LOG_PREFIX}_step_${STEP_NUM}_bddgen.md"

        BDDGEN_EXIT=0
        (cd "$PROJECT_DIR" && npx bddgen 2>&1) | tee "$BDDGEN_FILE" || BDDGEN_EXIT=$?

        if [ "$BDDGEN_EXIT" -ne 0 ] || is_blocker "$BDDGEN_FILE"; then
            echo "  → BLOCKER — bddgen failed after implementing this step"
            printf "| %s | %s | %s | **BLOCKER** |\n" "$STEP_NUM" "$KEYWORD" "$STEP_TEXT" >> "$STEPS_LOG"
            write_blocker_and_exit "$TC_ID" "$STEP_NUM" "$KEYWORD $STEP_TEXT" "$BDDGEN_FILE"
        fi

        echo "  → ADDED (compile OK)"
        chomp_info "Step $STEP_NUM: \`$KEYWORD $STEP_TEXT\` — **ADDED**"
        printf "| %s | %s | %s | ADDED |\n" "$STEP_NUM" "$KEYWORD" "$STEP_TEXT" >> "$STEPS_LOG"
        ADDED_COUNT=$((ADDED_COUNT + 1))

    done <<< "$STEP_LINES"

    # --- All steps implemented — run the TC test ---

    echo ""
    echo "  [$TC_ID] All $TOTAL_STEPS steps processed (existing: $EXISTING_COUNT, added: $ADDED_COUNT)"
    echo "  [$TC_ID] Running playwright test..."
    echo ""

    TEST_OUTPUT_FILE="${TC_LOG_PREFIX}_test_output.md"

    (cd "$PROJECT_DIR" && npx playwright test --grep "${TC_ID}\\b" --project=chromium 2>&1) \
        | tee "$TEST_OUTPUT_FILE" || true

    # Check for blocker in test output
    if is_blocker "$TEST_OUTPUT_FILE"; then
        echo ""
        echo "  → BLOCKER — build/compile error in test run"
        write_blocker_and_exit "$TC_ID" "test" "playwright test" "$TEST_OUTPUT_FILE"
    fi

    # Determine pass/fail
    TC_STATUS="FAIL"
    TC_TEST_RESULT="FAIL"
    TC_NOTE=""

    if grep -q "passed" "$TEST_OUTPUT_FILE" && ! grep -q "failed" "$TEST_OUTPUT_FILE"; then
        TC_STATUS="PASS"
        TC_TEST_RESULT="PASS"
        TC_NOTE="$EXISTING_COUNT existing, $ADDED_COUNT added"
        echo ""
        echo "  [PASS] $TC_ID"
        chomp_info "Test run: **PASS**"
        PASS_COUNT=$((PASS_COUNT + 1))
    else
        TC_NOTE="Test failed — $EXISTING_COUNT existing, $ADDED_COUNT added"
        LAST_ERROR=$(tail -40 "$TEST_OUTPUT_FILE")
        echo ""
        echo "  [FAIL] $TC_ID — runtime failure"
        echo ""
        echo "  Last error:"
        echo "  ─────────────────────────────────────────"
        echo "$LAST_ERROR" | sed 's/^/  /'
        echo "  ─────────────────────────────────────────"
        chomp_info "Test run: **FAIL**"
        chomp_code "Last error ($TC_ID)" "$LAST_ERROR"
        FAIL_COUNT=$((FAIL_COUNT + 1))
    fi

    # Record for summary
    SUMMARY_TC_IDS+=("$TC_ID")
    SUMMARY_STATUSES+=("$TC_STATUS")
    SUMMARY_STEPS_TOTAL+=("$TOTAL_STEPS")
    SUMMARY_STEPS_EXISTING+=("$EXISTING_COUNT")
    SUMMARY_STEPS_ADDED+=("$ADDED_COUNT")
    SUMMARY_TEST_RESULTS+=("$TC_TEST_RESULT")
    SUMMARY_NOTES+=("$TC_NOTE")

    # Write per-TC result file
    cat > "${TC_LOG_PREFIX}_result.md" << TC_RESULT_EOF
# $TC_ID — $TC_STATUS

**Ticket:** $TICKET_KEY
**Date:** $(date +"%Y-%m-%d %H:%M")
**Steps:** $TOTAL_STEPS total ($EXISTING_COUNT existing, $ADDED_COUNT added)
**Test run:** $TC_TEST_RESULT

## Scenario

\`\`\`gherkin
$TC_SCENARIO
\`\`\`

## Step Implementation

See \`${TC_ID}_steps.md\` for the per-step breakdown.

## Evidence

- Per-step log: \`${TC_ID}_steps.md\`
- Test output: \`${TC_ID}_test_output.md\`
- Step prompts: \`${TC_ID}_step_<N>_prompt.md\`
- Step logs: \`${TC_ID}_step_<N>_log.md\`
- bddgen checks: \`${TC_ID}_step_<N>_bddgen.md\`
TC_RESULT_EOF

done <<< "$TAG_PAIRS"

# ═══════════════════════════════════════════════════════
# Summary report
# ═══════════════════════════════════════════════════════

echo ""
echo "═══════════════════════════════════════════"
echo "  Step 7 Summary — $TICKET_KEY"
echo "═══════════════════════════════════════════"

write_summary_report

echo ""
echo "  Passed: $PASS_COUNT / $TC_COUNT"
echo "  Failed: $FAIL_COUNT / $TC_COUNT"
echo ""

chomp_info ""
chomp_info "### Summary"
chomp_info "**$PASS_COUNT** passed, **$FAIL_COUNT** failed out of **$TC_COUNT** test cases"
chomp_code "Automation summary" "$(cat "$READY_FILE")"

if [ "$FAIL_COUNT" -eq 0 ]; then
    chomp_result "PASS" "All $TC_COUNT test cases implemented and passing for $(jira_link "$TICKET_KEY")"
else
    chomp_result "WARN" "$PASS_COUNT/$TC_COUNT passing, $FAIL_COUNT failed for $(jira_link "$TICKET_KEY")"
fi

echo "Report:  $READY_FILE"
echo "TC logs: $TC_LOGS_DIR/"
echo ""
echo "=== Step 7: DONE ==="
echo "Journey log: $CHOMP_LOG"
