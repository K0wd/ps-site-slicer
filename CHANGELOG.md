# Changelog

All notable changes to this project are documented here. Newest entries first.

---

## 2026-04-08 — Dashboard Widgets, Forgot Password, Multi-Browser & Archiving

### Dashboard Widget Tests (20 new scenarios)
- Added 20 widget test scenarios to `dashboard.feature`, one per widget option:
  - Site Manager Performance, Known Employee Locations, Announcements, Favorites, Alerts, Clocked In, Materials Over Budget, Subcontractors Over Budget, Equipment Over Budget, Profitability By Department, Past Due Tickets, Timesheet/WO discrepancies, Scheduled Tickets, Vendor Announcements, Manager Announcements, Weather Widget, TEST HTML, Add Client Shares, View Client Shares, Vendor PO List
- Each scenario: login → add widget → verify widget visible → remove all widgets
- Widget removal flow: force-show hidden `.widget-icons` → click → select "Remove" from dropdown
- Used exact `normalize-space()` match for widget titles to avoid substring collisions (e.g. "Announcements" vs "Manager Announcements")
- Added `WIDGET_MENU_ITEM_XPATH`, `WIDGET_TITLE_XPATH`, `WIDGET_ICONS_CSS`, `WIDGET_REMOVE_XPATH` to `dashboard.properties.ts`
- Created `capture-widget.spec.ts` for investigating widget add/delete DOM structure

### Forgot Password Feature (3 new scenarios)
- Created `tests/features/forgot-password.feature`:
  - Display page branding (title, section heading, instructions)
  - Display reset form elements (username, email, send access link button)
  - Display navigation links (login link, version info)
- Created `tests/steps/forgot-password.steps.ts` — navigates via "Forgot Password" link from login page
- Created `tests/properties/forgot-password.properties.ts` — page title, section title, instructions, form inputs, send button, login link, version
- Captured `html/forgot-password.html` + `.png` for element discovery

### Renamed Home → Dashboard
- Renamed `home.feature` → `dashboard.feature` (Feature name: "Dashboard")
- Renamed `home.steps.ts` → `dashboard.steps.ts`
- Renamed `home.properties.ts` → `dashboard.properties.ts`
- Updated all import paths

### Multi-Browser Support
- Added 5 browser projects to `playwright.config.ts`:
  - `firefox` (Desktop Firefox)
  - `chromium` (Desktop Chrome)
  - `edge` (Desktop Edge via `msedge` channel)
  - `webkit` (Desktop Safari)
  - `edge-mobile` (Pixel 5 viewport via `msedge` channel)
- `npm test` runs all browsers; `npm run test:edge` runs Edge only

### Video Recording
- Enabled `video: 'on'` in Playwright config — every test records a `.webm` video as evidence

### Test Run Archiving
- Created `scripts/archive-results.js`:
  - Copies `test-results/` and `playwright-report/` into timestamped folder under `test-archives/`
  - Keeps only the last 5 archives, deletes older ones automatically
- Integrated into `npm test` and `npm run test:edge` (auto-archive after each run)
- Added `npm run test:archive` for manual archiving
- Added `test-archives/` to `.gitignore`

### CLAUDE.md (Project Instructions)
- Created `CLAUDE.md` as the master instruction file (auto-loaded every conversation)
- References mandatory pre-read files: `.claude/quality.md`, `rules/automation.mdc`, `rules/effective-rules-summary.mdc`
- Indexes all 23 ISTQB certification reference files by domain
- Indexes all project-specific rule files
- Documents project context, structure, and conventions

### XPath Selector Fixes
- Fixed dashboard properties to match actual DOM in Edge (previously captured from Chromium):
  - `ADD_WIDGET_BUTTON_XPATH` — use `normalize-space()` instead of `contains(text())`
  - `USER_PROFILE_XPATH` — use `a[@title='My Profile' and @href='/spa/profile']` for uniqueness
  - `LOGOUT_ICON_XPATH` — use `mat-icon[@title='Log out']` instead of text match
  - `REFRESH_ICON_XPATH` — union XPath for img and mat-icon variants
  - `menuItemXpath` — use `//ul//li//p[normalize-space()]` with `.first()` for duplicates
  - `VERSION_XPATH` — use `//*[contains(text(), 'SM VERSION')]` for paragraph element

