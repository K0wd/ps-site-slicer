# 🧠 CLAUDE.md — ps-site-slicer Test Automation Wiki
> SiteManager PWA · Powerslice Software · Last updated: April 2026

---

## 📌 Project Context

- **App under test:** SiteManager PWA (Next.js)
- **Backend:** CakePHP REST API
- **Test framework:** Playwright (TypeScript)
- **Jira project:** SM · Cloud ID: `68df42c0-c103-42f5-b3a7-11bd4675a76d`
- **Test URL:** https://testserver.betacom.com/testpwa
- **Stage URL:** https://testserver.betacom.com/stagepwa
- **Repo:** https://gitlab.com/powerslice-software-development/sm-pwa · Branch: `develop`

---

## 🧪 TESTING TECHNIQUES — INSTRUCTION SET

When writing tests, Claude MUST select and apply the appropriate technique(s) below based on the feature being tested. Each technique includes its **behavior rules** — follow them precisely.

---

## ━━━ CATEGORY 1: BLACK-BOX TECHNIQUES ━━━

---

### 1. Equivalence Partitioning (EP)

**What it is:** Divide all possible inputs into groups (partitions) where every value in the group is expected to behave identically. Test one representative value per partition — not every value.

**Behavior rules:**
- Identify VALID partitions (inputs the system should accept) and INVALID partitions (inputs it should reject)
- Write exactly ONE test per partition — never more
- Do NOT test every possible value within a partition
- If a field accepts ages 18–65, your partitions are: under 18 (invalid), 18–65 (valid), over 65 (invalid)
- Always ask: "Would changing this value to another within the same partition change the outcome?" If no → same partition

**Applied to SM:**
```
Work Order search field:
  Valid partition:   alphanumeric WO# → "WO-1234"
  Invalid partition: empty string → ""
  Invalid partition: special chars only → "!@#$"
  Invalid partition: over max length → 300-char string
```

**Test template:**
```typescript
test.describe('EP: Work Order Search', () => {
  test('valid alphanumeric WO# returns results', ...);
  test('empty search string shows validation error', ...);
  test('special characters only returns no results', ...);
  test('exceeds max length shows truncation/error', ...);
});
```

---

### 2. Boundary Value Analysis (BVA)

**What it is:** Bugs cluster at the edges of partitions, not the middle. Test the boundary values: the minimum, maximum, and the values just inside and just outside each boundary.

**Behavior rules:**
- For every numeric range, test: `min-1`, `min`, `min+1`, `max-1`, `max`, `max+1`
- For string lengths, test: `0`, `1`, `max-1`, `max`, `max+1` characters
- Always pair with EP — BVA tests the edges, EP tests the middle
- Never skip the "just outside" values — these catch off-by-one errors
- For 2-value BVA (ISTQB v4): test only `min` and `max` of each partition edge

**Applied to SM:**
```
Notification badge count (SM-1082):
  Boundary: 0 (no badge shown)
  Boundary: 1 (badge appears)
  Boundary: 99 (shows "99")
  Boundary: 100 (shows "99+" or "100")
  Boundary: 999 (max reasonable count)
```

**Test template:**
```typescript
test.describe('BVA: Notification Badge Count', () => {
  test('0 unread → badge is hidden',           async ({ page }) => { ... });
  test('1 unread → badge shows "1"',           async ({ page }) => { ... });
  test('99 unread → badge shows "99"',         async ({ page }) => { ... });
  test('100 unread → badge shows "99+"',       async ({ page }) => { ... });
});
```

---

### 3. Decision Table Testing

**What it is:** A matrix mapping every combination of conditions (inputs/rules) to expected actions (outputs). Forces complete coverage of all business rule combinations.

**Behavior rules:**
- List all CONDITIONS (boolean inputs) across the top
- List all ACTIONS (expected outputs) at the bottom
- Create one column per unique combination of condition values
- For N conditions there are 2^N combinations maximum — consolidate where outcomes are identical
- Always verify with stakeholders that every rule is covered
- Ideal for: login rules, permissions, form validation with multiple fields

