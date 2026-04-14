# Test Plan: SM-754 — Purchasing Tracker Filters Not Working

## Summary

Verify that all column filters in the Purchasing Tracker table view are functioning correctly, including filtering the table display and ensuring the Export output matches the filtered data. This bug originally reported that none of the filters were working on Test. Multiple fix rounds have addressed individual filters, blank filter logic, Approval/Approver(s) column filtering, Division filter removal, Dept filter "x" clear behavior, and export consistency. The most recent fix (SVN backend r16662, 2026-01-30) addresses Approval and Approver(s) "Blank" filter logic and partial matching for Override values.

**Jira:** SM-754  
**Type:** Bug  
**Priority:** Medium  
**Status:** Testing  
**Component:** Web Misc  
**Related:** SM-756 (Purchasing Tracker Export not pulling all data), SM-829 (Approval/Approver Blank filter issues)

---

## Pre-conditions

1. User has valid credentials (username: `Bandeleonk` / password: `test1234`)
2. Test environment is accessible at `https://testserver.betacom.com/spa`
3. User has access to the Purchasing Tracker page within Site Manager
4. Purchasing Tracker contains existing data with a mix of populated and blank values across columns
5. Browser: MS Edge (msedge channel)
6. User account has approval permissions (to test "Needs My Approval" filter)

---

## Test Cases

### TC-01: Navigate to Purchasing Tracker

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in to `https://testserver.betacom.com/spa/auth/login` with credentials | Dashboard loads successfully |
| 2 | Navigate to Purchasing Tracker page via sidebar | Purchasing Tracker table loads with data and column headers visible |
| 3 | Confirm filter icons are present on filterable column headers | Filter icons visible on all columns except Division |

---

### TC-02: ID Filter — Table View and Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter icon on the "ID" column | Filter input/dropdown appears |
| 2 | Enter a known ID value (e.g., a specific numeric ID) | Table filters to show only rows matching that ID |
| 3 | Verify the row count at the bottom matches visible rows | Count matches |
| 4 | Click Export while the ID filter is active | Export file downloads |
| 5 | Open the export file and verify it contains only the filtered ID rows | Export data matches the filtered table view |
| 6 | Clear the filter | Table returns to showing all rows; filter symbol removed from header |

---

### TC-03: Request Date Filter — Table View and Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter icon on the "Request Date" column | Date filter options appear (note: "equal" condition was removed; expect before/after/between) |
| 2 | Set a date range filter (e.g., "after" a specific date) | Table filters to show only rows within that date range |
| 3 | Click Export while the filter is active | Export file downloads |
| 4 | Open the export file and verify dates match the filter criteria | Export data matches the filtered table view |
| 5 | Clear the filter | Table returns to full data set |

---

### TC-04: Request By Date Filter — Table View and Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter icon on the "Request By Date" column | Date filter options appear |
| 2 | Set a date range filter | Table filters correctly |
| 3 | Export the filtered data | Export matches filtered view |
| 4 | Clear the filter | Table resets |

---

### TC-05: WO# Filter — Table View and Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter icon on the "WO#" column | Filter input appears |
| 2 | Enter a known WO number | Table filters to matching rows |
| 3 | Export the filtered data | Export contains WO# column and only filtered rows |
| 4 | Clear the filter | Table resets |

---

### TC-06: Requested Total Filter — Table View and Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter icon on the "Requested Total" column | Filter input appears |
| 2 | Enter a value or range | Table filters to matching rows |
| 3 | Export the filtered data | Export completes without freezing; data matches filtered view |
| 4 | Clear the filter | Table resets |

---

### TC-07: Division Column — Filter Removed

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Locate the "Division" column header | Division column is visible |
| 2 | Verify there is NO filter icon on the Division column | No filter icon present (filter was intentionally removed due to DB relationship issue) |

---

### TC-08: Type Filter — Table View and Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter icon on the "Type" column | Filter dropdown appears with type options |
| 2 | Select a type value (e.g., "PO", "Administrative", "Quote") | Table filters to matching rows |
| 3 | Export the filtered data | Export completes and data matches |
| 4 | Clear the filter | Table resets |

---

### TC-09: Description Filter — Table View and Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter on "Description" column | Filter input appears |
| 2 | Enter a search term | Table filters to rows containing that term |
| 3 | Export the filtered data | Export matches filtered view |
| 4 | Clear the filter | Table resets |

---

### TC-10: Status Filter — Table View and Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter on "Status" column | Filter dropdown appears |
| 2 | Select a status value | Table filters correctly |
| 3 | Export the filtered data | Export matches filtered view |
| 4 | Clear the filter | Table resets |

---

