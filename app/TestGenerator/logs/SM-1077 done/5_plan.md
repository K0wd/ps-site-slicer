# Test Plan — SM-1077: PWA Clock Simple Module

## Summary

This plan validates the Clock Simple module conversion from React Native to the SiteManager PWA (Next.js), covering the full timesheet entry lifecycle, critical bug fixes applied during this testing cycle (time picker, WO search modal, lunch display, validation order, approval blocking), and access control restrictions for approved timesheets and salary users.

## Pre-conditions

- Test environment: https://testserver.betacom.com/testpwa
- Standard test account: `Bandeleonk` / `test1234`
- Salary user test account: `hawseyl` (confirmed `hours_exempt=1` in DB)
- A date with **existing approved timesheet data** must be available in the test DB
- A date with **existing unapproved timesheet periods** must be available (with known WO, truck, and lunch values to verify against)
- A date within the current week with **no existing periods** must be available for the happy path

---

## Scenarios

### SC-01: Full Timesheet Entry and Approval (Happy Path)

**Objective:** Proves the end-to-end workflow — login, date selection, adding a fully populated period, saving, and confirming data persists under Current Period(s).

**Pre-conditions:** Logged out. A clean date within the current week with no existing periods is available.

**Steps:**
1. Navigate to `https://testserver.betacom.com/testpwa` → **Expected:** Login screen loads. Overall color theme is dark green/teal (not navy blue).
2. Enter `Bandeleonk` / `test1234` and click **Sign In** → **Expected:** Redirects directly to the Clock Simple screen. Date picker defaults to today's date.
3. Click anywhere on the date input field → **Expected:** A calendar popup opens immediately (no need to locate a small icon).
4. Select a valid date within the current week that has no existing periods → **Expected:** Current Period(s) section loads showing no existing entries. **Add Period +** button is visible and enabled.
5. Click **Add Period +** → **Expected:** A new blank period form appears under **New Period(s)**.
6. Click anywhere on the **Time In** field → **Expected:** Time picker opens. Set to `08:00 AM`.
7. Click anywhere on the **Time Out** field → **Expected:** Time picker opens. Set to `04:30 PM`. Total hours auto-calculates to reflect the correct duration (8.5 hours minus any lunch).
8. Click the WO selector button → **Expected:** A full-screen modal opens with a header, close button, search input at top, and an empty list below.
9. Type `1` in the modal search input → **Expected:** A list of matching Work Orders auto-populates without requiring an additional click. No duplicate "N/A" entries appear.
10. Select a WO from the list → **Expected:** Modal closes. Selected WO label displays correctly in the period row.
11. Select a value from the **Truck** dropdown → **Expected:** Truck selection saves to the period form.
12. Select a value from the **Lunch Duration** dropdown → **Expected:** Selection is visible and retained.
13. Fill in **Tech Response** field with any text → **Expected:** Field accepts input.
14. Click **Save & Approve Timesheet** → **Expected:** Confirmation dialog appears.
15. Confirm the dialog → **Expected:** Success message displays. The saved period now appears under **Current Period(s)** after reload, showing correct time, WO, truck, and lunch values.

---

### SC-02: Current Periods Read-Only Display

**Objective:** Proves that existing saved periods load correctly for a selected date, display all fields including lunch duration (previously missing), and are not editable.

**Pre-conditions:** A date exists in the test DB with at least one saved period that includes a known WO, truck assignment, and lunch duration value.

**Steps:**
1. Login as `Bandeleonk` and navigate to Clock Simple.
2. Click the date input field → **Expected:** Calendar popup opens on full-field click.
3. Select the date with known existing periods → **Expected:** **Current Period(s)** section loads and displays the saved period(s).
4. Verify the period row shows: correct Time In, Time Out, WO name, truck, and **lunch duration label and value** → **Expected:** All five data points are visible. Lunch duration is not blank.
5. Attempt to click or interact with any field in the Current Period(s) row → **Expected:** Fields are read-only; no input is accepted, no edit form opens.

---

### SC-03: Time Input and WO Picker Interactions (Fixed Behaviors)

**Objective:** Confirms the three UI components with known prior defects now work correctly: time fields support both direct typing and picker, and the WO modal behaves as specified.

**Pre-conditions:** Logged in. A new period has been added (Add Period + clicked).