**Applied to SM:**
```
Notification Tab Display Rules (SM-1082):

| Condition                    | R1 | R2 | R3 | R4 |
|------------------------------|----|----|----|----|
| Has Live Photo notifications | Y  | Y  | N  | N  |
| Has System notifications     | Y  | N  | Y  | N  |
|------------------------------|----|----|----|----|
| Show Live Photo tab badge    | Y  | Y  | N  | N  |
| Show System tab badge        | Y  | N  | Y  | N  |
| Show empty state message     | N  | N  | N  | Y  |
```

**Test template:**
```typescript
test.describe('Decision Table: Notification Display', () => {
  test('R1: both types → both badges shown',           ...);
  test('R2: live photo only → only live badge shown',  ...);
  test('R3: system only → only system badge shown',    ...);
  test('R4: no notifications → empty state shown',     ...);
});
```

---

### 4. State Transition Testing

**What it is:** Models a system as a set of states, events that trigger transitions, and guards/actions. Tests valid transitions, invalid transitions, and sequences of transitions.

**Behavior rules:**
- Draw a state diagram BEFORE writing tests (even mentally)
- Test EVERY valid transition at least once
- Test INVALID transitions — the system should reject or ignore them
- Test SEQUENCES of transitions (transition trees/paths)
- States must be mutually exclusive — object can only be in one state at a time
- Identify: Current State → Event → Guard → Next State → Action

**Applied to SM:**
```
Work Order State Machine (SM-1089):

States:    Open → In Progress → Complete → Closed
           Open → Cancelled

Transitions:
  Open       + assign()      → In Progress  (action: notify assignee)
  In Progress + complete()   → Complete     (action: timestamp recorded)
  In Progress + cancel()     → Cancelled    (action: reason required)
  Complete   + close()       → Closed       (action: audit log entry)
  Complete   + reopen()      → In Progress  (action: completion cleared)

Invalid:
  Open       + complete()    → REJECTED (must be In Progress first)
  Closed     + complete()    → REJECTED (already closed)
```

**Test template:**
```typescript
test.describe('State Transition: Work Order', () => {
  test('Open → assign → In Progress',              ...);
  test('In Progress → complete → Complete',         ...);
  test('In Progress → cancel → Cancelled',          ...);
  test('Complete → close → Closed',                 ...);
  test('INVALID: Open → complete → rejected',       ...);
  test('INVALID: Closed → reopen → rejected',       ...);
});
```

---

### 5. Use Case / User Journey Testing

**What it is:** Tests complete end-to-end paths a real user would take through the system. Based on actor goals, not just features. Covers the main success scenario and key alternative/failure scenarios.

**Behavior rules:**
- Define the ACTOR (who), GOAL (what they want), PRECONDITION (setup needed)
- Write the MAIN SUCCESS SCENARIO step by step
- Write ALTERNATIVE SCENARIOS (valid deviations)
- Write FAILURE SCENARIOS (what breaks the flow)
- Tests must be end-to-end — do not mock the critical path
- Always assert the final outcome, not just intermediate steps

**Applied to SM:**
```
Use Case: Technician views and completes a Work Order

Actor:         Field Technician
Goal:          Mark a work order as complete from the PWA
Precondition:  Logged in, at least one WO assigned

Main Success:
  1. Navigate to Work Orders module
  2. Search for WO by number
  3. Select WO from list
  4. View WO details and map
  5. Tap "Mark Complete"
  6. Confirm completion
  7. WO status updates to Complete

Alternative: WO not found → show "No results" message
Failure:      Network drops mid-complete → show retry option
```

---

### 6. Pairwise / All-Pairs Testing

**What it is:** When you have multiple input parameters each with multiple values, testing every combination is impractical. Pairwise ensures every PAIR of parameter values appears together at least once — catching most bugs with far fewer tests.

