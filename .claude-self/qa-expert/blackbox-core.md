# Black-Box Techniques — Core
> Test based on inputs, outputs, and behavior without knowledge of internal code.

---

## 1. Equivalence Partitioning (EP)

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

## 2. Boundary Value Analysis (BVA)

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

## 3. Decision Table Testing

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

## 4. State Transition Testing

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

## 5. Use Case / User Journey Testing

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

*See also: `blackbox-advanced.md` for Pairwise, Error Guessing, Exploratory, Negative Testing, and more.*
