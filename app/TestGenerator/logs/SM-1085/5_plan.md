# Test Plan — SM-1085: PWA Expense Module

**Ticket:** SM-1085 | **Status:** Testing | **Priority:** High
**Test URL:** https://testserver.betacom.com/testpwa
**Credentials:** Bandeleonk / test1234

---

## Summary

Verifies that the Expense module has been successfully migrated from the React Native mobile app to the SiteManager PWA (Next.js). Coverage focuses on the full expense lifecycle — navigation, search/list, detail view, create/edit form, and mileage calculation — plus regression of the attachment display issues fixed in QA rounds 1 and 2.

---

## Pre-conditions

- Logged in to the PWA at https://testserver.betacom.com/testpwa as Bandeleonk / test1234
- At least one existing expense record exists in the system for the current user
- At least one existing expense has an attachment (image) linked to it
- At least one existing expense is of the Mileage type

---

## Scenarios

---

### SC-01: Navigation and Default List Load

**Objective:** Proves the Expenses module is accessible from the sidebar and loads correctly with default date filtering applied.

**Pre-conditions:** Logged in; on the PWA home screen.

**Steps:**
1. Open the sidebar menu → **Expected:** Sidebar opens; "Expenses" link is visible in the navigation list.
2. Confirm the sidebar order of navigation items → **Expected:** Expenses appears in the correct position matching the legacy React Native app order.
3. Tap "Expenses" → **Expected:** Page navigates to `/expense`; a list of expense cards is displayed.
4. Inspect the Start Date and End Date filter fields without changing them → **Expected:** Start date defaults to approximately one year prior to today; End date defaults to today.
5. Confirm card list is sorted → **Expected:** Cards are ordered newest-first by expense date.
6. Confirm each card shows minimal summary data → **Expected:** Each card displays at minimum: date, amount, expense type, and approval status badge.

---

### SC-02: Date Range Search and Refresh

**Objective:** Proves the search filter correctly updates the expense list when a custom date range is applied, and that page refresh does not break the route.

**Pre-conditions:** On the `/expense` list page with the default date range loaded.

**Steps:**
1. Change the Start Date to a narrow recent range (e.g., first day of current month) and change the End Date to today → **Expected:** Date picker accepts both values without error.
2. Tap the Search button → **Expected:** The expense list refreshes; only expenses falling within the selected range are shown.
3. Change the date range to a period known to have no expenses (e.g., a single day in the past with no records) and tap Search → **Expected:** The list shows an empty state message; no cards are displayed; no crash occurs.
4. Tap the refresh icon in the PWA header → **Expected:** The expense list reloads within the current date range; the page remains on the expense list (not an Apache directory listing or 404).
5. Directly navigate to `/expense/` with a trailing slash (browser address bar) → **Expected:** The expense list page loads correctly; no directory listing is shown.

---

### SC-03: Expense Detail View

**Objective:** Proves all expense fields render correctly in the read-only detail view, including attachment display and back navigation.

**Pre-conditions:** At least one expense with an attachment exists in the list.

**Steps:**
1. Tap any expense card from the list → **Expected:** Navigates to `/expense/detail`; the detail page loads without error.
2. Verify all standard fields are visible → **Expected:** WO#, Date Entered, Amount, Approval Status, Type, Payment Type, Reimbursable flag, and Comment are all displayed.
3. Verify date formatting → **Expected:** "Date Entered" displays a readable formatted date with no console deprecation warnings (moment.js fix verified).
4. Tap the card for an expense that has an attachment → **Expected:** An attachment link or thumbnail is visible on the detail page.
5. Tap the attachment link → **Expected:** An image modal opens; the attachment image is visible and not obscured by a dark overlay; if the image cannot load, a fallback message "Unable to load attachment" is displayed.
6. Close the modal and tap the back arrow → **Expected:** Navigates back to the expense list; the list retains its previous state.

---

### SC-04: Create New Expense with Dynamic Metadata

**Objective:** Proves the create form loads dynamic metadata correctly, applies conditional field logic, and saves a new expense that appears in the list.

**Pre-conditions:** On the `/expense` list page. Metadata endpoint (`/timesheets/expensemeta`) is reachable.

