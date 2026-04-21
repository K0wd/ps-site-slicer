# Test Plan: SM-1030 — Vendor Admin Save View / Select View

**Ticket:** SM-1030 | **Priority:** High | **Status:** On Stage
**Parent:** SM-862 (Vendor Admin AG Grid Revamp)

---

## Summary

Verify that Vendor Admin users can save customized AG Grid layouts (filters, sort, column order, widths, pinned columns) as named views, switch between them via a Select View dropdown, and that views persist across page refreshes. The Delete View button must soft-delete custom views while protecting the Default view from deletion.

---

## Pre-conditions (shared)

- Logged into SM at `https://testserver.betacom.com/spa/auth/login` as **Bandeleonk / test1234**
- User has access to the Vendor Admin module
- The `vendor_admin_views` SQL migration has been run on the test environment
- Any previously created test views are cleaned up (start from a clean state with only Default view)

---

## Scenarios

### SC-01: Default State and Toolbar Layout on First Load

**Objective:** Verify the Select View dropdown, toolbar buttons, and Default view behavior are present and correct on initial page load (AC1)
**Pre-conditions:** No custom views exist for this user

**Steps:**
1. Navigate to Vendor Admin page → **Expected:** Page loads without errors, AG Grid renders with vendor data
2. Observe the left side of the toolbar → **Expected:** A "Select View" dropdown is visible, pre-selected to "Default"
3. Observe the right side of the toolbar → **Expected:** Buttons visible in this order: Add Vendor, Clear Filter, Save View, Export (Delete View is NOT visible because Default is selected)
4. Observe the AG Grid columns → **Expected:** All columns are displayed in their original defined order, no filters applied, no sort active, no columns pinned
5. Click the Select View dropdown → **Expected:** Dropdown opens showing only "Default" as the sole option

---

### SC-02: Create a Custom View with Full Grid Customization

**Objective:** Verify a user can customize the grid layout (sort, drag, pin, filter, resize columns) and save it as a named view that captures the complete grid state (AC2, AC3, AC4)
**Pre-conditions:** On Vendor Admin page with Default view selected

**Steps:**
1. Click on a column header (e.g., "Company Name") to sort ascending → **Expected:** Column sorts ascending, sort indicator appears
2. Drag a column (e.g., "Status") to a different position in the grid → **Expected:** Column moves to the new position
3. Right-click a column header and pin "Vendor ID" to the left → **Expected:** Vendor ID column is pinned to the left side of the grid
4. Resize a column (e.g., widen "Company Name") by dragging its header border → **Expected:** Column width changes
5. Apply a filter on the "Status" column (e.g., filter to "Approved") → **Expected:** Grid filters to show only Approved vendors
6. Click the "Save View" button → **Expected:** A dialog opens prompting for a view name
7. Enter "Approved Vendors" as the view name and confirm → **Expected:** Dialog closes, Select View dropdown now shows "Approved Vendors" as the active selection
8. Click the Select View dropdown → **Expected:** Dropdown lists both "Default" and "Approved Vendors"
9. Observe the toolbar → **Expected:** "Delete View" button is now visible (since a non-Default view is selected)

---

### SC-03: Switch Between Views and Verify Grid State Restoration

**Objective:** Verify switching views via the dropdown fully restores each view's saved grid state — and that Default resets to the original layout (AC5)
**Pre-conditions:** Custom view "Approved Vendors" exists from SC-02

**Steps:**
1. With "Approved Vendors" selected, note the current grid state (sort, column order, pinned columns, filter, column widths) → **Expected:** Grid reflects the customizations saved in SC-02
2. Select "Default" from the Select View dropdown → **Expected:** Grid resets: all columns visible in original order, no filters applied, no sort active, no columns pinned, default column widths restored
3. Verify the Delete View button → **Expected:** Delete View button is hidden (Default view is selected)
4. Select "Approved Vendors" from the Select View dropdown → **Expected:** Grid restores all saved state: Company Name sorted ascending, Status column in its dragged position, Vendor ID pinned left, Company Name at widened width, Status filtered to "Approved"
5. Verify the Delete View button → **Expected:** Delete View button is visible again

---

