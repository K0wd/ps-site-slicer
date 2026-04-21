# Test Plan: SM-1085 — PWA Expense Module

**Ticket:** SM-1085 | **Priority:** High | **Status:** Testing | **Parent:** SM-950 (PWA for SM Mobile)

## Summary

Verify that the Expense module migrated from the React Native mobile app to the SiteManager PWA (Next.js) allows users to search, view, create, edit, and manage expenses — including mileage calculation — with categories and types dynamically loaded from backend metadata. This is a re-test following two rounds of QA fixes (directory listing on refresh, reimbursable checkbox, attachment display, metadata loading).

## Pre-conditions (shared)

- Browser: MS Edge or Chrome
- Test URL: https://testserver.betacom.com/testpwa
- User is logged in as **Bandeleonk / test1234**
- At least one existing expense exists in the system for the test user within the last year
- At least one existing expense has a file attachment
- At least one existing expense is a mileage-type expense

---

## Scenarios

### SC-01: Navigation, Search, and Expense List Display (AC1, AC2)

**Objective:** Verify the Expense module is accessible from the sidebar, loads with correct defaults, supports date range search, and renders expense cards sorted correctly.
**Pre-conditions:** User is on the PWA home screen after login.

**Steps:**
1. Open the sidebar/hamburger menu → **Expected:** "Expenses" link is visible in the navigation menu
2. Tap "Expenses" → **Expected:** Browser navigates to `/expense`; expense list page loads with a date range picker and expense cards
3. Check the default date range values → **Expected:** Start date is 1 year ago from today; end date is today's date
4. Verify expense cards are rendered → **Expected:** Each card displays date, amount, expense type, and approval status; cards are sorted by date descending (newest first)
5. Modify the start date to narrow the range (e.g., last 30 days) and tap "Search" → **Expected:** List updates to show only expenses within the new date range; card count changes accordingly
6. Tap the refresh icon in the PWA header → **Expected:** Page reloads expense data without showing a directory listing or error page; expense list re-renders correctly
7. Perform a hard browser refresh (F5 / Cmd+R) on the `/expense` route → **Expected:** Expense list page loads normally (no Apache directory listing — regression from round 1 fix)

---

### SC-02: Create Standard Expense with Form Dynamics (AC4, AC5)

**Objective:** Verify a user can create a new non-mileage expense using the form, with expense types, payment types, default amounts, conditional reason fields, WO# search, and file attachment all functioning correctly.
**Pre-conditions:** User is on the expense list page (`/expense`).

**Steps:**
1. Tap the red "+" FAB button → **Expected:** "New Expense" form opens at `/expense/edit`
2. Verify the Expense Type dropdown → **Expected:** Dropdown is populated with expense types loaded from the server (not empty or hardcoded)
3. Select an expense type that has a default amount in metadata → **Expected:** Amount field auto-populates with the default value and becomes read-only
4. Verify the Payment Type dropdown → **Expected:** Dropdown is populated with payment types loaded from the server
5. Select a type/payment combination that requires a reason (per `comments_required` metadata) → **Expected:** Reason dropdown appears with a warning indicator; reasons list is populated from metadata
6. Toggle the "Scheduled" switch on the WO# field → **Expected:** Field switches from a text input (manual entry mode) to a dropdown of scheduled work orders, and back again on re-toggle
7. In manual WO mode, type a partial WO number → **Expected:** Autocomplete suggestions appear after a brief debounce (~500ms); selecting a suggestion populates the field with a validation indicator (valid/invalid)
8. Toggle the "Reimbursable to me" checkbox on and off → **Expected:** Checkbox responds to each click reliably (regression from round 1 fix)
9. Attach an image file → **Expected:** Image preview thumbnail appears in the form
10. Fill all remaining required fields (date, comment if required) and tap "Save" → **Expected:** Success toast appears; user is redirected back to the expense list; the newly created expense appears at the top of the list with correct details

---

### SC-03: View Expense Detail and Edit Existing Expense (AC3, AC4)

**Objective:** Verify the expense detail view displays all fields correctly (including attachments) and that editing an existing expense pre-populates the form and persists changes.
**Pre-conditions:** User is on the expense list page with at least one expense that has an attachment.

