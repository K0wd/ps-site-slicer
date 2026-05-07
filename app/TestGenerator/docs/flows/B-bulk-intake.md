# Flow B — Bulk Intake

**Trigger:** schedule (e.g. nightly 23:00) with a JQL filter.
**Range:** 2 → 7.
**Idea:** Sweep many tickets through code-gen only — no Playwright runs, no sentinels yet.

## Diagram

```
   schedule fires  (filter = "project = SM AND status = 'Ready for QA'")
        │
        ▼
  ┌──────────────────────┐
  │ Step 2 — Find Ticket │  many tickets discovered
  │ {phase: queued × N}  │
  └──────────┬───────────┘
             │
   ┌─────────▼─────────────────────────────────────────┐
   │  PER-TICKET LOOP  (ticket in [SM-1, SM-2, …])      │
   │                                                    │
   │    Step 3  Review Ticket          {info_gathered}  │
   │    Step 4  Review Code            {code_reviewed}  │
   │    Step 5  Draft Test Plan        {plan_drafted}   │
   │                                                    │
   │       PER-TC LOOP                                  │
   │         Step 6  Write Gherkin     {gherkin_done}   │
   │         Step 7  Write Auto Tests  {fully_         │
   │                                     automated}     │
   │                                                    │
   └──────────────┬─────────────────────────────────────┘
                  │
            ┌─────▼─────┐
            │   STOP    │   no execution this pass
            └───────────┘
```

## Why stop at 7

Pure code-gen sweep is cheap (Claude tokens only — no browser). Engineers wake up to fresh `.feature` + `.steps.ts` files for review. Execution is deferred to **Flow A** or **Flow C**.

## Outputs

- New `tests/features/<TAG>.feature`
- New `tests/steps/<TAG>.steps.ts`
- Tracker phases end in `gherkin_done` / `fully_automated` / `impl_partial`

## Hand-off

- Engineers review and merge the generated PRs.
- Once merged, **Flow C** runs 8-9 to surface failures as sentinels.
- Or **Flow A** at 02:00 picks up where this left off in one shot.
