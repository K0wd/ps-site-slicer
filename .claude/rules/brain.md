# 🧠 brain.md — SiteManager Project Knowledge Base
> Last updated: April 6, 2026  
> Use this file as a kick-start context for any new Claude conversation about the SiteManager project.

---

## 🔗 How to Connect to Jira (Atlassian)

**Platform:** Atlassian Rovo MCP (connected via claude.ai Connectors)  
**Site:** [https://powerslicesoftware.atlassian.net](https://powerslicesoftware.atlassian.net)  
**Cloud ID:** `68df42c0-c103-42f5-b3a7-11bd4675a76d`  
**Project Key:** `SM` (Site Manager)  
**Kanban Board:** [https://powerslicesoftware.atlassian.net/jira/software/c/projects/SM/boards/6](https://powerslicesoftware.atlassian.net/jira/software/c/projects/SM/boards/6)

### How Claude queries Jira
Claude uses the **Atlassian Rovo** MCP connector (already connected in claude.ai) with these tools:

| Tool | Purpose |
|------|---------|
| `searchJiraIssuesUsingJql` | Search/filter tickets with JQL |
| `getJiraIssue` | Get full details of a single ticket |
| `createJiraIssue` | Create new tickets |
| `editJiraIssue` | Update ticket fields |
| `transitionJiraIssue` | Move ticket status (To Do → In Progress → Done) |
| `addCommentToJiraIssue` | Add comments to tickets |
| `getAccessibleAtlassianResources` | Get the cloudId for the workspace |

### Useful JQL Queries
```
# All open tickets
project = SM AND status != Done ORDER BY updated DESC

# In Progress tickets
project = SM AND status = "In Progress"

# To Do tickets (backlog)
project = SM AND status = "To Do" ORDER BY priority ASC

# High priority tickets
project = SM AND priority in (High, Highest) AND status != Done

# Tickets assigned to Darl
project = SM AND assignee = "Darl Anthony Pepito"

# Recent tickets
project = SM ORDER BY created DESC
```

---

## 🏗️ Project Overview

**Project Name:** Site Manager (SM)  
**Company:** Powerslice Software  
**Total Tickets:** ~1,110+ (latest key: SM-1110)  
**Board Type:** Kanban

### What is SiteManager?
SiteManager is a field/site management platform with:
- A **backend** (CakePHP / traditional web stack)
- A **React Native mobile app** (legacy)
- A **PWA (Progressive Web App)** built in Next.js — currently under active development as the mobile app replacement

---

## 👥 Key People

| Name | Role | Notes |
|------|------|-------|
| **Darl Anthony Pepito** | Developer | Primary dev, assigned most PWA tickets |
| **Jason Hawsey** | Dev / DevOps | Backend & infrastructure tickets |
| **Kim Heinz** | Stakeholder / QA | Assigned to support/reporting tickets |

---

## 📌 Current Status Snapshot (as of April 2026)

### 🟡 In Progress (2 active tickets)

| Key | Title | Assignee | Priority |
|-----|-------|----------|----------|
| SM-1082 | PWA - Notification Module | Darl Anthony Pepito | High |
| SM-950 | PWA for SM Mobile *(Epic)* | Darl Anthony Pepito | Medium |

### 🔵 To Do / Backlog (notable tickets)

| Key | Title | Assignee | Priority | Type |
|-----|-------|----------|----------|------|
| SM-1110 | Set up stagepwa directory on test server | Jason Hawsey | Medium | Task |
| SM-1109 | Mobile Clock App — Configurable Non-Billable WO# | Jason Hawsey | Medium | Story |
| SM-1099 | Log Processing for errors and debug info | Darl | Medium | Task |
| SM-1089 | PWA - Work Orders Module | Darl | Medium | Story |
| SM-887 | OWASP Top 10 Security Review *(Epic)* | Unassigned | Medium | Epic |
| SM-502 | Push Prep | Unassigned | Lowest | Task |
| SM-496 | Ticket Updates and Reporting | Kim Heinz | Lowest | Task |
| SM-470 | General Support | Unassigned | Lowest | Task |

---

## 🚀 Active Workstream: PWA Migration

The primary active initiative is migrating the **React Native mobile app → Next.js PWA**.

**Repo:** [https://gitlab.com/powerslice-software-development/sm-pwa](https://gitlab.com/powerslice-software-development/sm-pwa)  
**Branch:** `develop`  
**Test URL:** [https://testserver.betacom.com/testpwa](https://testserver.betacom.com/testpwa)  
**Stage URL:** [https://testserver.betacom.com/stagepwa](https://testserver.betacom.com/stagepwa) *(being set up — SM-1110)*

### PWA Modules being migrated:
- ✅ *(various earlier modules)*
- 🟡 **Notification Module** (SM-1082) — In Progress
- 🔵 **Work Orders Module** (SM-1089) — To Do
  - Search with department filter
  - Card list, detail view, map view
  - Mark as complete

### PWA Notification Module (SM-1082) Scope:
- Tabbed: Live Photo Sessions / Rejected / System
- Unread count badges per tab
- Mark as read
- Navigate to related screen from notification

---

## 🔐 Security

- **SM-887** — OWASP Top 10 Security Review Epic (unassigned, To Do)
- Reference: [https://owasp.org/www-project-top-ten/](https://owasp.org/www-project-top-ten/)

---

## 🤖 Automation Ideas (from SM-1099)

There's a planned AI-assisted log analysis workflow:
1. Cron job grabs `error.log` and `debug.log` from `app/tmp/logs`
2. Auto-creates a Jira SM defect called `Logs {date}` assigned to Darl
3. Claude analyzes logs nightly, suggests code fixes, moves ticket to In Progress
4. Dev reviews, adjusts, implements
5. Long-term goal: zero log items via continuous fixing of technical debt

---

## 📋 How to Use This File with Claude

Paste this file (or its contents) at the start of a new Claude conversation and say:

> "Here is my brain.md. I want to work on the SiteManager Jira project. The Atlassian Rovo connector is already connected. Cloud ID is `68df42c0-c103-42f5-b3a7-11bd4675a76d` and project key is `SM`."

Claude will be immediately context-aware and ready to query tickets, create issues, or help plan work.
