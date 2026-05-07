# Flow F — Page Coverage

**Trigger:** weekly schedule (before Flow D).
**Range:** Eng05 alone.
**Idea:** Keep `sidebar-navigation.feature` in sync with the live app.

## Diagram

```
  schedule fires
        │
        ▼
  ┌──────────────────────────────────────┐
  │ Eng05 — App Scraper                   │
  │   1. read sidebar-navigation.feature  │
  │   2. discover live pages (sidebar     │
  │      crawl)                           │
  │   3. diff                             │
  │   4. update Examples table rows       │
  │   5. snapshot HTML to html/<slug>/    │
  └──────────────┬────────────────────────┘
                 │
                 ▼
  tests/features/sidebar-navigation.feature   updated
  html/<slug>/...                             snapshots
```

## Why before Flow D

Eng02 will exercise sidebar-navigation as part of the suite. Running Eng05 first means new pages get tested the same night they appear in the app — no week-long lag.

## Outputs

- Updated `tests/features/sidebar-navigation.feature`
- Page HTML snapshots under `html/`

## Hand-off

`Eng02` (in **Flow D**) picks up the refreshed feature on the next run.
