# Test Plan — SM-1049: Certificate Module Oops Page

## Summary
Verify that the Certificate Manager (cmdist) displays a user-friendly **Oops** page instead of the legacy login form when accessed without a valid session, while preserving existing functionality for public certificate links and authenticated iframe-embedded usage.

## Pre-conditions
- Test environment available at `https://testserver.betacom.com/` (SPA at `/spa`, cmdist at `/app/webroot/cmdist/#/`)
- Valid SM credentials: `Bandeleonk / test1234`
- Ability to open incognito/private browser windows (no cached session cookies)
- At least one known valid public certificate employee ID (e.g., `15071` or `16812`)
- Parent app URL (`VITE_PARENT_APP_URL`) correctly configured for the test environment

---

## Scenarios

### SC-01: Oops Page Replaces Login Form on Direct Unauthenticated Access (Root URL)
**Objective:** Confirm AC1, AC2, and AC4 — direct unauthenticated access to the cmdist root renders a clear Oops page rather than the legacy login form or a blank/broken page.
**Pre-conditions:** Fresh incognito window with no SM session cookies.

**Steps:**
1. Open an incognito browser window → **Expected:** No SM session cookies present.
2. Navigate directly to `https://testserver.betacom.com/app/webroot/cmdist/#/` → **Expected:** Session check completes; the Oops page renders (not the legacy login form).
3. Observe the page layout → **Expected:** AlertTriangle icon is displayed with a clear, user-friendly message indicating the page should be accessed through the main application.
4. Inspect the page for any login inputs → **Expected:** No username, password, or login submit controls are visible or accessible.
5. Check the page renders fully (no console errors, no white screen) → **Expected:** Page is styled consistently with the app's Tailwind design and is not blank/broken.

---

### SC-02: Oops Page Triggered by Stripped / Invalid Certificate UID
**Objective:** Confirm AC1 — stripping the UID from a public certificate URL (the original production defect scenario) correctly routes the user to the Oops page.
**Pre-conditions:** Fresh incognito window; a known public certificate URL pattern.

**Steps:**
1. In incognito, navigate to a valid public certificate URL, e.g. `cmdist/#/public-certificate/15071` → **Expected:** Public certificate loads normally (sanity baseline).
2. Manually edit the URL in the address bar and strip the UID, leaving `cmdist/#/public-certificate/` → **Expected:** User is routed to the Oops page (not a blank page, not the login form, not a JS error).
3. Continue stripping back to `cmdist/#/` and press Enter → **Expected:** Oops page is displayed.
4. Refresh the browser (F5) on the Oops page → **Expected:** Oops page reloads consistently and does not fall back to the login form.

---

### SC-03: "Go to Main Application" Navigation Returns User to a Safe Location
**Objective:** Confirm AC3 — the Oops page provides a working, environment-aware navigation path back to the parent Angular SPA.
**Pre-conditions:** Oops page is displayed (from SC-01 or SC-02).

**Steps:**
1. Locate the "Go to Main Application" button on the Oops page → **Expected:** Button is visible, enabled, and clearly labeled.
2. Hover over the button and inspect the target URL → **Expected:** Target resolves to the test environment's parent SPA (`https://testserver.betacom.com/spa/` or equivalent) — not localhost, not production.
3. Click "Go to Main Application" → **Expected:** Browser navigates out of cmdist and loads the Angular SPA.
4. Observe the landing page → **Expected:** SPA login screen (or dashboard if session still valid) is displayed — a safe, functional location.

---

### SC-04: Public Certificate Route Remains Unaffected (Regression)
**Objective:** Confirm the fix did not regress the public-facing certificate route, which is intentionally outside the auth gate.
**Pre-conditions:** Fresh incognito window; known valid employee IDs (e.g., `15071`, `16812`).

**Steps:**
1. In incognito, navigate to `cmdist/#/public-certificate/15071` → **Expected:** Certificate page loads normally with employee data; no Oops page, no login prompt.
2. Verify certificate content renders (name, certs, images/QR as applicable) → **Expected:** All expected certificate fields and assets display correctly.
3. Navigate to a second public certificate `cmdist/#/public-certificate/16812` → **Expected:** Loads normally, unaffected by the Oops routing.
4. Reload the public certificate page → **Expected:** Page reloads without redirecting to the Oops page.

---

### SC-05: Authenticated Iframe Usage Through Angular SPA Works Normally
**Objective:** Confirm that the intended access path — Certificate Manager embedded in the Angular SPA via iframe with a shared session — continues to function.
**Pre-conditions:** User has valid credentials (`Bandeleonk / test1234`).

**Steps:**
1. Open `https://testserver.betacom.com/spa/auth/login` and log in with `Bandeleonk / test1234` → **Expected:** Login succeeds; SPA dashboard loads.
2. Navigate to the Certificates module from the SPA sidebar/menu → **Expected:** Certificates module opens inside the SPA (iframe loads cmdist).
3. Observe cmdist content inside the iframe → **Expected:** Certificate Manager UI renders normally (not the Oops page), session is shared via cookies.
4. Interact with the module (open an employee, browse certificates) → **Expected:** All authenticated cmdist functionality works as before.
5. Log out of the SPA, then re-open the Certificates module → **Expected:** Without a valid session, cmdist now renders the Oops page (confirms the session-check gate).

---

## Edge Cases

### EC-01: Session Expiry Mid-Use
**Objective:** Verify graceful handling when an authenticated cmdist session expires while the iframe is open.
**Pre-conditions:** Logged in via SPA with Certificates module open in iframe.

**Steps:**
1. Clear/invalidate the session cookie via browser dev tools while cmdist is loaded → **Expected:** Session cookie removed.
2. Trigger a cmdist action that requires session re-validation (refresh the iframe or navigate within it) → **Expected:** On the next session check failure, the Oops page is rendered inside the iframe — not the legacy login form, not a broken state.
3. Click "Go to Main Application" from within the iframe context → **Expected:** Top-level navigation redirects to the Angular SPA login.

---

### EC-02: Invalid / Non-Existent Route vs. Unauthenticated Route
**Objective:** Confirm the NotFound (404) component and the Oops page are distinct and correctly separated per the design note.
**Pre-conditions:** Fresh incognito window.

**Steps:**
1. Navigate to a clearly invalid route, e.g. `cmdist/#/this-route-does-not-exist` → **Expected:** NotFound (404) component is displayed — not the Oops page.
2. Navigate to `cmdist/#/` (root, unauthenticated) → **Expected:** Oops page is displayed — not the NotFound component.
3. Compare the two pages → **Expected:** They are visually and semantically distinct (different purposes: invalid route vs. unauthenticated access).
