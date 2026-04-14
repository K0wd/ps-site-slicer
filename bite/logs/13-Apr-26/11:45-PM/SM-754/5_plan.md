# Test Plan: SM-754 — Purchasing Tracker Filters Not Working

## Summary

Verify that all filters in the Purchasing Tracker table view are functioning correctly, including filtering the table and exporting filtered data. The most recent fix (SVN r16662, 2026-01-30) addressed the Approval and Approver(s) column filters specifically:
- **Approval Column:** Blank filter now returns NULL/empty/"Approval Not Needed" records; Override filter uses partial matching; display values normalized to Approved/Pending Approval/Override/Rejected.
- **Approver(s) Column:** Blank filter checks both designated approvers table and approval history; specific approver filter includes both sources.

**Related ticket:** SM-756 (Purchasing Tracker Export not pulling all data) — Backlog  
**Related ticket:** SM-829 (Blank filter issues on Approval/Approver(s) columns)

---

## Pre-conditions

1. User is logged into SM Test at `https://testserver.betacom.com/spa` with credentials `Bandeleonk / test1234`
2. User navigates to the Purchasing Tracker page via sidebar
3. Purchasing Tracker table is fully loaded with data visible
4. No filters are currently applied (clean state)
5. Browser: MS Edge

---

## Test Cases

### TC-01: ID Filter — Table View

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter icon on the "ID" column header | Filter input/dropdown appears |
| 2 | Enter a known valid ID value | Table filters to show only rows matching that ID |
| 3 | Verify the row count at the bottom of the table | Count matches the number of visible filtered rows |
| 4 | Clear the filter by clicking "x" | Table returns to unfiltered state; filter symbol is removed from header |

### TC-02: ID Filter — Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Apply a filter on the "ID" column with a known value | Table filters correctly |
| 2 | Click the Export button | Export file downloads successfully |
| 3 | Open the exported file | Only the filtered ID rows are present; row count matches the table view |

### TC-03: Request Date Filter — Table View

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter icon on the "Request Date" column | Date filter options appear (note: "equal" condition was removed; use before/after/between) |
| 2 | Set a date range filter (e.g., "after" a specific date) | Table filters to show only rows with request dates matching the criteria |
| 3 | Clear the filter | Table returns to unfiltered state |

### TC-04: Request Date Filter — Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Apply a Request Date filter | Table filters correctly |
| 2 | Export the data | Exported file contains only the filtered rows with matching request dates |

### TC-05: Request By Date Filter — Table View + Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Apply a "Request By Date" filter with a date range | Table filters correctly |
| 2 | Export the filtered data | Exported rows match the filtered table view |

### TC-06: WO# Filter — Table View + Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Apply a filter on "WO#" with a known value | Table filters to matching rows |
| 2 | Export the filtered data | WO# column appears in export; filtered rows match table view |

### TC-07: Requested Total Filter — Table View + Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Apply a filter on "Requested Total" (e.g., greater than a value) | Table filters correctly |
| 2 | Export the filtered data | Export completes successfully; rows match filtered view |

### TC-08: Division Column — Filter Removed

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Inspect the "Division" column header | No filter icon/option is present on the Division column |

### TC-09: Type Filter — Table View + Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Apply a filter on "Type" (e.g., select "PO") | Table filters to matching rows |
| 2 | Export the filtered data | Export completes; only rows of the selected type are present |

### TC-10: Description Filter — Table View + Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Apply a text filter on "Description" with a keyword | Table filters to rows containing the keyword |
| 2 | Export the filtered data | Exported rows match filtered view |

### TC-11: Status Filter — Table View + Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Apply a filter on "Status" (e.g., select a specific status) | Table filters correctly |
| 2 | Export the filtered data | Exported rows match filtered view |

### TC-12: Approval Filter — Dropdown + Table View

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter icon on the "Approval" column | A **dropdown with checkboxes** appears (not a free-text search field) with options: Blank, Approved, Pending Approval, Override, Rejected |
| 2 | Select "Approved" | Table shows only rows with "Approved" status |
| 3 | Clear and select "Pending Approval" | Table shows only "Pending Approval" rows |
| 4 | Clear and select "Override" | Table shows rows with "Override Provided by..." values |
| 5 | Clear and select "Blank" | Table shows rows where Approval is NULL, empty, or "Approval Not Needed" |

### TC-13: Approval Filter — Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Filter Approval column by "Approved" | Table filters correctly |
| 2 | Export the data | Exported rows match; Approval column values are normalized (Approved, Pending Approval, Override, Rejected) |

### TC-14: Approver(s) Filter — Table View

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter on "Approver(s)" column | Filter options appear |
| 2 | Select a specific approver name | Table shows rows where that person is a designated approver OR appears in approval action history |
| 3 | Clear and select "Blank" | Table shows only rows with NO approvers (no designated approvers AND no approval history) |

### TC-15: Approver(s) Filter — Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Filter Approver(s) by a specific name | Table filters correctly |
| 2 | Export the data | Approver(s) column is present in export; filtered rows match table view |

### TC-16: Assigned To Filter — Table View + Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Apply a filter on "Assigned To" with a known name | Table filters correctly |
| 2 | Export the filtered data | Exported rows match; "Assigned To" column data is correct |

