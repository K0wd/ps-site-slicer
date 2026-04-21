# Test Plan: SM-864 — Vendor Admin AG Grid Filters and Sorting

**Ticket:** SM-864 | **Parent Epic:** SM-862 (Vendor Admin AG Grid Revamp)
**Status:** On Stage | **Priority:** High
**Environment:** https://testserver.betacom.com/spa | **Credentials:** Bandeleonk / test1234

---

## Summary

Verify that the Vendor Admin AG Grid provides complete filtering, sorting, column menu, and state persistence functionality consistent with other AG Grid modules (e.g., Project Tracker). A previous stage verification identified a **known defect in Scenario 9 — combining multiple filters with AND logic** — which must be re-tested.

## Pre-conditions (All Scenarios)

- User is logged in as Bandeleonk at `https://testserver.betacom.com/spa/auth/login`
- User has navigated to the Vendor Admin module via the sidebar
- The AG Grid has loaded with vendor data and no console errors are present
- Any previously saved filters/sorts have been cleared (click "Clear All Filters" if present)

---

## Scenarios

### SC-01: Single and Multi-Column Sorting

**Objective:** Verify ascending, descending, and clear sort on a single column, then verify multi-column sort with Ctrl+click produces correct numbered indicators and nested ordering.
**Pre-conditions:** Grid is in default unsorted state.

**Steps:**
1. Click the "Company Name" column header once → **Expected:** Grid sorts A-Z; ascending arrow indicator appears on the header
2. Click the "Company Name" column header a second time → **Expected:** Grid sorts Z-A; indicator changes to descending direction
3. Click the "Company Name" column header a third time → **Expected:** Sort clears; grid returns to default order; no sort indicator visible
4. Click the "State" column header once → **Expected:** Grid sorts by State ascending
5. Hold Ctrl and click the "Company Name" column header → **Expected:** Secondary sort applied within each State group; numbered indicators show State = 1, Company Name = 2
6. Hold Ctrl and click the "Status" column header → **Expected:** Third-level sort added; indicators show 1, 2, 3 on respective columns; data ordered correctly across all three levels
7. Click "Clear All Filters" button → **Expected:** All sort indicators removed; grid returns to default order

---

### SC-02: Column Filtering — Text Contains, Set Values, Apply/Reset

**Objective:** Verify that text filters default to "contains," set filters display database-populated distinct values, and Apply/Reset buttons control when filters take effect.
**Pre-conditions:** Grid is unfiltered.

**Steps:**
1. Click the filter icon on the "Company Name" column → **Expected:** Filter dropdown opens with a text input field; default condition is "Contains" (not "Equals"); Apply and Reset buttons are visible at the bottom
2. Type a partial vendor name (e.g., "tech") without clicking Apply → **Expected:** Grid does NOT filter yet (filter is not applied until user clicks Apply)
3. Click the "Apply" button → **Expected:** Grid filters to show only vendors whose Company Name contains "tech"; row count updates
4. Click the "Reset" button → **Expected:** Filter clears; full dataset is restored
5. Open the filter dropdown on a Set-type column (e.g., "State") → **Expected:** Checkbox list of distinct values appears, auto-populated from the database (not hardcoded)
6. Select one value (e.g., "Texas") and click Apply → **Expected:** Grid filters to show only Texas vendors; row count reflects the filtered subset
7. Click "Clear All Filters" in the toolbar → **Expected:** All active filters removed; grid shows full dataset; no filter highlights remain on any column header

---

### SC-03: Combined Multi-Column Filters with Sort

**Objective:** Verify that multiple filters applied across different columns combine with AND logic, and that sorting respects the filtered dataset. **Note:** This scenario previously FAILED on Stage (Scenario 9 defect) — re-test required.
**Pre-conditions:** Grid is unfiltered and unsorted.

**Steps:**
1. Open the filter on the "Status" column, select "Active" (or equivalent active status), and click Apply → **Expected:** Grid shows only active vendors; note the row count
2. Open the filter on the "State" column, select "California," and click Apply → **Expected:** Grid further reduces to show only active vendors in California; row count is less than or equal to the Active-only count; every displayed row matches both Status = Active AND State = California
3. Click the "Company Name" column header to sort ascending → **Expected:** Filtered results (active California vendors only) are now sorted A-Z; no non-California or inactive vendors appear
4. Verify data integrity by scrolling through results → **Expected:** Every row shows Active status AND California state AND names are in A-Z order
5. Click "Clear All Filters" → **Expected:** All filters and sort removed; grid returns to the full unfiltered dataset in default order

