# Flow G — Full Nightly

**Trigger:** chained schedules (one row per stage, gated by quiet hours).
**Idea:** End-to-end nocturnal cycle. Tickets enter as Jira rows, exit as KB-3 comments and transitioned tickets — but **only after healing converges**.

## Diagram (timeline)

```
  22:00 ┌──────────────────────────────┐
        │  Flow F   Eng05               │  page sync
        └───────────┬──────────────────┘
                    │
  23:00 ┌───────────▼──────────────────┐
        │  Flow B   Steps 2-7           │  bulk intake (gen)
        └───────────┬──────────────────┘
                    │
  02:00 ┌───────────▼──────────────────┐
        │  Flow A   Steps 2-9           │  per-ticket execute
        └───────────┬──────────────────┘
                    │  drops sentinels
                    ▼
  04:00 ┌──────────────────────────────┐
        │  Flow D   Eng01 + Eng02       │  suite health
        └───────────┬──────────────────┘
                    │  more sentinels
                    ▼
  06:00 ┌──────────────────────────────┐
        │  Flow E   runHealLoop + Eng04 │  drain sentinels
        └───────────┬──────────────────┘
                    │
  08:00 ┌───────────▼──────────────────┐
        │  PROMOTE   Step 10 + Step 11  │  ── only if clean ──
        │                               │
        │  for each ticket T:           │
        │    tcs = TCs(T)               │
        │    if no .test/.flaky in      │
        │       testrun/ for any tc:    │
        │         run Step 10 (post)    │
        │         run Step 11 (transit) │
        │       else:                   │
        │         skip — heal again     │
        │         tomorrow              │
        └──────────────────────────────┘
```

## The "promote when clean" gate

This is the rule that makes "try once, heal later" safe. Step 10 (Jira post) and Step 11 (transition) only fire for a ticket once **all** of its TCs have no outstanding sentinels.

### Predicate (pseudo)

```ts
function readyToPromote(ticketKey: string): boolean {
  const tcs = db.getTcTrackers().filter(t => t.ticketKey === ticketKey);
  if (tcs.length === 0) return false;
  if (tcs.some(t => t.phase !== 'results_determined')) return false;
  for (const tc of tcs) {
    const tag = `${ticketKey}_${tc.tcId}`;            // or your tag scheme
    if (existsSync(`tests/testrun/${tag}.test`))  return false;
    if (existsSync(`tests/testrun/${tag}.flaky`)) return false;
  }
  return true;
}
```

A small **Step12 PromoteIfClean** wrapper can run this predicate, then call Step 10 + Step 11 in sequence per ticket. Or it can stay outside the Step abstraction as a one-off promote routine fired by the scheduler.

## Why staggered hours

- Pipeline can only run one job at a time (`pipeline.isRunning`). Quiet hours prevent double-fire.
- Each stage waits for the previous to finish *and* for sentinel state to settle.
- Adjust offsets to your suite size.

## Outputs

End of cycle:
- Drafted features + steps for new tickets (B)
- Run results (A, D)
- Healed scenarios committed (E)
- KB-3 comments + Jira transitions for clean tickets (Promote)
- Sentinels remaining for tomorrow's heal (the unhealable / 🐞 / 🚧)

## Hand-off

Tomorrow's cycle picks up exactly where this one left off — bugs/not-implemented stay as sentinels until a human resolves them.
