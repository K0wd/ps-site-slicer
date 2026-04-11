# PS Site Slicer

Automated QA test suite for **Site Manager** using Playwright with BDD (Cucumber/Gherkin) via `playwright-bdd`.

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- npm
- MS Edge browser (tests run on Edge by default)

## Setup

```powershell
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Create your .env file from the example
Copy-Item .env.example .env
# Edit .env with your credentials
```

### Environment Variables

| Variable | Description |
|---|---|
| `BASE_URL` | Target application URL |
| `TEST_USERNAME` | Login username |
| `TEST_PASSWORD` | Login password |

## Project Structure

```
tests/
├── features/                    # Gherkin feature files (plain English)
│   ├── login.feature            #   3 scenarios — login flow
│   ├── dashboard.feature        #  25 scenarios — dashboard + 20 widgets
│   ├── forgot-password.feature  #   3 scenarios — forgot password view
│   └── sidebar-navigation.feature # 76 scenarios — sidebar page navigation
├── steps/                       # Step definitions (Playwright code)
│   ├── login.steps.ts
│   ├── dashboard.steps.ts
│   ├── forgot-password.steps.ts
│   └── sidebar-navigation.steps.ts
├── properties/                  # XPath locators per page (POM) — 80 files
│   ├── login-username.properties.ts
│   ├── login-password.properties.ts
│   ├── dashboard.properties.ts
│   ├── forgot-password.properties.ts
│   └── <76 sidebar page properties>
├── capture-page.spec.ts         # Page snapshot utility
└── capture-widget.spec.ts       # Widget flow snapshot utility

scripts/
├── archive-results.js           # Archives test runs (keeps last 5)
├── generate-sidebar-properties.ts # Generates stub properties files from sidebar data
└── surf-sidebar.ts              # Surfs all sidebar pages, captures HTML + generates properties

html/                            # Captured htmlBody snapshots (gitignored)
test-archives/                   # Archived test runs (gitignored)
rules/                           # QA rules and ISTQB reference files
.claude/                         # Agent configs, wiki.md
.features-gen/                   # Auto-generated specs from BDD (gitignored)
```

## Running Tests

```powershell
# Run all tests (Firefox, Chrome, Edge, WebKit, Edge Mobile)
npm test

# Run on Edge only
npm run test:edge

# Run with Playwright UI mode
npm run test:ui

# Run specific feature
npx bddgen; if ($?) { npx playwright test -g "Login" }
npx bddgen; if ($?) { npx playwright test -g "Dashboard" }
npx bddgen; if ($?) { npx playwright test -g "Forgot Password" }
npx bddgen; if ($?) { npx playwright test -g "Sidebar Navigation" }

# Run a specific widget test
npx bddgen; if ($?) { npx playwright test -g "Add widget - Alerts" }

# Run a specific sidebar navigation test
npx bddgen; if ($?) { npx playwright test -g "Navigate to \"Users Admin\"" }

# View last HTML report
npm run test:report

# Manually archive current test results
npm run test:archive
```

## Test Coverage (107 scenarios)