### SC-04: Page Refresh Persistence and Delete View Lifecycle

**Objective:** Verify the last-used view auto-restores after page refresh (localStorage), and that deleting a view removes it and resets to Default (AC4)
**Pre-conditions:** Custom view "Approved Vendors" is selected and active

**Steps:**
1. With "Approved Vendors" selected, refresh the browser page (F5) → **Expected:** Page reloads, Select View dropdown automatically shows "Approved Vendors", grid state is fully restored (sort, filters, columns, widths, pinning all match the saved view)
2. Click the "Delete View" button → **Expected:** A confirmation dialog appears asking to confirm deletion
3. Confirm the deletion → **Expected:** "Approved Vendors" is removed from the Select View dropdown, dropdown resets to "Default", grid resets to original default layout with all columns, no filters, no sort
4. Click the Select View dropdown → **Expected:** Only "Default" is listed; "Approved Vendors" no longer appears
5. Refresh the browser page → **Expected:** Page reloads with Default view selected (the deleted view does not reappear)

---

### SC-05: Clear Filter Resets to Default View

**Objective:** Verify the Clear Filter button resets the grid and switches back to the Default view
**Pre-conditions:** At least one custom view exists with filters applied

**Steps:**
1. Create and save a custom view "Filtered View" with a filter on Status and a sort on Company Name → **Expected:** View saved successfully, dropdown shows "Filtered View"
2. Click the "Clear Filter" button → **Expected:** All filters and sorts are cleared, grid shows all columns in default order, Select View dropdown resets to "Default"
3. Select "Filtered View" from the dropdown → **Expected:** Grid restores the saved filters and sort for "Filtered View"

---

## Edge Cases

### EC-01: Special Characters in View Name

**Objective:** Verify view names with special characters (e.g., `&`, `<`, `>`, `"`) are saved and displayed correctly without encoding issues
**Pre-conditions:** On Vendor Admin page

**Steps:**
1. Click "Save View" and enter `Flag & Status` as the name → **Expected:** View saves successfully
2. Click the Select View dropdown → **Expected:** Dropdown shows "Flag & Status" — not "Flag &amp; Status" or any other encoded form
3. Select the "Flag & Status" view → **Expected:** Grid restores correctly, view name displays without corruption
4. Delete the "Flag & Status" view → **Expected:** View is removed cleanly from the dropdown

---

### EC-02: View Name Boundary Conditions

**Objective:** Verify behavior at the boundaries of the view name field (VARCHAR(30) max, empty input)
**Pre-conditions:** On Vendor Admin page

**Steps:**
1. Click "Save View" and attempt to save with an empty name (or whitespace only) → **Expected:** Save is prevented or an error message is shown; no empty-named view is created
2. Click "Save View" and enter a name of exactly 30 characters (e.g., `ABCDEFGHIJKLMNOPQRSTUVWXYZ1234`) → **Expected:** View saves successfully and name displays in full in the dropdown
3. Click "Save View" and enter a name of 31+ characters → **Expected:** Input is truncated to 30 characters or an error is shown; no data corruption occurs

---

### EC-03: Duplicate View Name

**Objective:** Verify behavior when saving a view with a name that already exists
**Pre-conditions:** A custom view named "My View" already exists

**Steps:**
1. Customize the grid differently than "My View" → **Expected:** Grid reflects new customizations
2. Click "Save View" and enter "My View" as the name → **Expected:** Either the system prevents the duplicate (shows an error) or updates the existing view — it must not create two views with the same name in the dropdown

---

## Traceability

| Scenario | Acceptance Criteria Covered |
|---|---|
| SC-01 | AC1 (Select View dropdown present, mirrors Purchasing layout) |
| SC-02 | AC2 (customize by sort/drag/pin), AC3 (save as named view), AC4 (available in dropdown) |
| SC-03 | AC5 (switch views, grid updates to reflect selected view) |
| SC-04 | AC4 (persist after refresh), Delete functionality |
| SC-05 | Clear Filter interaction with views |
| EC-01 | AC3 (special character handling in view names) |
| EC-02 | AC3 (name field boundary validation) |
| EC-03 | AC3 (uniqueness constraint on view names) |
