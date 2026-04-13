# Test Plan: SM-754 — Purchasing Tracker Filters Not Working

## Summary

Verify that all filters in the Purchasing Tracker table view are functioning correctly, that filtered results display accurately in the table, and that the Export function outputs only the filtered data. This ticket has gone through multiple fix/retest cycles. The most recent resolution (SVN backend r16662, 2026-01-30) fixed the Approval and Approver(s) column "Blank" filter logic. This test pass covers the full regression of all filters plus the latest Approval/Approver(s) blank-filter fix.

**Jira ticket:** SM-754 (Bug, Medium priority, Status: Testing)
**Epic:** SM-877 (OCT-25-MAINT)
**Related:** SM-756 (Purchasing Tracker Export not pulling all data)
**Component:** Web Misc
**Developer resolution:** Darl Anthony Pepito (SVN r16662) — Approval & Approver(s) blank filter fix

---

## Pre-conditions

1. User has valid credentials: **Bandeleonk / test1234**
2. Test environment is accessible at **https://testserver.betacom.com/spa**
3. The Purchasing Tracker page loads and displays data (navigate via sidebar)
4. There is sufficient test data in the Purchasing Tracker (records with various statuses, approvals, departments, vendors, etc.)
5. The user account has permission to view and export Purchasing Tracker data
6. Browser: MS Edge (msedge channel)
7. The latest build (SVN r16662+) is deployed to Test

---

## Test Cases

### TC-01: Navigate to Purchasing Tracker

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in at `/spa/auth/login` with Bandeleonk / test1234 | Dashboard loads |
| 2 | Navigate to Purchasing Tracker via sidebar | Purchasing Tracker table loads with data |
| 3 | Confirm filter icons are visible in column headers | Filter icons appear on all filterable columns |

---

### TC-02: ID Filter — Table & Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter icon on the "ID" column | Filter panel opens |
| 2 | Enter a known ID value (e.g., a specific PO ID) | Table filters to show only matching rows |
| 3 | Verify the row count at the bottom matches visible rows | Count matches |
| 4 | Click Export while the ID filter is active | Export file downloads |
| 5 | Open the export and verify it contains only the filtered ID rows | Export data matches filtered table view |
| 6 | Clear the filter by clicking "x" | Table returns to unfiltered state; filter icon clears from header |

---

### TC-03: Request Date Filter — Table & Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter icon on the "Request Date" column | Filter panel opens (date-range conditions: before, after — no "equal" per design) |
| 2 | Set a date range (e.g., "after" a specific date) | Table filters to show only rows within the date range |
| 3 | Click Export while the Request Date filter is active | Export downloads with only the filtered date rows |
| 4 | Open export and verify dates fall within the filtered range | All exported dates match the filter criteria |
| 5 | Clear the filter | Table returns to unfiltered state |

---

### TC-04: Request By Date Filter — Table & Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Apply a "Request By Date" filter using a date range | Table shows only rows matching the date range |
| 2 | Export the filtered data | Export contains only the filtered rows |
| 3 | Verify export data matches the table view | Data matches |

---

### TC-05: WO# Filter — Table & Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Filter by a known WO# value | Table shows only matching rows |
| 2 | Export the filtered data | Export includes the WO# column and only filtered rows |
| 3 | Verify WO# appears in the export output | WO# column is present with correct data |

---

### TC-06: Requested Total Filter — Table & Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Apply a filter on "Requested Total" (e.g., greater than a value) | Table filters correctly |
| 2 | Export the filtered data | Export completes without freezing |
| 3 | Verify export data matches the filtered totals | Data matches |

---

### TC-07: Division Column — Filter Removed

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Inspect the "Division" column header | No filter icon is present (filter was intentionally removed) |
| 2 | Confirm Division data is still displayed in the table | Division values show in the column but are not filterable |

---

### TC-08: Type Filter — Table & Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Filter by a specific Type (e.g., "PO", "Quote", "Administrative") | Table shows only matching rows |
| 2 | Export the filtered data | Export completes successfully (no freezing) |
| 3 | Verify export contains only rows of the selected Type | Data matches |

---

### TC-09: Description Filter — Table & Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Filter by a keyword in "Description" | Table shows only rows containing the keyword |
| 2 | Export the filtered data | Export matches the filtered rows |

---

### TC-10: Status Filter — Table & Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Filter by a specific Status value | Table shows only matching rows |
| 2 | Export the filtered data | Export contains only the filtered status rows |

---

### TC-11: Approval Filter — Table & Export (Recent Fix Focus)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter icon on the "Approval" column | Filter panel opens as a **dropdown** with options (Approved, Pending Approval, Override, Rejected, Blank) |
| 2 | Select "Approved" | Table shows only rows with Approved status |
| 3 | Export the filtered data | Export completes and contains only Approved rows |
| 4 | Clear filter, then select "Pending Approval" | Table shows only Pending Approval rows |
| 5 | Select "Override" | Table shows rows with "Override Provided by..." values |
| 6 | **Select "Blank"** | Table shows rows with NULL, empty, or "Approval Not Needed" values |
| 7 | Verify row count matches visible blank/empty Approval rows | Count matches |
| 8 | Export while "Blank" is selected | Export contains only blank/null approval rows |

---

