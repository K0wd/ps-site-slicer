# ✅ quality.md — Software Quality Assurance Knowledge Base
> A pure, project-agnostic reference on QA principles, testing techniques, and quality standards.
> Claude MUST read this file before writing, reviewing, or planning any test activity.

---

## 🎯 QA Philosophy

- Quality is built in — not inspected in at the end
- A bug found in testing costs 10× less than a bug found in production
- Every feature has corresponding test coverage before it is marked Done
- Tests are written alongside development — not after
- No test is better than a lying test — always assert outcomes, not just actions
- Quality is everyone's responsibility — Dev, QA, and DevOps all own it together

---

## ━━━ PART 1: TESTING FUNDAMENTALS ━━━

---

### 1.1 Seven Principles of Software Testing (ISTQB)

1. **Testing shows the presence of defects** — it can prove bugs exist, never prove they don't
2. **Exhaustive testing is impossible** — use risk and priority to focus effort
3. **Early testing saves money** — shift left; find bugs as close to their source as possible
4. **Defects cluster together** — a small number of modules contain most bugs (Pareto principle)
5. **Beware of the pesticide paradox** — repeating the same tests stops finding new bugs; evolve your suite
6. **Testing is context-dependent** — what works for banking software differs from a mobile app
7. **Absence of errors fallacy** — a bug-free system that doesn't meet user needs is still a failure

---

### 1.2 Levels of Testing

Testing is performed at four distinct levels. Each has a different scope, speed, and purpose. Never collapse all testing into a single layer.

```
╔══════════════════════════════════════════════════════════╗
║  UNIT TESTING                                            ║
║  Scope:   Individual functions, methods, components      ║
║  Speed:   Very fast (milliseconds)                       ║
║  Tools:   Jest, Vitest, PHPUnit, JUnit, pytest           ║
║  Who:     Developers                                     ║
║  Target:  80% statement coverage, 75% branch coverage    ║
╠══════════════════════════════════════════════════════════╣
║  INTEGRATION TESTING                                     ║
║  Scope:   Modules working together, API endpoints        ║
║  Speed:   Fast (seconds)                                 ║
║  Tools:   Supertest, REST Assured, Playwright API        ║
║  Who:     Developers + QA                                ║
║  Target:  All API endpoints and service boundaries       ║
╠══════════════════════════════════════════════════════════╣
║  SYSTEM TESTING                                          ║
║  Scope:   Complete application end-to-end                ║
║  Speed:   Slower (minutes)                               ║
║  Tools:   Playwright, Cypress, Selenium                  ║
║  Who:     QA                                             ║
║  Target:  All acceptance criteria per requirement        ║
╠══════════════════════════════════════════════════════════╣
║  ACCEPTANCE TESTING (UAT)                                ║
║  Scope:   Business requirements and user goals           ║
║  Speed:   Variable                                       ║
║  Tools:   Manual or Cucumber/BDD                         ║
║  Who:     Stakeholders / Product Owner                   ║
║  Target:  Sign-off that software meets business needs    ║
╚══════════════════════════════════════════════════════════╝
```

---

### 1.3 Testing Types

| Type | Question it answers | When to run |
|------|---------------------|-------------|
| **Functional** | Does it do what it's supposed to? | Every feature |
| **Non-functional** | How well does it perform / scale / secure? | Performance, load, security |
| **Structural** | What code paths are covered? | Unit/integration phase |
| **Regression** | Did we break anything existing? | Every code change |
| **Smoke** | Is the build stable enough to test? | Before every test session |
| **Sanity** | Does this specific fix work? | After a bug fix is deployed |
| **Exploratory** | What did scripted tests miss? | New features, post-release |
| **Confirmation** | Is the defect actually fixed? | After a defect is resolved |
| **Migration** | Is the new version equivalent to the old? | After any system migration |

---

### 1.4 Static vs Dynamic Testing

**Static Testing** — no code execution required
- Code reviews, walkthroughs, inspections
- Linting, static analysis (ESLint, SonarQube, PHPStan)
- Document and specification reviews
- Finds defects earlier and cheaper than dynamic testing

**Dynamic Testing** — code is executed
- All techniques in Parts 2–4 of this document
- Requires a running build or environment
- Validates actual runtime behavior

---

### 1.5 The Testing Pyramid

```
        ▲
       /E2E\          ← Few, slow, high confidence, expensive to maintain
      /─────\
     /  API  \        ← More, faster, test integration points
    /─────────\
   /   UNIT    \      ← Many, fast, cheap, test logic in isolation
  /─────────────\
```

- **Unit** — the foundation. Many tests, fast feedback, low cost
- **API / Integration** — validate contracts between services and modules
- **E2E** — validate complete user journeys; keep count small, focus on critical paths
- Inverting the pyramid (many E2E, few unit) = slow, brittle, expensive test suite

---

## ━━━ PART 2: BLACK-BOX TECHNIQUES ━━━

> Test based on inputs, outputs, and behavior without knowledge of internal code.

---

### 2.1 Equivalence Partitioning (EP)

**What it is:** Divide all possible inputs into groups (partitions) where every value in the group is expected to behave identically. Test one representative value per partition instead of every possible value.

**Behavior rules:**
- Identify VALID partitions (inputs the system should accept)
- Identify INVALID partitions (inputs the system should reject)
- Write exactly ONE test per partition — never more
- Do NOT test every value within a partition — that defeats the purpose
- Always ask: "Would a different value here produce a different outcome?" If no → same partition
- Always pair with BVA — EP covers representative middle values, BVA covers edges

