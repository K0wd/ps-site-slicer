# Flow I — Pre-Commit Gate

**Trigger:** git pre-push hook or CI on PR.
**Range:** Eng01 + Eng02 (scoped to changed tags only).
**Idea:** Per-PR validation. Faster than the nightly suite, no draft work, no healing.

## Diagram

```
  developer pushes branch
        │
        ▼
  ┌──────────────────────────────────────┐
  │ git diff origin/master --name-only   │
  │   → list of changed *.feature        │
  │     and *.steps.ts files             │
  └──────────────┬───────────────────────┘
                 │
                 ▼
  ┌──────────────────────────────────────┐
  │ extract @TAG from each changed       │
  │ feature; cross-reference steps       │
  │ to find tags that import them        │
  │   → CHANGED_TAGS = [TAG-A, TAG-B]    │
  └──────────────┬───────────────────────┘
                 │
        empty?  YES → exit 0 (nothing test-related changed)
                 │ NO
                 ▼
  ┌──────────────────────────────────────┐
  │ Eng01 — scoped to CHANGED_TAGS       │
  │   any missing-step bindings?         │
  └──────────────┬───────────────────────┘
                 │ pass
                 ▼
  ┌──────────────────────────────────────┐
  │ Eng02 — scoped to CHANGED_TAGS       │
  │   run N times; classify              │
  └──────────────┬───────────────────────┘
                 │
        ┌────────┴─────────┐
   stable-pass         stable-fail / flaky
        │                   │
        ▼                   ▼
     exit 0           exit 1 + comment on PR
                      with sentinel + reason
```

## Why scoped

Running the full suite on every PR is too slow. Touching one feature should validate that one feature's tags. Suite-wide regressions are caught by **Flow D** at night.

## What this rejects

- New Gherkin steps without bindings (Eng01)
- Edits that turn a previously stable tag into stable-fail or flaky (Eng02 history)

## What this does NOT do

- No code generation
- No healing
- No Jira posting

Pure gate. If it fails, the dev sees the sentinel reason and fixes it locally before merging.

## Hand-off

On merge, **Flow B** picks up any new tickets the next night, **Flow D** runs the full suite, and the cycle continues.
