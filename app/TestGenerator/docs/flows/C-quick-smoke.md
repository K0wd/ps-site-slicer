# Flow C — Quick Smoke

**Trigger:** manual, after Flow B has produced features/steps.
**Range:** 8 → 9 for one ticket.
**Idea:** "Try once" — surface failures as sentinels without re-doing generation.

## Diagram

```
   user picks ticket from Flow B's queue (phase = fully_automated)
        │
        ▼
  ┌────────────────────────────┐
  │ Step 8 — Execute Tests     │   per TC
  │ {phase: tests_executed}    │
  └──────────────┬─────────────┘
                 │
                 ▼
  ┌────────────────────────────┐
  │ Step 9 — Determine Results │   per TC
  │ {phase: results_determined}│
  └──────────────┬─────────────┘
                 │
       on fail / flap
                 │
                 ▼
        [TAG.test]  [TAG.flaky]   sentinels written

  ──►  STOP   (no 10/11)
```

## Why this exists separately from Flow A

Flow A re-runs Steps 3-7 even when those artifacts haven't changed. Flow C is the surgical "I trust the gen output, just go try it." Use after merging a Flow B PR.

## Outputs

- `logs/<TICKET>/<runDir>/8_results_<tcId>.md`
- `tests/testrun/<TAG>.test` / `<TAG>.flaky`

## Hand-off

Sentinels feed **Flow E (Healing day)**.