**Steps:**
1. Tap the red + FAB button → **Expected:** Navigates to `/expense/edit`; the "New Expense" form loads immediately without a stuck "Loading metadata..." spinner.
2. Inspect the Expense Type dropdown → **Expected:** Dropdown is populated with options loaded from the server (not empty; not hardcoded).
3. Inspect the Payment Type dropdown → **Expected:** Dropdown is populated with payment type options from the server.
4. Select an expense type that has a configured default amount in metadata → **Expected:** The Amount field auto-populates with the default value and becomes read-only.
5. Select an expense type or payment type that is in the `comments_required` metadata list → **Expected:** A Reason dropdown appears; a visual warning indicator is shown prompting the user to select a reason.
6. Toggle the Reimbursable to Me checkbox on and off → **Expected:** Checkbox checks and unchecks reliably on each click (native HTML checkbox behavior confirmed).
7. Toggle the "Scheduled" switch on the WO# field → **Expected:** WO# input switches from a manual text entry with autocomplete to a scheduled WO dropdown, and back again on second toggle.
8. Fill all required fields (date, type, payment type, amount) and tap Save → **Expected:** A success toast notification appears; the page redirects to the expense list.
9. Confirm the new expense is visible in the list → **Expected:** The newly created expense card appears at the top of the list (newest first), showing correct date, amount, and type.

---

### SC-05: Edit Existing Expense and Attachment Preview

**Objective:** Proves that an existing expense opens pre-populated in edit mode, changes save correctly, and the existing attachment renders as an inline preview rather than a broken image.

**Pre-conditions:** At least one expense with an attachment exists. On the `/expense` list page.

**Steps:**
1. Tap an expense card to open the detail view → **Expected:** Detail page loads with all fields shown.
2. Tap the red edit FAB button → **Expected:** Navigates to `/expense/edit/[id]`; the form opens with all fields pre-populated from the existing expense data.
3. Verify attachment display in edit form → **Expected:** The existing attachment is shown as an inline image preview directly in the form (not a broken image icon; not just a clickable link); the image resolves via `/downloads/mv2` endpoint.
4. Modify one field (e.g., change the Comment text) → **Expected:** The field accepts input.
5. Tap Save → **Expected:** Success toast appears; the page redirects to the detail view or list; the modified field reflects the updated value.

---

### SC-06: Mileage Expense Creation and Auto-Calculation

**Objective:** Proves the mileage calculator component appears conditionally, auto-calculates the amount from miles × rate, and saves correctly.

**Pre-conditions:** On the `/expense/edit` (new expense) form. Metadata is loaded.

**Steps:**
1. Open the Expense Type dropdown and select the Mileage type (the type matching `metadata.mileage_item`) → **Expected:** The standard amount field is hidden or disabled; the MileageCalculator sub-form appears with From, To, and Miles fields.
2. Click into the From location input → **Expected:** A dropdown of office suggestions from metadata appears as quick-select options.
3. Select an office from the suggestions as the From location → **Expected:** The From field populates with the selected office name.
4. Enter a destination in the To location field → **Expected:** Field accepts free text input; office suggestions are also available.
5. Enter a numeric miles value (e.g., 25) → **Expected:** The Amount field auto-calculates to `miles × mileage_rate` (e.g., if rate is $0.67, Amount shows $16.75); calculation updates in real time.
6. Fill remaining required fields (date, payment type) and tap Save → **Expected:** Success toast appears; expense saves successfully.
7. Locate the new mileage expense in the list → **Expected:** Card shows the correct calculated amount and mileage type label.

---

## Edge Cases

---

### EC-01: Form Validation Blocks Save on Missing Required Fields

**Objective:** Confirms the form cannot be submitted with required fields empty.

**Steps:**
1. Navigate to `/expense/edit` (new expense) and immediately tap Save without filling any fields → **Expected:** Save is blocked; validation errors are displayed identifying which required fields are missing; no API call is made; the user remains on the form.
2. Fill only the Expense Type and tap Save → **Expected:** Remaining required fields (date, amount) still surface validation errors; form does not submit.

---

### EC-02: Mileage Type Requires Miles — Amount Cannot Be Zero

**Objective:** Confirms the mileage form validates that miles > 0 before allowing save.

**Steps:**
1. Select the Mileage expense type → **Expected:** MileageCalculator appears.
2. Leave the Miles field at 0 or empty and tap Save → **Expected:** Validation error appears on the Miles field; Amount remains $0.00; form does not submit.
3. Enter a valid miles value → **Expected:** Amount calculates correctly; Save proceeds successfully.

---

### EC-03: Page Refresh Stability Across All Expense Routes

**Objective:** Confirms the .htaccess fix holds across all four expense routes after browser refresh.

**Steps:**
1. Navigate to `/expense` and press browser refresh → **Expected:** Expense list reloads; no directory listing.
2. Navigate to an expense detail page and press browser refresh → **Expected:** Detail page reloads correctly.
3. Navigate to `/expense/edit` and press browser refresh → **Expected:** Create form reloads correctly; metadata loads without getting stuck.