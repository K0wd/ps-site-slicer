# Flow A — Draft and Walk Away

**Trigger:** manual UI run (single ticket key) or scheduled JQL filter.
**Range:** 2 → 9.
**Idea:** Generate everything for one ticket, attempt to run once, leave failures as sentinels.

## Diagram

```
                    ┌──────────────────────┐
                    │  Step 2 — Find Ticket │
                    │   {phase: queued}     │
                    └──────────┬────────────┘
                               │
              ┌────────────────▼─────────────────┐
              │ Step 3  Review Ticket            │ {info_gathered}
              │ Step 4  Review Code              │ {code_reviewed}
              │ Step 5  Draft Test Plan          │ {plan_drafted}
              └────────────────┬─────────────────┘
                               │  produces tcIds
                               │
        ┌──────────────────────▼──────────────────────┐
        │  PER-TC LOOP   (tcId in [TC-1, TC-2, …])     │
        │                                              │
        │   Step 6  Write Gherkin     {gherkin_done}   │
        │   Step 7  Write Auto Tests  {fully_automated │
        │                              | impl_partial} │
        │   Step 8  Execute Tests     {tests_executed} │
        │   Step 9  Determine Results {results_       │
        │                                determined}   │
        │                                              │
        │      on fail → drop [TAG.test] sentinel      │
        │      on flap → drop [TAG.flaky] sentinel     │
        └──────────────────────┬───────────────────────┘
                               │
                       ┌───────▼───────┐
                       │     STOP      │
                       │  (no 10/11)   │
                       └───────────────┘
```

## Why stop at 9

Step 10 posts to Jira (KB-3) and Step 11 transitions the ticket. Doing either before healing converges spams Jira with "broken" verdicts. Sentinels carry the unfinished work into Flow E.

## Outputs

- `logs/<TICKET>/5_plan.md`, `6_gherkin*.md`, `7_*.feature`, `7_*.steps.ts`
- `logs/<TICKET>/<runDir>/8_results_<tcId>.md`
- `tests/testrun/<TAG>.test` and/or `<TAG>.flaky` for failed/flapped TCs
- Tracker phase ends in `tests_executed` / `results_determined` / `blocked`

## Hand-off

Sentinels feed **Flow E (Healing day)**.
Tracker rows feed **Flow H (Dispatcher)**.
