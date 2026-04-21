# Test Plan: SM-1103 — Cascade Template Management Screen

## Summary

Tests the new admin management screen for project cascade templates, covering the full master-detail CRUD workflow: creating and managing templates, adding and reordering steps within each template, and deleting at both levels.

## Pre-conditions

- Logged in as `Bandeleonk / test1234` on the stage environment
- User has the "Cascade Templates" UAC permission granted
- SQL migration `20260410_sm1103_cascade_templates.sql` has been run on stage
- No cascade templates currently exist (clean state), or existing test data is acceptable

---

## Scenarios

---

### SC-01: Navigation and Initial Screen State

**Objective:** Confirms the management screen is accessible from the admin sidebar and renders correctly in an initial state.

**Pre-conditions:** Logged in; no cascade templates yet exist.

**Steps:**
1. Open the admin sidebar → **Expected:** "Cascade Templates" menu item is visible under admin navigation.
2. Click "Cascade Templates" → **Expected:** Page navigates to `/main/cascade-template-admin` without error.
3. Observe the template list panel → **Expected:** List is empty or shows a placeholder/empty state message; no console errors.
4. Observe the right-hand panel → **Expected:** Item panel is either hidden or shows a prompt to select a template; no stale data is visible.

---

### SC-02: Create Template and Add Multiple Steps

**Objective:** Proves a user can create a named template and add multiple steps, each with a correct day count — covering AC2, AC3, and AC5.

**Pre-conditions:** Cascade Templates screen is open; list is empty.

**Steps:**
1. Click "Add New" → **Expected:** An edit/create dialog opens with a name field.
2. Enter the name `"Site Launch"` and save → **Expected:** Dialog closes; "Site Launch" appears in the template list.
3. Click a second "Add New" and create a second template named `"Standard Rollout"` → **Expected:** Both templates appear in the list; list shows 2 rows.
4. Click the "Site Launch" row to select it → **Expected:** The right-hand items panel activates and shows an empty items list for that template.
5. Click "Add Item" → **Expected:** Item dialog opens with name and days fields.
6. Enter name `"Design"` and days `"5"`, save → **Expected:** Item appears in the panel with name "Design" and "5" days.
7. Add second item: name `"Procurement"`, days `"10"` → **Expected:** Item appears below "Design" showing "10" days.
8. Add third item: name `"Installation"`, days `"7"` → **Expected:** Three items are listed in the order added: Design (5), Procurement (10), Installation (7).
9. Click "Standard Rollout" in the left panel → **Expected:** Items panel switches context to show Standard Rollout's items (empty); Site Launch items are no longer shown.
10. Click "Site Launch" again → **Expected:** Site Launch's three items are restored exactly as entered.

---

### SC-03: Edit Template Name and Edit Step Values

**Objective:** Proves that both the template name and individual step fields (name and days) can be updated, and changes persist.

**Pre-conditions:** "Site Launch" template exists with three items (Design 5d, Procurement 10d, Installation 7d).

**Steps:**
1. Click the three-dot menu on "Site Launch" and select "Edit" → **Expected:** Edit dialog opens pre-populated with the name "Site Launch".
2. Change the name to `"Site Launch — Revised"` and save → **Expected:** The template list row updates to show the new name; no other rows are affected.
3. Select "Site Launch — Revised" to load its items → **Expected:** All three items are still present with their original values.
4. Click the edit action on the "Procurement" item → **Expected:** Item dialog opens pre-filled with name "Procurement" and days "10".
5. Change days to `"14"` and save → **Expected:** Procurement row now shows "14" days; Design and Installation are unchanged.
6. Click the edit action on "Installation" and change the name to `"Final Install"`, save → **Expected:** Item row updates to "Final Install" with 7 days intact.
7. Refresh the page and re-select "Site Launch — Revised" → **Expected:** Updated template name, Procurement at 14 days, and "Final Install" at 7 days all persist correctly.

---

### SC-04: Reorder Steps and Verify Persistence

**Objective:** Confirms the sort order controls work and that reordered steps survive a page refresh.

**Pre-conditions:** "Site Launch — Revised" is selected and shows three items: Design (pos 1), Procurement (pos 2), Final Install (pos 3).

**Steps:**
1. Click the "Move Up" arrow on "Procurement" (position 2) → **Expected:** Procurement moves to position 1; Design moves to position 2; Final Install remains at position 3.
2. Click the "Move Down" arrow on "Design" (now at position 2) → **Expected:** Design moves to position 3; order is now: Procurement, Final Install, Design.
3. Click the "Move Up" arrow on "Procurement" (already at position 1) → **Expected:** The up arrow is disabled or no change occurs; Procurement remains at position 1.
4. Refresh the page and re-select "Site Launch — Revised" → **Expected:** The item order is preserved: Procurement, Final Install, Design — confirming sort_order persisted to the database.

---

### SC-05: Delete Item and Delete Template

**Objective:** Proves soft-delete works at both levels — individual items and full templates — with confirmation and correct list updates.

**Pre-conditions:** "Site Launch — Revised" exists with three items (Procurement, Final Install, Design). "Standard Rollout" exists in the list.

**Steps:**
1. Select "Site Launch — Revised" and click the delete action on the "Final Install" item → **Expected:** A confirmation dialog appears.
2. Cancel the confirmation → **Expected:** Dialog closes; "Final Install" remains in the items list.
3. Click delete on "Final Install" again and confirm deletion → **Expected:** "Final Install" is removed from the items panel; Procurement and Design remain.
4. Refresh and re-select the template → **Expected:** Only Procurement and Design are present; "Final Install" does not reappear (soft-deleted).
5. Click the three-dot menu on "Standard Rollout" and select "Delete" → **Expected:** Confirmation dialog appears with a warning.
6. Confirm deletion → **Expected:** "Standard Rollout" is removed from the template list; only "Site Launch — Revised" remains.
7. Observe the items panel → **Expected:** Panel either resets to an empty/unselected state or retains the previously selected template; no error occurs.

---

## Edge Cases

---

### EC-01: Required Field Validation on Item Dialog

**Objective:** Ensures the item form enforces required fields and rejects non-numeric or negative day values.

**Pre-conditions:** A template is selected; the "Add Item" dialog is open.

**Steps:**
1. Submit the dialog with both fields empty → **Expected:** Validation errors are shown on both name and days fields; dialog does not close; no API call is made.
2. Enter a name but leave days empty → **Expected:** Validation error on days only; save is blocked.
3. Enter a valid name and type `"abc"` in the days field → **Expected:** Validation error indicating days must be a number; save is blocked.
4. Enter a valid name and type `"-3"` in the days field → **Expected:** Validation error (days must be ≥ 0); save is blocked.
5. Enter a valid name and type `"0"` in days → **Expected:** Item saves successfully (0 days is a valid boundary value per schema definition `min 0`).

---

### EC-02: Required Field Validation on Template Name and Duplicate Prevention

**Objective:** Confirms the template name field is required and that the system handles a blank or duplicate name gracefully.

**Pre-conditions:** Cascade Templates screen is open; "Site Launch — Revised" exists.

**Steps:**
1. Click "Add New" and attempt to save with an empty name → **Expected:** Validation error shown; template is not created.
2. Enter only whitespace in the name field and save → **Expected:** Validation error or the whitespace is trimmed and treated as empty; template is not created.
3. Enter the exact name `"Site Launch — Revised"` (duplicate of existing) and save → **Expected:** Either an error is shown indicating the name already exists, or the system prevents the save — the list does not show two entries with the same name.