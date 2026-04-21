# Test Plan — SM-754: Purchasing Tracker Filters

## Summary

Verifies that all Purchasing Tracker filters correctly narrow the table view and that filtered exports reflect only the filtered data. The most recent fix (SVN r16662) addressed Blank filter behavior on the Approval and Approver(s) columns — these are the highest-risk areas for this test pass.

## Pre-conditions

- Logged in as `Bandeleonk` / `test1234` at `https://testserver.betacom.com/spa/auth/login`
- Purchasing Tracker module is accessible and contains records across multiple statuses, types, approvers, departments, priorities, and vendors
- Records exist with blank values in the Approval and Approver(s) columns
- Division column has no filter option (intentionally removed — verify absence only)

---

## Scenarios

### SC-01: Text and ID Filters Filter Table and Export Correctly

**Objective:** Confirms that text-based filters (ID, WO#, Description, PO#) narrow the table and that the resulting export contains only filtered rows.

**Pre-conditions:** Multiple PO records exist with known IDs, WO numbers, descriptions, and PO numbers.

**Steps:**
1. Navigate to Purchasing Tracker → **Expected:** Tracker loads showing all records with a count visible at the bottom.
2. Apply the ID filter using a known PO ID → **Expected:** Table narrows to only rows matching that ID; row count decreases.
3. Click Export → **Expected:** Export downloads; row count in the file matches the filtered table count and contains only the filtered ID.
4. Clear the ID filter; apply the WO# filter using a known WO number → **Expected:** Table shows only rows linked to that WO number.
5. Click Export → **Expected:** Export reflects only WO-filtered rows; WO column is populated in all exported rows.
6. Clear; apply Description filter with a partial keyword → **Expected:** Table narrows to rows containing that keyword in the Description column.
7. Clear; apply PO# filter using a known PO number → **Expected:** Only rows with that PO# are shown.
8. Click Export → **Expected:** Exported file contains only rows with the filtered PO number; count matches.

---

### SC-02: Date Filters Filter Table and Export Correctly

**Objective:** Confirms that Request Date and Request By Date filters work correctly with the updated date-handling logic (no longer defaulting to 00:00:00), and that exports honor the date filter.

**Pre-conditions:** Records exist with known Request Date and Request By Date values spanning multiple months.

**Steps:**
1. Apply the Request Date filter using a known date range (e.g., "after" a specific date) → **Expected:** Table shows only records with Request Dates within the specified range; date column values in rows all satisfy the condition.
2. Click Export → **Expected:** Exported file row count matches the filtered table; all rows in the file have Request Dates within the specified range.
3. Clear; apply Request By Date filter using a specific future date → **Expected:** Table narrows to records with Request By Date matching the filter; no records outside that range appear.
4. Click Export → **Expected:** Export file reflects only Request By Date-filtered records; count matches filtered table.
5. Clear both date filters → **Expected:** Table returns to full unfiltered record set.

---

### SC-03: Dropdown and Selection Filters Filter Table and Export Correctly

**Objective:** Confirms that Type, Status, Priority, Dept, Vendor, Requested Total, and Needs My Approval filters work and export correctly, and that Division has no filter option.

**Pre-conditions:** Records exist covering multiple values for each filter. Needs My Approval has records with a "Yes" value.

**Steps:**
1. Verify the Division column header has no filter icon or filter option → **Expected:** No filter is available for Division; the column displays values but cannot be filtered.
2. Apply the Type filter; select one type value (e.g., "PO") → **Expected:** Table narrows to that type only.
3. Click Export → **Expected:** All rows in the export match the selected type.
4. Clear; apply the Status filter and select one status value → **Expected:** Table narrows; export matches the filtered status.
5. Clear; apply the Priority filter; select "High" → **Expected:** Table shows only High priority rows; export count matches.
6. Clear; apply the Dept filter; select a specific department → **Expected:** Table filters to that department; x-ing out the filter removes it and the filter icon disappears from the column header.
7. Apply Vendor filter; select a known vendor → **Expected:** Only rows for that vendor appear; export matches.
8. Apply Requested Total filter (e.g., greater than a known value) → **Expected:** Table filters correctly; export downloads without freezing and contains only matching rows.
9. Apply Needs My Approval filter; select "Yes" → **Expected:** Table shows records requiring the logged-in user's approval; export completes successfully with matching rows. *(Note: filtering by "No" may be slow due to record volume — accept timeout as known behavior.)*

---

### SC-04: Approval and Approver(s) Filters — Including Blank Values

**Objective:** Confirms the recently fixed Approval and Approver(s) column filters work correctly, including Blank selection, dropdown options, and export output. This is the highest-risk scenario given repeated failures and the most recent code change.

**Pre-conditions:** Records exist with Approval values of Approved, Pending Approval, Override, Rejected, and NULL/blank. Records exist with named approvers and with no approvers.

**Steps:**
1. Open the Approval column filter → **Expected:** A dropdown appears with checkable options (Approved, Pending Approval, Override, Rejected, Blank) — not a free-text search field.
2. Select "Approved" → **Expected:** Table shows only rows with Approved status; count is non-zero.
3. Click Export → **Expected:** Export downloads; all rows in the file show Approved in the Approval column.
4. Clear; select "Override" in the Approval filter → **Expected:** Table shows rows matching "Override Provided by..." values via partial match.
5. Clear; select "Blank" in the Approval filter → **Expected:** Table shows only rows where Approval is NULL or empty; rows with any approval status do not appear.
6. Click Export → **Expected:** Export downloads and contains only blank-Approval rows.
7. Clear; open the Approver(s) column filter; select a specific approver name → **Expected:** Table shows rows where that person is a designated approver OR has taken an approval action; count is non-zero.
8. Click Export → **Expected:** Export contains the approver name in the Approvers column for all rows; name is not missing from the export.
9. Clear; select "Blank" in the Approver(s) filter → **Expected:** Table shows only rows with no approvers assigned (no designated approver and no approval history); rows with approvers do not appear.
10. Click Export → **Expected:** Export downloads successfully; Approvers column is empty for all rows.

---

### SC-05: Filter Clearing and State Reset

**Objective:** Confirms that clearing filters fully resets the table state and removes filter indicators from column headers, preventing stale filter state from affecting subsequent operations.

**Pre-conditions:** Tracker loaded with full record set visible.

**Steps:**
1. Apply the Dept filter with a specific department; confirm table narrows and filter icon appears in the Dept column header → **Expected:** Table shows only that department; header shows filter indicator.
2. Click the "x" to clear the Dept filter → **Expected:** Table returns to full record set; filter icon is removed from the Dept column header. *(This was a previously broken behavior — verify it stays fixed.)*
3. Apply two filters simultaneously (e.g., Status = "Approved" AND Priority = "High") → **Expected:** Table shows only rows matching both conditions; both column headers show filter indicators.
4. Clear one filter; verify only that column's indicator is removed and the remaining filter still applies → **Expected:** Table still reflects the remaining active filter; other column header is clean.
5. Clear all filters → **Expected:** Full record set restored; no filter indicators remain on any column header.

---

## Edge Cases

### EC-01: Blank Filter Behavior Across Multiple Column Types

**Objective:** Confirms Blank filter works on columns other than Approval/Approver(s) and returns only genuinely empty rows.

**Steps:**
1. Apply Blank filter on the WO# column (if Blank option is available) → **Expected:** Only rows with no WO# association are returned; rows with WO numbers do not appear.
2. Apply Blank filter on the Vendor column → **Expected:** Only rows with no vendor assigned are returned.
3. Verify that Priority Blank filter works (previously worked even when others did not) → **Expected:** Rows with no priority value returned; count is consistent with visually blank priority cells in the table.

---

### EC-02: Export Does Not Freeze on Large Filtered Sets

**Objective:** Confirms export completes without hanging for moderate-sized filtered result sets, guarding against the repeated export-freeze regressions seen across multiple fix iterations.

**Steps:**
1. Apply a filter that returns a moderate result set (50–500 rows, e.g., a common status value) → **Expected:** Table loads the filtered results promptly.
2. Click Export → **Expected:** Export begins processing; a download starts within a reasonable time (under 30 seconds); the browser does not freeze or show an infinite loading state.
3. Open the downloaded file → **Expected:** Row count in the file matches the row count shown in the filtered table.