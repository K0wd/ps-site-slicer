# Flow H — State-Driven Dispatcher

**Trigger:** scheduler tick (every 30s — already exists).
**Idea:** Replace fixed step ranges with a tracker-phase state machine. The scheduler asks each ticket "what's the next single step you need?" and fires it.

## Diagram (state machine)

```
                  ┌─────────────┐
                  │  no row     │  ← Step 2 hasn't found this ticket
                  └─────┬───────┘
                        │
                        ▼
                  ┌─────────────┐
                  │  queued     │ → Step 3
                  └─────┬───────┘
                        ▼
                  ┌─────────────┐
                  │info_gathered│ → Step 4
                  └─────┬───────┘
                        ▼
                  ┌─────────────┐
                  │code_reviewed│ → Step 5
                  └─────┬───────┘
                        ▼
                  ┌─────────────┐
                  │plan_drafted │ → Step 6 (per TC)
                  └─────┬───────┘
                        ▼
                  ┌─────────────┐
                  │gherkin_done │ → Step 7 (per TC)
                  └─────┬───────┘
                        ▼
              ┌─────────────────────┐
              │  fully_automated    │ → Step 8 → 9
              │      OR             │
              │  impl_partial       │ → Step 7 again (cap retries)
              └─────────┬───────────┘
                        ▼
              ┌─────────────────────┐
              │ tests_executed /    │
              │ results_determined  │
              └─────────┬───────────┘
                        │
              .test or .flaky exists for this ticket?
                        │
                ┌───────┴────────┐
              YES                NO
                │                │
                ▼                ▼
          Eng03 (heal)      Step 10 → Step 11
                │                │
                └────────┬───────┘
                         ▼
                  ┌─────────────┐
                  │   blocked   │ ← any step failed; skip + alert
                  └─────────────┘
```

## Dispatcher tick (pseudo)

```ts
for (const ticket of db.getTicketTrackers()) {
  if (pipeline.isRunning) return;                    // one-at-a-time
  const next = nextStepFor(ticket);                  // table below
  if (next === null) continue;                       // nothing to do
  if (next === 'PROMOTE')   { runPromote(ticket); continue; }
  await pipeline.runSingleStep(next, ticket.ticketKey);
}

function nextStepFor(t: TicketTracker): number | 'PROMOTE' | null {
  switch (t.phase) {
    case 'queued':              return 3;
    case 'info_gathered':       return 4;
    case 'code_reviewed':       return 5;
    case 'plan_drafted':        return 6;
    case 'gherkin_done':        return 7;
    case 'impl_partial':        return t.implRetries < 2 ? 7 : null;
    case 'fully_automated':     return 8;
    case 'tests_executed':      return 9;
    case 'results_determined':
      return hasSentinels(t.ticketKey) ? 103 /* Eng03 */ : 'PROMOTE';
    case 'blocked':             return null;          // human-only
    default:                    return null;
  }
}
```

## Why this is the cleanest evolution

1. **No fragile chained ranges** — each tick fires one step.
2. **Auto-resume** — crash mid-Step-7? Next tick re-fires Step 7.
3. **Mixed-tempo work** — fast tickets blast through; slow tickets re-attempt without blocking the queue.
4. **Tracker is already populated** — `Step.ts:151` (`updateTracker`) writes phase on every step finish. The data is there; nothing to backfill.

## Caveats

- One-at-a-time pipeline is enforced by `pipeline.isRunning`. The dispatcher must respect it (just `return` and try next tick).
- Add a per-ticket retry counter to `tickets_tracker` to bound `impl_partial` re-attempts.
- `PROMOTE` is the same predicate as **Flow G**'s 08:00 gate.

## Hand-off

Replaces or augments **Flow G**'s rigid timetable. Can coexist: Flow G handles the suite-wide engineering passes (Eng02, Eng04, Eng05) while Flow H drives per-ticket progress.
