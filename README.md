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
│   └── forgot-password.feature  #   3 scenarios — forgot password view
├── steps/                       # Step definitions (Playwright code)
│   ├── login.steps.ts
│   ├── dashboard.steps.ts
│   └── forgot-password.steps.ts
├── properties/                  # XPath locators per page (POM)
│   ├── login-username.properties.ts
│   ├── login-password.properties.ts
│   ├── dashboard.properties.ts
│   └── forgot-password.properties.ts
├── capture-page.spec.ts         # Page snapshot utility
└── capture-widget.spec.ts       # Widget flow snapshot utility

scripts/
└── archive-results.js           # Archives test runs (keeps last 5)

html/                            # Captured htmlBody snapshots (gitignored)
test-archives/                   # Archived test runs (gitignored)
rules/                           # QA rules and ISTQB reference files
.claude/                         # quality.md, wiki.md
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

# Run a specific widget test
npx bddgen; if ($?) { npx playwright test -g "Add widget - Alerts" }

# View last HTML report
npm run test:report

# Manually archive current test results
npm run test:archive
```

## Test Coverage (31 tests)

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
