# Test Plan: SM-754 — Purchasing Tracker Filters Not Working

## Summary

Verify that all filters in the Purchasing Tracker table are functioning correctly after the latest fix (SVN backend r16662, 2026-01-30). The fix specifically addressed the **Approval** and **Approver(s)** column filters:
- **Approval Column:** Blank filter now returns records with NULL/empty/"Approval Not Needed" values; Override filter uses partial matching; display values normalized to Approved, Pending Approval, Override, Rejected.
- **Approver(s) Column:** Blank filter returns only POs with no approvers (checks both designated approvers table and approval history); specific approver filter includes both designated approvers and approval action history.

Each filter must be verified for two behaviors: (1) filtering the table view correctly, and (2) exporting filtered data correctly.

**Related ticket:** SM-756 (Purchasing Tracker Export not pulling all data) — Backlog, out of scope here.

---

## Pre-conditions

1. User has valid credentials: **Bandeleonk / test1234**
2. Test environment is accessible at **https://testserver.betacom.com/spa**
3. User has navigated to the **Purchasing Tracker** page after login
4. Purchasing Tracker table is fully loaded with data visible
5. No filters are currently active (clean state)
6. Browser: MS Edge (msedge channel)

---

## Test Cases

### TC-01: ID Filter

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter icon on the **ID** column header | Filter options appear |
| 2 | Enter a known ID value (e.g., a specific PO ID visible in the table) | Table filters to show only rows matching that ID |
| 3 | Verify the row count at the bottom of the table | Count matches the number of visible filtered rows |
| 4 | Click **Export** while the ID filter is active | Export downloads successfully |
| 5 | Open the exported file | Exported data contains only the filtered ID rows; row count matches the table |
| 6 | Clear the filter by clicking "x" | Table returns to unfiltered state; filter icon is removed from column header |

### TC-02: Request Date Filter

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter icon on **Request Date** column | Date filter options appear (no "equal" condition — removed by design) |
| 2 | Set a date range filter (e.g., "after" or "before" a specific date) | Table filters to show only rows within the date range |
| 3 | Verify the row count matches the visible filtered rows | Counts match |
| 4 | Click **Export** while the filter is active | Export completes and downloads |
| 5 | Open the exported file | Exported data contains only rows matching the date filter; row count matches |
| 6 | Clear the filter | Table returns to unfiltered state |

### TC-03: Request By Date Filter

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter icon on **Request By Date** column | Date filter options appear |
| 2 | Set a date range filter | Table filters correctly |
| 3 | Click **Export** | Export completes; data matches the filtered view |
| 4 | Clear the filter | Table returns to unfiltered state |

### TC-04: WO# Filter

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter on **WO#** column | Filter options appear |
| 2 | Enter a known WO# value | Table filters to matching rows |
| 3 | Click **Export** | Export completes; WO# column is present in export; data matches filtered view |
| 4 | Clear the filter | Table returns to unfiltered state |

### TC-05: Requested Total Filter

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter on **Requested Total** column | Filter options appear |
| 2 | Enter a numeric filter value (e.g., greater than a specific amount) | Table filters to matching rows |
| 3 | Click **Export** | Export completes; data matches filtered view |
| 4 | Clear the filter | Table returns to unfiltered state |

### TC-06: Division Column — Filter Removed

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Inspect the **Division** column header | No filter icon is present on the Division column |
| 2 | Verify the column still displays Division data | Data is visible but not filterable |

### TC-07: Type Filter

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter on **Type** column | Filter options appear (dropdown/checkboxes) |
| 2 | Select a type value (e.g., "PO", "Quote", "Administrative") | Table filters to matching rows |
| 3 | Click **Export** | Export completes; data matches filtered view |
| 4 | Clear the filter | Table returns to unfiltered state |

### TC-08: Description Filter

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter on **Description** column | Filter text input appears |
| 2 | Enter a keyword that appears in known descriptions | Table filters to rows containing that keyword |
| 3 | Click **Export** | Export completes; data matches filtered view |
| 4 | Clear the filter | Table returns to unfiltered state |

### TC-09: Status Filter

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter on **Status** column | Filter options appear |
| 2 | Select a status value | Table filters to matching rows |
| 3 | Click **Export** | Export completes; data matches filtered view |
| 4 | Clear the filter | Table returns to unfiltered state |

### TC-10: Approval Filter (recently fixed)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter on **Approval** column | **Dropdown with checkbox options** appears (not a text search field). Options: Approved, Pending Approval, Override, Rejected, Blank |
| 2 | Select **"Approved"** | Table shows only rows with "Approved" status |
| 3 | Click **Export** | Export completes; all exported rows show "Approved" |
| 4 | Clear the filter, then select **"Pending Approval"** | Table shows only "Pending Approval" rows |
| 5 | Clear the filter, then select **"Override"** | Table shows rows with "Override Provided by..." values |
| 6 | Clear the filter, then select **"Blank"** | Table shows rows where Approval is NULL, empty, or "Approval Not Needed" |
| 7 | Verify row count for Blank matches visible blank/empty Approval cells | Counts match |
| 8 | Click **Export** while Blank filter is active | Export completes; exported data only contains rows with blank/null approval values |
| 9 | Clear the filter | Table returns to unfiltered state; filter icon removed |