**Example:**
```
Field: Age input (accepts 18–65)
  Valid partition:   18–65        → test with 40
  Invalid partition: under 18     → test with 10
  Invalid partition: over 65      → test with 80
  Invalid partition: non-numeric  → test with "abc"
```

**Test template:**
```typescript
test.describe('EP: [Field/Feature Name]', () => {
  test('valid input within accepted range returns success',    ...);
  test('value below minimum is rejected with error',          ...);
  test('value above maximum is rejected with error',          ...);
  test('non-numeric input where number expected is rejected', ...);
});
```

---

### 2.2 Boundary Value Analysis (BVA)

**What it is:** Defects cluster at partition edges. Test the minimum, maximum, and values just inside and just outside each boundary.

**Behavior rules:**
- For every numeric range, test: `min-1` · `min` · `min+1` · `max-1` · `max` · `max+1`
- For string lengths, test: `0` · `1` · `max-1` · `max` · `max+1` characters
- Never skip the "just outside" values — these are where off-by-one bugs live
- ISTQB v4 2-value BVA: test only `min` and `max` of each partition boundary
- Always pair with EP — they complement each other

**Example:**
```
Field: Password length (min 8, max 64 characters)
  min-1 → 7 chars   (invalid: too short)
  min   → 8 chars   (valid: exactly minimum)
  min+1 → 9 chars   (valid: just inside)
  max-1 → 63 chars  (valid: just inside)
  max   → 64 chars  (valid: exactly maximum)
  max+1 → 65 chars  (invalid: too long)
```

**Test template:**
```typescript
test.describe('BVA: [Field/Feature Name]', () => {
  test('value at min-1 is rejected',  ...);
  test('value at min is accepted',    ...);
  test('value at min+1 is accepted',  ...);
  test('value at max-1 is accepted',  ...);
  test('value at max is accepted',    ...);
  test('value at max+1 is rejected',  ...);
});
```

---

### 2.3 Decision Table Testing

**What it is:** A matrix mapping every combination of conditions (inputs/rules) to expected actions (outputs). Ensures complete coverage of all business rule combinations.

