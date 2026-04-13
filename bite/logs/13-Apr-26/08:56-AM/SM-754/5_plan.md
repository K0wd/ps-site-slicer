# Test Plan: SM-754 — Purchasing Tracker Filters Not Working

## Summary

Verify that all filters in the Purchasing Tracker are functioning correctly after the latest fix (SVN backend r16662, 2026-01-30). The fix specifically addressed the **Approval** and **Approver(s)** column filters — Blank filter now returns NULL/empty/'Approval Not Needed' values, Override filter uses partial matching, and Approver(s) Blank filter checks both designated approvers and approval history. All other filters were previously verified passing and need regression confirmation. Each filter must be verified for both **table view filtering** and **export output correctness**.

**Jira:** SM-754 | **Type:** Bug | **Priority:** Medium | **Status:** Testing
**Component:** Web Misc | **Epic:** SM-877 (OCT-25-MAINT)
**Related:** SM-756 (Purchasing Tracker Export not pulling all data)

---

## Pre-conditions

1. User has valid credentials: **Bandeleonk / test1234**
2. Test server is accessible at `https://testserver.betacom.com/spa`
3. User is logged in and navigated to the **Purchasing Tracker** page
4. Purchasing Tracker table is populated with data (records exist)
5. No filters are currently active (clear all filters before starting)
6. Browser: MS Edge (preferred) or Chrome
7. Test on **Test** environment first, then **Stage** if applicable

---

## Test Cases

### TC-01: Approval Column — Blank Filter (Primary Fix)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Purchasing Tracker | Table loads with all records |
| 2 | Click the filter icon on the **Approval** column header | Filter dropdown appears with checkbox options (Approved, Pending Approval, Override, Rejected, Blank) |
| 3 | Verify filter is a **dropdown with checkboxes**, not a search/text field | Dropdown presents selectable options |
| 4 | Select **Blank** | Table filters to show only rows where Approval is NULL, empty, or 'Approval Not Needed' |
| 5 | Verify the row count at the bottom matches visible rows | Count matches |
| 6 | Click Export | Export completes and downloads a file |
| 7 | Open the exported file and verify only blank/empty Approval rows are included | Export matches filtered table view |
| 8 | Clear the filter | Table returns to full unfiltered view |

### TC-02: Approval Column — Approved Filter

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click filter on **Approval** column | Dropdown appears |
| 2 | Select **Approved** | Table shows only rows with "Approved" status |
| 3 | Verify row count matches | Count matches visible rows |
| 4 | Export the filtered data | Export file contains only Approved rows |

### TC-03: Approval Column — Override Filter

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select **Override** from the Approval filter | Table shows rows with 'Override Provided by...' values |
| 2 | Verify partial matching works (displays normalized as "Override") | Rows display correctly |
| 3 | Export and verify | Export matches filtered view |

### TC-04: Approval Column — Pending Approval Filter

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select **Pending Approval** | Table shows only pending approval rows |
| 2 | Export and verify | Export matches |

### TC-05: Approval Column — Rejected Filter

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select **Rejected** | Table shows only rejected rows (may be 0) |
| 2 | If 0 results, verify "0 found" message displays and search terminates | Does not hang/freeze |

### TC-06: Approver(s) Column — Blank Filter (Primary Fix)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click filter on **Approver(s)** column | Filter options appear |
| 2 | Select **Blank** | Table shows only POs with NO approvers (checks both designated approvers table and approval history) |
| 3 | Verify row count | Matches visible rows |
| 4 | Export and verify | Export contains only rows with no approvers |

### TC-07: Approver(s) Column — Specific Approver Filter

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select a specific approver name from the filter | Table shows rows where that person is a designated approver OR has taken an approval action |
| 2 | Verify results include both designated and historical approvers | Both sources are represented |
| 3 | Export and verify approver names appear in export | Approvers column is populated in export |

### TC-08: ID Filter + Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click filter on **ID** column | Filter appears |
| 2 | Enter a known ID value | Table filters to matching row(s) |
| 3 | Export | Export contains only the filtered ID row(s) |

### TC-09: Request Date Filter + Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click filter on **Request Date** column | Date filter appears (no "equal" condition — uses Before/After/Between) |
| 2 | Set a date range (e.g., Before a specific date) | Table filters correctly |
| 3 | Export | Export row count matches table filtered count |

### TC-10: Request By Date Filter + Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Apply a date range filter on **Request By Date** | Table filters correctly |
| 2 | Export | Export matches filtered view |

