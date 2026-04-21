#!/bin/bash
# Step 6 — Write Gherkin Steps from the Test Plan
#
# Parses TC-XX/EC-XX headings from 5_plan.md, then launches one `claude -p` call
# per test case IN PARALLEL to generate individual .gherkin Scenario blocks.
# Scratch files go to 6_gherkin_scratch/. After all PIDs finish, compiles them
# in natural order (TC-01…TC-NN, EC-01…EC-NN) into tests/features/<page>.feature.
# Appends to existing feature files; failed TCs get a TODO placeholder.
# Runs `npx bddgen` at the end to regenerate .features-gen/.
#
# Inputs:  5_plan.md, existing features/steps/properties (for reuse awareness)
# Outputs: tests/features/<page>.feature, 6_gherkin_scratch/*, bddgen regeneration
#
# Usage: ./step6-write-gherkin-steps.sh SM-1096

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
STEP6_CONTEXT=$(build_step6_context)
trap cleanup_context EXIT

# Resume journey log
source "$SCRIPT_DIR/chomp-logger.sh"
chomp_resume

TICKET_KEY="${1:?Usage: $0 <TICKET_KEY>}"
chomp_ticket_dir "$TICKET_KEY"
TICKET_DIR="$CHOMP_TICKET_DIR"
PLAN_FILE="$TICKET_DIR/5_plan.md"
TESTS_DIR="$PROJECT_DIR/tests"
RULES_DIR="$PROJECT_DIR/.claude/test-automation-expert/rules"
SCRATCH_DIR="$TICKET_DIR/6_gherkin_scratch"

chomp_step "6" "Write Gherkin Steps"
chomp_info "Ticket: **$(jira_link "$TICKET_KEY")**"

echo "=== Step 6: Write Gherkin Steps for $TICKET_KEY ==="

if [ ! -f "$PLAN_FILE" ]; then
    chomp_result "FAIL" "Test plan not found at \`$PLAN_FILE\`. Run step 5 first."
    echo "ERROR: Test plan not found at $PLAN_FILE"
    exit 1
fi

mkdir -p "$SCRATCH_DIR"

# -----------------------------------------------------------------------
# Build shared context (small — rules summary only, no inlining of files)
# -----------------------------------------------------------------------

RULES_SUMMARY=""
if [ -f "$RULES_DIR/effective-rules-summary.mdc" ]; then
    RULES_SUMMARY=$(cat "$RULES_DIR/effective-rules-summary.mdc")
fi

# Existing step signatures — lightweight grep, not full file content
EXISTING_STEP_SIGS=$(grep -rh "Given\|When\|Then" "$TESTS_DIR/steps/" \
    --include="*.steps.ts" 2>/dev/null \
    | grep -oE "(Given|When|Then)\(['\`].*['\`]" \
    | sort -u \
    | head -80 \
    || echo "(none found)")

# Existing feature names — for reuse awareness
EXISTING_FEATURES=$(ls "$TESTS_DIR/features/" 2>/dev/null | tr '\n' ', ' || echo "(none)")

# Existing properties files — for reuse awareness
EXISTING_PROPERTIES=$(ls "$TESTS_DIR/properties/" 2>/dev/null | tr '\n' ', ' || echo "(none)")

# Extract the page/feature name from the plan title (first H1 line)
PLAN_TITLE=$(grep -m1 '^# ' "$PLAN_FILE" | sed 's/^# //')
FEATURE_DESCRIPTION="${PLAN_TITLE:-$TICKET_KEY}"

# -----------------------------------------------------------------------
# Parse test case IDs from plan (SC-XX, TC-XX, EC-XX)
# -----------------------------------------------------------------------

TC_IDS=$(grep -oE '^### (SC|TC|EC)-[0-9]+' "$PLAN_FILE" | sed 's/### //' || true)

if [ -z "$TC_IDS" ]; then
    chomp_result "FAIL" "No scenarios (SC-XX / TC-XX / EC-XX) found in plan"
    echo "ERROR: Could not extract scenarios from $PLAN_FILE"
    exit 1
fi

TC_COUNT=$(echo "$TC_IDS" | wc -l | tr -d ' ')
chomp_info "Found **$TC_COUNT** test cases in plan"
echo "Found $TC_COUNT test cases: $(echo "$TC_IDS" | tr '\n' ' ')"