**Behavior rules:**
- List all CONDITIONS (boolean inputs) across the top rows
- List all ACTIONS (expected outputs) at the bottom rows
- Create one column per unique combination of condition values
- For N conditions: maximum 2^N possible combinations
- Consolidate columns where outcomes are identical (don't care values)
- Always verify every rule combination with stakeholders before writing tests
- Ideal for: login rules, permission logic, multi-field form validation

**Example:**
```
| Condition              | R1 | R2 | R3 | R4 |
|------------------------|----|----|----|----|
| User is authenticated  | Y  | Y  | N  | N  |
| Account is active      | Y  | N  | Y  | N  |
|------------------------|----|----|----|----|
| Grant access           | Y  | N  | N  | N  |
| Show suspended message | N  | Y  | N  | N  |
| Redirect to login      | N  | N  | Y  | Y  |
```

**Test template:**
```typescript
test.describe('Decision Table: [Feature Name]', () => {
  test('R1: authenticated + active → access granted',    ...);
  test('R2: authenticated + inactive → suspended msg',  ...);
  test('R3: unauthenticated + active → redirect login', ...);
  test('R4: unauthenticated + inactive → redirect login',...);
});
```

---

### 2.4 State Transition Testing

**What it is:** Models a system as discrete states, events that trigger transitions, and guards/actions. Tests valid transitions, invalid transitions, and multi-step sequences.

**Behavior rules:**
- Draw the state diagram BEFORE writing any tests
- Test EVERY valid transition at least once
- Test INVALID transitions — the system must reject or ignore them gracefully
- Test SEQUENCES of transitions — not just individual hops
- States are mutually exclusive — one object occupies one state at a time
- Format: `Current State + Event [Guard] → Next State / Action`

**Example:**
```
States:   Draft → Submitted → Approved → Published
          Submitted → Rejected → Draft (revision cycle)

Valid:
  Draft     + submit()  → Submitted (action: notify reviewer)
  Submitted + approve() → Approved  (action: set approval date)
  Submitted + reject()  → Rejected  (action: reason required)
  Rejected  + revise()  → Draft     (action: clear rejection)
  Approved  + publish() → Published (action: set publish date)

Invalid:
  Draft     + approve() → REJECTED  (must be submitted first)
  Published + submit()  → REJECTED  (terminal state)
```

**Test template:**
```typescript
test.describe('State Transition: [Feature Name]', () => {
  test('[StateA] + [event] → [StateB]',                       ...);
  test('INVALID: [StateA] + [forbidden event] → rejected',    ...);
  test('sequence: [StateA] → [StateB] → [StateC]',            ...);
});
```

---

### 2.5 Use Case / User Journey Testing

**What it is:** Tests complete end-to-end paths a real user would take through the system. Based on actor goals — not features. Covers main success scenario plus alternative and failure paths.

**Behavior rules:**
- Define before writing: ACTOR · GOAL · PRECONDITION
- Write the MAIN SUCCESS SCENARIO step by step
- Write ALTERNATIVE SCENARIOS (valid deviations from the happy path)
- Write FAILURE SCENARIOS (what goes wrong and how the system recovers)
- Do NOT mock the critical path — tests must be genuinely end-to-end
- Assert the FINAL OUTCOME — not just intermediate steps

**Template:**
```
Use Case:      [Name]
Actor:         [Who performs the action]
Goal:          [What they are trying to achieve]
Precondition:  [What must be true before the flow starts]

Main Success:
  1. [Step one]
  2. [Step two]
  N. [Final outcome that satisfies the goal]

Alternative:  [Valid deviation] → [Expected system response]
Failure:      [What breaks]    → [How system recovers gracefully]
```

---

### 2.6 Pairwise / All-Pairs Testing

**What it is:** When there are 3+ parameters each with multiple values, testing all combinations is impractical. Pairwise ensures every PAIR of parameter values appears in at least one test — catching most interaction bugs with far fewer tests.

**Behavior rules:**
- Apply when you have 3+ parameters with 2+ values each
- Every (parameter A value, parameter B value) pair must appear at least once
- Use a generation tool — never manually guess pairs: `pict` · `allpairs` · `combinatorial.js`
- Reduces N^M combinations to roughly N×M tests
- Does NOT replace full combinatorial testing for safety-critical paths
- Always specify constraints between parameters in the tool

**Example:**
```
Parameters:
  Browser:    Chrome | Firefox | Safari
  OS:         Windows | macOS | Linux
  User Role:  Admin | Editor | Viewer

Full combinations: 3×3×3 = 27 tests
Pairwise:                 ≈ 9 tests covering all pairs
```

---

### 2.7 Classification Tree Method

**What it is:** Visualizes the test input space as a tree. Root = system under test. Branches = input categories. Leaves = specific values. A test case = selecting one leaf from each category.

**Behavior rules:**
- Start from the root (the feature under test)
- Branch into independent input categories (not values)
- Each category branches into its possible values (the leaves)
- A test case = exactly one selection from EACH category branch
- Ensure every leaf is covered across the full test suite
- Use to systematically discover input combinations you might otherwise miss

---

### 2.8 Error Guessing

**What it is:** An experience-based technique where testers use intuition, domain knowledge, and historical bug data to predict where defects hide and write targeted tests against those spots.

**Behavior rules:**
- ALWAYS check these universal error hotspots:
  - Empty inputs, null values, zero values
  - Extremely long strings (buffer overflow candidates)
  - Special characters: `'  "  <  >  &  %  \n  \t  \0  ;  --`
  - Negative numbers where only positive are expected
  - Concurrent actions: double-click submit · rapid navigation · simultaneous requests
  - Session expiry mid-action
  - Network interruption mid-submit
  - Browser back button after form submission
  - Timezone and locale edge cases in all date/time fields
  - Copy-paste into fields with input restrictions
  - File uploads: wrong type · oversized · zero bytes · malformed content
- Document WHY each error guessing test exists — link to a past bug or note the intuition
- Update this list whenever a production bug is found that wasn't predicted

---

### 2.9 Exploratory Testing

**What it is:** Simultaneous test design and execution with no fixed script. The tester actively learns the system while testing it, adapting based on what they discover in real time.

**Behavior rules:**
- Always define a TIME-BOXED SESSION with a specific CHARTER before starting
- Charter format: `"Explore [area] using [resources] to discover [information]"`
- Take real-time notes — screenshots · unexpected behavior · open questions · observations
- When something interesting is found → investigate deeper before moving on
- At session end, produce a debrief: bugs found · areas covered · areas NOT covered
- Do NOT convert exploratory tests into fixed scripts — they lose their discovery value
- Use for: brand new features · post-major-change validation · areas with no existing tests

**Charter template:**
```
Charter:        "Explore [module/feature] using [test data/conditions]
                 to discover [risk area / defect type]"
Duration:       60–90 minutes
Tester:         [Name]
Date:           [Date]
---
Bugs found:     [List]
Issues noted:   [List]
Areas covered:  [List]
Areas missed:   [List]
```

---

### 2.10 Checklist-Based Testing

**What it is:** A reusable list of YES/NO verifiable conditions derived from standards, past bug history, or domain knowledge. Ensures consistent coverage across test runs.

**Behavior rules:**
- Each checklist item is a single, unambiguous YES/NO verifiable condition
- Review and update the checklist after every bug found in production
- Use for: regression passes · cross-browser checks · accessibility audits · release gates
- Do NOT use as a substitute for structured test cases on new, untested features
- Organize by category: functional · security · accessibility · performance

---

### 2.11 Cause-Effect Graphing

**What it is:** A formal technique that maps CAUSES (inputs/conditions) to EFFECTS (outputs/actions) using boolean logic graphs, then derives a decision table from the graph.

**Behavior rules:**
- Identify all causes (C1, C2, C3...) and all effects (E1, E2, E3...)
- Draw logical relationships: AND · OR · NOT · REQUIRES · EXCLUDES
- Convert the completed graph into a decision table
- Derive test cases from the resulting table
- Use when a decision table would have 5+ conditions — graphing reveals redundancies
- Best for: complex multi-field form validation · multi-step wizard flows · rule engines

---

### 2.12 Orthogonal Array Testing (OAT)

**What it is:** A mathematical approach using orthogonal arrays (Taguchi method) to select a balanced subset of parameter value combinations. More rigorous than pairwise.

**Behavior rules:**
- Use when pairwise isn't sufficient but full combinatorial is impractical
- Select the correct array based on parameter count and value levels: L4 · L8 · L9 · L16 · L18
- Each column in the array = one parameter · each row = one test case
- Ensures balanced representation — no single parameter value appears disproportionately
- Use for: complex configuration screens · multi-option settings · hardware/software matrix testing

---

### 2.13 Domain Testing

**What it is:** A structured analysis of the full input domain combining EP and BVA. Identifies four specific point types: ON, OFF, IN, and OUT points.

**Behavior rules:**
- **ON point:**  exact boundary value → always test
- **OFF point:** closest value just outside the boundary → always test
- **IN point:**  a value clearly inside the valid partition → one per valid partition
- **OUT point:** a value clearly outside all valid partitions → one per invalid partition

**Example:**
```
Rule: value must be >= 18 AND <= 65

  ON:  18, 65      (exact boundaries)
  OFF: 17, 66      (just outside each boundary)
  IN:  40          (clearly inside valid range)
  OUT: 0, 100      (clearly outside valid range)
```

---

### 2.14 Combinatorial Testing

**What it is:** Systematic testing of parameter value combinations at increasing levels of interaction strength.

**Behavior rules:**
- **2-way (pairwise):**   covers all pairs   → detects ~75% of interaction bugs
- **3-way (triplewise):** covers all triples → detects ~90% of interaction bugs
- Use PICT or Allpairs to generate the optimal test set
- Declare parameter constraints: e.g., `IF Status = Closed THEN Assignee IS NOT NULL`
- Choose interaction strength based on risk — higher risk = higher t-value

---

### 2.15 Back-to-Back Testing

**What it is:** Run identical inputs through two different implementations of the same system and compare outputs. Any difference is a potential defect.

**Behavior rules:**
- Build a comparison harness that sends identical inputs to both implementations
- Flag ANY output difference — even formatting differences must be investigated
- Maintain a documented list of accepted, intentional differences
- Ideal for: version migrations · platform rewrites · algorithm replacement
- Always capture the baseline from the known-good implementation first

---

### 2.16 Metamorphic Testing

**What it is:** When the exact correct output is hard to predict, verify RELATIONSHIPS between outputs for related inputs instead.

**Behavior rules:**
- Define metamorphic relations (MR): `"If [input changes this way], then [output must change this way]"`
- Use for: search results · sort orders · pagination · aggregations · calculated totals
- Especially useful for APIs and algorithms where exact output varies with data

**Example metamorphic relations:**
```
MR1 (search specificity):
  search("a") returns N results
  search("ab") returns ≤ N results
  (more specific query → fewer or equal results)

MR2 (sort symmetry):
  sort(ascending)[first] == sort(descending)[last]

MR3 (pagination completeness):
  page1.count + page2.count + ... == totalCount
```

---

### 2.17 Negative Testing

**What it is:** Deliberately providing invalid, unexpected, or malicious inputs to verify the system FAILS GRACEFULLY — correct errors, no crashes, no data corruption or leakage.

**Behavior rules:**
- Every form field and API endpoint gets a dedicated negative test pass
- Test categories: null/empty · wrong type · wrong format · too long · malicious payloads
- System MUST: show a user-friendly error message
- System MUST NOT: crash · expose stack traces · leak internal paths · corrupt data
- HTTP APIs MUST: return correct 4xx status codes · MUST NOT return 500 on bad user input
- Never skip negative tests — these represent exactly what real users accidentally do

**Universal negative testing checklist:**
```
□ Submit completely empty form / null body
□ Submit with whitespace-only values
□ SQL injection:        ' OR '1'='1; DROP TABLE users; --
□ XSS attempt:          <script>alert('xss')</script>
□ Command injection:    ; ls -la | rm -rf /
□ Path traversal:       ../../etc/passwd
□ Extremely long input: 1000+ characters
□ Unicode and emoji:    🔥 💀 中文 العربية
□ Null byte:            \0
□ Newlines in single-line fields: \n \r \r\n
□ Number where text expected
□ Text where number expected
□ Negative number where positive required
□ Past date where future date required
□ Duplicate submission (double-click / double-submit)
□ Replay of expired or already-used token
□ Malformed JSON / XML body (API)
□ Missing required headers (API)
□ Wrong Content-Type header (API)
```

---

## ━━━ PART 3: WHITE-BOX TECHNIQUES ━━━

> Test based on internal code structure, logic paths, and execution coverage.

---

### 3.1 Statement Coverage

**What it is:** Every executable statement in the code is run at least once during testing.

**Behavior rules:**
- Minimum acceptable threshold: **80% statement coverage**
- Statements in error-handling branches count — never exclude them
- Dead code (0% hit rate) must be investigated: test it or remove it
- Tools: Istanbul/NYC · V8 · JaCoCo · PHPUnit Coverage · coverage.py

---

### 3.2 Branch Coverage (Decision Coverage)

**What it is:** Every branch of every decision point executes at both its TRUE and FALSE outcomes.

**Behavior rules:**
- Branch coverage SUBSUMES statement coverage — always prefer branch over statement alone
- Every `if` needs one test where condition is TRUE and one where it is FALSE
- Include: `else` clauses · `default` switch cases · short-circuit `&&` and `||`
- Minimum target: **75% branch coverage**
- 100% statement coverage with 50% branch coverage still has significant gaps

---

### 3.3 Condition Coverage

**What it is:** Each individual boolean sub-expression within a compound condition is tested as both true and false, independently of the overall decision outcome.

**Behavior rules:**
- For `if (A && B)` — all four condition combinations must be tested:
  - A=true/B=true · A=true/B=false · A=false/B=true · A=false/B=false
- Condition coverage does NOT guarantee branch coverage — use both
- Focus on: complex filter logic · permission checks · validation guards · authentication conditions

---

### 3.4 MC/DC — Modified Condition/Decision Coverage

**What it is:** Each individual condition must independently demonstrate the ability to affect the overall decision outcome. The gold standard for safety-critical software.

**Behavior rules:**
- For each condition C in a compound decision, two test cases must exist where:
  - All other conditions are held constant between the two cases
  - Condition C alone changes from TRUE→FALSE or FALSE→TRUE
  - The overall decision outcome changes as a direct result
- Required by aviation (DO-178C), medical device, and automotive (ISO 26262) standards
- Apply to any authentication logic, permission gates, or safety-relevant conditions

---

### 3.5 Path Coverage

**What it is:** Every possible unique execution path through the code — every unique sequence of branches — is exercised at least once.

**Behavior rules:**
- Only practical on small, isolated functions — never attempt full-application path coverage
- Use for: critical utility functions · complex data transformation logic · algorithm implementations
- Loops make paths theoretically infinite — bound loop testing to 0, 1, and 2 iterations
- Cyclomatic complexity = the minimum number of test cases needed for full branch coverage

---

## ━━━ PART 4: ADVANCED & EXPERIENCE-BASED TECHNIQUES ━━━

---

### 4.1 Mutation Testing (Fault Attack)

**What it is:** Introduce small, deliberate code changes (mutations) — flip an operator, change a constant, delete a condition — then verify your test suite DETECTS (kills) each mutation. Surviving mutations indicate assertion gaps.

**Behavior rules:**
- Use a mutation testing framework: StrykerJS · PIT (Java) · mutmut (Python)
- Common mutations: `>` ↔ `>=` · `+` ↔ `-` · `true` ↔ `false` · removed conditionals
- Mutation score target: **>60%** for critical business logic
- Low score = tests pass but don't meaningfully assert the behavior under test
- A test with no assertions will never kill any mutation

```bash
npx stryker run          # JavaScript / TypeScript
mutmut run               # Python
mvn pitest:mutationCoverage  # Java
```

---

### 4.2 Risk-Based Testing

**What it is:** Prioritize test effort by calculating risk as LIKELIHOOD of failure × IMPACT of failure. Test the highest-risk areas first and most thoroughly.

**Behavior rules:**
- Score each feature: Likelihood (1–5) × Impact (1–5) = Risk Score (max 25)
- Test in descending risk score order
- Document the assessment in a risk register and revisit after every release
- Re-score whenever: new features are added · architecture changes · production incidents occur

**Risk register template:**
```
Feature / Area          | Likelihood | Impact | Score | Priority
------------------------|------------|--------|-------|----------
Authentication          | 2          | 5      | 10    | HIGH
Payment processing      | 2          | 5      | 10    | HIGH
Search / filtering      | 4          | 3      | 12    | CRITICAL
User settings           | 3          | 2      | 6     | MEDIUM
Static content pages    | 1          | 1      | 1     | LOW
```

---

### 4.3 Session-Based Test Management (SBTM)

**What it is:** Structures exploratory testing into timed, chartered sessions with documented, measurable outputs. Makes unscripted testing accountable and reportable.

**Behavior rules:**
- Every exploratory session must have: Charter · Duration · Tester · Date
- Output must include: Bugs found | Issues noted | Questions raised | Areas covered | Areas NOT covered
- Session length: 60–120 minutes maximum before a mandatory debrief
- Store session notes systematically: `/tests/sessions/YYYY-MM-DD-charter-name.md`
- NEVER run an exploratory session without a charter — undirected clicking is not testing

---

### 4.4 Property-Based Testing

**What it is:** Define PROPERTIES (invariants) that must always hold for ANY input, then let a framework automatically generate many random inputs attempting to falsify each property.

**Behavior rules:**
- Libraries: `fast-check` (TypeScript/JS) · `hypothesis` (Python) · `QuickCheck` (Haskell) · `jqwik` (Java)
- Define properties as universal invariants — things that MUST always be true
- When a failure is found, the framework automatically shrinks to the minimal failing input
- Best for: pure functions · sorting · data transformations · parser/serializer round-trips · math

```typescript
import fc from 'fast-check';

// Property: sorting is idempotent
test('sorting twice equals sorting once', () => {
  fc.assert(fc.property(fc.array(fc.integer()), (arr) => {
    expect(sort(sort(arr))).toEqual(sort(arr));
  }));
});

// Property: filtering always returns a subset
test('filtered results never exceed total results', () => {
  fc.assert(fc.property(fc.string(), (query) => {
    expect(filter(allItems, query).length).toBeLessThanOrEqual(allItems.length);
  }));
});
```

---

### 4.5 API Contract Testing

**What it is:** Verifies that an API returns responses matching an agreed CONTRACT (schema). Ensures consumers and providers remain compatible as both evolve independently.

**Behavior rules:**
- Define contracts in JSON Schema or OpenAPI/AsyncAPI format
- Every endpoint consumed by any client must have a contract test
- Contract tests run independently of the UI — fast and stable
- Provider changes that break the contract → negotiate before merging
- Consumer-Driven Contract Testing (CDCT): the consumer defines the contract, provider must satisfy it
- Tools: Pact · Dredd · Postman/Newman · REST-assured

```typescript
test('GET /api/resource returns valid contract', async ({ request }) => {
  const response = await request.get('/api/resource');
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body).toMatchSchema(resourceSchema);
});
```

---

### 4.6 Fuzz Testing

**What it is:** Automatically generating large volumes of random, malformed, or unexpected inputs and feeding them to the system to uncover crashes, memory leaks, hangs, and security vulnerabilities.

**Behavior rules:**
- Use for: file parsers · network protocols · API endpoints · serialization/deserialization
- Tools: AFL++ · libFuzzer · Jazzer (Java) · pythonfuzz · `fast-check`
- Monitor for: crashes · hangs · unexpected exits · memory errors · assertion failures
- Any crash is a defect — even if no visible error is shown to the user
- Run in CI against critical parsing or input-handling code paths

---

### 4.7 A/B Testing (Split Testing)

**What it is:** A controlled experiment deploying two or more feature variants simultaneously to different user segments. Statistical analysis determines which variant performs better.

**Behavior rules:**
- Define the hypothesis and success metric BEFORE running the experiment
- Randomize user assignment to avoid selection bias
- Run for sufficient duration to reach statistical significance (p < 0.05)
- Change ONE variable between variants — never test multiple changes simultaneously
- Always maintain a control group (the baseline / current behavior)

---

## ━━━ PART 5: NON-FUNCTIONAL TESTING ━━━

---

### 5.1 Performance Testing

**Types:**

| Type | Purpose |
|------|---------|
| **Load Testing** | Behavior under expected normal load |
| **Stress Testing** | Behavior beyond normal capacity — find the breaking point |
| **Soak / Endurance** | Stability over extended time — find memory leaks, slow degradation |
| **Spike Testing** | Behavior under sudden extreme load increase |
| **Volume Testing** | Behavior with large amounts of data |
| **Scalability Testing** | How well the system scales with increasing load |

**Behavior rules:**
- Define performance baselines and SLAs BEFORE testing
- Common web application thresholds:
  - Page load on 4G: < 3 seconds
  - API response (list endpoints): < 500ms at p95
  - API response (detail endpoints): < 1s at p95
  - Error rate under load: < 1%
- Tools: k6 · Gatling · JMeter · Locust · Artillery
- Test in an environment mirroring production as closely as possible
- Profile before optimizing — never guess at bottlenecks

---

### 5.2 Accessibility Testing

**What it is:** Verifying the application can be used by people with disabilities, including visual, auditory, motor, and cognitive impairments.

**Behavior rules:**
- Target: **WCAG 2.1 Level AA** as the minimum standard
- Automate with: `axe-core` · `@axe-core/playwright` · `pa11y`
- Zero critical or serious axe violations allowed to ship
- Manual checks automation cannot cover:
  - Keyboard-only navigation through all interactive elements
  - Screen reader compatibility (NVDA · JAWS · VoiceOver · TalkBack)
  - Logical focus order matches visual reading order
  - Color contrast: 4.5:1 for normal text · 3:1 for large text
  - Touch targets: ≥ 44×44px on mobile interfaces
  - All images have meaningful alt text
  - All form inputs have proper label associations
  - Error messages are announced to screen readers

```typescript
import { checkA11y } from 'axe-playwright';

test('page has no accessibility violations', async ({ page }) => {
  await page.goto('/your-page');
  await checkA11y(page);
});
```

---

### 5.3 Security Testing (OWASP Top 10 — 2021)

For every form input and API endpoint, verify protection against:

```
A01 Broken Access Control
  □ Users cannot access resources belonging to other users
  □ Unauthenticated requests to protected routes are rejected (401/403)
  □ Privilege escalation attempts are blocked

A02 Cryptographic Failures
  □ Sensitive data encrypted at rest and in transit (HTTPS enforced)
  □ No sensitive data in URL parameters or application logs
  □ Strong current algorithms used (no MD5, SHA1, DES)

A03 Injection
  □ SQL injection:     ' OR '1'='1; DROP TABLE users; --
  □ NoSQL injection:   { "$gt": "" }
  □ Command injection: ; ls -la | rm -rf /
  □ LDAP injection, XPath injection

A04 Insecure Design
  □ Rate limiting on authentication endpoints
  □ Account lockout after N failed attempts
  □ Sensitive operations require re-authentication

A05 Security Misconfiguration
  □ Debug mode disabled in production
  □ Default credentials changed
  □ Unnecessary features/endpoints disabled
  □ Security headers present: CSP · HSTS · X-Frame-Options · X-Content-Type-Options

A06 Vulnerable Components
  □ No known CVEs in dependencies (npm audit / composer audit / pip-audit)
  □ Dependencies regularly updated and monitored

A07 Authentication Failures
  □ Passwords hashed with bcrypt or Argon2 (never MD5/SHA1/plain)
  □ Session tokens invalidated on logout
  □ Session fixation attacks prevented
  □ Brute force protection active on login endpoint

A08 Software and Data Integrity
  □ Subresource Integrity (SRI) on externally loaded scripts
  □ CI/CD pipeline cannot be hijacked by untrusted code contributions

A09 Logging and Monitoring Failures
  □ Failed login attempts are logged
  □ No sensitive data (passwords, tokens, PII) appears in logs
  □ Logs are tamper-evident and monitored

A10 Server-Side Request Forgery (SSRF)
  □ User-supplied URLs are validated and allowlisted
  □ Internal network not reachable via user-controlled input
```

Reference: https://owasp.org/www-project-top-ten/

---

### 5.4 Usability Testing

**What it is:** Evaluating a product by observing real users attempting real tasks — identifying usability problems and areas of confusion before they reach production.

**Behavior rules:**
- Test with representative users — not developers or testers
- Give users realistic TASKS, not instructions on HOW to complete them
- Observe silently — do not guide or help during the session
- Record: task completion rate · time-on-task · errors made · satisfaction score
- Five users typically reveal 80% of usability issues (Nielsen's Law)
- Conduct early — wireframes and prototypes are cheaper to change than shipped code

---

### 5.5 Compatibility Testing

**What it is:** Verifying the application works correctly across different browsers, operating systems, devices, screen sizes, and network conditions.

**Behavior rules:**
- Maintain an explicit compatibility matrix for every project
- Test on real devices in addition to emulators for mobile coverage
- Minimum browser coverage: latest Chrome · Firefox · Safari · Edge
- Mobile coverage: iOS Safari · Android Chrome
- Viewport widths to test: 375px · 768px · 1024px · 1440px
- Network conditions to simulate: 4G · 3G slow · offline / no connection

---

## ━━━ PART 6: TEST LIFECYCLE & PROCESS ━━━

---

### 6.1 Smoke Testing

**What it is:** A fast, broad pass verifying the build is stable enough for deeper testing. "Does it start? Does it catch fire?"

**Behavior rules:**
- Maximum runtime: **5 minutes** — if longer, it is not a smoke test
- Critical-path happy flows ONLY — no edge cases or negative paths
- Run BEFORE any other test suite — failing smoke stops all further testing
- Tag all smoke tests with `@smoke`
- Automate smoke in CI — it runs on every deployment to any environment

**Smoke test checklist:**
```
□ Application loads without errors
□ Authentication flow completes successfully
□ Primary navigation functions correctly
□ Core feature is accessible and renders
□ User can log out and session is cleared
```

---

### 6.2 Sanity Testing

**What it is:** Narrow, targeted testing of a specific bug fix or new feature to confirm it works before investing in full regression.

**Behavior rules:**
- Run after a specific fix is deployed to the test environment
- Test ONLY the changed area and its immediate functional neighbors
- If sanity fails → do NOT proceed to full regression — fix first
- Document: what was changed · what was tested · pass or fail result

---

### 6.3 Regression Testing

**What it is:** Re-running previously passing tests after any code change to verify nothing previously working has been broken.

**Behavior rules:**
- The full automated test suite IS the regression suite — run it on every merge
- Maintain a `@smoke` subset for fast per-commit checks; full suite on merge
- Any test that catches a regression → add a comment referencing the related bug
- Never delete a regression test without team discussion and approval
- The suite must be deterministic — flaky tests destroy trust in the entire suite

---

### 6.4 Confirmation Testing (Re-testing)

**What it is:** Verifying that a specific reported defect has been fixed. Distinct from regression — confirmation targets the exact defect; regression checks for unintended side effects.

**Behavior rules:**
- Execute the exact steps that originally reproduced the defect
- Verify the defect no longer reproduces in the fixed build
- Add the reproduction steps as a permanent automated test to prevent recurrence
- Only after confirmation passes should regression testing be run

---

## ━━━ PART 7: TEST DESIGN PRINCIPLES ━━━

---

### 7.1 Test Case Anatomy

Every well-formed test case must contain:

```
ID:            Unique identifier (linked to requirement or ticket)
Title:         Clear, descriptive — what behavior is being verified
Preconditions: What must be true before the test begins
Steps:         Numbered, unambiguous actions to perform
Expected:      The precise, observable outcome if the system is correct
Actual:        Populated during execution
Status:        Pass | Fail | Blocked | Skipped
```

---

### 7.2 Good Test Characteristics (FIRST Principles)

| Principle | Meaning |
|-----------|---------|
| **F**ast | Tests run quickly — slow tests get skipped |
| **I**ndependent | No test depends on another's output or side effects |
| **R**epeatable | Same result every time, in any environment |
| **S**elf-validating | Pass or fail is binary and unambiguous — no manual interpretation needed |
| **T**imely | Written alongside the code being tested, not weeks later |

---

### 7.3 Test Anti-Patterns to Avoid

```
❌ Interdependent tests      — tests that must run in a specific order
❌ Shared mutable state      — tests that modify shared data without cleanup
❌ Sleeping / fixed waits    — waitForTimeout() hides timing issues; use smart waits instead
❌ Asserting on actions      — "button was clicked" is not an outcome assertion
❌ Testing implementation    — tests that break on refactor without behavior change
❌ God tests                 — one test verifying everything; impossible to diagnose failures
❌ Commented-out tests       — fix them or delete them; comments are not version control
❌ Flaky tests               — non-deterministic results destroy trust in the entire suite
❌ No requirement traceability — tests unlinked from requirements are unauditable
❌ Production data in tests  — always use synthetic data; never real PII
```

---

### 7.4 Test Data Management

**Behavior rules:**
- Use SYNTHETIC test data — never use real production data containing PII
- Test data must be: deterministic · version-controlled · environment-independent
- Each test is responsible for creating its own data and cleaning up after itself
- Use factories or builders to generate test data programmatically
- Maintain separate data sets for: unit · integration · E2E · performance
- Never hardcode usernames, passwords, or IDs in test code — use environment variables

---

### 7.5 Page Object Model (POM)

The standard pattern for organizing UI test code. Separates page interaction logic from test assertions.

**Behavior rules:**
- Every distinct page or significant component has its own Page Object class
- Page Objects expose human-readable methods — no raw selectors in spec files
- Selectors live ONLY in the Page Object — change once, fix everywhere
- Page Objects contain NO assertions — assertions belong in spec files only
- Page Objects return `this` or other Page Objects to enable fluent chaining

```typescript
// ✅ Page Object
class LoginPage {
  constructor(private page: Page) {}

  async goto()                    { await this.page.goto('/login'); }
  async fillEmail(email: string)  { await this.page.getByTestId('email-input').fill(email); }
  async fillPassword(pwd: string) { await this.page.getByTestId('password-input').fill(pwd); }
  async submit()                  { await this.page.getByTestId('submit-btn').click(); }
}

// ✅ Spec file — assertions here, not in the Page Object
test('valid credentials grant access to dashboard', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.fillEmail('user@example.com');
  await login.fillPassword('securepassword');
  await login.submit();
  await expect(page).toHaveURL('/dashboard'); // assert the outcome
});
```

---

## ━━━ PART 8: DEFECT MANAGEMENT ━━━

---

### 8.1 Defect Lifecycle

```
New → Assigned → In Progress → Fixed → Verification → Closed
                                            ↓ (fails verification)
                                         Reopened → In Progress
```

---

### 8.2 Writing Good Bug Reports

Every defect report must contain:

```
Title:               Short, specific — describes the symptom, not the assumed cause
Environment:         OS · browser/version · build number · test environment
Severity:            Critical | High | Medium | Low
Priority:            P1 | P2 | P3 | P4
Steps to Reproduce:
  1. [Exact step that anyone can follow]
  2. [Next step]
  N. [Step that triggers the defect]
Expected Result:     [What should happen]
Actual Result:       [What actually happens]
Evidence:            Screenshot · screen recording · log output · network trace
Frequency:           Always | Intermittent (X/10 attempts) | Once observed
```

---

### 8.3 Severity vs Priority

| | Severity | Priority |
|---|---------|----------|
| **Definition** | The impact the defect has on the system | The urgency with which the defect must be fixed |
| **Set by** | QA / Tester | Product Owner / Business |
| **Example** | App crash on launch = Critical severity | Crash in a rarely-used admin page = Low priority |

These are independent — a cosmetic bug on the home page may be low severity but high priority.

---

### 8.4 Defect Severity Levels

| Level | Definition | Example |
|-------|-----------|---------|
| **Critical** | System unusable, no workaround | Application crashes on every launch |
| **High** | Major feature broken, limited workaround | Payment processing fails for 50% of users |
| **Medium** | Feature partially broken, workaround exists | Filter returns incorrect results intermittently |
| **Low** | Minor, cosmetic, minimal user impact | Button label contains a typo |

---

## ━━━ PART 9: QA METRICS & REPORTING ━━━

---

### 9.1 Key QA Metrics

| Metric | Formula | Target |
|--------|---------|--------|
| **Defect Detection Efficiency (DDE)** | Bugs in testing ÷ (bugs in testing + bugs in production) | > 90% |
| **Test Coverage** | Requirements covered ÷ total requirements | 100% for critical paths |
| **Defect Escape Rate** | Bugs in production ÷ total bugs found | < 5% |
| **Test Pass Rate** | Tests passing ÷ total executed | > 95% at release gate |
| **Mean Time to Detect (MTTD)** | Avg time from bug introduction to detection | Minimize |
| **Flaky Test Rate** | Flaky tests ÷ total tests | < 1% |
| **Blocked Tests** | Tests unable to run due to environment issues | 0 at release |

---

### 9.2 Test Report Essentials

Every test report must communicate:
- **Scope:** what was tested and what was explicitly NOT tested
- **Results summary:** passed · failed · blocked · skipped counts and trends
- **Coverage:** requirements or user stories covered by executed tests
- **Defects found:** count by severity, list of all critical/high items
- **Risk assessment:** what is safe to release, what carries known risk
- **Recommendation:** go / no-go / conditional go with documented known issues

---

## ━━━ PART 10: TECHNIQUE SELECTION GUIDE ━━━

Before writing any new test, follow this decision tree:

```
Is there a numeric or string input with defined valid ranges?
  YES → Apply EP + BVA together (always pair these two)

Are there multiple conditions that together determine an output?
  YES → Build a Decision Table first, then derive tests from it

Does the feature have distinct states (e.g., draft/published, open/closed)?
  YES → Map the State Transition diagram, then test all valid AND invalid transitions

Are there 3+ input parameters each with multiple values?
  YES → Use Pairwise Testing (generate the matrix with PICT or allpairs)

Is this a rewrite or migration of an existing system?
  YES → Apply Back-to-Back Testing against the known-good baseline

Is the exact correct output hard to predict, but relationships between outputs are known?
  YES → Define Metamorphic Relations, then test against them

Is this a new, poorly understood feature or area of the system?
  YES → Run a chartered Exploratory Testing session FIRST before scripting tests

Is the business rule complex with 5+ interacting conditions?
  YES → Use Cause-Effect Graphing to derive the Decision Table

Is this immediately after a bug fix?
  YES → Run Confirmation Testing on the exact fix, then Sanity, then full Regression

Is this a pre-deployment verification?
  YES → Run Smoke Testing first — stop all further testing if smoke fails

Is this testing any form field or API input point?
  ALWAYS → Include a Negative Testing pass regardless of other techniques applied

Is this testing pure functions, algorithms, or mathematical operations?
  CONSIDER → Property-Based Testing to automatically probe the full input space
```

---

*This is a living document. Update it when: a new technique is adopted, a production defect reveals a gap in coverage, industry standards change, or tooling evolves.*