**Behavior rules:**
- Use when you have 3+ parameters with 2+ values each
- Each pair of (parameter A value, parameter B value) must appear in at least one test
- Use a pairwise generation tool (e.g., `allpairs`, `pict`) to generate the matrix
- Reduces N^M test cases to roughly N×M cases
- Does NOT replace full combinatorial testing for safety-critical paths
- Always seed the test data from generated pairs, not manual guessing

**Applied to SM:**
```
Work Order Filters (SM-1089):
  Department:  Maintenance | Electrical | Plumbing
  Status:      Open | In Progress | Complete
  Priority:    High | Medium | Low

Full combinations: 3×3×3 = 27
Pairwise pairs:    ~9 tests cover all pairs
```

---

### 7. Classification Tree Method

**What it is:** Visualizes test input space as a tree. Root = system. Branches = input categories. Leaves = specific values. Tests are built by selecting one leaf per category.

**Behavior rules:**
- Start from the root (feature under test)
- Branch into independent input categories
- Each category branches into its possible values (leaves)
- A test case = one selection from EACH category
- Ensure all leaves are covered across the test suite
- Use to systematically discover input combinations you might miss

---

### 8. Error Guessing

**What it is:** Experienced-based technique. Tester uses intuition, domain knowledge, and past bug history to predict where defects are likely to hide and write targeted tests.

**Behavior rules:**
- ALWAYS check these common error hotspots first:
  - Empty inputs, null values, zero values
  - Very long strings (buffer overflow candidates)
  - Special characters: `'`, `"`, `<`, `>`, `&`, `%`, `\n`, `\t`
  - Negative numbers where positive expected
  - Concurrent actions (double-click submit, rapid tab switching)
  - Session expiry mid-action
  - Network interruption mid-submit
  - Browser back button after form submit
  - Timezone/locale edge cases in dates
  - Copy-paste into restricted fields
- Document WHY each error guess test exists (link to past bug or gut feel)
- For the SM PWA specifically, always test:
  - Offline mode (PWA service worker)
  - Slow 3G network simulation
  - Portrait vs landscape orientation

---

### 9. Exploratory Testing

**What it is:** Simultaneous test design and execution. No fixed script. Tester actively learns the system while testing it, adapting based on what they discover.

**Behavior rules:**
- Define a TIME-BOXED SESSION (e.g., 60 minutes) with a specific CHARTER
- Charter format: "Explore [area] using [resources] to discover [information]"
- Take notes in real-time — screenshots, unexpected behaviors, questions
- When something interesting is found → investigate deeper before moving on
- At session end: write up bugs found, areas covered, areas NOT covered
- Do NOT convert exploratory tests into fixed scripts — they lose value
- Use for: new features, after major changes, areas with no existing tests

**SM Charter examples:**
```
Charter 1: "Explore the Notification Module (SM-1082) using a test account
            with 50+ mixed notifications to discover display edge cases"

Charter 2: "Explore Work Order search (SM-1089) using boundary inputs
            and rapid filter changes to discover state management bugs"
```

---

### 10. Checklist-Based Testing

**What it is:** A reusable list of conditions/questions to verify, derived from standards, past bugs, or domain knowledge. Less detailed than a test case but ensures consistent coverage.

**Behavior rules:**
- Maintain checklists in `/tests/checklists/` folder
- Each checklist item is a YES/NO verifiable condition
- Review and update checklists after every bug found
- Use for regression passes, cross-browser checks, accessibility audits
- Do NOT use as a replacement for structured test cases on new features

---

## ━━━ CATEGORY 2: WHITE-BOX TECHNIQUES ━━━

---

### 11. Statement Coverage

**What it is:** Every executable statement in the code is executed at least once.

**Behavior rules:**
- Minimum acceptable coverage: **80%** for this project
- Use Istanbul/NYC or V8 coverage built into Playwright
- Statements in error-handling branches count — do not ignore them
- Dead code (0% hit) must be investigated and either tested or removed