### TC-12: Approver(s) Filter — Table & Export (Recent Fix Focus)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter icon on the "Approver(s)" column | Filter panel opens |
| 2 | Select a specific approver name | Table shows rows where that person is a designated approver or in approval history |
| 3 | Export the filtered data | Export includes the Approver(s) column with correct data |
| 4 | **Select "Blank"** | Table shows only POs with no approvers (no designated approvers and no approval history) |
| 5 | Verify the rows shown genuinely have no approver data | No approver names visible in the Approver(s) column |
| 6 | Export while "Blank" is selected | Export contains only rows with no approvers |

---

### TC-13: Assigned To Filter — Table & Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Filter by a specific "Assigned To" value | Table shows only matching rows |
| 2 | Export the filtered data | Export completes and matches filtered data |
| 3 | Filter by "Blank" if available | Table shows rows with no assignment (or returns 0 results) |

---

### TC-14: Dept Filter — Table & Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Filter by a specific department | Table shows only matching rows |
| 2 | Export the filtered data | Export matches |
| 3 | Clear the filter by clicking "x" on the selected department | Filter clears, **filter icon is removed from the column header** |
| 4 | Verify table returns to full unfiltered view | All rows visible; no residual filter icon on Dept header |

---

### TC-15: Priority Filter — Table & Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Filter by a specific Priority (e.g., "H", "M", "L") | Table shows only matching rows |
| 2 | Export the filtered data | Export completes and matches |
| 3 | Filter by "Blank" | Table shows rows with blank priority (if any exist) |

---

### TC-16: Vendor Filter — Table & Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Filter by a specific Vendor name | Table shows only matching rows |
| 2 | Export the filtered data | Export matches filtered data |

---

### TC-17: PO# Filter — Table & Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Filter by a specific PO# | Table shows only matching rows |
| 2 | Export the filtered data | Export matches |

---

### TC-18: Needs My Approval Filter — Table & Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Filter by "Yes" | Table shows only rows needing the logged-in user's approval (or 0 results with count displayed) |
| 2 | Export the "Yes" filtered data | Export completes (small result set expected) |
| 3 | Filter by "No" | Table shows rows not needing approval (**Note:** large dataset ~23k rows may be slow — expected behavior per Jason) |
| 4 | Filter by "Blank" | Table shows rows with blank Needs My Approval value (or 0 results) |

---

## Edge Cases

| # | Edge Case | Expected Behavior |
|---|-----------|-------------------|
| EC-01 | Apply a filter that returns 0 results | Table shows empty state with "0" count at bottom; search stops in reasonable time |
| EC-02 | Apply multiple filters simultaneously (e.g., Status + Type) | Table correctly intersects both filters; export reflects combined filter |
| EC-03 | Clear all filters after applying multiple | All filters clear; table returns to full data; no residual filter icons in any column header |
| EC-04 | Export with a very large filtered result set (8k+ rows) | Export may be slow on weak server — verify it eventually completes or shows a timeout/error rather than freezing indefinitely |
| EC-05 | Approval filter dropdown persists across page navigation | Navigate away and back to Purchasing Tracker; verify Approval filter still shows as dropdown (not a search field) |
| EC-06 | Multi-value filter selection (select multiple values in a dropdown filter) | All selected values return matching records |
| EC-07 | Filter by "Blank" on Approval column — verify "Approval Not Needed" rows are included | Rows with NULL, empty, or "Approval Not Needed" all appear |
| EC-08 | Filter by "Override" on Approval column | Rows with "Override Provided by [name]" values appear (partial match) |
| EC-09 | Approver(s) blank filter — verify it checks both designated approvers table AND approval history | Only POs with truly no approver involvement appear |

---

## Results

### Test Environment: Test (https://testserver.betacom.com/spa)

| Test Case | Status | Tester | Date | Notes |
|-----------|--------|--------|------|-------|
| TC-01 | | | | |
| TC-02 | | | | |
| TC-03 | | | | |
| TC-04 | | | | |
| TC-05 | | | | |
| TC-06 | | | | |
| TC-07 | | | | |
| TC-08 | | | | |
| TC-09 | | | | |
| TC-10 | | | | |
| TC-11 | | | | |
| TC-12 | | | | |
| TC-13 | | | | |
| TC-14 | | | | |
| TC-15 | | | | |
| TC-16 | | | | |
| TC-17 | | | | |
| TC-18 | | | | |
| EC-01 | | | | |
| EC-02 | | | | |
| EC-03 | | | | |
| EC-04 | | | | |
| EC-05 | | | | |
| EC-06 | | | | |
| EC-07 | | | | |
| EC-08 | | | | |
| EC-09 | | | | |

### Test Environment: Stage (SM-PWA — https://testserver.betacom.com/testpwa)

| Test Case | Status | Tester | Date | Notes |
|-----------|--------|--------|------|-------|
| TC-01 | | | | |
| TC-02 | | | | |
| TC-03 | | | | |
| TC-04 | | | | |
| TC-05 | | | | |
| TC-06 | | | | |
| TC-07 | | | | |
| TC-08 | | | | |
| TC-09 | | | | |
| TC-10 | | | | |
| TC-11 | | | | |
| TC-12 | | | | |
| TC-13 | | | | |
| TC-14 | | | | |
| TC-15 | | | | |
| TC-16 | | | | |
| TC-17 | | | | |
| TC-18 | | | | |
| EC-01 | | | | |
| EC-02 | | | | |
| EC-03 | | | | |
| EC-04 | | | | |
| EC-05 | | | | |
| EC-06 | | | | |
| EC-07 | | | | |
| EC-08 | | | | |
| EC-09 | | | | |
