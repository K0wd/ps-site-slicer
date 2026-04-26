# SiteManager — Product Overview & Usage Guide

> Generated: April 9, 2026
> Source: Jira project SM @ powerslicesoftware.atlassian.net
> Cloud ID: `68df42c0-c103-42f5-b3a7-11bd4675a76d`

---

## What is SiteManager?

SiteManager is a **field service management platform** built by Powerslice Software. It manages the full lifecycle of field operations — from work order creation and dispatch, through on-site execution (clock-in, expenses, photos, e-signatures), to back-office close-out, invoicing, and reporting.

The platform consists of three layers:
- **Web Application** — CakePHP backend + Angular SPA frontend for administrators and office staff
- **Mobile App (Legacy)** — React Native app for field workers (being retired)
- **PWA (Active)** — Next.js Progressive Web App replacing the mobile app, deployable without app store updates

**Test Environment:** `https://testserver.betacom.com/` (SPA login at `/spa/auth/login`)
**PWA Test:** `https://testserver.betacom.com/testpwa`
**PWA Stage:** `https://testserver.betacom.com/stagepwa`

---

## Who Uses SiteManager?

| User Role | What They Do | Primary Modules |
|---|---|---|
| **Field Workers** | Clock in/out, submit timesheets & expenses, complete work orders, take close-out photos | PWA: Clock Simple, Timesheets, Expenses, Work Orders, Close-Outs |
| **Field Managers** | Approve timesheets, handle exceptions, manage work confirmations, use manager toolbox | Timesheets, Work Confirmation, Manager Toolbox, PTO |
| **Project Managers** | Track projects, manage cascade templates, monitor budgets via Deep Dive | Project Tracker, Deep Dive, Cascade Templates |
| **Vendor Administrators** | Manage vendor profiles, approve/reject/blacklist vendors, audit vendor data | Vendor Admin (AG Grid) |
| **System Administrators** | Configure permissions, manage certifications, handle incidents, set up forms | User Admin, UAC, Certificate Module, Incident Admin |
| **Finance / Procurement** | Create quotes, manage purchase orders, track purchasing, generate reports | Quoting, Purchasing (POR), Reports |
| **Clients (External)** | Access project status and documents through a limited portal | Client Portal |

---

## Core Modules

### Work Orders (WO)
The central module for field work management. Tracks individual work order tickets, folder organization, and field assignments. Supports dispatch, on-site notes, and completion workflows.

**Key capabilities:**
- Work order creation, assignment, and tracking
- WO folder organization and admin
- Map view for geographic dispatch
- Mark-as-complete flow from the field
- Integration with timesheets, expenses, and close-outs

**Active tickets:** WO Folder Admin button fix (SM-1097), Work Orders PWA module (SM-1089)

---

### Timesheets
Time entry, review, and approval for field workers. Supports PTO, overtime, company holidays, and exception handling.

**Key capabilities:**
- Daily time entry with work order association
- PTO requests and blocking on company holidays
- Time period preservation across sessions
- Manager review and approval workflow
- Exception handling for partial-day PTO

**Active tickets:** Timesheet Module for PWA (SM-1087), Preserve Time Periods (SM-1072), Block PTO on Company Holidays (SM-956)

---

### Expenses
Employee expense tracking from both web and mobile/PWA. Supports receipt capture and work order association.

**Key capabilities:**
- Expense submission with WO# association
- Receipt photo capture (mobile/PWA)
- Manager review and approval
- Export and reporting

**Active tickets:** Expense Module for PWA (SM-1085), My Expenses WO save issue (SM-802)

---

### Quoting
Quote creation with labor drivers, calculation formulas, and export capabilities. Feeds into purchasing and project tracking.

**Key capabilities:**
- Quote builder with labor driver rates
- Save/load with data consistency checks
- Export to external formats
- Tracker integration

**Active tickets:** Data consistency between save and load (SM-885)

---

### Purchasing (POR)
Purchase order request management — creation, tracking, approval workflows, and auto-refresh.

**Key capabilities:**
- PO creation and tracking
- Approval workflows
- Purchasing tracker with auto-refresh
- Error handling for new item saves

**Active tickets:** Purchasing Tracker auto-refresh (SM-1055), Error saving new item (SM-1011)

---

### Project Tracker
AG Grid-based project management with custom fields, formulas, saved views, and cascade templates. The most advanced grid module in the platform.

**Key capabilities:**
- Spreadsheet-like AG Grid interface with filters, sorting, saved views
- Custom fields and formula columns
- Cascade template management (configurable step durations)
- Summary button and CSV export
- Deep Dive integration for budget/task analysis

**Active epic:** Cascade Template Management (SM-1103) — management screen for creating configurable project cascade templates with step durations

---