---

### SC-04: Filter and Sort Persistence Across Refresh and Clear

**Objective:** Verify that applied filters and sorts persist via localStorage after page refresh, and that "Clear All Filters" properly resets the persisted state.
**Pre-conditions:** Grid is unfiltered and unsorted.

**Steps:**
1. Apply a filter on the "State" column (e.g., select "Texas") and sort "Company Name" ascending → **Expected:** Grid shows Texas vendors sorted A-Z
2. Press F5 to refresh the page → **Expected:** After reload, the State filter is still active (only Texas vendors shown) and Company Name ascending sort is still applied
3. Close the browser tab entirely, then reopen the Vendor Admin page → **Expected:** Filter and sort state are restored from localStorage
4. Click "Clear All Filters" → **Expected:** All filters and sorts removed; grid shows full dataset in default order
5. Press F5 to refresh the page again → **Expected:** Grid loads with no filters or sorts applied (the cleared state was persisted)

---

### SC-05: Column Menu, Rearranging, Pinning, and Visibility

**Objective:** Verify the static column menu (hamburger icon) with its three tabs, drag-and-drop column rearranging, column pinning, and column visibility toggling.
**Pre-conditions:** Grid is in default column layout.

**Steps:**
1. Observe any column header without hovering → **Expected:** Hamburger menu icon is statically visible (always shown, not hover-only); consistent across at least three different columns
2. Click the hamburger menu on the "Company Name" column → **Expected:** Column menu panel opens with three tabs: Filter, General, and Columns
3. Click the "Columns" tab → **Expected:** Shows all available columns with checkboxes; uncheck one column (e.g., "State") → the State column hides from the grid; re-check it → the column reappears with no data misalignment
4. Click the "General" tab and pin "Company Name" to the left → **Expected:** Company Name column stays fixed while scrolling horizontally through other columns
5. Unpin the column via the General tab → **Expected:** Column returns to its normal scrollable position
6. Drag the "State" column header to a new position (e.g., before "Company Name") → **Expected:** Visual drop indicator shown during drag; column repositions correctly on drop; row data remains aligned with correct column headers

---

## Edge Cases

### EC-01: Filter Returning No Results

**Objective:** Verify graceful handling when a filter matches zero vendors.
**Pre-conditions:** Grid is unfiltered.

**Steps:**
1. Open the text filter on "Company Name," type a non-matching string (e.g., "ZZZZNONEXISTENT999"), and click Apply → **Expected:** Grid shows zero rows with an empty state message (no crash, no JavaScript errors)
2. Click Reset or "Clear All Filters" → **Expected:** Full dataset is restored

---

### EC-02: Special Characters in Filter Input

**Objective:** Verify that special characters do not cause XSS, injection, or UI breakage.
**Pre-conditions:** Grid is unfiltered.

**Steps:**
1. Open the text filter on "Company Name," type `& ' " < >` and click Apply → **Expected:** No JavaScript errors in the console; no broken UI rendering; grid shows matching results or empty state
2. Open the text filter, type `<script>alert('xss')</script>` and click Apply → **Expected:** Input is treated as literal text; no script execution; grid shows empty state or matching results safely

---

### EC-03: Filter on Every Column Availability

**Objective:** Verify that every column in the grid has a working filter dropdown with appropriate filter type.
**Pre-conditions:** Grid is unfiltered.

**Steps:**
1. For each column in the grid, click the filter icon → **Expected:** Filter dropdown opens; text columns show a text filter defaulting to "Contains"; set/category columns show a checkbox list of distinct values
2. Verify Apply and Reset buttons are present on every column's filter panel → **Expected:** Both buttons visible and functional on each column
3. Apply one filter on a text column and one on a set column → **Expected:** Both filters reduce the dataset correctly; clicking "Clear All Filters" removes both

---

## Known Defect

| Scenario | Issue | Env | Status |
|---|---|---|---|
| SC-03 (AND logic) | Combining multiple column filters does not correctly apply AND logic — filtered results may not reflect both conditions | Stage | **OPEN — requires fix and re-test** |