```typescript
// playwright.config.ts
use: {
  coverage: true
}
```

---

### 12. Branch Coverage (Decision Coverage)

**What it is:** Every branch of every decision point (if/else, switch, ternary) is executed at both TRUE and FALSE outcomes.

**Behavior rules:**
- Branch coverage SUBSUMES statement coverage — prefer branch over statement alone
- Every `if` needs a test where condition is true AND a test where it is false
- Don't forget: `else` clauses, default switch cases, short-circuit `&&` and `||`
- Target: **75% branch coverage** minimum for SM PWA components

---

### 13. Condition Coverage

**What it is:** Each individual boolean sub-expression within a compound condition is tested as both true and false, independently of the overall decision outcome.

**Behavior rules:**
- For `if (A && B)`: test A=T/B=T, A=T/B=F, A=F/B=T, A=F/B=F
- Condition coverage does NOT guarantee branch coverage — use both
- Focus on complex boolean logic in filters, permission checks, and state guards

---

### 14. MC/DC (Modified Condition/Decision Coverage)

**What it is:** Each condition must independently affect the decision outcome. Gold standard for safety-critical code.

**Behavior rules:**
- For each condition C in a decision, there must be two test cases where:
  - All other conditions are held constant
  - C changes from T to F (or F to T)
  - The overall decision outcome changes as a result
- Use for: authentication logic, permission gates, data validation rules
- Required if SM ever integrates with safety-critical field operations

---

### 15. Path Coverage

**What it is:** Every possible path through the code (every unique sequence of branches) is executed.

**Behavior rules:**
- Only practical on small, isolated functions — do NOT attempt full-app path coverage
- Use for: critical utility functions, complex data transformation logic
- Loops make paths infinite — bound loops to 0, 1, and 2 iterations for path testing

---

## ━━━ CATEGORY 3: EXPERIENCE-BASED TECHNIQUES ━━━

---

### 16. Fault Attack / Mutation Testing

**What it is:** Deliberately introduce small code changes (mutations) — flip operators, change values, delete lines — and verify that your tests CATCH these mutations (kill them). If a test suite doesn't kill a mutation, it's not testing that logic.

**Behavior rules:**
- Use StrykerJS for TypeScript/JavaScript mutation testing
- Common mutations to test for: `>` ↔ `>=`, `+` ↔ `-`, `true` ↔ `false`, removed conditionals
- Mutation score target: **>60%** for critical modules
- Low mutation score = tests are passing but not ASSERTING meaningfully
- Run mutation testing on: SM-1082 notification logic, SM-1089 filter logic

```bash
npx stryker run
```

---

### 17. Risk-Based Testing

**What it is:** Prioritize tests by multiplying the LIKELIHOOD of failure × the IMPACT of failure. Test high-risk areas first and most thoroughly.

**Behavior rules:**
- Score each feature: Likelihood (1–5) × Impact (1–5) = Risk Score (1–25)
- Test in descending risk score order
- Document risk assessment in `/tests/risk-register.md`
- Re-assess risk after every release or major change

**SM Risk Register:**
```
Feature                        | Likelihood | Impact | Score | Priority
-------------------------------|------------|--------|-------|----------
Auth / Login                   | 2          | 5      | 10    | HIGH
Notification mark-as-read      | 3          | 3      | 9     | HIGH
Work Order complete action     | 2          | 5      | 10    | HIGH
Search filter combinations     | 4          | 3      | 12    | CRITICAL
Map view rendering             | 3          | 2      | 6     | MEDIUM
Badge count display            | 3          | 2      | 6     | MEDIUM
```

---

### 18. Session-Based Test Management (SBTM)

**What it is:** Structures exploratory testing into timed, chartered sessions with documented outputs. Makes unscripted testing measurable and reportable.

