# SiteManager (SM) Jira Project Wiki

> Generated: April 7, 2026
> Source: Jira project SM @ powerslicesoftware.atlassian.net
> Cloud ID: `68df42c0-c103-42f5-b3a7-11bd4675a76d`

---

## Project Overview

**Project:** Site Manager (SM)
**Company:** Powerslice Software
**Total Tickets:** ~1,110+ (SM-1 through SM-1110)
**Board:** [Kanban Board](https://powerslicesoftware.atlassian.net/jira/software/c/projects/SM/boards/6)

SiteManager is a field/site management platform consisting of:
- **Backend** - CakePHP web application
- **React Native Mobile App** - legacy, being replaced
- **PWA (Progressive Web App)** - Next.js, actively under development as mobile replacement

---

## Key People

| Name | Role | Focus |
|------|------|-------|
| **Darl Anthony Pepito** | Developer | Primary PWA developer, assigned most SM-950 child tickets |
| **Jason Hawsey** | Dev / DevOps | Backend, infrastructure, server setup, CI/CD |
| **Kim Heinz** | Stakeholder / QA | QA testing, Vendor Admin module, regression testing |
| **Austin Johnson** | Developer (early) | Assigned to early tickets (SM-1 through SM-15 era) |
| **Alik Jakal** | Developer (early) | Early quoting tracker work |

---

## Active Workstreams

### 1. PWA Migration (SM-950) - Epic, In Progress

**Assignee:** Darl Anthony Pepito
**Priority:** Medium
**Description:** Migrate the React Native mobile app to a Next.js PWA for easier updates without redeployment.

**Repo:** [GitLab - sm-pwa](https://gitlab.com/powerslice-software-development/sm-pwa)
**Branch:** `develop`
**Test URL:** https://testserver.betacom.com/testpwa
**Stage URL:** https://testserver.betacom.com/stagepwa (SM-1110 - being set up)

#### PWA Module Status

| Key | Module | Status | Assignee | Priority |
|-----|--------|--------|----------|----------|
| SM-1082 | Notification Module | **In Progress** | Darl | High |
| SM-1102 | Respect user permissions | Testing | Kim Heinz | Highest |
| SM-1101 | Icons per build (test/stage/live) | Testing | Kim Heinz | Highest |
| SM-1087 | Timesheet Module | Testing | Kim Heinz | Highest |
| SM-1085 | Expense Module | Testing | Kim Heinz | Highest |
| SM-1077 | Clock Simple Module | Testing | Kim Heinz | Highest |
| SM-1092 | Close-Outs Module | Testing | Kim Heinz | Medium |
| SM-1080 | SSO for Betacom Domain | QA Verified | Unassigned | High |
| SM-1089 | Work Orders Module | To Do | Darl | Medium |
| SM-1107 | Home Page Module | Requirements | Darl | Medium |
| SM-1091 | E-Sign / Asset Management | Requirements | Darl | Medium |
| SM-1090 | Manager Toolbox Module | Requirements | Darl | Medium |
| SM-1088 | Work Confirmation Module | Requirements | Darl | Medium |
| SM-1086 | PTO Module | Requirements | Darl | Medium |
| SM-1084 | Work Confirm Exception | Requirements | Darl | Medium |
| SM-1083 | Profile Module | Requirements | Darl | Medium |
| SM-1110 | Set up stagepwa directory | To Do | Jason Hawsey | Medium |

**PWA Notification Module (SM-1082) Scope:**
- Tabbed notification center: Live Photo Sessions / Rejected / System
- Unread count badges per tab
- Mark notification as read
- Navigate to related screen from notification item

**PWA Infrastructure:**
- SM-1076: Set up testpwa SVN checkout and auto-update (QA Verified)
- SM-1080: SSO for Betacom domain users (QA Verified)

---

### 2. Vendor Admin AG Grid Revamp (SM-862) - Epic, On Stage

**Assignee:** Kim Heinz
**Priority:** High
**Labels:** `PS-JTF`, `VendorAdmin`, `change_request`
**Description:** Replace Vendor Admin UI with AG Grid system (spreadsheet-like) similar to Project Tracker.

#### Vendor Admin Child Tickets

| Key | Summary | Status | Priority |
|-----|---------|--------|----------|
| SM-864 | Make AG Grid with Filters and Sorting | On Stage | High |
| SM-1032 | Add drop downs within the grid | On Stage | High |
| SM-1030 | Save View button with Select View | On Stage | High |
| SM-1070 | Add Sage ID Field | On Stage | High |
| SM-1068 | Replace Bottom Labels with Modal Pop-ups | On Stage | High |
| SM-1064 | Upload/Replace Company Logo section | On Stage | High |
| SM-1063 | Carrier Experience section | On Stage | High |
| SM-1062 | Capabilities section | On Stage | High |
| SM-1061 | Market section | On Stage | High |
| SM-1060 | Users Section | On Stage | High |
| SM-1057 | Location Section | On Stage | High |
| SM-1056 | Audit Log Section | On Stage | High |
| SM-1054 | Mirror Required Fields | On Stage | High |
| SM-1053 | Update Address Field Location | On Stage | High |
| SM-945 | Vendor Location Type dropdown | On Stage | High |
| SM-934 | Navigate to Vendor Profile from Company Name | On Stage | High |
| SM-1066 | Grey area behind buttons fix | On Stage | Medium |
| SM-1095 | Approved Status not showing in Edit | Testing | High |
| SM-1081 | Improve Required Field Identification | Stage Verified | High |
| SM-936 | Delete Vendor from Grid | Stage Verified | High |
| SM-935 | Add New Vendor via "New Item" | Stage Verified | High |
| SM-865 | AG Grid Export | Stage Verified | High |
| SM-863 | Make AG Grid Editable | Stage Verified | High |
| SM-490 | Add "Blacklisted" Status Option | Stage Verified | High |
| SM-489 | Manually Flag a vendor | Stage Verified | High |
| SM-488 | Capture Rejection/Blacklist Reason | Stage Verified | High |

---

### 3. Project Tracker - Cascade Template Management (SM-1103) - Epic, Backlog

**Priority:** High
**Labels:** `change_request`
**Description:** Create management screen for project cascade templates with configurable number of days per step. Requested by Carlos (4/1/26 on-call meeting).

| Key | Summary | Status | Priority |
|-----|---------|--------|----------|
| SM-1106 | Cascade Template custom Project Tracker fields | Backlog | High |
| SM-1105 | Set Default Template | Backlog | High |
| SM-1104 | Link to Project Cascade Templates | Backlog | High |

---

### 4. OWASP Top 10 Security Review (SM-887) - Epic, To Do

**Priority:** Medium
**Reference:** https://owasp.org/www-project-top-ten/

| Key | OWASP Category | Status |
|-----|---------------|--------|
| SM-888 | A01: Broken Access Control | Requirements |
| SM-889 | A02: Cryptographic Failures | Requirements |
| SM-890 | A03: Injection | Requirements |
| SM-891 | A04: Insecure Design | Requirements |
| SM-892 | A05: Security Misconfiguration | Requirements |
| SM-893 | A06: Vulnerable and Outdated Components | Requirements |
| SM-894 | A07: Identification and Authentication Failures | Requirements |
| SM-895 | A08: Software and Data Integrity Failures | Requirements |
| SM-896 | A09: Security Logging and Monitoring Failures | Requirements |
| SM-897 | A10: Server-Side Request Forgery (SSRF) | Requirements |

---

### 5. Certificate Module Enhancements

Several recently completed and in-progress tickets:

| Key | Summary | Status | Priority |
|-----|---------|--------|----------|
| SM-1096 | Department-Restricted Employee Visibility | On Stage | High |
| SM-1094 | Restore Archived Certificates | Done | High |
| SM-1093 | View Certificate Images in Archive | Done | High |
| SM-1075 | Standardize Attachments as Images | Done | High |
| SM-1074 | Add Archive button | Done | High |
| SM-1073 | Create Archive Tab | Done | High |
| SM-1049 | Oops page for login screen | Done | High |
| SM-1044 | Download All Certificates fix | Done | High |
| SM-1035 | Unify "Add Certificate" Button | Done | High |
| SM-1034 | Email QR Code button | Done | High |
| SM-1033 | Email Alert | Done | High |
| SM-996 | Mobile History clearing for QR Code | Backlog | Medium |

---

## Active Ticket Status Summary (excl. Done/Cancelled/Old Backlog)

| Status | Count | Description |
|--------|-------|-------------|
| **Backlog** | ~80 | Prioritized but not yet started |
| **Testing** | ~27 | In QA/testing with Kim Heinz |
| **On Stage** | ~26 | Deployed to staging for verification |
| **QA Verified** | ~19 | QA has approved |
| **Requirements** | ~17 | Awaiting requirements/specs |
| **Stage Verified** | ~13 | Verified on staging |
| **Stage Prep** | ~9 | Being prepared for staging |
| **To Do** | ~7 | Ready to start |
| **In Progress** | 2 | Actively being developed |

---

## Ticket Pipeline (Workflow)

```
Backlog -> To Do -> In Progress -> Testing -> QA Verified -> On Stage -> Stage Verified -> Stage Prep -> Done
                                                                                          (also: Cancelled)
```

Additional statuses: `Requirements`, `Old Backlog`

---

## Notable Backlog Items

### High Priority Backlog

| Key | Summary | Assignee | Parent |
|-----|---------|----------|--------|
| SM-949 | Mobile iOS Clock-In Fix: Prevent App Freeze | Unassigned | - |
| SM-940 | Deep Dive - Standardize Bulk Selection Alert | Unassigned | - |
| SM-928 | Time Entry with partial day PTO | Unassigned | - |
| SM-674 | Allow users to opt in/out of specific emails | Unassigned | SM-671 |
| SM-1072 | Timesheets - Preserve Time Periods | Unassigned | - |
| SM-1041 | Incident emails not queued (AJAX/exit bug) | Unassigned | - |
| SM-1031 | AG Grid back arrow disappears on refresh | Unassigned | - |
| SM-1010 | Project Tracker Summary button error | Unassigned | - |
| SM-1011 | Purchasing - Error saving new item | Unassigned | - |
| SM-1015 | Close Out Hamburger Menu Filter broken | Unassigned | - |

### Infrastructure / DevOps

| Key | Summary | Status | Assignee |
|-----|---------|--------|----------|
| SM-1099 | Log Processing for errors and debug info | To Do | Darl |
| SM-942 | Log Cron - move logs to new location | Testing | Jason Hawsey |
| SM-720 | Convert SM mobile SVN repo to git/gitlab | Backlog | Unassigned |
| SM-786 | DB Optimization | Backlog | Unassigned |
| SM-601 | Update Filerun to latest | Backlog | Unassigned |

---

## On Stage Items (Awaiting Verification)

| Key | Summary | Assignee |
|-----|---------|----------|
| SM-885 | Handle Data Consistency between Quote Save and Load | Kim Heinz |
| SM-802 | My Expenses WOs allowed to be saved incorrectly (Mobile) | Unassigned |
| SM-761 | VP Override approval link issue | Unassigned |
| SM-738 | Office Location Type dropdown fix | Unassigned |
| SM-1047 | Add email sender to intake email logs | Kim Heinz |
| SM-1046 | Incident Admin - Remove WO# Grouping | Unassigned |
| SM-1045 | Incident Admin - Auto-Sort by Date | Unassigned |
| SM-1096 | Certificate - Department-Restricted Visibility | Kim Heinz |
| SM-862+ | ~15 Vendor Admin AG Grid tickets | Kim Heinz |

---

## Testing Queue (Kim Heinz Primary Tester)

| Key | Summary | Priority |
|-----|---------|----------|
| SM-1102 | PWA - respect user permissions | Highest |
| SM-1101 | PWA - icons per build | Highest |
| SM-1087 | PWA - Timesheet Module | Highest |
| SM-1085 | PWA - Expense Module | Highest |
| SM-1077 | PWA - Clock Simple Module | Highest |
| SM-956 | Timesheets - Block PTO on Company Holidays | High |
| SM-939 | AG Grid - Standardize Button Layout | High |
| SM-825 | Vendor Mismatch on Case sensitivity | High |
| SM-1095 | Vendor Admin - Approved Status issue | High |
| SM-1092 | PWA - Close-Outs Module | Medium |
| SM-1079 | Project Admin - CSV Upload optimization | Medium |
| SM-1078 | Project Admin - Prevent Type Changes | Medium |
| SM-1055 | Purchasing tracker auto refresh | Medium |
| SM-1052 | Project Tracker duplicate field names | Medium |
| SM-1097 | WO Folder Admin removing folder | Medium |
| SM-967 | Incident Admin Filter Display Bar | Medium |
| SM-965 | Incident Admin Employee filter resets | Medium |

---

## Completed Epics (Monthly Maintenance)

These maintenance epics track monthly bug fixes and small improvements:

| Key | Epic | Status |
|-----|------|--------|
| SM-680 | OCT-24-MAINT | Done |
| SM-670 | NOV-24-MAINT | Done |
| SM-692 | DEC-24-MAINT | Done |
| SM-700 | JAN-25-MAINT | Done |
| SM-721 | FEB-25-MAINT | Done |
| SM-753 | MAR-25-MAINT | Done |
| SM-771 | APR-25-MAINT | Done |
| SM-780 | MAY-25-MAINT | Done |
| SM-792 | JUNE-25-MAINT | Done |
| SM-805 | JULY-25-MAINT | Done |
| SM-817 | AUG-25-MAINT | Done |
| SM-841 | SEP-25-MAINT | Done |
| SM-877 | OCT-25-MAINT | Done (implied, child tickets active) |
| SM-988 | Security Updates - 2026 Q1 | Done |

---

## Modules / Feature Areas

Based on ticket analysis, these are the major SiteManager modules:

### Core Modules
- **Work Orders (WO)** - Central module for field work management, tickets, folders, tracker
- **Timesheets** - Time entry, review, exceptions, PTO, overtime
- **Expenses** - Employee expense tracking, mobile and web
- **Quoting** - Quote creation, labor drivers, export, trackers
- **Purchasing (POR)** - Purchase order requests, tracking, approval
- **Project Tracker** - AG Grid-based project management with custom fields, formulas, views
- **Close Outs** - Photo sessions, barcode prompts, PDF export
- **Incident Admin** - Accident/injury/loss reporting, admin module

### Administration
- **Vendor Admin** - Vendor management (undergoing AG Grid revamp)
- **User Admin** - User profiles, permissions, departments
- **Certificate Module** - Employee certifications, QR codes, archive
- **UAC (User Access Control)** - Permissions system
- **Maintenance** - Search, module maintenance

### Mobile / PWA
- **React Native App** (legacy) - Clock Simple, Expenses, Work Orders, etc.
- **PWA (Next.js)** (new) - Replacing mobile app, modules being migrated one by one

### Other
- **Dashboard** - Widgets, maps, ticket locations
- **Reports** - Various report modules, Sage milestone reports
- **Deep Dive** - Budget calculations, task completion, split screen
- **Intake Emails** - Email processing into WO system
- **E-Sign / Assets** - Digital signature and asset management
- **Forms** - Form builder, completion, assigned forms
- **Files / Filerun** - Document management integration
- **Kiosk** - Kiosk mode interface
- **Client Portal** - External client access

---

## Technology Stack

- **Backend:** CakePHP (PHP 8.4.x target per SM-988)
- **Web Server:** Apache httpd 2.4.66 (target per SM-988)
- **Database:** MySQL (upgrade to 8.x planned - SM-128)
- **Frontend (Web):** Angular SPA, AG Grid for tracker modules
- **Mobile (Legacy):** React Native
- **Mobile (New):** Next.js PWA
- **CI/CD:** GitLab CI, SVN (legacy) + Git
- **Hosting:** Test server at testserver.betacom.com
- **Notifications:** OneSignal
- **File Management:** Filerun integration
- **Sign Server:** Digital signature server (Azure migration planned - SM-752)
- **BI:** Data archiving for BI ingestion (SM-1021)

---

## Automation & AI Plans (SM-1099)

Planned AI-assisted log analysis workflow:
1. Cron job grabs `error.log` and `debug.log` from `app/tmp/logs`
2. Auto-creates Jira SM defect `Logs {date}` assigned to Darl
3. Claude analyzes logs nightly, suggests code fixes
4. Dev reviews, adjusts, implements
5. Goal: zero log items via continuous fixing

---

## Legacy Context

- Tickets SM-1 through ~SM-100 were migrated from **Unfuddle** (prefixed `UNF-####`)
- Tickets SM-101 through ~SM-500 are mostly in **Old Backlog** status (historical/deferred)
- Significant early work included: WO ticket redesign, client portal, quoting tracker, mobile app features
- AG Grid adoption started with Project Tracker and is expanding to Vendor Admin and other modules

---

## Labels in Use

| Label | Purpose |
|-------|---------|
| `PS-JTF` | Powerslice JTF (Joint Task Force?) - common label on active work |
| `VendorAdmin` | Vendor Admin module tickets |
| `change_request` | Feature change requests |
| `defect_internal` | Bugs found internally |
| `defect_production` | Bugs found in production |
| `Suggestion_QA` | QA-suggested improvements |
| `TaskCompletionDeepDive` | Deep Dive task completion related |
| `oct-24-maint` | October 2024 maintenance |
| `target_july25`, `target_june25`, etc. | Target release month labels |
| `new_backlog` | Newly added to backlog |

---

## Useful JQL Queries

```sql
-- All open tickets
project = SM AND status != Done ORDER BY updated DESC

-- In Progress (active development)
project = SM AND status = "In Progress"

-- Testing queue
project = SM AND status = "Testing" ORDER BY priority DESC

-- On Stage (awaiting verification)
project = SM AND status = "On Stage" ORDER BY priority DESC

-- Active (not Done/Cancelled/Old Backlog)
project = SM AND status NOT IN (Done, Cancelled, "Old Backlog") ORDER BY key DESC

-- PWA tickets
project = SM AND parent = SM-950 ORDER BY status ASC

-- Vendor Admin AG Grid
project = SM AND parent = SM-862 ORDER BY status ASC

-- High priority backlog
project = SM AND status = "Backlog" AND priority in (High, Highest) ORDER BY key DESC

-- Bugs in backlog
project = SM AND issuetype = Bug AND status = "Backlog" ORDER BY priority DESC

-- Kim Heinz's testing queue
project = SM AND assignee = "Kim Heinz" AND status = "Testing"

-- OWASP tasks
project = SM AND parent = SM-887

-- Recent tickets
project = SM ORDER BY created DESC
```

---

## Quick Reference: Jira Connection

**Site:** https://powerslicesoftware.atlassian.net
**Cloud ID:** `68df42c0-c103-42f5-b3a7-11bd4675a76d`
**Project Key:** `SM`

### MCP Tools Available
| Tool | Purpose |
|------|---------|
| `searchJiraIssuesUsingJql` | Search/filter with JQL |
| `getJiraIssue` | Get full ticket details |
| `createJiraIssue` | Create new tickets |
| `editJiraIssue` | Update ticket fields |
| `transitionJiraIssue` | Move ticket status |
| `addCommentToJiraIssue` | Add comments |
