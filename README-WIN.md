# PS Site Slicer (Windows)

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
│   ├── nav-bar.feature          #  13 scenarios — navbar display + interactions
│   └── sidebar-navigation.feature # 78 scenarios — sidebar page nav + nav bar persistence
├── steps/                       # Step definitions (Playwright code)
│   ├── login.steps.ts
│   ├── dashboard.steps.ts
│   ├── forgot-password.steps.ts
│   ├── nav-bar.steps.ts
│   └── sidebar-navigation.steps.ts
├── properties/                  # XPath locators per page (POM) — 82 files
│   ├── login-username.properties.ts
│   ├── login-password.properties.ts
│   ├── dashboard.properties.ts
│   ├── forgot-password.properties.ts
│   ├── nav-bar.properties.ts
│   └── <77 sidebar page properties>
├── capture-page.spec.ts         # Page snapshot utility
└── capture-widget.spec.ts       # Widget flow snapshot utility

scripts/
├── archive-results.js           # Archives test runs (keeps last 5)
├── generate-sidebar-properties.ts # Generates stub properties files from sidebar data
└── surf-sidebar.ts              # Surfs all sidebar pages, captures HTML + generates properties

html/                            # Captured htmlBody snapshots — 81 pages (gitignored)
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
npx bddgen; if ($?) { npx playwright test -g "Nav Bar" }
npx bddgen; if ($?) { npx playwright test -g "Sidebar Navigation" }

# Run a specific widget test
npx bddgen; if ($?) { npx playwright test -g "Add widget - Alerts" }

# Run a specific sidebar navigation test
npx bddgen; if ($?) { npx playwright test -g "Navigate to `"Users Admin`"" }

# Run a specific nav bar interaction test
npx bddgen; if ($?) { npx playwright test -g "Toggle sidebar" }

# View last HTML report
npm run test:report

# Manually archive current test results
npm run test:archive
```

## Test Coverage

**122 scenarios** across 5 feature files. See [TestCoverage.md](TestCoverage.md) for the full breakdown.

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

This repo is synced via GitHub. To set up on a new Windows machine:

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
- **ESLint + Prettier** — Auto-format on save, ESLint auto-fix on save
- **Error Lens** — Inline error/warning display
- **Claude Code** — AI agent with MCP integration enabled
- Run "Generate BDD Specs" task if tests don't appear in Test Explorer
- Workspace tasks: Generate BDD Specs, Run Tests (Edge), Playwright UI Mode, Playwright Report, Archive Results