**Behavior rules:**
- Every exploratory session must have: Charter · Duration · Tester · Date
- Output format: Bugs found | Issues noted | Questions raised | Coverage areas
- Store session notes in `/tests/sessions/YYYY-MM-DD-charter-name.md`
- Sessions should be 60–120 minutes maximum before debriefing

---

### 19. Cause-Effect Graphing

**What it is:** A formal technique that maps CAUSES (inputs/conditions) to EFFECTS (outputs/actions) using boolean logic graphs, then derives a decision table from the graph.

**Behavior rules:**
- Identify all causes (C1, C2, C3...) and effects (E1, E2, E3...)
- Draw logical relationships: AND, OR, NOT, REQUIRES, EXCLUDES
- Convert graph to decision table — use table to generate test cases
- Use when decision tables get too large (5+ conditions) to manually enumerate
- Best for: complex form validation, multi-step wizard screens

---

### 20. Orthogonal Array Testing (OAT)

**What it is:** A mathematical approach to selecting a balanced subset of parameter combinations using orthogonal arrays (Taguchi method). More rigorous than pairwise — covers t-way interactions.

**Behavior rules:**
- Use when pairwise isn't sufficient but full combinatorial is impractical
- Select array based on number of parameters and levels: L4, L8, L9, L16, L18
- Each column = one parameter, each row = one test case
- Ensures balanced representation — no parameter value appears disproportionately
- Use for: complex filter screens, configurable settings pages

---

### 21. Domain Testing

**What it is:** Combines EP and BVA into a structured analysis of the input domain. Identifies ON points (exactly on boundary), OFF points (just outside), and IN points (well inside partition).

**Behavior rules:**
- ON point: the exact boundary value — must always be tested
- OFF point: the closest value outside the boundary — must always be tested
- IN point: a value clearly inside the valid partition — one per partition
- OUT point: a value clearly outside (invalid) — one per invalid partition
- For `>= 18 AND <= 65`:
  - ON: 18, 65
  - OFF: 17, 66
  - IN: 40
  - OUT: 0, 100

---

### 22. Combinatorial Testing

**What it is:** Systematic testing of all possible combinations of discrete parameter values. Full combinatorial when possible, t-way (pairwise/triples) when not.

**Behavior rules:**
- 2-way (pairwise): covers all pairs → catches ~75% of bugs
- 3-way (triplewise): covers all triples → catches ~90% of bugs
- Use PICT (Microsoft) or Allpairs tool to generate combination sets
- Always specify constraints (e.g., "Status=Closed IMPLIES AssignedTo IS NOT NULL")

---

### 23. Back-to-Back Testing

**What it is:** Run the same inputs through TWO different implementations (e.g., old React Native app vs new PWA) and compare outputs. If outputs differ, investigate which is correct.

**Behavior rules:**
- Ideal for SM's React Native → PWA migration
- Build a comparison harness that sends identical API calls to both
- Flag ANY output difference — even formatting differences may indicate bugs
- Document accepted differences (known intentional changes) in `/tests/migration-diff.md`

**Applied to SM:**
```
For every PWA module migrated:
  1. Record expected output from React Native app (baseline)
  2. Run same action in PWA
  3. Compare: API response, UI state, data displayed
  4. Any diff → investigate before marking migration complete
```

---

### 24. Metamorphic Testing

**What it is:** When you can't easily verify the exact output, verify RELATIONSHIPS between outputs for related inputs. If input changes in a known way, output should change in a predictably related way.

**Behavior rules:**
- Define metamorphic relations: "If X, then Y should also be true"
- Example: "Searching with fewer characters should return MORE or equal results"
- Example: "Sorting ascending then reversing should equal sorting descending"
- Use for: search results, sort orders, pagination, calculated totals
- Great for APIs where you can't always predict the exact response

