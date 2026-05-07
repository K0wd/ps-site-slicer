# Flow E — Healing Day

**Trigger:** morning schedule, after Flow A and Flow D.
**Range:** `runHealLoop` (Eng03 looped) → Eng04.
**Idea:** Drain the sentinel backlog. The only flow that *consumes* `.test` / `.flaky` files.

## Diagram

```
  schedule fires
        │
        ▼
  ┌─────────────────────────────────────────┐
  │  runHealLoop  (max 20 iterations)        │
  │                                          │
  │   while testrun/*.test exists:           │
  │     pick first .test                     │
  │     ┌──────────────────────────────┐     │
  │     │ Eng03 — Heal Scenario         │═══▶│ rounds × 2
  │     │  attempts fix                 │     │
  │     │  re-runs to verify            │     │
  │     └──────┬───────────────────────┘     │
  │            │                              │
  │     ┌──────▼─────────────────────────┐   │
  │     │ classify outcome               │   │
  │     │  ✓ healed   → remove .test     │   │
  │     │  🐞 bug      → KB-3 + leave    │   │
  │     │  🚧 not-impl → KB-3 + leave    │   │
  │     │  ✗ exhausted → STOP loop       │   │
  │     └────────────────────────────────┘   │
  └─────────────────┬────────────────────────┘
                    │
                    ▼
  ┌─────────────────────────────────────────┐
  │ Eng04 — Decalcification                 │
  │   for each [.flaky]:                    │
  │     attempt stabilization fix           │
  │     verify with N runs                  │
  │     ✓ stable  → remove .flaky           │
  │     ✗ exhausted → leave for human       │
  └─────────────────────────────────────────┘
                    │
                    ▼
       Heal-loop summary posted to KB-3
       (per-scenario journey + aggregate)
```

## Loop semantics

`runHealLoop` is built into the Pipeline. It picks the *first* `.test` file each iteration; healing one reveals the next. Stops when:
- no more `.test` files (clean), or
- one is unhealable (heal-exhausted), or
- 20 iterations hit (cap).

## Outputs

- Edited `tests/steps/*.steps.ts` (the fix)
- Removed sentinels (on success)
- KB-3 comment with full healing report
- `bugs[]` and `notImplemented[]` lists for human review

## Hand-off

After Flow E completes, tickets whose TC sentinels are *all* gone become eligible for the **promote step** in Flow G — Steps 10 and 11.