### TC-11: Approver(s) Filter (recently fixed)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter on **Approver(s)** column | Filter options appear |
| 2 | Select a specific approver name | Table shows rows where that person is a designated approver OR has taken approval action |
| 3 | Click **Export** | Export completes; Approver(s) column is present in export; data matches filtered view |
| 4 | Clear the filter, then select **"Blank"** | Table shows only rows with NO approvers (no designated approvers AND no approval history) |
| 5 | Verify the filtered rows truly have empty Approver(s) cells | All visible rows have blank Approver(s) |
| 6 | Click **Export** while Blank filter is active | Export completes; exported rows have no approver data |
| 7 | Clear the filter | Table returns to unfiltered state |

### TC-12: Assigned To Filter

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter on **Assigned To** column | Filter options appear |
| 2 | Select a known assignee (e.g., "Inc, Betacom") | Table filters to matching rows |
| 3 | Click **Export** | Export completes; data matches filtered view |
| 4 | Clear the filter | Table returns to unfiltered state |

### TC-13: Dept Filter

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter on **Dept** column | Filter options appear |
| 2 | Select a department value | Table filters to matching rows |
| 3 | Click **Export** | Export completes; data matches |
| 4 | Click **"x"** to clear the Dept filter | Filter is cleared; **filter icon is removed** from the Dept column header; table shows all rows again |
| 5 | Verify the Dept column header looks the same as other unfiltered columns | No residual filter symbol |

### TC-14: Priority Filter

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter on **Priority** column | Filter options appear |
| 2 | Select a priority value (e.g., "H", "M", "L") | Table filters to matching rows |
| 3 | Select **"Blank"** | Table shows rows with blank priority |
| 4 | Click **Export** | Export completes; data matches filtered view |
| 5 | Clear the filter | Table returns to unfiltered state |

### TC-15: Vendor Filter

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter on **Vendor** column | Filter options appear |
| 2 | Select a known vendor | Table filters to matching rows |
| 3 | Click **Export** | Export completes; data matches |
| 4 | Clear the filter | Table returns to unfiltered state |

### TC-16: PO# Filter

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter on **PO#** column | Filter options appear |
| 2 | Enter a known PO# | Table filters to matching rows |
| 3 | Click **Export** | Export completes; data matches |
| 4 | Clear the filter | Table returns to unfiltered state |

### TC-17: Needs My Approval Filter

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter on **Needs My Approval** column | Filter options appear (Yes/No/Blank) |
| 2 | Select **"Yes"** | Table shows only rows needing current user's approval (may be 0 results — that is OK) |
| 3 | If results exist, click **Export** | Export completes; data matches |
| 4 | Select **"No"** | Table shows rows not needing approval (note: large result sets may be slow due to server capacity — known limitation) |
| 5 | Select **"Blank"** | Table shows rows with blank values for this field |
| 6 | Clear the filter | Table returns to unfiltered state |

---

## Edge Cases

| # | Scenario | Expected Result |
|---|----------|-----------------|
| E-01 | Apply a filter that returns **0 results** | Table shows empty state with "0 found" message; search stops (does not spin indefinitely) |
| E-02 | Apply **multiple filters simultaneously** (e.g., Status + Type) | Table shows only rows matching ALL active filters; export respects all filters |
| E-03 | **Clear all filters** after multiple are applied | All filter icons removed from column headers; full data set restored |
| E-04 | Select **multiple values** within a single filter (multi-value select) | Table returns records matching ANY of the selected values |
| E-05 | **Blank filter on Approval column** specifically | Returns rows with NULL, empty string, or "Approval Not Needed" — not rows with actual approval values |
| E-06 | **Blank filter on Approver(s) column** specifically | Returns only POs with no designated approvers AND no approval history entries |
| E-07 | **Override filter on Approval column** | Matches rows containing "Override Provided by..." using partial matching |
| E-08 | Export a **large filtered result set** (e.g., 8,000+ rows) | Export may be slow but should eventually complete; if it freezes/times out, note as known server limitation |
| E-09 | **"x" out of Dept filter** after filtering | Filter icon is removed from Dept column header; no residual filter state; table shows all rows |
| E-10 | Verify **Approval filter is a dropdown** (not text search) | Filter UI shows checkboxes with options: Approved, Pending Approval, Override, Rejected, Blank |
| E-11 | Filter by a specific **Approver name**, then check export | Export includes the Approver(s) column with the filtered approver's name |
| E-12 | Rapidly toggle filters on/off | Table responds correctly without freezing or showing stale data |

---

## Results

| Test Case | Environment | Pass/Fail | Notes | Tester | Date |
|-----------|-------------|-----------|-------|--------|------|
| TC-01 | Test | | | | |
| TC-02 | Test | | | | |
| TC-03 | Test | | | | |
| TC-04 | Test | | | | |
| TC-05 | Test | | | | |
| TC-06 | Test | | | | |
| TC-07 | Test | | | | |
| TC-08 | Test | | | | |
| TC-09 | Test | | | | |
| TC-10 | Test | | | | |
| TC-11 | Test | | | | |
| TC-12 | Test | | | | |
| TC-13 | Test | | | | |
| TC-14 | Test | | | | |
| TC-15 | Test | | | | |
| TC-16 | Test | | | | |
| TC-17 | Test | | | | |
| E-01 | Test | | | | |
| E-02 | Test | | | | |
| E-03 | Test | | | | |
| E-04 | Test | | | | |
| E-05 | Test | | | | |
| E-06 | Test | | | | |
| E-07 | Test | | | | |
| E-08 | Test | | | | |
| E-09 | Test | | | | |
| E-10 | Test | | | | |
| E-11 | Test | | | | |
| E-12 | Test | | | | |