### Login (3 scenarios)
- Display the username page
- Submit username and see password page
- Login with valid credentials (full flow + Safe Day's Alert modal)

### Dashboard (25 scenarios)
- Display top bar elements (search, refresh, add widget)
- Display user profile controls (my profile, logout)
- Display sidebar navigation (80+ menu items)
- Filter sidebar menu
- Display version info
- **20 widget tests** — each adds a widget, verifies it appears, then removes it:
  - Site Manager Performance, Known Employee Locations, Announcements, Favorites, Alerts, Clocked In, Materials Over Budget, Subcontractors Over Budget, Equipment Over Budget, Profitability By Department, Past Due Tickets, Timesheet/WO discrepancies, Scheduled Tickets, Vendor Announcements, Manager Announcements, Weather Widget, TEST HTML, Add Client Shares, View Client Shares, Vendor PO List

### Forgot Password (3 scenarios)
- Display page branding
- Display reset form elements
- Display navigation links

### Sidebar Navigation (76 scenarios)
- **73 page navigation tests** (Scenario Outline) — each clicks a sidebar menu item, verifies the page loads at the expected route, and saves an htmlBody snapshot:
  - Account Management, Admin Alerts, Asset Control Panel, Audit Inspector, BI Admin, Capabilities Admin, Carrier Keys, Client Admin, Close Outs, Company Directory, Company Files, Cron Utility, Dashboard, DB Query Screen, Director Admin, Divisions Admin, Document Signature Admin, Drivers Admin, Eversign, Forms Admin, Hiring, IT Support, Import Costs, Incidents Admin, Job Titles, Keys Admin, LOB Admin, Locks Admin, Logs, Maintenance, Maintenance Admin, Market Admin, Material Category Admin, Menu Editor, Message Queue, Message Recipients, Mobile Assets, Office Locations, PM Transfer, PMO Admin, PMO Dashboard, PMO SharePoint Dashboard, PTO Admin, Performance, Personal Assets, Project Tracker, Projects, Projects Admin, Purchasing, Purchasing Admin, Quoting, Report DB, Reports, Search, Site Alerts, Site Upload Admin, Tax Group Admin, Temp Files, Texting, Time Zone Admin, Timedata, Timesheet Admin, Timesheets, Training, Transfer Tickets, UAC System, UI Config, Update Users Import, Users Admin, Vendor Admin, Vendor Admin-Old, WO Folder Setup, WO Tracker, WOT Export Queue
- **3 parent menu expansion tests** — each clicks a parent menu and verifies the submenu expands:
  - Certificates, Files, RTWP

## Video Recording & Archiving

- **Video**: Every test records a `.webm` video in `test-results/`
- **Archiving**: After `npm test` or `npm run test:edge`, results are automatically archived to `test-archives/<timestamp>/`
- **Retention**: Only the last 5 test runs are kept; older archives are deleted automatically

## Writing Tests

### 1. Write a feature file in plain English

```gherkin
# tests/features/example.feature
Feature: Example

  Scenario: Do something
    Given I am on the login page
    When I enter my username
    Then I should see the next button
```

### 2. Create XPath locators in properties

```typescript
// tests/properties/example.properties.ts
export const SOME_ELEMENT_XPATH = "//div[@id='example']";
```

### 3. Implement step definitions

```typescript
// tests/steps/example.steps.ts
import { createBdd } from 'playwright-bdd';
import { SOME_ELEMENT_XPATH } from '../properties/example.properties';

const { Given, When, Then } = createBdd();

Then('I should see the example element', async ({ page }) => {
  await expect(page.locator(`xpath=${SOME_ELEMENT_XPATH}`)).toBeVisible();
});
```

### 4. Capture page snapshots

Use the capture utility to save htmlBody and screenshots for building properties files:

```powershell
npx playwright test --config=playwright.capture.config.ts
```

Snapshots are saved to `html/` (gitignored).

## Browser Projects

| Project | Browser | Viewport |
|---|---|---|
| `firefox` | Firefox | Desktop |
| `chromium` | Chrome | Desktop |
| `edge` | MS Edge | Desktop |
| `webkit` | Safari | Desktop |
| `edge-mobile` | MS Edge | Pixel 5 (mobile) |

## Flakiness Detection

Tests retry once locally (twice in CI). If a test fails then passes on retry, Playwright marks it **flaky** (yellow) in the HTML report. View with `npm run test:report`.

## Multi-Machine Sync

This repo is synced via GitHub. To set up on a new machine (Mac or Windows):

```powershell
# Clone and install
git clone git@github.com:K0wd/ps-site-slicer.git
cd ps-site-slicer
npm install
npx playwright install

# Create .env
Copy-Item .env.example .env
# Edit .env with your credentials
```

For full environment setup including Claude Code brain files, see the [k0wd-template](https://github.com/K0wd/k0wd-template) repo and its `mac-setup.sh` script.

## Tech Stack

- **Playwright** — Browser automation
- **playwright-bdd** — BDD/Gherkin integration for Playwright
- **@cucumber/cucumber** — Gherkin parser
- **TypeScript** — Step definitions and properties
- **dotenv** — Environment variable management

## VS Code Integration

- **Playwright Test Explorer** — Run/debug tests from the Testing sidebar (beaker icon)
- **Cucumber Autocomplete** — Go-to-definition and autocomplete in `.feature` files
- **Cucumber Official** — Gherkin syntax highlighting
- Run "Generate BDD Specs" task if tests don't appear in Test Explorer
