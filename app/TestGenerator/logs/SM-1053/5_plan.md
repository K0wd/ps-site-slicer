# Test Plan: SM-1053 — Vendor Admin Address Field Relocation

**Ticket:** SM-1053 | **Priority:** High | **Status:** On Stage | **Parent:** SM-862 (AG Grid Revamp)

## Summary

Verify that the Address field has been moved from the Contacts section to the Address section, relabeled from "Safety Address" to "Address," and made required — in both the Add New Vendor and Edit Vendor (pencil icon) forms. This is a frontend-only change; the underlying database column (`safety_contact_address`) is unchanged.

## Pre-conditions (shared)

- Logged into SM at `https://testserver.betacom.com/spa` as **Bandeleonk / test1234**
- User has Vendor Admin access
- At least one existing vendor exists in the grid (for Edit Vendor scenarios)
- Stage deployment of MR !40 is complete (confirmed by dev comment 2026-03-26)

---

## Scenarios

### SC-01: Add New Vendor — Field Location, Label, Required Validation, and Save

**Objective:** Confirm the full Add New Vendor flow reflects the relocated, relabeled, required Address field and that the Contacts section is clean.
**Pre-conditions:** User is on the Vendor Admin page.

**Steps:**
1. Click "New Item" (Add New Vendor) → **Expected:** Vendor form dialog opens
2. Expand the **Address** section → **Expected:** An "Address" labeled textarea field is present as the first field, before City/State/Zip
3. Inspect the Address field label → **Expected:** Label reads "Address" (not "Safety Address")
4. Leave the Address field empty and fill in all other required fields, then attempt to save → **Expected:** Save button is disabled; form cannot be submitted
5. Expand the **Contacts** section → **Expected:** No field labeled "Address" or "Safety Address" exists in Contacts
6. Return to Address section, enter a valid address, and click Save → **Expected:** Vendor is created successfully; new vendor appears in the grid
7. Open the newly created vendor via the pencil icon → **Expected:** The Address field in the Address section displays the value just entered

---

### SC-02: Edit Existing Vendor — Field Location, Label, Data Persistence, and Update

**Objective:** Confirm the Edit Vendor form (pencil icon) shows the same field relocation, retains existing data, and saves updates correctly.
**Pre-conditions:** User is on the Vendor Admin page with at least one existing vendor that has a populated address.

**Steps:**
1. Click the pencil icon on an existing vendor row → **Expected:** Edit Vendor dialog opens with pre-populated data
2. Expand the **Address** section → **Expected:** "Address" textarea is present in the Address section, pre-populated with the vendor's existing address data
3. Inspect the field label → **Expected:** Label reads "Address" (not "Safety Address")
4. Expand the **Contacts** section → **Expected:** No "Address" or "Safety Address" field exists in Contacts
5. Modify the Address field value and click Save → **Expected:** Save succeeds; dialog closes
6. Reopen the same vendor via pencil icon → **Expected:** The updated address value is displayed in the Address field

---

### SC-03: Required Field Enforcement — Empty Address Blocks Submission

**Objective:** Confirm the Address field is enforced as required in both Add and Edit flows, and that the validation error message displays correctly.
**Pre-conditions:** User is on the Vendor Admin page.

**Steps:**
1. Open Add New Vendor form → fill all required fields **except** Address → **Expected:** Save button is disabled
2. Click into the Address field, then click out (touch and blur) → **Expected:** "Address is required" validation error message appears below the field
3. Enter a valid address → **Expected:** Save button becomes enabled; validation error clears
4. Close the dialog without saving and open an existing vendor via pencil icon → **Expected:** Edit dialog opens with populated Address
5. Clear the Address field entirely → **Expected:** Save button becomes disabled; "Address is required" error appears
6. Re-enter an address and save → **Expected:** Save succeeds

---

## Edge Cases

### EC-01: Whitespace-Only Address Input

**Objective:** Verify that entering only spaces/whitespace in the Address field is treated as empty (or is trimmed on save).
**Pre-conditions:** User has the Add New Vendor form open.

**Steps:**
1. Enter only spaces in the Address field, fill all other required fields → **Expected:** Either the Save button remains disabled (client-side trim) or the form rejects the input with a validation error

---

### EC-02: Grid Column Regression — Vendor Admin Data Grid Unaffected

**Objective:** Confirm the Vendor Admin AG Grid columns and data display are not impacted by the form change.
**Pre-conditions:** User is on the Vendor Admin page viewing the vendor grid.

**Steps:**
1. Verify the vendor grid loads without errors → **Expected:** Grid renders with all expected columns
2. Confirm address-related data in the grid (if displayed) shows correct values → **Expected:** No column label changes or data corruption from the field relocation
3. Use grid filters and sorting → **Expected:** Functionality is unaffected

---

## Techniques Applied

| Technique | Where Applied |
|---|---|
| **State Transition** | SC-01/SC-03: Save button disabled ↔ enabled based on required field state |
| **Equivalence Partitioning** | EC-01: Valid address vs. whitespace-only vs. empty |
| **Regression** | SC-01 step 5, SC-02 step 4, EC-02: Contacts section clean, grid unaffected |
| **Confirmation Testing** | SC-01/SC-02: Re-verifying the original QA failure (Safety Address lingering in Contacts) |

## Known Risk

The first QA pass (Joshua Rempis, 2026-03-04) **failed** because the "Safety Address" field was not removed from the Contacts section. This was subsequently fixed and passed on retest. Stage verification must explicitly confirm this regression point — covered in SC-01 step 5 and SC-02 step 4.