# -----------------------------------------------------------------------
# Extract each test case's section from the plan into a scratch file
# -----------------------------------------------------------------------

extract_tc_section() {
    local tc_id="$1"
    local out_file="$2"

    # Extract from "### SC/TC/EC-XX" heading to the next "###" heading or end of section
    awk "/^### ${tc_id}[^0-9]/,/^### (SC|TC|EC)-[0-9]+[^0-9]|^## /" "$PLAN_FILE" \
        | head -60 \
        > "$out_file"

    # If empty (awk didn't match), try simpler pattern
    if [ ! -s "$out_file" ]; then
        grep -A 40 "^### ${tc_id}" "$PLAN_FILE" \
            | awk 'NR>1 && /^###/ {exit} {print}' \
            >> "$out_file" || true
    fi
}

# -----------------------------------------------------------------------
# Launch one Claude CLI call per test case — in parallel
# -----------------------------------------------------------------------

declare -a PIDS=()
declare -a TC_LIST=()

for TC_ID in $TC_IDS; do
    TC_SECTION_FILE="$SCRATCH_DIR/${TC_ID}_section.md"
    TC_OUTPUT_FILE="$SCRATCH_DIR/${TC_ID}.gherkin"
    TC_LOG_FILE="$SCRATCH_DIR/${TC_ID}_log.md"
    TC_PROMPT_FILE="$SCRATCH_DIR/${TC_ID}_prompt.md"

    extract_tc_section "$TC_ID" "$TC_SECTION_FILE"

    TC_SECTION_CONTENT=$(cat "$TC_SECTION_FILE")

    # Build a minimal, focused prompt for this single test case
    cat > "$TC_PROMPT_FILE" << TC_PROMPT_EOF
You are a Gherkin test writer. Write exactly ONE Gherkin Scenario (or Scenario Outline) for the test case below.

## TEST CASE

$TC_SECTION_CONTENT

## OUTPUT

Write ONLY the Scenario block (no Feature header, no imports, no code) to: $TC_OUTPUT_FILE

