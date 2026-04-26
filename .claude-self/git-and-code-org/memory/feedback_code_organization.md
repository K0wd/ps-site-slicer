---
name: Code organization principles
description: Follow existing project structure, keep code simple, no premature abstractions
type: feedback
---

Follow existing project structure, naming patterns, and conventions before adding new code.

**Why:** Consistent code organization reduces cognitive load and prevents drift. Over-engineering (unnecessary helpers, premature abstractions, speculative features) creates maintenance burden.

**How to apply:**
- Before writing code, read the project's existing structure and conventions
- Match naming patterns, file organization, and code style already in use
- Keep implementations simple — three similar lines is better than a premature abstraction
- Don't add features, refactor code, or make "improvements" beyond what was asked
- Don't add error handling for scenarios that can't happen
- Run tests after every change to verify nothing broke
