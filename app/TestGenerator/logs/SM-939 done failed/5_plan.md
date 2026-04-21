# Test Plan: SM-939 — Standardize AG Grid Button Layout Across Modules

## Summary

Verify that AG Grid toolbar buttons follow a consistent order across the Purchasing (reference), Quoting (reordered), and Vendor Admin modules, that the WO Tracker Refresh button has been removed without breaking data reload, and that Project Tracker and Incident modules remain unchanged.

## Pre-conditions (all scenarios)

- Logged in to `https://testserver.betacom.com/spa` as **Bandeleonk / test1234** (admin user)
- Browser loaded, SPA navigation functional
- At least one saved non-default view exists in each AG Grid module (for Delete View visibility checks)

---

### SC-01: Cross-Module Button Order Consistency

**Objective:** Confirm the toolbar button sequence is standardized across the three target modules, using Purchasing as the reference
**Pre-conditions:** Shared pre-conditions; default view selected in each module

**Steps:**

1. Navigate to the **Purchasing Tracker** module (`/purchasing-tracker`) → **Expected:** Grid loads; toolbar buttons appear in order: **New Item, Admin, Clear Filter, Save View, Export** (Delete View hidden on default view)
2. Note the exact button labels and left-to-right positions as the reference baseline → **Expected:** Order documented for comparison
3. Navigate to the **Quoting Tracker** module (`/quoting-tracker`) → **Expected:** Grid loads; toolbar buttons appear in order: **New Item, Admin, Clear Filter, Save View, Export** — identical sequence to Purchasing
4. Navigate to the **Vendor Admin** module (`/vendors-admin`) → **Expected:** Grid loads; toolbar buttons appear in order: **Add Vendor, Clear Filter, Save View, Export** (no Admin button since this IS the admin page) — matches Purchasing order with expected omission
5. In each module, select a **non-default saved view** from the view dropdown → **Expected:** **Delete View** button appears between Save View and Export in all three modules, maintaining consistent relative position

---

### SC-02: Quoting Tracker Button Functionality After Reorder

**Objective:** Confirm every button in the Quoting Tracker retains its original functionality after being repositioned
**Pre-conditions:** Shared pre-conditions; on the Quoting Tracker page

**Steps:**

1. Click **New Item** (1st button) → **Expected:** New quoting item form/dialog opens
2. Close the form, then click **Admin** (2nd button) → **Expected:** Navigates to the Quoting admin page
3. Navigate back to the Quoting Tracker; apply a column filter to any column → **Expected:** Grid data filters correctly
4. Click **Clear Filter** (3rd button) → **Expected:** All active grid filters are cleared; full dataset redisplays
5. Click **Save View** (4th button) → **Expected:** Save view dialog/prompt appears; saving completes without error
6. Select a **non-default saved view**, then click **Delete View** (5th button) → **Expected:** View is deleted; grid reverts to default view; Delete View button hides
7. Click **Export** (last button) → **Expected:** Grid data exports (file download initiates or export dialog appears)

---

### SC-03: WO Tracker — Refresh Button Removal and Alternate Reload

**Objective:** Confirm the toolbar Refresh button is removed from WO Tracker and that data refresh still works via the department selector
**Pre-conditions:** Shared pre-conditions

**Steps:**

1. Navigate to the **WO Tracker** module (`/wo-tracker`) → **Expected:** Grid loads successfully
2. Inspect the toolbar buttons → **Expected:** Buttons present are **Clear Filter, Save View, Delete View (conditional), Export to Excel**; **no Refresh button** exists in the toolbar
3. Note the currently displayed data rows, then change the **Department selector** to a different department → **Expected:** Grid data reloads and displays work orders for the newly selected department (confirms alternate refresh mechanism works)
4. Click **Clear Filter** → **Expected:** Any active filters are cleared
5. Click **Save View** → **Expected:** Save view functionality works as before
6. Click **Export to Excel** → **Expected:** Excel export initiates successfully

---

### SC-04: Regression — Unchanged Modules Remain Unaffected

**Objective:** Confirm Project Tracker and Incident module toolbars were not altered by this change
**Pre-conditions:** Shared pre-conditions

**Steps:**

1. Navigate to the **Project Tracker** module → **Expected:** Grid loads; toolbar buttons appear in their pre-existing order and quantity — no buttons added, removed, or reordered
2. Click 2-3 toolbar buttons in Project Tracker → **Expected:** Each button performs its expected function without error
3. Navigate to the **Incident** module → **Expected:** Grid loads; toolbar buttons appear in their pre-existing order and quantity — no buttons added, removed, or reordered
4. Click 2-3 toolbar buttons in Incident → **Expected:** Each button performs its expected function without error

---

## Edge Cases

### EC-01: Delete View Conditional Visibility Across Modules

**Objective:** Verify Delete View only appears when a non-default view is selected, consistently across all AG Grid modules
**Pre-conditions:** Shared pre-conditions

**Steps:**

1. In Purchasing Tracker, ensure **default view** is selected → **Expected:** Delete View button is **not visible**
2. Select a **non-default saved view** → **Expected:** Delete View button appears between Save View and Export
3. Switch back to the **default view** → **Expected:** Delete View button disappears
4. Repeat steps 1-3 in **Quoting Tracker** and **Vendor Admin** → **Expected:** Identical conditional behavior in all three modules

---

### EC-02: Non-Admin User Button Visibility

**Objective:** Verify that permission-gated buttons (e.g., Admin) remain correctly hidden for non-admin users after the reorder
**Pre-conditions:** Logged in as a **non-admin user** (if a test account is available)

**Steps:**

1. Navigate to the **Purchasing Tracker** → **Expected:** **Admin** button is hidden; remaining buttons maintain standardized order without a gap
2. Navigate to the **Quoting Tracker** → **Expected:** **Admin** button is hidden; remaining buttons maintain standardized order without a gap
3. Click available buttons (New Item, Clear Filter, Save View, Export) → **Expected:** All function correctly with no permission errors
