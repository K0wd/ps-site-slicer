# Test Plan — SM-1064: Vendor Admin Upload/Replace Company Logo

## Summary

Verify that the new Vendor Admin (Angular) correctly presents an "Upload/Replace Company Logo" section in both Edit and New forms, that PNG uploads persist and display correctly, and that logos are stored to the shared path so the old and new admin remain in sync.

## Pre-conditions

- Logged in as `Bandeleonk / test1234` at `https://testserver.betacom.com/spa`
- Vendor Admin module is accessible from the main navigation
- At least one existing vendor record is available for editing
- At least one vendor record that already has a logo uploaded is available
- Two distinct PNG test files are available locally (referred to as `logo-a.png` and `logo-b.png`)
- One non-PNG test file is available locally (e.g. `test.jpg`)

---

## Scenarios

### SC-01: Upload a Logo to an Existing Vendor (First-Time Upload)

**Objective:** Prove that a vendor with no logo can have one uploaded via the Edit form, that the UI provides a preview and success confirmation, and that the logo persists across sessions.

**Pre-conditions:** Target vendor has no logo currently set.

**Steps:**

1. Navigate to Vendor Admin and open an existing vendor that has no logo → **Expected:** Edit dialog opens; "Upload/Replace Company Logo" expansion panel is visible in the form.
2. Expand the "Upload/Replace Company Logo" section → **Expected:** Section expands to reveal a placeholder image, an "Upload Logo" button, and no filename displayed.
3. Click "Upload Logo" and select `logo-a.png` from the local filesystem → **Expected:** File picker closes; filename `logo-a.png` is displayed in the section; a preview of the selected image replaces the placeholder.
4. Click "Upload Now" → **Expected:** A success snackbar appears confirming the upload completed without error.
5. Close the edit dialog and reopen the same vendor → **Expected:** "Upload/Replace Company Logo" section displays `logo-a.png` as the current logo image (not a placeholder).

---

### SC-02: Replace an Existing Logo with a New One

**Objective:** Prove that a vendor which already has a logo shows it correctly in the section and that uploading a second PNG fully replaces the first.

**Pre-conditions:** Target vendor already has a logo uploaded.

**Steps:**

1. Open the vendor that already has a logo for editing → **Expected:** Edit dialog opens.
2. Expand the "Upload/Replace Company Logo" section → **Expected:** The existing logo image is displayed (not a placeholder); button reads "Replace Logo" or equivalent.
3. Click the upload/replace button and select `logo-b.png` (different from the current logo) → **Expected:** Preview updates to show `logo-b.png`; filename displayed is `logo-b.png`.
4. Click "Upload Now" → **Expected:** Success snackbar appears.
5. Close and reopen the vendor → **Expected:** The logo section now shows `logo-b.png`; the previous logo is no longer displayed.

---

### SC-03: Upload a Logo During New Vendor Creation

**Objective:** Prove that the logo section is present in the New Vendor form and that the deferred upload executes correctly after the vendor is saved and assigned an ID.

**Steps:**

1. Click "Add New Vendor" (or equivalent) in the Vendor Admin grid → **Expected:** New Vendor form/dialog opens; "Upload/Replace Company Logo" section is visible.
2. Expand the "Upload/Replace Company Logo" section → **Expected:** Section is accessible with an upload control; no logo is displayed yet.
3. Select `logo-a.png` from the local filesystem → **Expected:** Preview is shown; a hint message reads *"Logo will be uploaded when vendor is saved"* (or equivalent deferred-upload notice).
4. Fill in all required fields (Company Name, Status, Address, City, State, Zip, EIN, Primary Contact) → **Expected:** Fields accept input without error.
5. Click "Save" → **Expected:** The new vendor is created successfully; the logo upload executes as part of the save flow; success confirmation appears.
6. Locate the newly created vendor in the grid and open it for editing → **Expected:** The "Upload/Replace Company Logo" section displays `logo-a.png` — confirming the deferred upload completed and the logo is bound to the new vendor ID.

---

### SC-04: Cross-Admin Logo Consistency

**Objective:** Prove that logos written via the new Vendor Admin appear in the old Vendor Admin (and vice versa), confirming shared file storage is functioning as designed (AC3).

**Pre-conditions:** A known vendor exists that is accessible in both old and new admin interfaces.

**Steps:**

1. In the new Vendor Admin, open the known vendor and upload `logo-a.png` via the "Upload/Replace Company Logo" section; click "Upload Now" → **Expected:** Success snackbar; logo preview shows `logo-a.png`.
2. Navigate to the old Vendor Admin (CakePHP interface) and open the same vendor → **Expected:** The company logo section in the old admin displays `logo-a.png` — same image uploaded via the new admin.
3. In the old Vendor Admin, upload `logo-b.png` as the company logo and save → **Expected:** Old admin reflects `logo-b.png`.
4. Return to the new Vendor Admin and reopen the same vendor → **Expected:** "Upload/Replace Company Logo" section now displays `logo-b.png` — confirming bidirectional consistency.

---

## Edge Cases

### EC-01: Non-PNG File Is Rejected

**Objective:** Verify both client-side and server-side validation reject non-PNG files with a clear error message.

**Steps:**

1. Open any existing vendor for editing; expand the "Upload/Replace Company Logo" section → **Expected:** Section is visible with upload control.
2. Attempt to select `test.jpg` (or `.gif`) via the file picker → **Expected:** The file input's `accept="image/png"` attribute filters out non-PNG files at the OS level, OR the file is selectable but the client shows an immediate validation error before upload.
3. If the file was selectable, click "Upload Now" → **Expected:** Upload is rejected; an error message containing *"Only PNG files are allowed"* (or equivalent) is displayed; no logo is changed.
4. Reopen the vendor → **Expected:** The previous logo state is unchanged — no corruption from the failed upload attempt.

---

### EC-02: Logo Section Appears and Functions Identically in Both Form Modes

**Objective:** Confirm AC1 and AC5 — the section is present and behaves the same whether the dialog is in Edit mode or New mode.

**Steps:**

1. Open an existing vendor in Edit mode; note the position, label, and controls of the "Upload/Replace Company Logo" expansion panel → **Expected:** Panel labeled "Upload/Replace Company Logo" is present; expansion, preview, and upload controls are all functional.
2. Close the dialog and open the New Vendor form → **Expected:** The same "Upload/Replace Company Logo" panel appears in the same position with the same controls.
3. Confirm the upload control is interactive (clickable, opens file picker) in the New form without requiring the form to be saved first → **Expected:** File selection and preview work in New mode; deferred-upload hint is shown upon file selection.