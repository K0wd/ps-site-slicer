# Test Plan: SM-1032 — Vendor Admin Grid Dropdowns & Free-form Columns

## Summary

Verifies that 21 Vendor Admin grid columns are correctly configured as either dropdown selectors or free-form text inputs, that selections persist to the backend, and that all columns default to blank with the ability to revert. This is a Stage verification — the feature previously passed on Test including a persistence fix applied after the dropdown save bug was found.

## Pre-conditions

- Logged into https://testserver.betacom.com/spa as Bandeleonk / test1234
- Vendor Admin module is accessible via the sidebar
- At least one vendor row exists in the grid
- Stage deployment includes: frontend commits 67a5a1c6, 3f1028a2, 2d22b711, 79dec94e; backend SVN r16882/r16883

---

## Scenarios

### SC-01: Dropdown columns display visible select controls and correct option sets

**Objective:** Confirms that all 15 dropdown columns render a visible native select element in every cell (no click required to reveal it), and that each column offers exactly the specified options plus blank.

**Pre-conditions:** Vendor Admin grid is loaded with at least one vendor row visible.

**Steps:**
1. Navigate to Vendor Admin → **Expected:** Grid loads, all columns are visible.
2. Observe cells in the "Onboarding Documents Requested", "VRF Acknowledgement Received", and "W-9 Received" columns without clicking → **Expected:** A visible dropdown arrow is shown in each cell at rest.
3. Click the dropdown in "W-9 Received" for any vendor row → **Expected:** Only three options appear: blank, YES, NO — no other values.
4. Click the dropdown in "Correct COI Received" → **Expected:** Only four options: blank, YES, NO, NA.
5. Click the dropdown in "MSA Status" → **Expected:** Only four options: blank, Approved, Pending, NA.
6. Click the dropdown in "GC Approved or Pending?" → **Expected:** Only four options: blank, Approved, Pending, NA.
7. Click the dropdown in "Safety Cart Review" → **Expected:** Only four options: blank, Approved, Pending, NA.
8. Click the dropdown in "Safety Status" → **Expected:** Only four options: blank, Approved, Pending, NA.
9. Click the dropdown in "PO Half Year Status" → **Expected:** Only three options: blank, Active, Inactive.

---

### SC-02: Dropdown selection saves and persists after page refresh

**Objective:** Confirms that selecting a dropdown value writes to the backend and survives a full page reload — the core regression caught in the initial Test cycle.

**Pre-conditions:** Vendor Admin grid is loaded. All dropdown columns show blank for the test vendor row (or note the current value before changing it).

**Steps:**
1. Locate a test vendor row. In the "Onboarding Documents Requested" column, select **YES** → **Expected:** Cell updates to YES; a green flash confirms the save succeeded.
2. In the same row, change "W-9 Received" to **NO** → **Expected:** Cell updates to NO with green flash.
3. In the same row, change "MSA Status" to **Pending** → **Expected:** Cell updates to Pending with green flash.
4. In the same row, change "PO Half Year Status" to **Active** → **Expected:** Cell updates to Active with green flash.
5. Refresh the browser (F5 or Cmd+R) → **Expected:** Page reloads, the Vendor Admin grid re-renders.
6. Locate the same vendor row → **Expected:** "Onboarding Documents Requested" shows YES, "W-9 Received" shows NO, "MSA Status" shows Pending, "PO Half Year Status" shows Active — all values persist.

---

### SC-03: Dropdown reversion to blank saves and persists

**Objective:** Confirms that a user can revert a dropdown back to blank (AC5), and that blank is saved — not silently reverted to the prior value.

**Pre-conditions:** The test vendor row from SC-02 has at least one dropdown column set to a non-blank value (e.g., YES in "Onboarding Documents Requested").

**Steps:**
1. In the "Onboarding Documents Requested" cell for the test vendor, open the dropdown and select the blank option → **Expected:** Cell displays blank; a green flash confirms save.
2. In the "MSA Status" cell, select the blank option → **Expected:** Cell displays blank with green flash.
3. Refresh the browser → **Expected:** Page reloads.
4. Locate the same vendor row → **Expected:** "Onboarding Documents Requested" is blank, "MSA Status" is blank — neither has reverted to the previous value.

---

### SC-04: Free-form columns accept text input and persist

**Objective:** Confirms that the six free-form columns accept arbitrary text (including the expected value formats), save correctly, and display correctly after reload.

**Pre-conditions:** Vendor Admin grid is loaded with the test vendor row visible.

**Steps:**
1. Click the "Avetta Approved" cell for the test vendor, type **1250**, press Enter → **Expected:** Cell displays 1250; green flash confirms save.
2. Click the "Type" cell, type **Subcontractor**, press Enter → **Expected:** Cell displays Subcontractor with green flash.
3. Click the "Date Sent" cell, type **2026-04-15**, press Enter → **Expected:** Cell displays the entered value with green flash.
4. Click the "Certificate Expiration" cell, type **NA**, press Enter → **Expected:** Cell displays NA with green flash.
5. Click the "Payment Terms" cell, type **Net 30**, press Enter → **Expected:** Cell displays Net 30 with green flash.
6. Click the "Type of Company" cell, type **LLC**, press Enter → **Expected:** Cell displays LLC with green flash.
7. Refresh the browser → **Expected:** Page reloads.
8. Locate the test vendor row → **Expected:** All six free-form values (1250, Subcontractor, 2026-04-15, NA, Net 30, LLC) are displayed exactly as entered.

---

### SC-05: Legacy data displays blank — no "0000-00-00" or "0" shown

**Objective:** Confirms the valueFormatter fix is applied on Stage — any vendor rows with legacy numeric/date data from before the DB migration display blank rather than 0, 0, or 0000-00-00.

**Pre-conditions:** At least one vendor row exists that may have been created before the SM-1032 migration (older rows).

**Steps:**
1. Load the Vendor Admin grid and scroll through all visible vendor rows → **Expected:** No cell in any dropdown column shows "0", "0000-00-00", or other legacy numeric values; all such cells are blank.
2. Scroll to view the date-format columns (MSA Sent to GC, MSA Signed/AP Setup, Safety Orientation Date, COI Expiration if visible) → **Expected:** Empty date cells show the mm/dd/yyyy placeholder in light gray, not 0000-00-00.
3. Locate a date cell that has a real date populated → **Expected:** Date displays in mm/dd/yyyy format (e.g., 02/25/2026), not yyyy-mm-dd.

---

## Edge Cases

### EC-01: New vendor row defaults all dropdown columns to blank

**Objective:** Confirms AC5 — a freshly created vendor has no pre-populated dropdown values.

**Steps:**
1. In Vendor Admin, create a new vendor row using the "New Item" button and save the minimum required fields → **Expected:** New vendor row appears in the grid.
2. Inspect all 15 dropdown columns in the new row → **Expected:** Every dropdown cell is blank; none shows a pre-selected value, 0, or 0000-00-00.

---

### EC-02: Export to Excel reflects current dropdown and free-form values

**Objective:** Confirms that the valueFormatter changes do not corrupt the export — saved values (and blanks) round-trip correctly to the exported file.

**Steps:**
1. Using the test vendor row with values set in SC-02 and SC-04, trigger the AG Grid export (Export button) → **Expected:** An Excel/CSV file downloads.
2. Open the exported file and locate the test vendor row → **Expected:** Dropdown columns show the saved text values (YES, NO, Pending, Active), not 0 or 0000-00-00; free-form columns show the entered text; blank fields are empty cells, not zero.
