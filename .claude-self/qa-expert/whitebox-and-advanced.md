# White-Box & Advanced Techniques
> White-box (code-structure) techniques + advanced/experience-based techniques.

---

## WHITE-BOX TECHNIQUES

> Test based on internal code structure, logic paths, and execution coverage.

---

### Statement Coverage

**What it is:** Every executable statement in the code is run at least once during testing.

**Behavior rules:**
- Minimum acceptable threshold: **80% statement coverage**
- Statements in error-handling branches count — never exclude them
- Dead code (0% hit rate) must be investigated: test it or remove it
- Tools: Istanbul/NYC · V8 · JaCoCo · PHPUnit Coverage · coverage.py

---

### Branch Coverage (Decision Coverage)

**What it is:** Every branch of every decision point executes at both its TRUE and FALSE outcomes.

**Behavior rules:**
- Branch coverage SUBSUMES statement coverage — always prefer branch over statement alone
- Every `if` needs one test where condition is TRUE and one where it is FALSE
- Include: `else` clauses · `default` switch cases · short-circuit `&&` and `||`
- Minimum target: **75% branch coverage**
- 100% statement coverage with 50% branch coverage still has significant gaps

---

### Condition Coverage

**What it is:** Each individual boolean sub-expression within a compound condition is tested as both true and false, independently of the overall decision outcome.

**Behavior rules:**
- For `if (A && B)` — all four condition combinations must be tested:
  - A=true/B=true · A=true/B=false · A=false/B=true · A=false/B=false
- Condition coverage does NOT guarantee branch coverage — use both
- Focus on: complex filter logic · permission checks · validation guards · authentication conditions

---

### MC/DC — Modified Condition/Decision Coverage

**What it is:** Each individual condition must independently demonstrate the ability to affect the overall decision outcome. The gold standard for safety-critical software.

**Behavior rules:**
- For each condition C in a compound decision, two test cases must exist where:
  - All other conditions are held constant between the two cases
  - Condition C alone changes from TRUE→FALSE or FALSE→TRUE
  - The overall decision outcome changes as a direct result
- Required by aviation (DO-178C), medical device, and automotive (ISO 26262) standards
- Apply to any authentication logic, permission gates, or safety-relevant conditions

---

### Path Coverage

**What it is:** Every possible unique execution path through the code — every unique sequence of branches — is exercised at least once.

**Behavior rules:**
- Only practical on small, isolated functions — never attempt full-application path coverage
- Use for: critical utility functions · complex data transformation logic · algorithm implementations
- Loops make paths theoretically infinite — bound loop testing to 0, 1, and 2 iterations
- Cyclomatic complexity = the minimum number of test cases needed for full branch coverage

---

## ADVANCED & EXPERIENCE-BASED TECHNIQUES

---

### Mutation Testing (Fault Attack)

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

### Risk-Based Testing

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

### Session-Based Test Management (SBTM)

**What it is:** Structures exploratory testing into timed, chartered sessions with documented, measurable outputs. Makes unscripted testing accountable and reportable.

**Behavior rules:**
- Every exploratory session must have: Charter · Duration · Tester · Date
- Output must include: Bugs found | Issues noted | Questions raised | Areas covered | Areas NOT covered
- Session length: 60–120 minutes maximum before a mandatory debrief
- Store session notes systematically: `/tests/sessions/YYYY-MM-DD-charter-name.md`
- NEVER run an exploratory session without a charter — undirected clicking is not testing

---

### Property-Based Testing

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

### API Contract Testing

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

### Fuzz Testing

**What it is:** Automatically generating large volumes of random, malformed, or unexpected inputs and feeding them to the system to uncover crashes, memory leaks, hangs, and security vulnerabilities.

**Behavior rules:**
- Use for: file parsers · network protocols · API endpoints · serialization/deserialization
- Tools: AFL++ · libFuzzer · Jazzer (Java) · pythonfuzz · `fast-check`
- Monitor for: crashes · hangs · unexpected exits · memory errors · assertion failures
- Any crash is a defect — even if no visible error is shown to the user
- Run in CI against critical parsing or input-handling code paths

---

### A/B Testing (Split Testing)

**What it is:** A controlled experiment deploying two or more feature variants simultaneously to different user segments. Statistical analysis determines which variant performs better.

**Behavior rules:**
- Define the hypothesis and success metric BEFORE running the experiment
- Randomize user assignment to avoid selection bias
- Run for sufficient duration to reach statistical significance (p < 0.05)
- Change ONE variable between variants — never test multiple changes simultaneously
- Always maintain a control group (the baseline / current behavior)

---

*See also: `blackbox-core.md`, `blackbox-advanced.md` for input-based techniques.*
