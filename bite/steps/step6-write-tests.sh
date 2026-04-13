#!/bin/bash
# Step 6 — Write Playwright-BDD Tests from the Test Plan
# Generates .feature, .steps.ts, and .properties.ts files following POM conventions.
# Uses Claude CLI with full project context (rules, existing patterns, test plan).
#
# Usage: ./step6-write-tests.sh SM-1096

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
PLAN_FILE="$TICKET_DIR/5_plan.md"

chomp_step "6" "Write Tests"
chomp_info "Ticket: **$(jira_link "$TICKET_KEY")**"

echo "=== Step 6: Write Tests for $TICKET_KEY ==="

if [ ! -f "$PLAN_FILE" ]; then
    chomp_result "FAIL" "Test plan not found at \`$PLAN_FILE\`. Run step 5 first."
    echo "ERROR: Test plan not found at $PLAN_FILE"
    exit 1
fi

# --- Build context from project rules and existing patterns ---

RULES_DIR="$PROJECT_DIR/.claude/test-automation-expert/rules"
QA_DIR="$PROJECT_DIR/.claude/qa-expert"
TESTS_DIR="$PROJECT_DIR/tests"

# Collect rules context
RULES_CONTEXT=""
for rule_file in "$RULES_DIR/automation.mdc" "$RULES_DIR/effective-rules-summary.mdc"; do
    if [ -f "$rule_file" ]; then
        RULES_CONTEXT="$RULES_CONTEXT
--- $(basename "$rule_file") ---
$(cat "$rule_file")
"
    fi
done

# Collect an existing feature+steps+properties as reference pattern
EXAMPLE_CONTEXT="
--- EXAMPLE: login.feature ---
$(cat "$TESTS_DIR/features/login.feature")

--- EXAMPLE: login.steps.ts ---
$(cat "$TESTS_DIR/steps/login.steps.ts")

--- EXAMPLE: login-username.properties.ts ---
$(cat "$TESTS_DIR/properties/login-username.properties.ts")
"

# Collect ticket context from previous steps
TICKET_CONTEXT=""
[ -f "$TICKET_DIR/3_issue.json" ] && TICKET_CONTEXT="$TICKET_CONTEXT
--- Ticket Issue ---
$(cat "$TICKET_DIR/3_issue.json")
"
[ -f "$TICKET_DIR/3_comments.json" ] && TICKET_CONTEXT="$TICKET_CONTEXT
--- Ticket Comments ---
$(cat "$TICKET_DIR/3_comments.json")
"

# List existing properties files for awareness
EXISTING_PROPERTIES=$(ls "$TESTS_DIR/properties/" 2>/dev/null | tr '\n' ', ')

# --- Build the prompt ---

PROMPT_FILE="$TICKET_DIR/6_prompt.txt"
cat > "$PROMPT_FILE" << PROMPT_EOF
You are a senior test automation engineer. Your task is to write Playwright-BDD test code for the Jira ticket $TICKET_KEY based on the test plan below.

## OUTPUT REQUIREMENTS

Generate EXACTLY these files inside the project. Use the Write tool to create them:

1. **Feature file**: tests/features/<page-name>.feature
   - Gherkin scenarios covering the test plan's test cases
   - Business-focused, readable steps
   - Reuse existing step definitions from other features where possible

2. **Step definitions**: tests/steps/<page-name>.steps.ts
   - TypeScript with playwright-bdd (createBdd)
   - Import XPath selectors from the properties file
   - Use \`page.locator(\\\`xpath=\\\${XPATH_VAR}\\\`)\` for all element targeting
   - Use deterministic waits: waitForURL, waitForLoadState, toBeVisible
   - Credentials from process.env.TEST_USERNAME / process.env.TEST_PASSWORD

3. **Properties file**: tests/properties/<page-name>.properties.ts
   - XPath-only selectors as exported string constants
   - Include a Record<string, string> element map at the bottom
   - Add JSDoc header with page URL, source, and capture date
   - Since you don't have the actual HTML, use BEST-GUESS XPaths based on:
     - The ticket description and screenshots
     - Common Angular Material / Bootstrap patterns
     - Stable anchors: data-automation-id > semantic attrs > heading/label text
   - Mark uncertain selectors with a // TODO: verify from htmlBody comment

## CONVENTIONS (follow these strictly)

$RULES_CONTEXT

## REFERENCE PATTERNS (follow this exact style)

$EXAMPLE_CONTEXT

## EXISTING PROPERTIES FILES (reuse if the page already has one)

$EXISTING_PROPERTIES

## TEST PLAN

$(cat "$PLAN_FILE")

## TICKET DETAILS

$TICKET_CONTEXT

## IMPORTANT RULES

- Do NOT modify any existing files unless absolutely necessary for import sharing
- If a properties file already exists for the page (check the list above), READ it first and extend it rather than overwriting
- Feature file name should match the page being tested (e.g., purchasing.feature for Purchasing Tracker)
- Include login steps in your scenarios (reuse from login.steps.ts: "Given I am on the login page", "When I enter my username", etc.)
- Test URL is ${BASE_URL}spa
- Use XPath ONLY — no CSS selectors
- Keep it KISS — simplest implementation that covers the test plan
PROMPT_EOF

chomp_info "Prompt built with rules, examples, and ticket context"
chomp_info "Prompt saved to \`$TICKET_DIR/6_prompt.txt\`"

echo "Launching Claude CLI to generate test code..."

# Run Claude with file access to read existing code and write new files
claude -p \
    --allowedTools "Bash,Read,Write,Edit,Grep,Glob" \
    -d "$PROJECT_DIR" \
    < "$PROMPT_FILE" \
    > "$TICKET_DIR/6_generation_log.txt" 2>&1

echo "Claude CLI finished."

# --- Log what was generated ---

# Find any new/modified files in tests/
GENERATED_FILES=""
for dir in features steps properties; do
    for f in "$TESTS_DIR/$dir"/*; do
        [ -f "$f" ] || continue
        # Check if modified in last 5 minutes
        if find "$f" -mmin -5 2>/dev/null | grep -q .; then
            GENERATED_FILES="$GENERATED_FILES
  - $dir/$(basename "$f")"
        fi
    done
done

if [ -n "$GENERATED_FILES" ]; then
    chomp_info "Generated/modified files:$GENERATED_FILES"
    chomp_result "PASS" "Test code generated for $(jira_link "$TICKET_KEY")"
else
    chomp_info "No test files detected (check generation log)"
    chomp_result "WARN" "Claude ran but no test files were detected — check \`6_generation_log.txt\`"
fi

chomp_code "Generation log (tail)" "$(tail -50 "$TICKET_DIR/6_generation_log.txt")"

echo ""
echo "Generation log: $TICKET_DIR/6_generation_log.txt"
echo "Generated files:$GENERATED_FILES"
echo ""
echo "=== Step 6: DONE ==="
echo "Journey log: $CHOMP_LOG"
