#!/bin/bash
# Step 7 — Write Automated Tests (Playwright runner using existing step definitions)
# Generates a runnable Playwright test script that uses the .feature and .steps.ts
# files written in step 6 as much as possible. Falls back to inline Playwright
# scripts only for steps not yet covered by existing definitions.
#
# Usage: ./step7-write-automated-tests.sh SM-1096

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
TESTS_DIR="$PROJECT_DIR/tests"

chomp_step "7" "Write Automated Tests"
chomp_info "Ticket: **$(jira_link "$TICKET_KEY")**"

echo "=== Step 7: Write Automated Tests for $TICKET_KEY ==="

if [ ! -f "$PLAN_FILE" ]; then
    chomp_result "FAIL" "Test plan not found at \`$PLAN_FILE\`. Run step 5 first."
    echo "ERROR: Test plan not found at $PLAN_FILE"
    exit 1
fi

# --- Collect existing test files from step 6 ---

EXISTING_FEATURES=""
for f in "$TESTS_DIR/features"/*.feature; do
    [ -f "$f" ] || continue
    EXISTING_FEATURES="$EXISTING_FEATURES
- $f"
done

EXISTING_STEPS=""
for f in "$TESTS_DIR/steps"/*.steps.ts; do
    [ -f "$f" ] || continue
    EXISTING_STEPS="$EXISTING_STEPS
- $f"
done

EXISTING_PROPERTIES=""
for f in "$TESTS_DIR/properties"/*.properties.ts; do
    [ -f "$f" ] || continue
    EXISTING_PROPERTIES="$EXISTING_PROPERTIES
- $f"
done

chomp_info "Existing features:$EXISTING_FEATURES"
chomp_info "Existing steps:$EXISTING_STEPS"

# --- Check for playwright config ---
PLAYWRIGHT_CONFIG=""
for cfg in "$PROJECT_DIR/playwright.config.ts" "$PROJECT_DIR/playwright.config.js"; do
    [ -f "$cfg" ] && PLAYWRIGHT_CONFIG="$cfg" && break
done

# --- Build prompt ---

PROMPT_FILE="$TICKET_DIR/7_prompt.txt"
cat > "$PROMPT_FILE" << PROMPT_EOF
You are a senior test automation engineer. Your task is to ensure the Playwright-BDD test suite for Jira ticket $TICKET_KEY is complete and runnable.

## CONTEXT

Step 6 already generated the following test files. Use them as-is wherever possible — do NOT rewrite or duplicate what already works.

### Existing feature files:
$EXISTING_FEATURES

### Existing step definition files:
$EXISTING_STEPS

### Existing properties files (XPath selectors):
$EXISTING_PROPERTIES

### Playwright config:
${PLAYWRIGHT_CONFIG:-Not found — infer from package.json or tsconfig}

### Test plan:
Read this file for the full list of test cases: $PLAN_FILE

### Ticket context:
- Issue: $TICKET_DIR/3_issue.json (read if needed for page context)

## YOUR TASK

1. **READ** the existing feature file(s) for this ticket
2. **READ** the existing step definition file(s) for this ticket
3. **CHECK** that every Gherkin step in the feature file has a matching step definition
4. **CHECK** that the playwright.config.ts includes the correct feature tag or path so these tests will run
5. **FIX** any gaps:
   - Missing step definitions → add them to the existing .steps.ts file
   - Missing imports → fix them
   - Steps that reference selectors not in the properties file → add the XPath constants
6. **VERIFY** the test can be executed by running:
   \`\`\`
   npx bddgen && npx playwright test --project=chromium 2>&1 | head -50
   \`\`\`
   If it fails, read the error and fix the root cause. Repeat until tests compile and run (even if individual test cases fail due to app behaviour — compilation and step binding errors must be resolved).

## RULES

- Prefer editing existing files over creating new ones
- Use XPath ONLY — no CSS selectors
- Use \`page.locator(\`xpath=\${SELECTOR}\`)\` pattern
- Reuse login steps from login.steps.ts — do NOT redefine them
- Deterministic waits: waitForURL, waitForLoadState('networkidle'), toBeVisible
- Credentials: process.env.TEST_USERNAME / process.env.TEST_PASSWORD
- Test URL: ${BASE_URL}spa
- Keep it KISS — fix what's broken, don't over-engineer

## OUTPUT

After all fixes, write a summary to: $TICKET_DIR/7_automation_ready.txt

Format:
\`\`\`
Automation Ready Summary — $TICKET_KEY
=======================================
Feature file: <path>
Steps file: <path>
Properties file: <path>

Steps coverage:
- <step text> → DEFINED / ADDED / MISSING
...

Compile check: PASS / FAIL
Run check: PASS / FAIL (note: individual test failures due to app state are OK)

Notes:
<anything notable>
\`\`\`
PROMPT_EOF

chomp_info "Prompt saved to \`$TICKET_DIR/7_prompt.txt\`"
echo "Launching Claude CLI to wire up automated tests..."

claude -p \
    --allowedTools "Bash,Read,Write,Edit,Grep,Glob" \
    -d "$PROJECT_DIR" \
    < "$PROMPT_FILE" \
    > "$TICKET_DIR/7_automation_log.txt" 2>&1

echo "Claude CLI finished."

# --- Report outcome ---

if [ -f "$TICKET_DIR/7_automation_ready.txt" ]; then
    chomp_info "Automation summary: \`$TICKET_DIR/7_automation_ready.txt\`"
    chomp_code "Automation ready summary" "$(cat "$TICKET_DIR/7_automation_ready.txt")"
    chomp_result "PASS" "Automated tests wired up for $(jira_link "$TICKET_KEY")"
else
    chomp_info "No automation summary found (check \`7_automation_log.txt\`)"
    chomp_result "WARN" "Step 7 ran but no summary was written — check \`7_automation_log.txt\`"
fi

chomp_code "Automation log (tail)" "$(tail -50 "$TICKET_DIR/7_automation_log.txt")"

echo ""
echo "Automation log: $TICKET_DIR/7_automation_log.txt"
echo ""
echo "=== Step 7: DONE ==="
echo "Journey log: $CHOMP_LOG"