**Applied to SM:**
```
Metamorphic Relations for Work Order Search:
  MR1: search("WO") returns N results
       search("WO-1") returns ≤ N results  (more specific = fewer/equal)

  MR2: sort(ASC)[0] == sort(DESC)[last]   (first ASC = last DESC)

  MR3: page1.count + page2.count == totalCount  (pagination adds up)
```

---

### 25. Property-Based Testing

**What it is:** Instead of writing specific test cases with fixed inputs, define PROPERTIES that should always hold true for ANY input, then let a framework generate hundreds of random inputs to try to break the property.

**Behavior rules:**
- Use `fast-check` library with Playwright/Jest for TypeScript
- Define invariants: things that must ALWAYS be true regardless of input
- Let the framework find the minimal failing case (shrinking)
- Good for: data transformation functions, sorting, filtering, calculations

```typescript
import fc from 'fast-check';

test('search always returns subset of all work orders', () => {
  fc.assert(fc.property(fc.string(), (query) => {
    const results = searchWorkOrders(query);
    expect(results.length).toBeLessThanOrEqual(totalWorkOrders);
  }));
});
```

---

### 26. Negative Testing

**What it is:** Deliberately providing invalid, unexpected, or malicious inputs to verify the system FAILS GRACEFULLY — with correct error messages, no crashes, no data corruption.

**Behavior rules:**
- Every form field gets a dedicated negative test suite
- Test categories: null/empty, wrong type, wrong format, too long, malicious
- System MUST: show user-friendly error, NOT crash, NOT expose stack traces
- HTTP APIs MUST: return correct 4xx status codes, NOT 500 on bad input
- Never skip negative tests — they catch the bugs users actually hit

**Negative test checklist for every SM form:**
```
□ Submit empty form
□ Submit with only whitespace
□ SQL injection: ' OR '1'='1
□ XSS attempt: <script>alert('xss')</script>
□ Extremely long input (1000+ chars)
□ Unicode/emoji input: 🔥💀
□ Null bytes: \0
□ Newlines in single-line fields: \n\r
□ Numbers where text expected
□ Text where numbers expected
□ Past date where future date required
□ Negative numbers where positive required
```

---

### 27. Regression Testing

**What it is:** Re-running previously passing tests after code changes to ensure nothing that worked before has been broken.

**Behavior rules:**
- ALL Playwright tests are regression tests by default — run on every GitLab push
- Maintain a SMOKE subset (fast, critical-path only) tagged `@smoke`
- Run smoke on every commit, full suite on every merge to `develop`
- Any test that catches a regression → add a comment linking to the bug ticket
- Never delete a regression test without team approval

```typescript
test('notifications display correctly @smoke', ...);
test('work order search returns results @smoke', ...);
```

---

### 28. Smoke Testing

**What it is:** A quick, broad test pass to verify the application is stable enough for deeper testing. "Does it turn on? Does it catch fire?"

**Behavior rules:**
- Maximum runtime: **5 minutes**
- Covers only critical-path happy flows
- Run BEFORE any test suite — if smoke fails, stop and fix first
- Tag all smoke tests with `@smoke` in Playwright

**SM Smoke suite:**
```
□ App loads at testpwa URL
□ Login succeeds with valid credentials
□ Navigation between main modules works
□ Notifications tab renders
□ Work Orders list loads
□ Logout works
```

---

### 29. Sanity Testing

**What it is:** Narrow, targeted testing of a specific bug fix or new feature to confirm it works before running full regression. Faster than full regression, more focused than smoke.

**Behavior rules:**
- Run after a specific bug fix is deployed
- Test ONLY the area changed + immediate neighbors
- If sanity fails → do NOT proceed to full regression
- Document: what was fixed, what was tested, result

---

### 30. API Contract Testing

**What it is:** Verifies that the API (CakePHP backend) returns responses that match an agreed CONTRACT (schema), ensuring frontend and backend stay in sync as both evolve.