### TC-11: WO# Filter + Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter a known WO# in the filter | Table shows matching rows |
| 2 | Export | Export includes WO# column and only filtered rows |

### TC-12: Requested Total Filter + Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Apply a filter on **Requested Total** (e.g., greater than a value) | Table filters correctly |
| 2 | Export | Export completes (does not freeze) and matches filtered data |

### TC-13: Division Column — Filter Removed

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Locate the **Division** column in the table | Column is visible |
| 2 | Check the column header for a filter icon | No filter icon is present — filter has been removed |

### TC-14: Type Filter + Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Filter by a **Type** value (e.g., "PO", "Administrative", "Quote") | Table filters correctly |
| 2 | Export | Export completes without freezing and matches filtered view |

### TC-15: Description Filter + Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter a keyword in the **Description** filter | Table shows matching rows |
| 2 | Export | Export matches |

### TC-16: Status Filter + Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Filter by a **Status** value | Table filters correctly |
| 2 | Export | Export matches |

### TC-17: Assigned To Filter + Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select an assignee in the **Assigned To** filter | Table filters correctly |
| 2 | Export | Export completes and matches (note: very large result sets may take time) |

### TC-18: Dept Filter + Export + Clear Behavior

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Filter by a **Dept** value | Table filters correctly |
| 2 | Export | Export matches |
| 3 | Click "x" to clear the Dept filter | Filter clears, filter symbol is removed from column header, table shows all records |
| 4 | Verify no residual dept values remain selected | Filter is fully cleared |

### TC-19: Priority Filter + Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Filter by a **Priority** value (e.g., "H") | Table filters correctly |
| 2 | Export | Export matches |
| 3 | Test **Blank** filter on Priority | Returns rows with blank priority |

### TC-20: Vendor Filter + Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Filter by a **Vendor** name | Table filters correctly |
| 2 | Export | Export matches |

### TC-21: PO# Filter + Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Filter by a known **PO#** | Table filters correctly |
| 2 | Export | Export matches |

### TC-22: Needs My Approval Filter + Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Filter **Needs My Approval** by "Yes" | Table shows rows requiring current user's approval (may be 0) |
| 2 | If 0 results, verify "0 found" displays and search terminates | Does not hang |
| 3 | Filter by "No" | Note: large result set (~23k records) may be slow — this is a known server limitation, not a bug |
| 4 | Export "Yes" filtered data | Export matches |

---

## Edge Cases

| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| E1 | Select **Blank** on Approval column when rows have 'Approval Not Needed' | These rows should appear in Blank results |
| E2 | Select **Override** when data contains 'Override Provided by [Name]' | Partial matching returns these rows; display normalizes to "Override" |
| E3 | Approver(s) Blank filter with POs that have approval history but no designated approvers | Should NOT appear in Blank results (has approval history) |
| E4 | Approver(s) filter for a person who approved but is not a designated approver | Should appear (includes approval action history) |
| E5 | Apply multiple filters simultaneously (e.g., Status + Type) | Both filters apply; table shows intersection; export matches |
| E6 | Clear all filters using "x" on each column | All filter symbols removed from headers; full data restored |
| E7 | Export with a very large filtered result (8k+ rows) | Export may be slow on stage server but should eventually complete or show progress |
| E8 | Filter by Blank on columns other than Approval/Approver(s) (e.g., WO#, Vendor) | Blank filter returns rows with empty values in that column |
| E9 | Approval dropdown reverts to search field after page refresh | Dropdown should persist (known regression risk — document if it occurs) |
| E10 | Date filters do NOT show "Equal" as a condition option | Only Before/After/Between available |

---

## Results

### Test Environment Results

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
| TC-19 | | | | |
| TC-20 | | | | |
| TC-21 | | | | |
| TC-22 | | | | |

### Edge Case Results

| Edge Case | Status | Tester | Date | Notes |
|-----------|--------|--------|------|-------|
| E1 | | | | |
| E2 | | | | |
| E3 | | | | |
| E4 | | | | |
| E5 | | | | |
| E6 | | | | |
| E7 | | | | |
| E8 | | | | |
| E9 | | | | |
| E10 | | | | |

### Stage Environment Results

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
| TC-19 | | | | |
| TC-20 | | | | |
| TC-21 | | | | |
| TC-22 | | | | |

### Issues Found

| # | Description | Severity | Environment | Related Ticket |
|---|-------------|----------|-------------|----------------|
| | | | | |