### Vendor Admin
Vendor management module undergoing a full AG Grid revamp. Manages vendor profiles, approval status, locations, capabilities, and audit trails.

**Key capabilities:**
- AG Grid spreadsheet-like vendor data management
- Vendor profile editing (inline in grid)
- Approval, rejection, and blacklist workflows with captured reasons
- Vendor location types, Sage ID integration
- Grid export, saved views, bulk operations
- Company logo upload, carrier experience, market/capabilities sections
- Audit log per vendor

**Active epic:** AG Grid Revamp (SM-862) — 20+ child tickets, most On Stage awaiting verification

---

### Close-Outs
Photo session management for field work completion. Supports barcode prompts, PDF export, and digital documentation.

**Key capabilities:**
- Photo session capture and management
- Barcode-prompted photo workflows
- PDF export of close-out packages
- Close-Outs Module for PWA (SM-1092)

---

### Certificate Module
Employee certification tracking with QR codes, archive management, and department-restricted visibility.

**Key capabilities:**
- Certificate creation and tracking per employee
- QR code generation and email
- Archive/restore with image viewing
- Department-restricted employee visibility
- Download all certificates
- Standardized image attachments

**Recently completed:** Archive tab (SM-1073), Archive button (SM-1074), Restore archived (SM-1094), QR code email (SM-1034)

---

### Incident Admin
Accident, injury, and loss reporting with administrative filtering, sorting, and email intake.

**Key capabilities:**
- Incident creation and tracking
- Admin module with filters and sorting
- Employee filter with persistence
- Auto-sort by date
- Intake email processing into incidents

**Active tickets:** Filter Display Bar (SM-967), Employee filter reset fix (SM-965)

---

### Dashboard
Landing page with widgets, maps, and operational overviews. Includes ticket location mapping and summary metrics.

**Key capabilities:**
- Widget-based operational dashboard
- Map view with ticket/WO locations
- Desktop-optimized layout (headless-safe)

---

### PWA (Progressive Web App)
The flagship migration initiative — replacing the React Native mobile app with a Next.js PWA for field workers.

**Epic:** SM-950 — In Progress, assigned to Darl Anthony Pepito
**Repo:** GitLab `sm-pwa`, branch `develop`

#### Module Migration Status

| Module | Ticket | Status |
|---|---|---|
| SSO for Betacom Domain | SM-1080 | QA Verified |
| Clock Simple | SM-1077 | Testing |
| Expense | SM-1085 | Testing |
| Timesheet | SM-1087 | Testing |
| User Permissions | SM-1102 | Testing |
| Icons per Build | SM-1101 | Testing |
| Close-Outs | SM-1092 | Testing |
| Notification | SM-1082 | In Progress |
| Work Orders | SM-1089 | To Do |
| Home Page | SM-1107 | Requirements |
| E-Sign / Assets | SM-1091 | Requirements |
| Manager Toolbox | SM-1090 | Requirements |
| Work Confirmation | SM-1088 | Requirements |
| PTO | SM-1086 | Requirements |
| Work Confirm Exception | SM-1084 | Requirements |
| Profile | SM-1083 | Requirements |

**Notification Module (SM-1082) Scope:**
- Tabbed notification center: Live Photo Sessions / Rejected / System
- Unread count badges per tab
- Mark notification as read
- Navigate to related screen from notification item

---

### Other Modules

| Module | Purpose |
|---|---|
| **User Admin / UAC** | User profiles, permissions, departments, access control |
| **Deep Dive** | Budget calculations, task completion analysis, split-screen view |
| **Reports** | Various report modules, Sage milestone reports |
| **Intake Emails** | Email processing into WO system |
| **E-Sign / Assets** | Digital signature and asset management |
| **Forms** | Form builder, completion tracking, assigned forms |
| **Files / Filerun** | Document management integration |
| **Kiosk** | Kiosk mode interface for on-site terminals |
| **Client Portal** | External client access to project status |

---

## Current Project Status (April 2026)

### Active Epics

| Epic | Key | Status | Owner | Priority |
|---|---|---|---|---|
| PWA for SM Mobile | SM-950 | In Progress | Darl Anthony Pepito | Medium |
| Vendor Admin AG Grid Revamp | SM-862 | On Stage | Kim Heinz | High |
| Cascade Template Management | SM-1103 | Backlog | Unassigned | High |
| OWASP Top 10 Security Review | SM-887 | To Do | Unassigned | Medium |

### Ticket Pipeline

```
Backlog → To Do → In Progress → Testing → QA Verified → On Stage → Stage Verified → Stage Prep → Done
                                                                                      (also: Cancelled)
Additional: Requirements, Old Backlog
```

### Status Distribution (Active Tickets)