**Steps:**
1. Click the **Time In** field directly (not on a picker icon) → **Expected:** Time picker opens immediately.
2. Close the picker. Now type `09:00` directly into the **Time In** field using the keyboard → **Expected:** The field accepts the typed time; value updates to `09:00 AM`.
3. Click directly on the **Time Out** field → **Expected:** Time picker opens.
4. Close the picker. Type `05:00` directly into the **Time Out** field → **Expected:** Field accepts typed input. Total hours auto-updates.
5. Click the WO selector button → **Expected:** Full-screen modal opens with title header, visible close (X) button, a search input, and a list area.
6. Type a number in the modal search box → **Expected:** Matching WO results auto-appear in the list immediately without a separate trigger click.
7. Select a WO → **Expected:** Modal closes. The period row shows the WO label. The WO selector button shows the selected WO name (not a blank or repeated "N/A").
8. Click the WO selector button again to reopen the modal → **Expected:** Modal opens cleanly. Previous search text is not carried over causing duplicate entries.

---

### SC-04: Validation Error Sequence

**Objective:** Confirms validation fires in the correct order (time first, then WO, then lunch) and produces the correct per-period error messages.

**Pre-conditions:** Logged in. Clock Simple screen is open on a date with no existing periods.

**Steps:**
1. Click **Save & Approve Timesheet** without adding any periods → **Expected:** Error message: *"You need to add a period at least."*
2. Click **Add Period +** to add a new blank period. Do not fill in any fields. Click **Save & Approve Timesheet** → **Expected:** Error message: *"Period 1: Please select a valid time period."* No lunch-related error appears first.
3. Set a valid Time In and Time Out. Leave WO, Truck, and Lunch unset. Click **Save & Approve Timesheet** → **Expected:** An error related to WO or Lunch appears (not a time error), confirming the validation has advanced past the time check. Specifically: *"Period 1: Please select a lunch option."*
4. Set a Lunch Duration. Leave WO unset if WO is required. Click **Save & Approve Timesheet** → **Expected:** Appropriate error for next missing required field. System does not allow saving incomplete data.
5. Fill all required fields completely. Click **Save & Approve Timesheet** → **Expected:** Confirmation dialog appears — no validation errors.

---

### SC-05: Access Control — Approved Timesheet and Salary User

**Objective:** Confirms two enforcement mechanisms are correctly blocking writes: (1) manager-approved timesheet locks the form, (2) salary-type user cannot add or submit periods.

**Pre-conditions:** A manager-approved timesheet date exists in the DB. Salary test account `hawseyl` is available.

**Steps:**
1. Login as `Bandeleonk`. On Clock Simple, select the date with a manager-approved timesheet → **Expected:** Current Period(s) shows the approved periods. **Add Period +** and **Save & Approve Timesheet** buttons are visibly grayed out (disabled). An approval notice is displayed near the buttons.
2. Attempt to click **Add Period +** → **Expected:** Button is non-interactive (disabled). No new period form appears.
3. Attempt to click **Save & Approve Timesheet** → **Expected:** Button is non-interactive (disabled). No confirmation dialog or save action occurs.
4. Logout. Login as `hawseyl` (salary user). Navigate to Clock Simple → **Expected:** Clock Simple screen loads.
5. Click **Add Period +** → **Expected:** Error message: *"SALARY user can not add any periods."* No period form is added.
6. Click **Save & Approve Timesheet** → **Expected:** Error message: *"SALARY user can not submit any timesheet."* No save action occurs.

---

## Edge Cases

### EC-01: Date Picker Boundary Constraints

**Objective:** Confirms the calendar enforces the current-week-only rule and blocks future dates.

**Pre-conditions:** Logged in on Clock Simple. Today is within a standard Mon–Sun week.

**Steps:**
1. Click the date input field to open the calendar → **Expected:** Calendar opens.
2. Attempt to select tomorrow or any future date → **Expected:** Future dates are not selectable (grayed out or unresponsive).
3. Attempt to navigate to the previous week and select a date outside the current week → **Expected:** Dates outside the current week are not selectable.
4. Select a valid date from within the current week (e.g., yesterday) → **Expected:** Date is selectable, Current Period(s) loads for that date.

---

### EC-02: Adding and Deleting Multiple Periods

**Objective:** Confirms the add/delete period lifecycle works correctly when multiple periods are added before saving.

**Pre-conditions:** Logged in. A date with no existing periods is selected.

**Steps:**
1. Click **Add Period +** twice → **Expected:** Two separate period forms appear under **New Period(s)**, labeled "Period 1" and "Period 2".
2. Delete Period 2 using the delete/remove control → **Expected:** Period 2 is removed. Only Period 1 remains.
3. Fill Period 1 with valid time, WO, truck, and lunch. Click **Save & Approve Timesheet** → **Expected:** Confirmation dialog appears. No error about the deleted period. Save succeeds.
4. After confirmation, reload the date → **Expected:** Exactly one period appears in **Current Period(s)** matching the saved Period 1 data.