# Test Plan — SM-754: Purchasing Tracker Filters

**Ticket:** SM-754 | **Status:** Testing | **Environment:** Test server
**Last Fix (Darl, SVN r16662):** Approval column blank filter and Approver(s) blank filter now correctly handle NULL/empty/non-static values.

## Summary

Verifies that all Purchasing Tracker filters narrow the table view correctly and that the filtered result set is faithfully reflected in the CSV export. The most recent fix targets the Approval and Approver(s) blank filter edge cases; this plan confirms those fixes hold while ensuring no regressions across the full filter set.

## Pre-conditions

- Logged in as Bandeleonk at `https://testserver.betacom.com/spa`
- Purchasing Tracker is accessible and contains records spanning multiple values for each filterable column (IDs, vendors, statuses, approvers, departments, priorities, WO#s, PO#s)
- The test environment reflects the latest build (SVN r16662+)

---

## Scenarios

### SC-01: Core Text and Numeric Filters — Table and Export

**Objective:** Confirms that text-input and numeric filters (ID, WO#, Description, PO#, Requested Total) narrow the table to matching rows and that the export reflects the same filtered set.

**Pre-conditions:** Purchasing Tracker is open with unfiltered data showing multiple records.

**Steps:**

1. Apply the **ID** filter with a known POR ID value → **Expected:** Table refreshes showing only rows matching that ID; row count at bottom updates.
2. Click **Export** with the ID filter active → **Expected:** Downloaded CSV contains only the matching rows; row count in CSV equals the table count.
3. Clear the ID filter and apply the **WO#** filter with a known WO number → **Expected:** Only rows tied to that WO# display in the table.
4. Click **Export** with the WO# filter active → **Expected:** CSV contains only those WO# rows; WO# column is present and populated in the file.
5. Clear and apply the **Description** filter using a partial keyword → **Expected:** Table shows only rows whose Description field contains that keyword.
6. Clear and apply the **PO#** filter with a known PO number → **Expected:** Table filters to matching PO records; export matches.
7. Clear and apply the **Requested Total** filter using a numeric condition (e.g., greater than a specific amount) → **Expected:** Table shows only rows meeting that condition; export reflects the same subset without freezing.

---

### SC-02: Date Filters — Table and Export

**Objective:** Confirms that Request Date and Request By Date filters work correctly after the date-type fix (removal of "equal" condition; date matching no longer defaults to 00:00:00).

**Pre-conditions:** Records exist with known Request Dates and Request By Dates spanning multiple calendar dates.

**Steps:**

1. Apply the **Request Date** filter using "after" or "before" a known date → **Expected:** Table shows only rows whose Request Date satisfies the condition; no records are missed due to time-component mismatch.
2. Confirm the available filter operators for Request Date do **not** include "equal" → **Expected:** The "equal" operator is absent from the date filter options (removed by design).
3. Click **Export** with the Request Date filter active → **Expected:** CSV downloads successfully and row count matches the filtered table.
4. Clear and apply the **Request By Date** filter using a date range or "before" condition → **Expected:** Table narrows to matching rows correctly.
5. Click **Export** with the Request By Date filter active → **Expected:** CSV row count matches the filtered table; date values in the export correspond to the filter criterion.

---

### SC-03: Categorical and Dropdown Filters — Table and Export

**Objective:** Confirms that Type, Status, Priority, Vendor, and Dept dropdown/multi-select filters narrow the table and export correctly, and that clearing a Dept filter removes the filter indicator from the column header.

**Pre-conditions:** Multiple distinct values exist for Type, Status, Priority, Vendor, and Dept columns.

**Steps:**

1. Apply the **Type** filter by selecting a single type value from the dropdown → **Expected:** Table shows only rows of that type; row count updates.
2. Click **Export** with the Type filter active → **Expected:** CSV downloads; all rows reflect the selected type; no freezing.
3. Clear the Type filter and apply the **Status** filter with a single status value → **Expected:** Table narrows to matching status rows; export row count matches.
4. Clear and apply the **Priority** filter (e.g., select "H") → **Expected:** Table shows only rows with that priority; export matches.
5. Clear and apply the **Vendor** filter by typing a partial vendor name → **Expected:** Table filters to matching vendors; export contains only those vendors.
6. Clear and apply the **Dept** filter by selecting one department → **Expected:** Table shows only rows for that department.
7. Click the **X** to clear the Dept filter → **Expected:** Table resets to unfiltered state; the filter indicator icon is removed from the Dept column header (regression check for previous bug).
8. Click **Export** after re-applying the Dept filter → **Expected:** CSV matches the filtered department rows.

---

### SC-04: Approval Column Filter — Dropdown Options, Blank, and Export

**Objective:** Confirms the Approval column presents a dropdown (not a free-text field), all option values filter correctly, the Blank option returns records with NULL/empty/"Approval Not Needed" values, and each filtered view exports without failure.

**Pre-conditions:** Purchasing Tracker contains records with Approval values of Approved, Pending Approval, Override, Rejected, and at least some blank/null approval entries.

**Steps:**

1. Click the filter icon on the **Approval** column → **Expected:** A dropdown with selectable options appears (Approved / Pending Approval / Override / Rejected / Blank); a free-text search field is NOT shown.
2. Select **Approved** from the dropdown → **Expected:** Table shows only approved rows; row count is non-zero.
3. Click **Export** → **Expected:** CSV downloads; all rows in the file have an "Approved" Approval value.
4. Clear and select **Pending Approval** → **Expected:** Table narrows to pending rows; export matches.
5. Clear and select **Override** → **Expected:** Table shows rows where Approval contains "Override Provided by…" using partial match; export matches.
6. Clear and select **Rejected** → **Expected:** Table shows only rejected rows; export matches.
7. Clear and select **Blank** → **Expected:** Table shows only rows where the Approval field is NULL, empty, or "Approval Not Needed" — this is the core fix being verified; no previously-passing approved rows appear.
8. Click **Export** with Blank selected → **Expected:** CSV downloads with only blank-approval rows; no infinite loading spinner.

---

### SC-05: Approver(s) Column Filter — Specific Name, Blank, and Export

**Objective:** Confirms the Approver(s) filter finds records from both designated approvers and approval action history, the Blank option returns only POs with no approvers, and the approver name appears in the export.

**Pre-conditions:** Some PO records have named approvers; some records have no approvers at all.

**Steps:**

1. Apply the **Approver(s)** filter by typing a known approver's name → **Expected:** Table shows rows where that person appears as either a designated approver or in the approval history; row count is accurate.
2. Click **Export** with the approver name filter active → **Expected:** CSV downloads; the Approver(s) column in the file is populated with the filtered approver's name (regression check — previously approvers were missing from export).
3. Clear the Approver(s) filter and select **Blank** → **Expected:** Table shows only records with no approvers in either designated approvers or approval history — this is the second core fix being verified; records with named approvers do NOT appear.
4. Confirm the row count of the Blank result is plausible (greater than 0 if blank records exist, or 0 with a clear empty-state message) → **Expected:** No infinite spinner; the result resolves.
5. Click **Export** with Blank selected → **Expected:** CSV downloads; Approver(s) column is empty for all exported rows.

---

## Edge Cases

### EC-01: Division Column Has No Filter

**Objective:** Confirms the Division column no longer exposes a filter option (removed by design due to one-to-many DB relationship).

**Steps:**
1. Scroll to the **Division** column in the Purchasing Tracker → **Expected:** No filter icon or dropdown is present on the Division column header; the column is display-only.

---

### EC-02: Needs My Approval Filter — Yes Resolves; No Is a Known Performance Limitation

**Objective:** Confirms "Yes" filter works and that filtering by "No" (23,000+ records) is understood as a server performance limitation, not a code defect.

**Steps:**
1. Apply the **Needs My Approval** filter and select **Yes** → **Expected:** Table loads and shows only records requiring the logged-in user's approval; result resolves without freezing.
2. Click **Export** with "Yes" active → **Expected:** CSV downloads successfully with matching rows.
3. Apply the **Needs My Approval** filter and select **No** → **Expected:** Query runs; note that due to the large record volume (~23,000 rows) the request may time out on the test server — this is an accepted server capacity limitation, not a bug.

---

### EC-03: Multi-Value Filter Selects Multiple Items Simultaneously

**Objective:** Confirms the multi-value filter fix (Viktor's last fix) allows selecting multiple values and returns records matching any selected value.

**Steps:**
1. On the **Status** filter, select two status values simultaneously (e.g., Approved + Pending) → **Expected:** Table shows rows matching either status, not just one; both values appear active in the filter chip.
2. On the **Priority** filter, select two or more priority values → **Expected:** All selected priorities appear in the table; export reflects the combined filter.