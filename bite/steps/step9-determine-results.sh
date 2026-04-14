#!/bin/bash
# Step 9 — Determine Final Result & Generate Test Report
# Reads step 8 results + test plan, generates a structured .md report with:
#   Test Name | Test Steps | Results per Step | Image Proof
# Usage: ./step9-determine-results.sh SM-1096

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
RESULTS_FILE="$TICKET_DIR/8_results.md"
PLAN_FILE="$TICKET_DIR/5_plan.md"
SCREENSHOTS_DIR="$TICKET_DIR/test-results"
REPORT_FILE="$TICKET_DIR/9_test_report.md"

chomp_step "9" "Determine Results"
chomp_info "Ticket: **$(jira_link "$TICKET_KEY")**"

echo "=== Step 9: Determine Results for $TICKET_KEY ==="

if [ ! -f "$RESULTS_FILE" ]; then
    chomp_result "FAIL" "Results file not found. Run step 8 first."
    echo "ERROR: Results file not found at $RESULTS_FILE"
    exit 1
fi

# --- Extract verdict from results ---

VERDICT=$(grep -oE 'RESULT:\s*(PASS|FAIL|NOT TESTED)' "$RESULTS_FILE" | head -1 | sed 's/RESULT:\s*//')

if [ -z "$VERDICT" ]; then
    chomp_result "FAIL" "Could not extract verdict from results file"
    echo "WARNING: Could not extract verdict from results file."
    cat "$RESULTS_FILE"
    exit 1
fi

chomp_info "Verdict extracted: **$VERDICT**"

# --- Collect available screenshots ---

SCREENSHOT_LIST=""
if [ -d "$SCREENSHOTS_DIR" ]; then
    for img in "$SCREENSHOTS_DIR"/*.png "$SCREENSHOTS_DIR"/*.jpg "$SCREENSHOTS_DIR"/*.jpeg; do
        [ -f "$img" ] || continue
        SCREENSHOT_LIST="$SCREENSHOT_LIST
  - $(basename "$img")"
    done
fi

# --- Collect test plan content ---

PLAN_CONTENT=""
if [ -f "$PLAN_FILE" ]; then
    PLAN_CONTENT="$(cat "$PLAN_FILE")"
fi

# --- Generate structured .md report via Claude CLI ---

chomp_info "Generating test report: \`$REPORT_FILE\`"
echo "Launching Claude CLI to generate test report..."

REPORT_PROMPT_FILE="$TICKET_DIR/9_prompt.md"
cat > "$REPORT_PROMPT_FILE" << REPORT_EOF
You are a QA report generator. Create a structured Markdown test report for Jira ticket $TICKET_KEY.

## OUTPUT

Write the report to: $REPORT_FILE

## REPORT FORMAT

The report MUST follow this exact structure:

\`\`\`markdown
# Test Report: $TICKET_KEY
**Date:** $(date +"%Y-%m-%d")
**Tester:** Claude Code + Playwright
**Environment:** ${BASE_URL}
**Overall Result:** <PASS|FAIL|NOT TESTED>

---

## Test Results

| Test Name | Test Steps | Result per Step | Image Proof |
|-----------|-----------|----------------|-------------|
| TC-01: <name> | 1. <step desc><br>2. <step desc><br>3. <step desc> | 1. PASS<br>2. PASS<br>3. FAIL — <reason> | ![TC-01](test-results/<filename>.png) |
| TC-02: <name> | 1. <step desc><br>2. <step desc> | 1. PASS<br>2. PASS | ![TC-02](test-results/<filename>.png) |
| ... | ... | ... | ... |

---

## Summary

- **Total:** <count>
- **Passed:** <count>
- **Failed:** <count>
- **Not Tested:** <count>

### Failed Tests
<list any failed tests with brief reason>

### Notes
<any additional observations>
\`\`\`

## COLUMN RULES

1. **Test Name**: The test case ID and descriptive name (e.g., "TC-01: ID Filter — Table View")
2. **Test Steps**: Numbered list of actual steps executed, use \`<br>\` for line breaks within the cell
3. **Result per Step**: Numbered result for EACH step (PASS / FAIL with reason / SKIP), use \`<br>\` for line breaks. The numbering MUST match the Test Steps column
4. **Image Proof**: Markdown image link to the screenshot. Use relative path from the report file location: \`![TC-XX](test-results/<filename>.png)\`. If no screenshot exists for a test, write "No screenshot"

## INPUT DATA

### Test Plan (from step 5)
$PLAN_CONTENT

### Execution Results (from step 8)
$(cat "$RESULTS_FILE")

### Available Screenshots
Directory: $SCREENSHOTS_DIR
$SCREENSHOT_LIST

### Overall Verdict
$VERDICT

## IMPORTANT RULES

- Every test case from the plan MUST appear in the report table — no omissions
- Match screenshots to test cases by filename (e.g., tc-01.png → TC-01)
- If a test was not executed, mark all its steps as "NOT TESTED"
- Image paths must be relative from the report file: \`test-results/<filename>.png\`
- Use the Write tool to create the report file
- Do NOT create any other files — only the report
REPORT_EOF

claude -p \
    --allowedTools "Read,Write,Glob" \
    -d "$TICKET_DIR" \
    < "$REPORT_PROMPT_FILE" \
    > "$TICKET_DIR/9_report_log.md" 2>&1

echo "Claude CLI finished (report generation)."

# --- Verify report was created ---

if [ -f "$REPORT_FILE" ]; then
    chomp_info "Test report generated: \`$REPORT_FILE\`"
    chomp_result "$VERDICT" "Final result for $(jira_link "$TICKET_KEY") is **$VERDICT** — report at \`9_test_report.md\`"
else
    chomp_info "Report file was not created (check \`9_report_log.md\`)"
    chomp_result "$VERDICT" "Final result for $(jira_link "$TICKET_KEY") is **$VERDICT** (report generation failed)"
fi

echo ""
echo "Verdict: $VERDICT"
echo "Report:  $REPORT_FILE"
echo "Log:     $TICKET_DIR/9_report_log.md"
echo ""
cat "$RESULTS_FILE"
echo ""
echo "=== Step 9: DONE — Result: $VERDICT ==="
echo "Journey log: $CHOMP_LOG"
