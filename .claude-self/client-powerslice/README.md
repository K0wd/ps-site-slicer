# Client: Powerslice (SiteManager)

Project-specific knowledge for the Powerslice SiteManager application. This persona gives Claude deep context about the product, team, Jira project, active workstreams, and cross-project relationships.

## What's Included

| File | Purpose |
|---|---|
| `brain.md` | SiteManager knowledge base — Jira connection, key people, active work, PWA migration status |
| `wiki.md` | Full Jira project wiki — 1,110+ tickets, workstreams, modules, tech stack, useful JQL |
| `CLAUDE.md` | Master project instructions — mandatory reads, key rules, project context and structure |
| `settings.local.json` | Project-level Claude permissions |
| `rules/sibling-projects-context.mdc` | Cross-project relationships and inter-service context |

## Project Summary

- **App:** SiteManager — field service management PWA by Powerslice Software
- **Test target:** `https://testserver.betacom.com/` (SPA login at `/spa/auth/login`)
- **Stack:** CakePHP backend, React Native mobile, Next.js PWA, Playwright + BDD for testing
- **Browser:** MS Edge (`msedge` channel)
- **Jira:** Project key `SM`, 1,110+ tickets
- **Key people:** Darl Anthony Pepito, Jason Hawsey, Kim Heinz

## Active Workstreams
- PWA Migration (SM-950) — 17+ modules being migrated
- Vendor Admin AG Grid Revamp (SM-862)
- OWASP Top 10 Security Review (SM-887)

## Setup

Copy into your ps-site-slicer project:
```
ps-site-slicer/
├── CLAUDE.md
├── .claude/
│   ├── wiki.md
│   └── settings.local.json
└── rules/
    ├── brain.md
    └── sibling-projects-context.mdc
```