**Steps:**
1. Tap an expense card that has an attachment → **Expected:** Detail page loads at `/expense/detail` showing all read-only fields: WO#, Date Entered, Amount, Approved status, Type, Payment Type, Reimbursable, Comment
2. Verify the attachment section → **Expected:** Attachment link/thumbnail is visible and clickable
3. Tap the attachment link → **Expected:** Image modal opens displaying the receipt/attachment image clearly (not a dark overlay or broken image — regression from round 2 fix)
4. Close the modal → **Expected:** Modal dismisses; detail view is unchanged
5. Tap the back arrow → **Expected:** Returns to the expense list page with scroll position preserved
6. Tap the same expense card again, then tap the red edit FAB → **Expected:** "Edit Expense" form opens at `/expense/edit/[id]` with all fields pre-populated with the current expense data (date, type, payment type, amount, WO#, reimbursable, comment)
7. Verify the existing attachment preview → **Expected:** Current attachment image is displayed inline in the edit form (not a broken image icon — regression from round 2 fix)
8. Change the comment field to a new value and tap "Save" → **Expected:** Success toast appears; user is redirected to the list; re-opening the expense detail shows the updated comment

---

### SC-04: Mileage Expense Creation and Calculation (AC6)

**Objective:** Verify that selecting the mileage expense type reveals the mileage calculator, auto-calculates amount from miles and rate, provides office suggestions, and saves correctly.
**Pre-conditions:** User is on the expense list page.

**Steps:**
1. Tap the red "+" FAB to open the new expense form → **Expected:** Form loads with all dropdowns populated
2. Select the "Mileage" expense type from the Type dropdown → **Expected:** Mileage calculator section appears with From, To, and Miles fields; the standard Amount field becomes auto-calculated (read-only)
3. Tap into the "From" location input → **Expected:** Office suggestions dropdown appears with predefined office locations from metadata
4. Select an office from the suggestions for the "From" field → **Expected:** From field is populated with the selected office name
5. Enter a destination in the "To" field and enter a miles value (e.g., 50) → **Expected:** Amount field auto-calculates as `miles x mileage_rate` (e.g., 50 x $0.67 = $33.50); amount updates in real-time as miles value changes
6. Fill remaining required fields (date, payment type) and tap "Save" → **Expected:** Success toast; redirect to expense list; new mileage expense appears with the calculated amount
7. Tap the new mileage expense to view detail → **Expected:** Detail page shows From, To, Miles fields in addition to standard fields; amount matches the calculated value

---

### SC-05: View Mileage Expense Detail Fields (AC3, AC6)

**Objective:** Verify that mileage-specific fields (From, To, Miles) are displayed on the detail view for mileage expenses, and hidden for non-mileage expenses.
**Pre-conditions:** System has both a mileage expense and a non-mileage expense for the test user.

**Steps:**
1. Navigate to the expense list and tap a mileage-type expense → **Expected:** Detail page shows From, To, Miles fields with their saved values, in addition to all standard expense fields
2. Tap back to return to the list → **Expected:** Returns to expense list
3. Tap a non-mileage expense → **Expected:** Detail page shows standard fields only; From, To, Miles fields are NOT displayed

---

## Edge Cases

### EC-01: Form Validation — Required Fields and Constraints

**Objective:** Verify the form enforces required field validation and date constraints.
**Pre-conditions:** User is on the new expense form.

**Steps:**
1. Without filling any fields, tap "Save" → **Expected:** Validation errors appear for all required fields; form does NOT submit; no API call is made
2. Enter a date in the future (beyond today) → **Expected:** Date picker restricts selection to today or earlier; future dates are not selectable
3. Select a type/payment combination that requires a comment, leave the comment empty, and tap "Save" → **Expected:** Validation error indicates comment is required for this combination; form does NOT submit

### EC-02: Metadata Loading Failure Recovery

**Objective:** Verify the expense form recovers gracefully when metadata is not cached in sessionStorage.
**Pre-conditions:** User is logged in.

**Steps:**
1. Clear browser sessionStorage (DevTools → Application → Session Storage → Clear) → **Expected:** No immediate error
2. Navigate to the new expense form via the "+" FAB → **Expected:** Form loads successfully with all dropdowns populated (fetches metadata from API as fallback); does NOT show "Loading metadata..." indefinitely (regression from round 1 fix)

### EC-03: Empty Search Results

**Objective:** Verify the expense list handles a date range with no matching expenses gracefully.
**Pre-conditions:** User is on the expense list page.

**Steps:**
1. Set the date range to a very old period where no expenses exist (e.g., 2020-01-01 to 2020-01-31) and tap "Search" → **Expected:** List area shows an empty state message (e.g., "No expenses found") instead of a blank screen or error

---

## AC Traceability

| AC | Covered By |
|----|-----------|
| AC1: Search by date range | SC-01 (steps 3-6), EC-03 |
| AC2: Expense card list | SC-01 (step 4) |
| AC3: Expense detail view | SC-03 (steps 1-4), SC-05 |
| AC4: Create/edit expenses | SC-02, SC-03 (steps 6-8), EC-01 |
| AC5: Dynamic metadata loading | SC-02 (steps 2-5), EC-02 |
| AC6: Mileage calculation | SC-04, SC-05 |

## Regression Focus Areas

These items were fixed during QA rounds 1 and 2 and must be explicitly re-verified:

| Fix | Verify In |
|-----|-----------|
| Directory listing on page refresh | SC-01 step 7 |
| Reimbursable checkbox responsiveness | SC-02 step 8 |
| Metadata loading fallback (no sessionStorage) | EC-02 |
| Attachment modal displays image (not dark overlay) | SC-03 step 3 |
| Edit page shows existing attachment preview (not broken icon) | SC-03 step 7 |
