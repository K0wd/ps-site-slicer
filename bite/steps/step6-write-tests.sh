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

# Build ticket context file references (NOT inlined — files are too large)
# Claude will read these on demand via the Read tool
TICKET_FILE_REFS=""
[ -f "$TICKET_DIR/3_issue.json" ] && TICKET_FILE_REFS="$TICKET_FILE_REFS
- Ticket issue: $TICKET_DIR/3_issue.json"
[ -f "$TICKET_DIR/3_comments.json" ] && TICKET_FILE_REFS="$TICKET_FILE_REFS
- Ticket comments: $TICKET_DIR/3_comments.json"
[ -f "$TICKET_DIR/3_attachments.txt" ] && TICKET_FILE_REFS="$TICKET_FILE_REFS
- Ticket attachments: $TICKET_DIR/3_attachments.txt"

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

The ticket data files are large. Use the Read tool to read them if you need more context:
$TICKET_FILE_REFS

Focus on the test plan above — it already summarizes the ticket. Only read the raw ticket files if the test plan lacks detail for a specific test case.

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

echo "Claude CLI finished (6a — code generation)."

# --- Detect generated files from 6a ---

GENERATED_FEATURES=""
GENERATED_STEPS=""
GENERATED_PROPERTIES=""

for f in "$TESTS_DIR/features"/*; do
    [ -f "$f" ] || continue
    if find "$f" -mmin -5 2>/dev/null | grep -q .; then
        GENERATED_FEATURES="$GENERATED_FEATURES $f"
    fi
done

for f in "$TESTS_DIR/steps"/*; do
    [ -f "$f" ] || continue
    if find "$f" -mmin -5 2>/dev/null | grep -q .; then
        GENERATED_STEPS="$GENERATED_STEPS $f"
    fi
done

for f in "$TESTS_DIR/properties"/*; do
    [ -f "$f" ] || continue
    if find "$f" -mmin -5 2>/dev/null | grep -q .; then
        GENERATED_PROPERTIES="$GENERATED_PROPERTIES $f"
    fi
done

# Build combined list for logging
GENERATED_FILES=""
for f in $GENERATED_FEATURES $GENERATED_STEPS $GENERATED_PROPERTIES; do
    REL=$(echo "$f" | sed "s|$TESTS_DIR/||")
    GENERATED_FILES="$GENERATED_FILES
  - $REL"
done

if [ -n "$GENERATED_FILES" ]; then
    chomp_info "6a generated/modified files:$GENERATED_FILES"
    chomp_result "PASS" "Test code generated for $(jira_link "$TICKET_KEY")"
else
    chomp_info "No test files detected from 6a (check generation log)"
    chomp_result "WARN" "Claude ran but no test files were detected — check \`6_generation_log.txt\`"
fi

chomp_code "6a generation log (tail)" "$(tail -50 "$TICKET_DIR/6_generation_log.txt")"

# ===================================================================
# Step 6b — Implement step definitions with real Playwright logic
# ===================================================================
# The first pass (6a) generates feature files, properties, and initial
# step definitions. This second pass reads the generated feature file
# and properties, then rewrites the step definitions with proper
# Playwright interactions, assertions, and waits.
# ===================================================================

chomp_step "6b" "Implement Step Definitions"
echo ""
echo "=== Step 6b: Implement Step Definitions ==="

if [ -z "$GENERATED_FEATURES" ] && [ -z "$GENERATED_STEPS" ]; then
    chomp_result "SKIP" "No generated features/steps from 6a — skipping 6b"
    echo "SKIP: No generated files to implement. Ending step 6."
else
    # Collect all generated file contents for the prompt
    GENERATED_FEATURE_CONTENT=""
    for f in $GENERATED_FEATURES; do
        GENERATED_FEATURE_CONTENT="$GENERATED_FEATURE_CONTENT
--- $(basename "$f") ---
$(cat "$f")
"
    done

    GENERATED_STEPS_CONTENT=""
    for f in $GENERATED_STEPS; do
        GENERATED_STEPS_CONTENT="$GENERATED_STEPS_CONTENT
--- $(basename "$f") ---
$(cat "$f")
"
    done

    GENERATED_PROPS_CONTENT=""
    for f in $GENERATED_PROPERTIES; do
        GENERATED_PROPS_CONTENT="$GENERATED_PROPS_CONTENT
--- $(basename "$f") ---
$(cat "$f")
"
    done

    IMPLEMENT_PROMPT_FILE="$TICKET_DIR/6b_prompt.txt"
    cat > "$IMPLEMENT_PROMPT_FILE" << IMPLEMENT_EOF
You are a senior test automation engineer. Step 6a has already generated feature files, properties files, and initial step definitions for Jira ticket $TICKET_KEY.

Your job is to REVIEW and REWRITE the step definition files so that every step has proper, working Playwright logic. Do NOT change the feature files or properties files — only edit the step definition (.steps.ts) files.

## WHAT TO DO

1. Read each generated feature file to understand the Gherkin steps needed
2. Read each generated properties file to know the available XPath selectors
3. Read the existing step definition files generated in 6a
4. Read the existing login.steps.ts and other existing step files for reference patterns
5. REWRITE each step definition file with:
   - Correct imports from the properties file (use exact export names)
   - Proper Playwright actions: click, fill, selectOption, check, etc.
   - Proper assertions: toBeVisible, toHaveText, toHaveURL, toContainText, etc.
   - Deterministic waits: waitForURL, waitForLoadState('networkidle'), toBeVisible checks
   - Correct use of XPath selectors: page.locator(\`xpath=\${SELECTOR}\`)
   - Login reuse: do NOT redefine login steps — import/reuse from login.steps.ts
   - Credentials from process.env.TEST_USERNAME / process.env.TEST_PASSWORD

## REFERENCE: Existing login.steps.ts pattern

$EXAMPLE_CONTEXT

## GENERATED FEATURE FILES (do NOT modify these)

$GENERATED_FEATURE_CONTENT

## GENERATED PROPERTIES FILES (do NOT modify these)

$GENERATED_PROPS_CONTENT

## GENERATED STEP DEFINITIONS (REWRITE these)

$GENERATED_STEPS_CONTENT

## RULES

$RULES_CONTEXT

## IMPORTANT

- ONLY edit files under tests/steps/ — do NOT touch features or properties
- Every Given/When/Then in the feature file MUST have a matching step definition
- Do NOT duplicate step definitions that already exist in login.steps.ts
- Use the Edit tool to rewrite the step files in place
- XPath ONLY — no CSS selectors
- Use createBdd() from playwright-bdd
- Keep it simple — real Playwright logic, no stubs, no TODOs, no placeholder comments
- Test URL is ${BASE_URL}spa
IMPLEMENT_EOF

    chomp_info "6b prompt saved to \`$TICKET_DIR/6b_prompt.txt\`"
    echo "Launching Claude CLI to implement step definitions..."

    claude -p \
        --allowedTools "Bash,Read,Write,Edit,Grep,Glob" \
        -d "$PROJECT_DIR" \
        < "$IMPLEMENT_PROMPT_FILE" \
        > "$TICKET_DIR/6b_implementation_log.txt" 2>&1

    echo "Claude CLI finished (6b — step implementation)."

    # Detect files modified by 6b
    IMPL_FILES=""
    for f in "$TESTS_DIR/steps"/*; do
        [ -f "$f" ] || continue
        if find "$f" -mmin -2 2>/dev/null | grep -q .; then
            IMPL_FILES="$IMPL_FILES
  - steps/$(basename "$f")"
        fi
    done

    if [ -n "$IMPL_FILES" ]; then
        chomp_info "6b implemented step files:$IMPL_FILES"
        chomp_result "PASS" "Step definitions implemented for $(jira_link "$TICKET_KEY")"
    else
        chomp_info "No step files modified by 6b (check implementation log)"
        chomp_result "WARN" "6b ran but no step files were modified — check \`6b_implementation_log.txt\`"
    fi

    chomp_code "6b implementation log (tail)" "$(tail -50 "$TICKET_DIR/6b_implementation_log.txt")"
fi

echo ""
echo "Generation log (6a): $TICKET_DIR/6_generation_log.txt"
echo "Implementation log (6b): $TICKET_DIR/6b_implementation_log.txt"
echo "Generated files:$GENERATED_FILES"
echo ""
echo "=== Step 6: DONE ==="
echo "Journey log: $CHOMP_LOG"
