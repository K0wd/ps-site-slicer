# TestGenerator Flows

Visual mechanism reference for how Steps 1-10 and Eng01-05 chain together.

> Step 11 (Transition Ticket) is **operator-only** — not part of any range run. It's invoked via the single-step panel after a human has reviewed the run.

## Building blocks

```
GENERATION (per-ticket, drafts artifacts)
  Step 1   Verify Jira Auth
  Step 2   Find Ticket(s)         ─ produces queue + tracker rows
  Step 3   Review Ticket          ─ once per ticket
  Step 4   Review Code            ─ once per ticket
  Step 5   Draft Test Plan        ─ produces tcIds (TC-1, TC-2…)
  Step 6   Write Gherkin          ─ per TC
  Step 7   Write Automated Tests  ─ per TC
  Step 8   Execute Tests          ─ per TC, drops sentinels
  Step 9   Determine Results      ─ per TC, writes 8_results.md
  Step 10  Post to KB-3           ─ once per ticket (range cap)
  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
  Step 11  Transition Ticket      ─ operator-only, post-review

ENGINEERING (suite-wide, no ticket required)
  Eng01    Check Steps            ─ missing-step inventory
  Eng02    Run Tag Suite          ─ classifies pass / flaky / fail
  Eng03    Heal Scenario          ─ consumes one .test
  Eng04    Decalcification        ─ consumes one .flaky
  Eng05    App Scraper            ─ refreshes sidebar feature
```

## Sentinels (the handoff currency)

`tests/testrun/<TAG>.test`  → scenario failed; needs Eng03 healing
`tests/testrun/<TAG>.flaky` → scenario flapped; needs Eng04 decalcification

Anything that *produces* sentinels (Step 8/9, Eng02) feeds anything that *consumes* them (Eng03 via `runHealLoop`, Eng04).

## Flow index

| File | Trigger | Range | Purpose |
|---|---|---|---|
| [A — Draft and walk away](A-draft-and-walk-away.md) | manual | 2-9 | Per-ticket pipeline, drops sentinels |
| [B — Bulk intake](B-bulk-intake.md) | nightly schedule | 2-7 | Multi-ticket gen sweep, no execution |
| [C — Quick smoke](C-quick-smoke.md) | manual | 8-9 | Run once after review, drop sentinels |
| [D — Nightly suite health](D-nightly-suite-health.md) | nightly schedule | Eng01-Eng02 | Build heal/decalc backlog |
| [E — Healing day](E-healing-day.md) | morning schedule | runHealLoop + Eng04 | Consume sentinels |
| [F — Page coverage](F-page-coverage.md) | weekly schedule | Eng05 | Refresh sidebar pages |
| [G — Full nightly](G-full-nightly.md) | chained schedules | F→B→A→D→E→Promote | End-to-end nocturnal cycle |
| [H — State-driven dispatcher](H-state-driven-dispatcher.md) | scheduler tick | tracker phase → next step | Self-driving by Jira state |
| [I — Pre-commit gate](I-pre-commit-gate.md) | git diff | Eng01-Eng02 (changed only) | Per-PR validation |

## Reading the diagrams

```
┌─ Solid box ─┐    a Step / Eng tool
│             │
└─────────────┘

──►   sequence
═══►  loops until done
··►   conditional / async

[.test]   sentinel file produced
[.flaky]  sentinel file produced
{phase}   tracker phase set
```
