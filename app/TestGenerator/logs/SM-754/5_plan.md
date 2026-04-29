# Test Plan: SM-754 — Purchasing Tracker Filters

**Summary:** Verifies that all Purchasing Tracker filters correctly narrow the table view and that exported data matches the filtered results. This is a regression confirmation after multiple fix cycles spanning March 2025–January 2026, with the most recent fix addressing Approval and Approver(s) blank filter behavior (r16662, Jan 30 2026).

**Pre-conditions (shared):**
- Logged in as Bandeleonk / test1234 at https://testserver.betacom.com/spa
- Purchasing Tracker has existing records across multiple statuses, types, vendors, departments, priorities, and approvers
- At least one PO record exists with a blank Approval value and at least one with a blank Approver(s) value

---

### SC-01: Text and Numeric Filters Filter the Table and Export Correctly

**Objective:** Confirms ID, WO#, Requested Total, Description, and PO# filters all narrow the table and produce matching exports.

**Pre-conditions:** Purchasing Tracker is open with unfiltered data visible.

**Steps:**
1. Apply the **ID** filter with a known PO ID value → **Expected:** Table shows only rows matching that ID
2. Click Export → **Expected:** Downloaded file contains only the filtered rows; row count matches table
3. Clear the ID filter; apply the **WO#** filter with a known WO number → **Expected:** Table shows only rows associated with that WO
4. Click Export → **Expected:** Downloaded file includes the WO# column and contains only matching rows
5. Clear; apply **Requested Total** filter (e.g., greater than a specific dollar value) → **Expected:** Table narrows to rows meeting the condition
6. Click Export → **Expected:** Export completes and row count matches the filtered table
7. Clear; apply **Description** filter with a partial keyword → **Expected:** Table shows only rows whose description contains that keyword
8. Click Export → **Expected:** Exported rows all match the description filter
9. Clear; apply **PO#** filter → **Expected:** Table narrows to matching PO numbers; export count matches

---

### SC-02: Date Filters Filter the Table and Export Correctly

**Objective:** Confirms Request Date and Request By Date filters work correctly with the updated date filter conditions ("equal" removed).

**Pre-conditions:** Records exist with known Request Date and Request By Date values.

**Steps:**
1. Apply the **Request Date** filter using "greater than or equal to" a date that has known records → **Expected:** Table shows rows on or after that date; no "equal" option appears in the filter type dropdown
2. Confirm the filter does NOT offer an "equal" option → **Expected:** "Equal" is absent from the condition list (intentionally removed)
3. Click Export → **Expected:** Exported file row count matches the filtered table
4. Clear; apply **Request By Date** filter using a date range with known records → **Expected:** Table narrows to records within that range
5. Click Export → **Expected:** Export row count matches filtered table

---

### SC-03: Dropdown Category Filters Filter the Table and Export Correctly

**Objective:** Confirms Type, Status, Priority, and Vendor filters work and produce correct exports. Also confirms Division has no filter option.

**Pre-conditions:** Records exist across multiple types, statuses, priorities, and vendors.

**Steps:**
1. Open the column header for **Division** → **Expected:** No filter option is available for this column (filter was intentionally removed)
2. Apply the **Type** filter and select a specific type (e.g., "PO") → **Expected:** Table shows only rows of that type
3. Click Export → **Expected:** Exported file contains only rows of the selected type; count matches
4. Clear; apply **Status** filter (e.g., "Pending Approval") → **Expected:** Table narrows to matching status rows
5. Click Export → **Expected:** Export matches filtered table
6. Clear; apply **Priority** filter (e.g., "High") → **Expected:** Table narrows to matching priority rows; export matches
7. Clear; apply **Vendor** filter with a known vendor name → **Expected:** Table shows only that vendor's rows; export matches

---

### SC-04: People Filters (Assigned To, Dept, Approvers) Filter and Export Correctly

**Objective:** Confirms people-based filters work, export correctly, and filter state clears cleanly — including the previously-buggy Dept x-out behavior.

**Pre-conditions:** Records exist assigned to known users and departments with known approvers.

**Steps:**
1. Apply **Assigned To** filter with a known assignee name → **Expected:** Table narrows to that person's records
2. Click Export → **Expected:** Exported file row count matches filtered table
3. Clear; apply **Dept** filter with a specific department → **Expected:** Table narrows to that department's records
4. Click the **X** to clear the Dept filter → **Expected:** Table returns to full unfiltered view; the filter icon in the Dept column header is removed (not left behind)
5. Apply **Approvers** filter with a known approver name → **Expected:** Table shows only rows where that person is listed as an approver
6. Click Export → **Expected:** Exported file includes the Approvers column populated with the filtered name; row count matches

---

### SC-05: Approval Column Filter — Dropdown and Blank Behavior

**Objective:** Confirms the Approval column presents a dropdown (not a free-text search), all dropdown values filter correctly, and the Blank option returns rows with no approval value.

**Pre-conditions:** At least one record exists with Approval = "Approved", one with "Pending Approval", and one with a blank/null approval value.

**Steps:**
1. Click the Approval column filter → **Expected:** A dropdown appears with checkable options (Approved, Pending Approval, Override, Rejected, Blank) — not a free-text search field
2. Select "Approved" → **Expected:** Table shows only Approved rows
3. Click Export → **Expected:** Export completes with only Approved rows
4. Clear; select "Pending Approval" → **Expected:** Table narrows to Pending Approval rows
5. Clear; select "Blank" → **Expected:** Table shows only rows where Approval is NULL or empty (not zero results unless none exist)
6. Apply **Approver(s)** filter and select "Blank" → **Expected:** Table shows only rows where no approver is assigned; previously this returned 0 results incorrectly

---

### SC-06: Needs My Approval Filter and Boolean Filter Cleanup

**Objective:** Confirms the "Needs My Approval" filter works for Yes and Blank values, and that selecting Blank on other filterable columns returns rows with empty values.

**Pre-conditions:** Logged-in user has at least some POs that require their approval. At least one record exists with a blank value in a filterable column (e.g., Vendor, Description).

**Steps:**
1. Apply **Needs My Approval** filter and select "Yes" → **Expected:** Table narrows to records pending this user's approval; table eventually loads (does not spin indefinitely)
2. Click Export → **Expected:** Export completes for the "Yes" result set
3. Clear; apply **Needs My Approval** and select "Blank" → **Expected:** Table shows rows where the field is blank; result count is displayed (zero is acceptable if none exist — must not hang indefinitely)
4. Clear; apply a filter on a column with known blank values (e.g., Vendor) and select "Blank" → **Expected:** Table shows only rows where that column is blank
5. Clear all filters → **Expected:** All filter icons are removed from all column headers; full unfiltered dataset is restored

---

## Edge Cases

### EC-01: Export Performance with Large Result Sets

**Steps:**
1. Apply **Needs My Approval = No** (or any filter returning thousands of records) → **Expected:** System behavior is acknowledged as expected: very large result sets on the test server may time out; this is a known infrastructure limitation and not a bug in the filter logic
2. Apply a filter that returns a smaller manageable set (under ~1,000 rows) → **Expected:** Export completes within a reasonable time without freezing

### EC-02: Division Column Has No Filter Option

**Steps:**
1. Inspect the Division column header → **Expected:** No filter icon or filter option is present
2. Confirm Division data is still visible in the table rows (data is displayed, just not filterable) → **Expected:** Division values show in the column; only filtering has been disabled by design due to the one-to-many DB relationship constraint