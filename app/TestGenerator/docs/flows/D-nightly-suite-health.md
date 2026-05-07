# Flow D — Nightly Suite Health

**Trigger:** nightly schedule (after Flow B).
**Range:** Eng01 → Eng02.
**Idea:** Run the entire tag suite, classify, and write the heal/decalc backlog.

## Diagram

```
  schedule fires
        │
        ▼
  ┌──────────────────────────────┐
  │ Eng01 — Check Steps           │
  │  scans .feature files for     │
  │  steps with no binding        │
  │  → testrun/summary.json       │
  └──────────────┬────────────────┘
                 │
                 ▼
  ┌──────────────────────────────────────┐
  │ Eng02 — Run Tag Suite                 │
  │  for tag in all-tags:                 │
  │    run N times                        │
  │    classify: stable-pass /            │
  │              stable-fail /            │
  │              flaky                    │
  │  → posts new outcomes to KB-3         │
  │  → writes [.test] / [.flaky]          │
  └──────────────┬────────────────────────┘
                 │
                 ▼
   tests/testrun/  fills with sentinels
        ├─ TAG-A.test     (stable-fail)
        ├─ TAG-B.flaky    (intermittent)
        └─ TAG-C.test     (stable-fail)
```

## Why Eng01 first

Eng01 surfaces *missing step bindings* before they pollute Eng02 results with avoidable failures. Cheap, fast, no Playwright.

## Outputs

- `tests/testrun/summary.json` (Eng01)
- `tests/testrun/<TAG>.test` (Eng02 stable-fail)
- `tests/testrun/<TAG>.flaky` (Eng02 flaky)
- KB-3 history comments per tag (only when outcome changes)

## Hand-off

Sentinels feed **Flow E (Healing day)**.
