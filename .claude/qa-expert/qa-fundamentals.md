# QA Fundamentals — Philosophy, Principles & Testing Foundations
> Part of the Software Quality Assurance Knowledge Base (split from quality.md)

---

## QA Philosophy

- Quality is built in — not inspected in at the end
- A bug found in testing costs 10× less than a bug found in production
- Every feature has corresponding test coverage before it is marked Done
- Tests are written alongside development — not after
- No test is better than a lying test — always assert outcomes, not just actions
- Quality is everyone's responsibility — Dev, QA, and DevOps all own it together

---

## Seven Principles of Software Testing (ISTQB)

1. **Testing shows the presence of defects** — it can prove bugs exist, never prove they don't
2. **Exhaustive testing is impossible** — use risk and priority to focus effort
3. **Early testing saves money** — shift left; find bugs as close to their source as possible
4. **Defects cluster together** — a small number of modules contain most bugs (Pareto principle)
5. **Beware of the pesticide paradox** — repeating the same tests stops finding new bugs; evolve your suite
6. **Testing is context-dependent** — what works for banking software differs from a mobile app
7. **Absence of errors fallacy** — a bug-free system that doesn't meet user needs is still a failure

---

## Levels of Testing

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

## Testing Types

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

## Static vs Dynamic Testing

**Static Testing** — no code execution required
- Code reviews, walkthroughs, inspections
- Linting, static analysis (ESLint, SonarQube, PHPStan)
- Document and specification reviews
- Finds defects earlier and cheaper than dynamic testing

**Dynamic Testing** — code is executed
- All techniques in the black-box, white-box, and advanced technique files
- Requires a running build or environment
- Validates actual runtime behavior

---

## The Testing Pyramid

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

*See also: `blackbox-core.md`, `blackbox-advanced.md`, `whitebox-and-advanced.md`, `nonfunctional-and-lifecycle.md`, `test-design-defects-metrics.md`*
