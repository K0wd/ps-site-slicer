# Healing — Fix Plan

## Analysis: Where It Bottlenecks

### Evidence from real runs

**CASCADE-1 round 1**: Prompt built (48KB), Claude called — no response ever came back. No `03-claude-response.log`. Process hung at Claude indefinitely.

**MAINT-1 round 1**: Claude fixed 2 missing steps but bddgen still failed due to 80 missing steps in *other* features. Round 2: Claude stubbed 80 steps across 4 files — but then `No tests found` (grep pattern didn't match). Round 3: hung at Claude again.

### Root causes

1. **Claude calls are the #1 time sink** — 48KB prompt, multiple tool calls, no progress visibility. User sees "Calling Claude..." then silence for minutes.
2. **No error triage** — every failure goes to Claude, even ones Claude can't fix (infra issues, config errors, 80+ missing steps).
3. **HTML context bloats prompts** — full page HTML snapshots are 30KB+, most of it irrelevant to the specific error.
4. **No heartbeat during Claude** — impossible to tell if it's working or stuck.
5. **Round carry-forward can propagate unfixable errors** — `No tests found` gets carried into the next round, Claude tries again with the same unfixable error.

---

## Fix: Error classifier + fail-fast triage

Add an error classifier at the start of phase 2 (before calling Claude). Based on the error type, either abort immediately or proceed to heal.

### Triage table

| Error Type | Detection | Action | Reason |
|---|---|---|---|
| `No tests found` | `output.includes('No tests found')` | **Abort** — mark `.test` as `not-healable` | Grep/bddgen config issue, not code |
| `CONFIG ERROR: Project not found` | `output.includes('not found. Available')` | **Abort** | Playwright config issue |
| `Missing steps: 20+` | Parse count from `Missing step definitions: N` | **Abort** — too systemic | Claude can't reliably stub 20+ steps |
| `Missing steps: 1-19` | Same parse, N < 20 | **Heal** | Claude can implement a few steps |
| `Locator timeout / element not found` | `Timeout`, `element(s) not found` | **Heal** | Claude reads HTML snapshot, fixes XPath |
| `Navigation / login timeout` | Timeout on login URL or dashboard | **Abort** — infrastructure | Server may be down, not a code fix |
| `Assertion failure` | `expected`/`received` in output | **Heal** | Claude can adjust test logic |
| `bddgen non-step error` | bddgen fails without `Missing step definitions` | **Abort** | Build/config issue |

### On abort

- Log the reason clearly: `ABORT: No tests found — not a code issue, skipping Claude`
- Don't delete the `.test` file — keep it for manual review
- Write a `summary.md` explaining why it was skipped
- Return `status: 'warn'` with a clear message

---

## Fix: Progress heartbeat during Claude calls

During the `promptStreaming` call, start a 30-second interval that logs:

```
│ Claude working... (30s elapsed)
│ Claude working... (60s elapsed, 1 tool call detected)
│ Claude working... (90s elapsed, 3 tool calls detected)
```

Track tool call count from the streaming chunks to show activity.

---

## Fix: Trim HTML context

Instead of sending the full 30KB HTML page:
1. Parse the error to find the failing XPath/locator
2. Search the HTML for the relevant DOM section (parent container)
3. Send only that section (typically 2-5KB) instead of the full page

Fallback: if we can't isolate the section, send the first 10KB instead of 30KB.

---

## Fix: Exhausted test marking

After max rounds, rename the `.test` file to `.test.exhausted` so:
- Step 102 doesn't re-create it on the next cycle
- Step 103 skips it automatically
- User can find and review all exhausted tests

---

## Implementation order

1. **Error classifier + fail-fast** — biggest impact, prevents wasted Claude calls
2. **Progress heartbeat** — user visibility during Claude calls
3. **Exhausted test marking** — prevents infinite re-processing
4. **Trim HTML context** — faster Claude responses, lower cost

---

## Expected outcome

- Unhealable errors abort in <1 second instead of waiting 5 minutes
- User always knows what's happening — heartbeat every 30s during Claude
- Only genuinely fixable errors go to Claude
- Step log tells you *why* it decided to abort or heal
- Exhausted tests don't clog the pipeline on re-runs