### TC-11: Approval Filter — Table View and Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter on "Approval" column | Filter appears as a **dropdown** (not a search field) with options: Approved, Pending Approval, Override, Rejected, Blank |
| 2 | Select "Approved" | Table shows only approved rows |
| 3 | Export the filtered data | Export matches; display values are normalized (Approved, Pending Approval, Override, Rejected) |
| 4 | Clear and select "Pending Approval" | Table shows only pending rows |
| 5 | Clear and select "Override" | Table shows rows with "Override Provided by..." values |
| 6 | Clear and select "Blank" | Table shows rows with NULL, empty, or "Approval Not Needed" values |
| 7 | Export with "Blank" filter active | Export contains only the blank/null approval rows |
| 8 | Clear the filter | Table resets |

---

### TC-12: Approver(s) Filter — Table View and Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter on "Approver(s)" column | Filter options appear |
| 2 | Select a specific approver name | Table shows rows where that person is a designated approver or has approval action history |
| 3 | Export the filtered data | Export includes Approver(s) column; data matches filtered rows |
| 4 | Clear and select "Blank" | Table shows only POs with no approvers (no designated approvers AND no approval history) |
| 5 | Export with "Blank" filter active | Export matches the blank-approver filtered view |
| 6 | Clear the filter | Table resets |

---

### TC-13: Assigned To Filter — Table View and Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter on "Assigned To" column | Filter options appear |
| 2 | Select a specific assignee | Table filters to matching rows |
| 3 | Export the filtered data | Export matches filtered view |
| 4 | Clear the filter | Table resets |

---

### TC-14: Dept Filter — Table View, Export, and Clear Behavior

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter on "Dept" column | Filter dropdown appears |
| 2 | Select a department | Table filters correctly |
| 3 | Export the filtered data | Export matches filtered view |
| 4 | Click "x" to clear the Dept filter | Filter is removed; filter symbol is **removed** from the column header; table shows all rows (not all depts populated in filter) |

---

### TC-15: Priority Filter — Table View and Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter on "Priority" column | Filter dropdown appears |
| 2 | Select a priority value | Table filters correctly |
| 3 | Select "Blank" | Table shows rows with blank priority |
| 4 | Export the filtered data | Export matches filtered view |
| 5 | Clear the filter | Table resets |

---

### TC-16: Vendor Filter — Table View and Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter on "Vendor" column | Filter options appear |
| 2 | Select a vendor | Table filters correctly |
| 3 | Export the filtered data | Export matches filtered view |
| 4 | Clear the filter | Table resets |

---

### TC-17: PO# Filter — Table View and Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter on "PO#" column | Filter input appears |
| 2 | Enter a known PO number | Table filters to matching rows |
| 3 | Export the filtered data | Export matches filtered view |
| 4 | Clear the filter | Table resets |

---

### TC-18: Needs My Approval Filter — Table View and Export

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the filter on "Needs My Approval" column | Filter options appear (Yes / No / Blank) |
| 2 | Select "Yes" | Table shows rows needing current user's approval (or 0 results with count displayed) |
| 3 | Export with "Yes" filter active | Export matches (note: "No" may time out with very large datasets — this is a known server limitation, not a bug) |
| 4 | Select "Blank" | Table shows rows with blank values for this field |
| 5 | Clear the filter | Table resets |

---

## Edge Cases to Verify

| # | Edge Case | Expected Behavior |
|---|-----------|-------------------|
| EC-01 | Apply multiple filters simultaneously (e.g., Status + Type) | Table shows intersection of both filters; export matches |
| EC-02 | Filter resulting in 0 rows | Table shows empty state with "0" count; search stops (does not spin indefinitely) |
| EC-03 | Select "Blank" on Approval column | Returns rows with NULL, empty, or "Approval Not Needed" values |
| EC-04 | Select "Blank" on Approver(s) column | Returns only POs with no designated approvers and no approval action history |
| EC-05 | Select "Override" on Approval column | Returns rows with "Override Provided by..." using partial matching |
| EC-06 | Clear all filters using "x" on each column | All filter symbols removed from headers; full data restored |
| EC-07 | Export with a large filtered dataset (500+ rows) | Export completes without freezing |
| EC-08 | Approval dropdown persists as dropdown (not reverting to search field) after page reload | Filter type remains dropdown |
| EC-09 | Multi-value filter selection (select multiple values in a dropdown filter) | Returns records matching all selected values |
| EC-10 | Filter, export, then navigate away and return to Purchasing Tracker | Filters are cleared; table shows all data |

---

## Results

### Test Environment: Test (`https://testserver.betacom.com/spa`)

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
| EC-10 | | | | |

### Test Environment: SM-PWA (`https://testserver.betacom.com/testpwa`)

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
| EC-10 | | | | |