### TC-17: Dept Filter — Table View + Clear Behavior

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Apply a filter on "Dept" with a specific department | Table filters correctly |
| 2 | Click the "x" to clear the Dept filter | Filter is removed; filter symbol is removed from the Dept column header; table shows all rows again (no residual filter values) |

### TC-18: Dept Filter — Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Filter by Dept | Table filters correctly |
| 2 | Export | Exported rows match filtered view |

### TC-19: Priority Filter — Table View + Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Apply a filter on "Priority" | Table filters correctly |
| 2 | Export the filtered data | Exported rows match |

### TC-20: Vendor Filter — Table View + Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Apply a filter on "Vendor" with a known vendor name | Table filters correctly |
| 2 | Export the filtered data | Exported rows match |

### TC-21: PO# Filter — Table View + Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Apply a filter on "PO#" | Table filters correctly |
| 2 | Export the filtered data | Exported rows match |

### TC-22: Needs My Approval Filter — Table View

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Filter "Needs My Approval" by "Yes" | Table shows only rows requiring the logged-in user's approval (or 0 results with count displayed) |
| 2 | Filter by "No" | Table shows rows not needing approval (note: may be slow with large datasets) |
| 3 | Filter by "Blank" | Returns rows with blank values, or 0 results |

### TC-23: Needs My Approval Filter — Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Filter "Needs My Approval" by "Yes" | Table filters correctly |
| 2 | Export | Exported rows match filtered view |

---

## Edge Cases

### EC-01: Blank Filter on Approval Column
- Select "Blank" in Approval filter
- **Expected:** Returns records with NULL, empty string, or "Approval Not Needed" values
- **Why:** This was a recurring defect (SM-829); the backend now checks multiple empty states

### EC-02: Blank Filter on Approver(s) Column
- Select "Blank" in Approver(s) filter
- **Expected:** Returns only POs with zero approvers across both designated approvers table and approval history
- **Why:** Previously returned incorrect results due to incomplete table joins

### EC-03: Override Values in Approval Column
- Filter Approval by "Override"
- **Expected:** Returns rows where the raw value is "Override Provided by [Name]" — partial match works
- **Why:** Display values vary ("Override Provided by John Doe") but filter uses normalized category

### EC-04: Multi-Value Filter Selection
- Select multiple values in a filter dropdown (e.g., both "Approved" and "Pending Approval" in Approval)
- **Expected:** Table shows rows matching ANY of the selected values

### EC-05: Clearing Filters Removes Filter Symbol
- Apply a filter on any column, then clear it via "x"
- **Expected:** The filter icon/symbol in the column header is removed; table returns to full dataset
- **Special attention:** Dept column had a known issue where the symbol persisted after clearing

### EC-06: Approval Column Remains a Dropdown
- Navigate away from Purchasing Tracker and return
- **Expected:** Approval filter still presents a dropdown (not a search field)
- **Why:** Historical issue where dropdown reverted to search field after deployments

### EC-07: Export with Large Result Set
- Apply a filter that returns a large dataset (e.g., "Needs My Approval" = "No" or "Assigned To" with many records)
- **Expected:** Export may take longer but should eventually complete or show a meaningful timeout/error — not freeze indefinitely
- **Known limitation:** Server is resource-constrained; exports exceeding ~8k rows may be very slow

### EC-08: Date Filter Conditions
- Open Request Date or Request By Date filter
- **Expected:** "Equal" condition is NOT available (was intentionally removed); only before/after/between options are present

### EC-09: Approver Filter Includes Approval History
- Filter Approver(s) by a person who approved a PO but is NOT a designated approver
- **Expected:** That PO still appears in filtered results (approval action history is now checked)

---

## Results

### Test Environment Results

| TC# | Description | Pass/Fail | Notes |
|-----|-------------|-----------|-------|
| TC-01 | ID Filter — Table | | |
| TC-02 | ID Filter — Export | | |
| TC-03 | Request Date — Table | | |
| TC-04 | Request Date — Export | | |
| TC-05 | Request By Date — Table + Export | | |
| TC-06 | WO# — Table + Export | | |
| TC-07 | Requested Total — Table + Export | | |
| TC-08 | Division — Filter Removed | | |
| TC-09 | Type — Table + Export | | |
| TC-10 | Description — Table + Export | | |
| TC-11 | Status — Table + Export | | |
| TC-12 | Approval — Dropdown + Table | | |
| TC-13 | Approval — Export | | |
| TC-14 | Approver(s) — Table | | |
| TC-15 | Approver(s) — Export | | |
| TC-16 | Assigned To — Table + Export | | |
| TC-17 | Dept — Table + Clear | | |
| TC-18 | Dept — Export | | |
| TC-19 | Priority — Table + Export | | |
| TC-20 | Vendor — Table + Export | | |
| TC-21 | PO# — Table + Export | | |
| TC-22 | Needs My Approval — Table | | |
| TC-23 | Needs My Approval — Export | | |

### Edge Case Results

| EC# | Description | Pass/Fail | Notes |
|-----|-------------|-----------|-------|
| EC-01 | Blank on Approval | | |
| EC-02 | Blank on Approver(s) | | |
| EC-03 | Override partial match | | |
| EC-04 | Multi-value selection | | |
| EC-05 | Clear removes filter symbol | | |
| EC-06 | Approval stays dropdown | | |
| EC-07 | Large export behavior | | |
| EC-08 | Date "equal" removed | | |
| EC-09 | Approval history lookup | | |
