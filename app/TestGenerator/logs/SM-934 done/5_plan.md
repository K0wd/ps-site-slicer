# Test Plan: SM-934 — Vendor Admin: Navigate to Vendor Profile from Company Name Click

**Ticket:** SM-934 | **Priority:** High | **Status:** On Stage | **Parent:** SM-862 (AG Grid Revamp)

---

## Summary

Verify that the Company Name column in the Vendor Admin AG Grid is rendered as a clickable hyperlink that navigates to the correct legacy Vendor Profile page (`users/vendoredit/{id}`), and that the pencil icon opens the edit modal — two distinct interactions on the same cell. This is a **re-verification on Stage** after a fix for a base-path routing issue that broke navigation outside the Test environment.

## Pre-conditions (all scenarios)

- Logged in as **Bandeleonk / test1234** at `https://testserver.betacom.com/spa`
- User has **Vendor Admin** permissions (`admin:Vendor Admin`)
- Navigated to **Vendor Admin** module (`/main/vendors-admin`)
- AG Grid has loaded with at least one vendor row visible

---

## Scenarios

### SC-01: Company Name Link Navigates to Vendor Profile Page

**Objective:** Confirm the core acceptance criteria — clicking a company name routes to the correct legacy vendor profile, not the edit modal.
**Pre-conditions:** Grid is loaded, at least 3 different vendors visible.

**Steps:**
1. Observe the Company Name column in the AG Grid → **Expected:** Company names are displayed as underlined hyperlinks with blue styling (#1976d2), cursor changes to pointer on hover
2. Click on the first vendor's Company Name text (e.g., vendor ID visible in the row) → **Expected:** Browser navigates to the Vendor Profile page at URL pattern `/spa/clview/users/vendoredit/{vendor_id}` — NOT a modal, a full page navigation
3. Verify the Vendor Profile page ("Vendor Account Management") loads completely → **Expected:** Page displays the correct vendor's profile data matching the company name clicked
4. Use browser back button to return to the Vendor Admin grid → **Expected:** Grid reloads and displays the vendor list
5. Click on a different vendor's Company Name → **Expected:** Navigates to that second vendor's profile page with the correct vendor data
6. Verify the URL contains the correct vendor ID for the second vendor → **Expected:** URL matches `/spa/clview/users/vendoredit/{second_vendor_id}`

---

### SC-02: Pencil Icon vs Company Name — Distinct Interactions

**Objective:** Confirm the pencil icon and company name text trigger different actions (modal vs navigation) and do not interfere with each other.
**Pre-conditions:** Grid loaded with vendors visible.

**Steps:**
1. Identify the pencil icon next to a Company Name in the grid → **Expected:** Pencil icon is visible adjacent to the company name text
2. Click the **pencil icon** (not the company name text) → **Expected:** An edit modal dialog opens overlaying the grid — the page does NOT navigate away
3. Verify the modal displays the vendor's editable information → **Expected:** Modal shows vendor edit form for the correct vendor
4. Close the modal → **Expected:** Modal closes, grid is still visible and unchanged
5. Now click the **Company Name text** for the same vendor → **Expected:** Browser navigates to the Vendor Profile page (`users/vendoredit/{id}`) — a full page load, not a modal
6. Return to the grid and repeat for a different vendor → **Expected:** Both interactions (pencil = modal, name = profile navigation) work consistently across different rows

---

### SC-03: Modal Display Across Sidebar States and Viewport Sizes

**Objective:** Confirm the edit modal (pencil icon) displays correctly without being obscured by the sidebar, including in split-screen/smaller viewports.
**Pre-conditions:** Grid loaded. Browser window at full width.

**Steps:**
1. With sidebar **expanded/open**, click the pencil icon on any vendor → **Expected:** Modal appears fully visible above the sidebar, not covered or clipped by it
2. Close the modal, then **collapse/minimize** the sidebar to mini state → **Expected:** Grid adjusts, vendor data still visible
3. Click the pencil icon again → **Expected:** Modal displays correctly, positioned centrally and fully accessible
4. Close the modal, then **hide** the sidebar completely → **Expected:** Grid expands to fill available space
5. Click the pencil icon → **Expected:** Modal displays correctly
6. Resize the browser window to approximately **50% width** (split-screen simulation, ~900px) → **Expected:** Grid adjusts to narrower viewport
7. Click the pencil icon → **Expected:** Modal is fully visible and scrollable — no content is cut off or inaccessible outside the viewport

---

### SC-04: Link Styling Consistency with Other Modules

**Objective:** Confirm the Company Name hyperlink styling matches the standard underlined link pattern used across other SM modules (e.g., Quoting Module).
**Pre-conditions:** Grid loaded.

**Steps:**
1. Observe the Company Name column at rest → **Expected:** Text is displayed in blue (#1976d2) with a persistent underline — matching the Quoting Module link style
2. Hover over a Company Name → **Expected:** Cursor changes to pointer; hover effect is visible (underline persists or intensifies)
3. Scroll down through multiple rows in the grid → **Expected:** All Company Name cells consistently display the hyperlink styling (blue, underlined)
4. Apply a filter or sort to the Company Name column → **Expected:** After grid re-renders, links retain their styling and remain clickable
5. Click a Company Name link to navigate, then return to grid → **Expected:** Links are still styled correctly after returning

---

## Edge Cases

### EC-01: Browser Back Button After Profile Navigation

**Objective:** Verify navigation history works correctly when moving between the grid and vendor profile pages.

**Steps:**
1. From the Vendor Admin grid, click a Company Name to navigate to the profile → **Expected:** Profile page loads
2. Click browser back button → **Expected:** Returns to the Vendor Admin grid without errors
3. Click browser forward button → **Expected:** Returns to the vendor profile page
4. Click a Company Name, then immediately click another Company Name from the profile page's breadcrumb or navigation (if available) → **Expected:** No stale routing or URL doubling occurs

---

### EC-02: Rapid/Double-Click on Company Name

**Objective:** Verify the system handles rapid or accidental double-clicks gracefully.

**Steps:**
1. Double-click quickly on a Company Name link → **Expected:** Navigates to the vendor profile page once — no duplicate navigation, no error page, no stacked page loads
2. Return to grid and rapidly click different Company Names in succession (click one, immediately click another before navigation completes) → **Expected:** Final navigation wins; no broken state or partial page loads

---

### EC-03: Grid Interaction After Scrolling

**Objective:** Verify that Company Name links and pencil icons work correctly for rows that are rendered via AG Grid virtual scrolling.

**Steps:**
1. Scroll far down in the Vendor Admin grid (past the initial viewport of rows) → **Expected:** Rows continue to render with Company Name hyperlinks and pencil icons
2. Click a Company Name in the scrolled-to area → **Expected:** Navigates to the correct vendor's profile page with the right vendor ID
3. Return to grid, scroll to the same area, click the pencil icon → **Expected:** Edit modal opens for the correct vendor

---

**Risk focus:** The highest-risk area is SC-01 (correct navigation URL) given the history of three distinct URL/routing bugs during development (double `/clview/`, relative path resolution across environments, modal vs profile target). SC-03 addresses the previously reported split-screen modal accessibility issue.
