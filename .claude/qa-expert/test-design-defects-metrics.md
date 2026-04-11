# Test Design, Defect Management, Metrics & Technique Selection
> Test case anatomy, FIRST principles, anti-patterns, POM, defect lifecycle, QA metrics, and the technique selection guide.

---

## TEST DESIGN PRINCIPLES

---

### Test Case Anatomy

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

### Good Test Characteristics (FIRST Principles)

| Principle | Meaning |
|-----------|---------|
| **F**ast | Tests run quickly — slow tests get skipped |
| **I**ndependent | No test depends on another's output or side effects |
| **R**epeatable | Same result every time, in any environment |
| **S**elf-validating | Pass or fail is binary and unambiguous — no manual interpretation needed |
| **T**imely | Written alongside the code being tested, not weeks later |

---

### Test Anti-Patterns to Avoid

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

### Test Data Management

**Behavior rules:**
- Use SYNTHETIC test data — never use real production data containing PII
- Test data must be: deterministic · version-controlled · environment-independent
- Each test is responsible for creating its own data and cleaning up after itself
- Use factories or builders to generate test data programmatically
- Maintain separate data sets for: unit · integration · E2E · performance
- Never hardcode usernames, passwords, or IDs in test code — use environment variables

---

### Page Object Model (POM)

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

## DEFECT MANAGEMENT

---

### Defect Lifecycle

```
New → Assigned → In Progress → Fixed → Verification → Closed
                                            ↓ (fails verification)
                                         Reopened → In Progress
```

---

### Writing Good Bug Reports

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

### Severity vs Priority

| | Severity | Priority |
|---|---------|----------|
| **Definition** | The impact the defect has on the system | The urgency with which the defect must be fixed |
| **Set by** | QA / Tester | Product Owner / Business |
| **Example** | App crash on launch = Critical severity | Crash in a rarely-used admin page = Low priority |

These are independent — a cosmetic bug on the home page may be low severity but high priority.

---

### Defect Severity Levels

| Level | Definition | Example |
|-------|-----------|---------|
| **Critical** | System unusable, no workaround | Application crashes on every launch |
| **High** | Major feature broken, limited workaround | Payment processing fails for 50% of users |
| **Medium** | Feature partially broken, workaround exists | Filter returns incorrect results intermittently |
| **Low** | Minor, cosmetic, minimal user impact | Button label contains a typo |

---

## QA METRICS & REPORTING

---

### Key QA Metrics

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

### Test Report Essentials

Every test report must communicate:
- **Scope:** what was tested and what was explicitly NOT tested
- **Results summary:** passed · failed · blocked · skipped counts and trends
- **Coverage:** requirements or user stories covered by executed tests
- **Defects found:** count by severity, list of all critical/high items
- **Risk assessment:** what is safe to release, what carries known risk
- **Recommendation:** go / no-go / conditional go with documented known issues

---

## TECHNIQUE SELECTION GUIDE

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