Format:
\`\`\`
  @${TC_ID} @${TICKET_KEY}
  Scenario: <descriptive name from the test case>
    Given <precondition>
    When <action>
    Then <expected result>
    ...
\`\`\`

## CANONICAL PATTERN — follow this exactly

This is how a feature file is structured. Every Gherkin line you write MUST have
a corresponding step definition that already exists or follows this same shape.

### Feature file structure (reference)
\`\`\`gherkin
Feature: <Ticket Key> — <description>

  Background:
    Given I am on the login page
    When I enter my username
    And I click the next button
    And I enter my password
    And I click the "Let's go" button
    Then I should see the Safe Day's Alert modal
    When I dismiss the Safe Day's Alert
    Then I should be on the dashboard

  @TC-01 @<Ticket-Key>
  Scenario: <descriptive name>
    When <first action after login>
    Then <expected result>
\`\`\`

The Background block runs before EVERY scenario — it handles login and landing
on the dashboard. Individual scenarios MUST NOT repeat any login steps.
Each scenario starts from the dashboard and adds only the steps unique to that test case.

### tests/steps/login.steps.ts (the matching step definitions — do NOT modify)
Each Background line maps 1:1 to a step definition like:
  Given('I am on the login page', async ({ page }) => { await page.goto('/'); ... })
  When('I enter my username', async ({ page }) => { await page.locator(\`xpath=\${USERNAME_INPUT_XPATH}\`).fill(...) })
  Then('I should be on the dashboard', async ({ page }) => { await expect(page).toHaveURL(...) })

This is the pattern: business-readable Gherkin → XPath-based Playwright step.

## REUSE — IMPORTANT

Before writing any step, check if it already exists. Use these exact phrasings when they match:

Existing feature files (READ before writing): $TESTS_DIR/features/
  Files: $EXISTING_FEATURES

Existing step phrasings already defined (copy exactly if semantics match):
$EXISTING_STEP_SIGS

Existing properties files (XPath selectors already defined):
  $EXISTING_PROPERTIES

## CONVENTIONS

$RULES_SUMMARY

## STRICT RULES

- Output ONLY the Scenario block — no Feature header, no Background, no \`\`\` fences, no explanation
- Do NOT include login steps — Background handles login; each scenario starts from the dashboard
- Reuse existing Given/When/Then phrasings exactly when the semantics match
- Business-readable Gherkin only — no XPath, no code in Gherkin
- Indent with 2 spaces inside the Scenario block
- Tag with @${TC_ID} @${TICKET_KEY} above the Scenario line (both tags on the same line)
- Use the Write tool to write the output file
TC_PROMPT_EOF

    TC_TOKEN_FILE="$SCRATCH_DIR/${TC_ID}_tokens.txt"

    # Launch in background
    (
        CLAUDE_JSON=$(claude -p \
            --allowedTools "Read,Write,Glob" \
            --append-system-prompt-file "$STEP6_CONTEXT" \
            --output-format json \
            -d "$PROJECT_DIR" \
            < "$TC_PROMPT_FILE" 2>&1) || true
        echo "$CLAUDE_JSON" > "$TC_LOG_FILE"
        echo "$CLAUDE_JSON" | python3 -c "
import json,sys
try:
    d=json.load(sys.stdin)
    u=d.get('usage',{})
    print(u.get('input_tokens',0) + u.get('cache_read_input_tokens',0) + u.get('output_tokens',0))
except:
    print('0')
" > "$TC_TOKEN_FILE" 2>/dev/null
    ) &

    PIDS+=($!)
    TC_LIST+=("$TC_ID")
    echo "  Launched: $TC_ID (PID $!)"
done

echo ""
echo "All $TC_COUNT claude processes launched in parallel. Waiting..."
echo ""

# -----------------------------------------------------------------------
# Wait for all processes, track pass/fail per TC
# -----------------------------------------------------------------------

PASS_COUNT=0
FAIL_COUNT=0
FAILED_TCS=""

for i in "${!PIDS[@]}"; do
    PID="${PIDS[$i]}"
    TC_ID="${TC_LIST[$i]}"
    TC_OUTPUT_FILE="$SCRATCH_DIR/${TC_ID}.gherkin"

    if wait "$PID" 2>/dev/null; then
        if [ -s "$TC_OUTPUT_FILE" ]; then
            echo "  [OK]   $TC_ID"
            PASS_COUNT=$((PASS_COUNT + 1))
        else
            echo "  [WARN] $TC_ID — process exited OK but output file is empty"
            FAIL_COUNT=$((FAIL_COUNT + 1))
            FAILED_TCS="$FAILED_TCS $TC_ID"
        fi
    else
        echo "  [FAIL] $TC_ID — claude process failed (check $SCRATCH_DIR/${TC_ID}_log.md)"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        FAILED_TCS="$FAILED_TCS $TC_ID"
    fi
done

echo ""
echo "Results: $PASS_COUNT OK, $FAIL_COUNT failed"
[ -n "$FAILED_TCS" ] && echo "Failed:$FAILED_TCS"
echo ""

# Aggregate token usage from all parallel calls
STEP6_TOTAL_TOKENS=0
for TC_ID in $TC_IDS; do
    TC_TOKEN_FILE="$SCRATCH_DIR/${TC_ID}_tokens.txt"
    if [ -s "$TC_TOKEN_FILE" ]; then
        TC_TOKENS=$(cat "$TC_TOKEN_FILE" | tr -d '[:space:]')
        STEP6_TOTAL_TOKENS=$((STEP6_TOTAL_TOKENS + TC_TOKENS))
    fi
done

if [ -n "${BITE_TOKEN_FILE:-}" ]; then
    echo "$STEP6_TOTAL_TOKENS" > "$BITE_TOKEN_FILE"
fi

chomp_info "Parallel generation: **$PASS_COUNT** OK, **$FAIL_COUNT** failed (**$STEP6_TOTAL_TOKENS** tokens)"
[ -n "$FAILED_TCS" ] && chomp_info "Failed TCs:$FAILED_TCS"

# -----------------------------------------------------------------------
# Compile — merge all Scenario blocks in chronological order
# -----------------------------------------------------------------------

echo "=== Compiling Gherkin scenarios in order ==="

FEATURE_FILE="$TESTS_DIR/features/${TICKET_KEY}.feature"

# Check if a feature file for this page already exists — append rather than overwrite
EXISTING_CONTENT=""
if [ -f "$FEATURE_FILE" ]; then
    EXISTING_CONTENT=$(cat "$FEATURE_FILE")
    echo "  Existing feature file found: $FEATURE_FILE — will merge"
    chomp_info "Merging into existing: \`tests/features/$(basename "$FEATURE_FILE")\`"
else
    echo "  Creating new feature file: $FEATURE_FILE"
    chomp_info "Creating: \`tests/features/$(basename "$FEATURE_FILE")\`"
fi

# Sort IDs in natural order (SC-01 … SC-NN, TC-01 … TC-NN, then EC-01 … EC-NN)
SORTED_TC_IDS=$(echo "$TC_IDS" \
    | grep '^SC-' | sort -t'-' -k2 -n; \
  echo "$TC_IDS" \
    | grep '^TC-' | sort -t'-' -k2 -n; \
  echo "$TC_IDS" \
    | grep '^EC-' | sort -t'-' -k2 -n)

# Build compiled feature content
COMPILED_SCENARIOS=""
for TC_ID in $SORTED_TC_IDS; do
    TC_OUTPUT_FILE="$SCRATCH_DIR/${TC_ID}.gherkin"
    if [ -s "$TC_OUTPUT_FILE" ]; then
        COMPILED_SCENARIOS="$COMPILED_SCENARIOS
$(cat "$TC_OUTPUT_FILE")
"
    else
        # Placeholder for failed TCs so order is preserved
        COMPILED_SCENARIOS="$COMPILED_SCENARIOS
  @${TC_ID} @${TICKET_KEY}
  Scenario: ${TC_ID} — TODO (generation failed, check $SCRATCH_DIR/${TC_ID}_log.md)
    Given TODO

"
    fi
done

# Write the final feature file
if [ -z "$EXISTING_CONTENT" ]; then
    # New file — write full Feature header + Background + all scenarios
    cat > "$FEATURE_FILE" << FEATURE_EOF
Feature: $TICKET_KEY — $FEATURE_DESCRIPTION
  Jira: $TICKET_KEY
  Generated by TestGenerator step 6 on $(date +"%Y-%m-%d")

  Background:
    Given I am on the login page
    When I enter my username
    And I click the next button
    And I enter my password
    And I click the "Let's go" button
    Then I should see the Safe Day's Alert modal
    When I dismiss the Safe Day's Alert
    Then I should be on the dashboard

$COMPILED_SCENARIOS
FEATURE_EOF
else
    # Existing file — append new scenarios after existing content
    {
        echo "$EXISTING_CONTENT"
        echo ""
        echo "  # --- $TICKET_KEY scenarios added $(date +"%Y-%m-%d") ---"
        echo "$COMPILED_SCENARIOS"
    } > "$FEATURE_FILE"
fi

echo "  Feature file written: $FEATURE_FILE"
SCENARIO_COUNT=$(grep -c '^\s*Scenario' "$FEATURE_FILE" 2>/dev/null || echo "?")
echo "  Scenarios in file: $SCENARIO_COUNT"

chomp_info "Feature file: \`tests/features/$(basename "$FEATURE_FILE")\` ($SCENARIO_COUNT scenarios)"
chomp_result "PASS" "Gherkin steps written for $(jira_link "$TICKET_KEY") — $PASS_COUNT/$TC_COUNT test cases"

echo ""
echo "Feature file:  $FEATURE_FILE"
echo "Scratch dir:   $SCRATCH_DIR/"
echo "Pass/Fail:     $PASS_COUNT / $FAIL_COUNT"

# -----------------------------------------------------------------------
# Run bddgen — always required after any .feature file change.
# Generates .features-gen/ test files that Playwright actually executes.
# -----------------------------------------------------------------------

echo ""
echo "=== Running bddgen ==="
BDDGEN_OUTPUT=$(cd "$PROJECT_DIR" && npx bddgen 2>&1) || BDDGEN_EXIT=$?
BDDGEN_EXIT=${BDDGEN_EXIT:-0}

echo "$BDDGEN_OUTPUT"

if [ $BDDGEN_EXIT -eq 0 ]; then
    chomp_info "bddgen: OK — test files regenerated"
    chomp_result "PASS" "bddgen completed successfully"
else
    chomp_info "bddgen: FAILED (exit $BDDGEN_EXIT)"
    chomp_result "WARN" "bddgen failed — check output above before running step 8"
fi

echo ""
echo "=== Step 6: DONE ==="
echo "Journey log: $CHOMP_LOG"
