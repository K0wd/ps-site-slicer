# Black-Box Techniques — Advanced
> Pairwise, combinatorial, experience-based, and specialized black-box techniques.

---

## 6. Pairwise / All-Pairs Testing

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

## 7. Classification Tree Method

**What it is:** Visualizes the test input space as a tree. Root = system under test. Branches = input categories. Leaves = specific values. A test case = selecting one leaf from each category.

**Behavior rules:**
- Start from the root (the feature under test)
- Branch into independent input categories (not values)
- Each category branches into its possible values (the leaves)
- A test case = exactly one selection from EACH category branch
- Ensure every leaf is covered across the full test suite
- Use to systematically discover input combinations you might otherwise miss

---

## 8. Error Guessing

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

## 9. Exploratory Testing

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

## 10. Checklist-Based Testing

**What it is:** A reusable list of YES/NO verifiable conditions derived from standards, past bug history, or domain knowledge. Ensures consistent coverage across test runs.

**Behavior rules:**
- Each checklist item is a single, unambiguous YES/NO verifiable condition
- Review and update the checklist after every bug found in production
- Use for: regression passes · cross-browser checks · accessibility audits · release gates
- Do NOT use as a substitute for structured test cases on new, untested features
- Organize by category: functional · security · accessibility · performance

---

## 11. Cause-Effect Graphing

**What it is:** A formal technique that maps CAUSES (inputs/conditions) to EFFECTS (outputs/actions) using boolean logic graphs, then derives a decision table from the graph.

**Behavior rules:**
- Identify all causes (C1, C2, C3...) and all effects (E1, E2, E3...)
- Draw logical relationships: AND · OR · NOT · REQUIRES · EXCLUDES
- Convert the completed graph into a decision table
- Derive test cases from the resulting table
- Use when a decision table would have 5+ conditions — graphing reveals redundancies
- Best for: complex multi-field form validation · multi-step wizard flows · rule engines

---

## 12. Orthogonal Array Testing (OAT)

**What it is:** A mathematical approach using orthogonal arrays (Taguchi method) to select a balanced subset of parameter value combinations. More rigorous than pairwise.

**Behavior rules:**
- Use when pairwise isn't sufficient but full combinatorial is impractical
- Select the correct array based on parameter count and value levels: L4 · L8 · L9 · L16 · L18
- Each column in the array = one parameter · each row = one test case
- Ensures balanced representation — no single parameter value appears disproportionately
- Use for: complex configuration screens · multi-option settings · hardware/software matrix testing

---

## 13. Domain Testing

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

## 14. Combinatorial Testing

**What it is:** Systematic testing of parameter value combinations at increasing levels of interaction strength.

**Behavior rules:**
- **2-way (pairwise):**   covers all pairs   → detects ~75% of interaction bugs
- **3-way (triplewise):** covers all triples → detects ~90% of interaction bugs
- Use PICT or Allpairs to generate the optimal test set
- Declare parameter constraints: e.g., `IF Status = Closed THEN Assignee IS NOT NULL`
- Choose interaction strength based on risk — higher risk = higher t-value

---

## 15. Back-to-Back Testing

**What it is:** Run identical inputs through two different implementations of the same system and compare outputs. Any difference is a potential defect.

**Behavior rules:**
- Build a comparison harness that sends identical inputs to both implementations
- Flag ANY output difference — even formatting differences must be investigated
- Maintain a documented list of accepted, intentional differences
- Ideal for: version migrations · platform rewrites · algorithm replacement
- Always capture the baseline from the known-good implementation first

---

## 16. Metamorphic Testing

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

## 17. Negative Testing

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

*See also: `blackbox-core.md` for EP, BVA, Decision Tables, State Transition, Use Case testing.*