**Behavior rules:**
- Define contracts in JSON Schema or OpenAPI format in `/tests/contracts/`
- Every API endpoint used by the PWA has a contract test
- Contract tests run independently of the UI — fast and reliable
- If backend changes the response shape → contract test FAILS → negotiate change
- Use Playwright's `request` context for API contract tests

```typescript
test('GET /work_orders returns valid contract', async ({ request }) => {
  const response = await request.get('/api/work_orders.json');
  expect(response.status()).toBe(200);
  const body = await response.json();
  // validate against JSON schema
  expect(body).toMatchSchema(workOrdersSchema);
});
```

---

## ━━━ TECHNIQUE SELECTION GUIDE ━━━

When Claude writes a new test, it MUST follow this decision tree:

```
Is there a defined input space with ranges or partitions?
  YES → Use EP + BVA together

Are there multiple conditions affecting an output?
  YES → Use Decision Table

Does the feature have states (open/closed, read/unread)?
  YES → Use State Transition Testing

Are there 3+ filter parameters with multiple values?
  YES → Use Pairwise Testing

Is this a migrated feature from React Native?
  YES → Use Back-to-Back Testing

Is the exact output hard to predict but relationships are known?
  YES → Use Metamorphic Testing

Is this a new/unknown area?
  YES → Start with Exploratory Testing (chartered session)

Is this a critical business rule with many condition combos?
  YES → Use Decision Table + Cause-Effect Graphing

Is this running after a bug fix?
  YES → Sanity Test the fix, then Regression suite

Is this a pre-deploy check?
  YES → Smoke Test suite first
```

---

## ━━━ TEST FILE STRUCTURE ━━━

```
ps-site-slicer/
  tests/
    e2e/
      notifications/
        notifications-ep.spec.ts        ← Equivalence Partitioning
        notifications-bva.spec.ts        ← Boundary Value Analysis
        notifications-state.spec.ts      ← State Transition
        notifications-smoke.spec.ts      ← Smoke (@smoke tag)
      work-orders/
        work-orders-ep.spec.ts
        work-orders-pairwise.spec.ts
        work-orders-journey.spec.ts      ← Use Case / Journey
        work-orders-negative.spec.ts     ← Negative Testing
        work-orders-back2back.spec.ts    ← Migration comparison
    api/
      contracts/
        work-orders.contract.spec.ts
        notifications.contract.spec.ts
    checklists/
      negative-testing-checklist.md
      smoke-checklist.md
    sessions/
      exploratory/                       ← SBTM session notes
    risk-register.md
    migration-diff.md
  pages/                                 ← Page Object Models
    NotificationsPage.ts
    WorkOrdersPage.ts
    LoginPage.ts
```

---

## ━━━ CODING CONVENTIONS ━━━

- **Pattern:** Page Object Model (POM) for all UI interactions
- **Language:** TypeScript strict mode
- **Selectors:** Always use `data-testid` attributes — never CSS classes or XPath
- **Independence:** Every test must be fully independent — no shared state between tests
- **Naming:** `[technique]-[feature]-[scenario].spec.ts`
- **Tags:** `@smoke`, `@regression`, `@api`, `@negative`, `@migration`
- **Assertions:** Always assert the OUTCOME, not just the action
- **Comments:** Every test block must explain WHY, not just WHAT

---

## ━━━ JIRA INTEGRATION ━━━

When creating tests for a Jira ticket:
1. Add the ticket key as a comment at the top of the spec file: `// SM-1082`
2. Map test IDs to acceptance criteria: `// AC1: Tab navigation`
3. After tests pass → transition ticket to Done via Atlassian Rovo MCP
4. Failing tests → add comment to Jira ticket with failure details

**Connection:**
- Cloud ID: `68df42c0-c103-42f5-b3a7-11bd4675a76d`
- Tool: `searchJiraIssuesUsingJql` · `transitionJiraIssue` · `addCommentToJiraIssue`

---

*This file is auto-loaded by Claude Code at session start. Keep it updated as the project evolves.*
