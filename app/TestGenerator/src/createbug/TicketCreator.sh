#!/usr/bin/env bash
# TicketCreator — draft a Powerslice SM Jira ticket as an HTML file from brief input.
#
# Usage:
#   ./TicketCreator.sh "<brief ticket details>" ["more details"] ...
#   ./TicketCreator.sh <brief1> --- <brief2> --- <brief3>
#
# Examples:
#   ./TicketCreator.sh "SM-1234 Save button in Vendor Admin is disabled" "reported by Acme customer"
#   ./TicketCreator.sh SM-864 Multiple Filter Not Working
#   ./TicketCreator.sh SM-864 Multiple Filter Not Working --- SM-1105 Dashboard loads slow
#
# Output:
#   logs/<REF_TICKET>_<WorkType>-<N>.html  (one per ticket)
#
# Notes:
#   - Uses Claude CLI to fill in the draft per rules in rules/jira-ticket-creation.md
#   - Layout mirrors template.html (inline styles — survives Jira paste)
#   - NEVER creates a ticket via the Jira API. Output is a draft you review and paste manually.

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$PROJECT_DIR/../../../.." && pwd)"
LOGS_DIR="$PROJECT_DIR/logs"
RULES_FILE="$REPO_ROOT/.claude-self/rules/jira-ticket-creation.md"
TEMPLATE_FILE="$PROJECT_DIR/template.html"

[ $# -ge 1 ] || { echo "Usage: $0 \"<brief ticket details>\" [--- \"<another ticket>\"] ..."; exit 1; }

for f in "$RULES_FILE" "$TEMPLATE_FILE"; do
    [ -f "$f" ] || { echo "ERROR: missing $f"; exit 1; }
done
command -v claude >/dev/null || { echo "ERROR: claude CLI not on PATH"; exit 1; }
mkdir -p "$LOGS_DIR"

# Split arguments on "---" into separate ticket briefs.
BRIEFS=()
CURRENT=""
for arg in "$@"; do
    if [ "$arg" = "---" ]; then
        [ -n "$CURRENT" ] && BRIEFS+=("$CURRENT")
        CURRENT=""
    else
        CURRENT="${CURRENT:+$CURRENT }$arg"
    fi
done
[ -n "$CURRENT" ] && BRIEFS+=("$CURRENT")

[ ${#BRIEFS[@]} -ge 1 ] || { echo "ERROR: no ticket briefs provided"; exit 1; }

draft_ticket() {
    local DETAILS="$1"
    local INDEX="$2"
    local TOTAL="$3"

    REF_TICKET=$(echo "$DETAILS" | grep -oE 'SM(-[A-Z]+)?-[0-9]+' | head -1 || true)
    REF_TICKET="${REF_TICKET:-NEW}"

    echo "==> [$INDEX/$TOTAL] Drafting Jira ticket from brief..."
    echo "    Ref ticket: $REF_TICKET"
    echo "    Brief: $DETAILS"

    PROMPT_FILE=$(mktemp -t ticketcreator_prompt.XXXXXX)

    {
    cat <<'HEADER'
You are a senior QA test analyst drafting a Jira ticket for Powerslice's Site Manager (SM) product. Follow the Powerslice field conventions below exactly.

## COMPANY RULES

HEADER
    cat "$RULES_FILE"
    cat <<'MID1'

## TARGET HTML LAYOUT (fill placeholders; keep inline styles as-is — Jira strips <style> blocks on paste)

MID1
    cat "$TEMPLATE_FILE"
    cat <<MID2

## BRIEF TICKET DETAILS

$DETAILS
MID2
    cat <<'FOOTER'

## OUTPUT FORMAT

- First line: TYPE:<Bug|Story|Task|Epic>  (pick the best work type based on the brief)
- Remaining lines: the full HTML draft starting with <div
- No markdown code fences, no preamble, no trailing commentary.

## FILLING RULES

- Summary MUST start with the module name: "<Module> – <concise summary>" (em-dash).
- Primary QA Tester is always "Kim Bandeleon".
- Primary Developer: if named in the brief, use it; otherwise "TBD — assign before creating".
- Priority defaults to "Medium" unless the brief says otherwise.
- Status is always "Backlog" (new ticket).
- Labels: choose from the taxonomy in the rules based on request origin:
    * defect_internal   — found by someone on our team
    * defect_production — found on live by a customer
    * change_request    — customer enhancement request
    * Suggestion-QA     — QA user suggestion
    If none apply, leave the Labels cell blank.
- Description block: fill what you can from the brief (observed, expected, steps to reproduce, environment, notes). For anything not in the brief, write "TBD" so the user knows to fill it in before creating the ticket.
- Post-Create Comment: cite the request source (customer name / internal person / QA) using info from the brief when available; mark unknowns as "TBD".
- DRAFT banner stays as-is ("DRAFT — Not yet created in Jira").
FOOTER
    } > "$PROMPT_FILE"

    RAW=$(claude -p --output-format json < "$PROMPT_FILE" \
        | python3 -c "import json,sys; print(json.load(sys.stdin).get('result',''))")

    rm -f "$PROMPT_FILE"

    TYPE_LINE=$(echo "$RAW" | grep -m1 '^TYPE:' || true)
    WORK_TYPE=$(echo "$TYPE_LINE" | sed 's/^TYPE: *//' | tr -d ' \r')
    if [[ ! "$WORK_TYPE" =~ ^(Bug|Story|Task|Epic)$ ]]; then
        echo "ERROR: [$INDEX/$TOTAL] Claude returned unexpected work type: '$WORK_TYPE'"
        echo "--- Raw output (first 40 lines) ---"
        echo "$RAW" | head -40
        return 1
    fi

    TYPE_LINE_NUM=$(echo "$RAW" | grep -n '^TYPE:' | head -1 | cut -d: -f1)
    HTML_BODY=$(echo "$RAW" | tail -n +"$((TYPE_LINE_NUM + 1))")

    N=1
    while [ -f "$LOGS_DIR/${REF_TICKET}_${WORK_TYPE}-${N}.html" ]; do
        N=$((N + 1))
    done
    OUTPUT_FILE="$LOGS_DIR/${REF_TICKET}_${WORK_TYPE}-${N}.html"

    printf '%s\n' "$HTML_BODY" > "$OUTPUT_FILE"

    SIZE=$(wc -c < "$OUTPUT_FILE" | tr -d ' ')
    echo "==> [$INDEX/$TOTAL] Draft saved: $OUTPUT_FILE ($SIZE bytes)"
}

TOTAL=${#BRIEFS[@]}
FAILED=0

for i in "${!BRIEFS[@]}"; do
    INDEX=$((i + 1))
    if ! draft_ticket "${BRIEFS[$i]}" "$INDEX" "$TOTAL"; then
        FAILED=$((FAILED + 1))
    fi
    [ "$INDEX" -lt "$TOTAL" ] && echo ""
done

echo ""
if [ "$FAILED" -eq 0 ]; then
    echo "==> All $TOTAL ticket(s) drafted. Open in browser to review, then paste into Jira."
else
    echo "==> $((TOTAL - FAILED))/$TOTAL ticket(s) drafted. $FAILED failed — see errors above."
    exit 1
fi