| Status | Count |
|---|---|
| Backlog | ~80 |
| Testing | ~27 |
| On Stage | ~26 |
| QA Verified | ~19 |
| Requirements | ~17 |
| Stage Verified | ~13 |
| Stage Prep | ~9 |
| To Do | ~7 |
| In Progress | ~2 |

### Open Bugs Summary

- **30 open bugs** total (4 Highest, 7 High, 19 Medium)
- 67% are Cancelled or Backlog — only 6 actively in Testing/On Stage
- Most affected areas: Regression testing, Vendor Admin, Project Tracker, Work Orders

**Critical active bugs:**
| Key | Summary | Status | Priority |
|---|---|---|---|
| SM-1097 | WO Folder Admin — remove folder button broken | Testing | Highest |
| SM-1095 | Vendor Admin — Approved Status not showing in Edit | Testing | High |
| SM-825 | Vendor Mismatch on Case sensitivity | Testing | High |
| SM-1051 | Project Selection GO Button TypeError | QA Verified | High |
| SM-885 | Data Consistency between Quote Save/Load | On Stage | High |

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Backend** | CakePHP (PHP 8.4.x) |
| **Web Server** | Apache httpd 2.4.66 |
| **Database** | MySQL (upgrade to 8.x planned) |
| **Frontend (Web)** | Angular SPA, AG Grid for tracker modules |
| **Mobile (Legacy)** | React Native |
| **Mobile (New)** | Next.js PWA |
| **CI/CD** | GitLab CI, SVN (legacy) + Git |
| **Hosting** | testserver.betacom.com |
| **Notifications** | OneSignal |
| **File Management** | Filerun |
| **Sign Server** | Digital signature server (Azure migration planned) |

---

## Team

| Name | Role | Focus |
|---|---|---|
| **Darl Anthony Pepito** | Developer | Primary PWA developer, assigned most SM-950 child tickets |
| **Jason Hawsey** | Dev / DevOps | Backend, infrastructure, server setup, CI/CD |
| **Kim Heinz** | Stakeholder / QA | QA testing, Vendor Admin module, regression testing |

---

## Security Posture

**OWASP Top 10 Review** (SM-887) — Epic with 10 child tickets, one per OWASP category (A01–A10). All in Requirements status, unassigned. Covers: Broken Access Control, Cryptographic Failures, Injection, Insecure Design, Security Misconfiguration, Vulnerable Components, Auth Failures, Data Integrity, Logging/Monitoring, SSRF.

**Recent security work:** Security Updates 2026 Q1 (SM-988) — completed, covering PHP 8.4.x and Apache upgrades.

---

## Automation & AI Plans

**SM-1099 — Log Processing** (To Do, assigned to Darl):
1. Cron job grabs `error.log` and `debug.log` from `app/tmp/logs`
2. Auto-creates Jira defect `Logs {date}` assigned to Darl
3. Claude analyzes logs nightly, suggests code fixes
4. Dev reviews and implements
5. Goal: zero log items via continuous technical debt reduction

---

## Jira Quick Reference

**Site:** https://powerslicesoftware.atlassian.net
**Cloud ID:** `68df42c0-c103-42f5-b3a7-11bd4675a76d`
**Project Key:** SM

### Useful JQL Queries
```sql
-- All active tickets
project = SM AND status NOT IN (Done, Cancelled, "Old Backlog") ORDER BY key DESC

-- In Progress
project = SM AND status = "In Progress"

-- Testing queue
project = SM AND status = "Testing" ORDER BY priority DESC

-- PWA tickets
project = SM AND parent = SM-950 ORDER BY status ASC

-- Vendor Admin AG Grid
project = SM AND parent = SM-862 ORDER BY status ASC

-- Open bugs
project = SM AND issuetype = Bug AND status NOT IN (Done, Cancelled) ORDER BY priority DESC

-- Kim Heinz's testing queue
project = SM AND assignee = "Kim Heinz" AND status = "Testing"

-- OWASP tasks
project = SM AND parent = SM-887
```

### MCP Tools Available
| Tool | Purpose |
|---|---|
| `searchJiraIssuesUsingJql` | Search/filter with JQL |
| `getJiraIssue` | Get full ticket details |
| `createJiraIssue` | Create new tickets |
| `editJiraIssue` | Update ticket fields |
| `transitionJiraIssue` | Move ticket status |
| `addCommentToJiraIssue` | Add comments |

---

## Labels in Use

| Label | Purpose |
|---|---|
| `PS-JTF` | Powerslice Joint Task Force — active work |
| `VendorAdmin` | Vendor Admin module tickets |
| `change_request` | Feature change requests |
| `defect_internal` | Bugs found internally |
| `defect_production` | Bugs found in production |
| `Suggestion_QA` | QA-suggested improvements |
| `target_july25`, etc. | Target release month labels |