### Configuration Updates
- Updated `BASE_URL` from `/testpwa` to `https://testserver.betacom.com/` (SPA direct access)
- Updated `playwright.config.ts` fallback baseURL to match
- Updated `login-username.properties.ts` for SPA login elements (was PWA/Next.js)
- Increased global test timeout from 30s to 60s (login flow needs ~25s in Background step)
- Updated `playwright.capture.config.ts` to match all `capture-*.spec.ts` files and use Edge

### Documentation
- Updated `README.md` with full test coverage summary, video/archiving docs, browser projects table
- Updated `CHANGELOG.md`

---

## 2026-04-07 — Project Setup and BDD Integration

### Project Initialization
- Created `package.json` with Playwright as the core test framework
- Added `playwright.config.ts` with multi-browser support (Chromium, Firefox, WebKit)
- Created `.gitignore` for `node_modules/`, `test-results/`, `playwright-report/`, `.env`, `html/`, `.features-gen/`
- Created `.env` and `.env.example` with `BASE_URL`, `TEST_USERNAME`, `TEST_PASSWORD`
  - Fixed `USERNAME` → `TEST_USERNAME` to avoid conflict with Windows reserved env var

### BDD Framework Integration
- Installed `playwright-bdd` and `@cucumber/cucumber` for Gherkin/Cucumber syntax
- Updated `playwright.config.ts` to use `defineBddConfig` for feature/step discovery
- Updated `npm test` and `npm run test:ui` scripts to run `bddgen` before Playwright
- Created `playwright.capture.config.ts` for standalone page capture tests

### Login Feature
- Created `tests/features/login.feature` with 3 scenarios:
  - Display the username page
  - Submit username and see password page
  - Login with valid credentials (full flow including Safe Day's Alert modal)
- Created `tests/steps/login.steps.ts` with step definitions using properties XPaths
- Created `tests/properties/login-username.properties.ts` — SPA username page elements:
  - Navbar logo, forgot password link, login card title, username icon/label/input, next button, footer links
- Created `tests/properties/login-password.properties.ts` — SPA password page elements:
  - Password icon/input, visibility toggle, back button, "Let's go" button, Safe Day's Alert modal, error notification

### Dashboard Feature (initial)
- Created initial dashboard feature with 5 scenarios:
  - Display top bar elements (search, refresh, add widget)
  - Display user profile controls (my profile, logout)
  - Display sidebar navigation (filter + menu items)
  - Filter sidebar menu
  - Display version info
- Created step definitions with full login as Background
- Created properties file with dashboard elements (top bar, user profile, sidebar, version)

### Page Capture Utility
- Created `tests/capture-page.spec.ts` for capturing htmlBody snapshots and screenshots
- Captured and saved to `html/`:
  - `login-username.html` / `.png` — SPA username step
  - `login-password.html` / `.png` — SPA password step
  - `home-with-modal.html` / `.png` — Post-login with Safe Day's Alert
  - `home.html` / `.png` — Dashboard after dismissing modal

### QA Rules (Imported and Generalized)
- Imported QA rules from previous client projects into `rules/`
- Generalized all non-ISTQB rule files to remove old client references (SMS, Inventory, TicketNest, AJTickets):
  - `sibling-projects-context.mdc` — Rewritten as generic cross-project guidance
  - `sidebar-navigation-reliability.mdc` — Replaced `TicketNest` with generic example
  - `headless-dashboard-readiness.mdc` — Removed SMS/TicketNest references
  - `effective-rules-summary.mdc` — Generalized to frontend UI / backend API terminology
  - `automation.mdc` — Generalized export flow and removed Inventory-specific examples
- ISTQB reference files left untouched

### Documentation
- Created `README.md` with setup, project structure, running tests, and writing tests guide
- Created `CHANGELOG.md`
