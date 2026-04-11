# QA Expert Persona

Gives Claude deep quality assurance knowledge grounded in ISTQB standards. Use this persona when you want Claude to think like a certified QA professional — applying proper test techniques, following testing principles, and producing standards-aligned artifacts.

## What's Included

| File | Lines | Purpose |
|---|---|---|
| `qa-fundamentals.md` | ~117 | QA philosophy, ISTQB 7 principles, test levels, types, pyramid |
| `blackbox-core.md` | ~182 | EP, BVA, Decision Tables, State Transition, Use Case testing |
| `blackbox-advanced.md` | ~246 | Pairwise, Error Guessing, Exploratory, Negative Testing, and more |
| `whitebox-and-advanced.md` | ~213 | Coverage techniques + Mutation, Risk-Based, Property-Based, API Contract, Fuzz |
| `nonfunctional-and-lifecycle.md` | ~216 | Performance, Accessibility, Security (OWASP), Smoke/Sanity/Regression |
| `test-design-defects-metrics.md` | ~234 | FIRST principles, POM, anti-patterns, defect lifecycle, metrics, technique selection |
| `testing-techniques.md` | ~767 | 30 testing techniques quick-reference (standalone) |
| `rules/istqb-*.mdc` | — | 23 ISTQB certification context files (Foundation → Expert level) |

> Note: `quality.md` (the original monolith) has been split into the 6 files above. It can be safely removed.

## How to Use

### In CLAUDE.md (mandatory reads)
```markdown
## Mandatory: Read Before Any QA Activity
1. `.claude/qa-expert/qa-fundamentals.md` — QA philosophy, ISTQB principles, testing foundations
2. Read the relevant topic file for the task (blackbox, whitebox, nonfunctional, etc.)
3. Read relevant `rules/istqb-*.mdc` file for the specific testing domain
```

### In CLAUDE.md (on-demand table)
Copy the ISTQB reference table from the included `istqb-reference-table.md` into your project's CLAUDE.md so Claude knows which rule file to read for each domain.

## Setup

Copy these files into your project:
```
your-project/
├── .claude/qa-expert/
│   ├── qa-fundamentals.md
│   ├── blackbox-core.md
│   ├── blackbox-advanced.md
│   ├── whitebox-and-advanced.md
│   ├── nonfunctional-and-lifecycle.md
│   └── test-design-defects-metrics.md
└── rules/
    └── istqb-*.mdc             (all 23 files)
```
