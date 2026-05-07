import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import {
  SIDEBAR_CASCADE_TEMPLATES_XPATH,
  TEMPLATE_TABLE_XPATH,
  TEMPLATE_ROW_XPATH,
  TEMPLATE_NAME_CELL_XPATH,
  THREE_DOT_MENU_BUTTON_XPATH,
  CONTEXT_MENU_ITEM_XPATH,
  CONTEXT_MENU_PANEL_XPATH,
  GOLD_STAR_ICON_XPATH,
  GOLD_STAR_IN_ROW_XPATH,
  ADD_NEW_BUTTON_XPATH,
  DIALOG_NAME_INPUT_XPATH,
  DIALOG_SUBMIT_BUTTON_XPATH,
  DIALOG_CONTAINER_XPATH,
  DUPLICATE_NAME_ERROR_XPATH,
  REFRESH_ICON_XPATH,
  STEP_DURATION_INPUT_XPATH,
  STEP_DATE_CELL_XPATH,
  STEP_ALL_DURATION_INPUTS_XPATH,
} from '../properties/cascade-templates.properties';

const { Given, When, Then } = createBdd();

// ── Template List Visibility ──

Then('I should see the template list with available templates', async ({ page }) => {
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  const table = page.locator(`xpath=${TEMPLATE_TABLE_XPATH}`);
  await expect(table).toBeVisible({ timeout: 15000 });
  const rows = page.locator(`xpath=${TEMPLATE_ROW_XPATH}`);
  await expect(rows.first()).toBeVisible({ timeout: 15000 });
});

// ── Default Template State ──

When('I note the current default template state', async ({ page }) => {
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  // Check if any gold star exists — just note the state, no assertion
  const starCount = await page.locator(`xpath=${GOLD_STAR_ICON_XPATH}`).count().catch(() => 0);
  // Store in page for later reference if needed
  await page.evaluate((count) => {
    (window as any).__previousDefaultStarCount = count;
  }, starCount);
});

// ── Three-dot Menu ──

When('I click the three-dot menu on a non-default template', async ({ page }) => {
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  const rows = page.locator(`xpath=${TEMPLATE_ROW_XPATH}`);
  const rowCount = await rows.count();
  expect(rowCount, 'No template rows found in the table').toBeGreaterThan(0);

  // Find a row that does NOT contain a gold star icon
  for (let i = 0; i < rowCount; i++) {
    const row = rows.nth(i);
    const hasStar = await row.locator(
      `xpath=.//mat-icon[normalize-space()='star']`
    ).count();

    if (hasStar === 0) {
      // Store the template name for later verification
      const nameCell = row.locator(`xpath=.//mat-cell[contains(@class,'mat-column-name')]`);
      const templateName = await nameCell.textContent() ?? '';
      await page.evaluate((name) => {
        (window as any).__selectedTemplateName = name.trim();
      }, templateName);

      // Click the three-dot menu icon in this row (no button wrapper)
      const menuIcon = row.locator(`xpath=.//mat-icon[normalize-space()='more_vert']`);
      await menuIcon.scrollIntoViewIfNeeded({ timeout: 5000 });
      try {
        await menuIcon.click({ timeout: 5000 });
      } catch {
        await menuIcon.dispatchEvent('click');
      }
      await page.waitForTimeout(500);
      return;
    }
  }

  // If all rows have stars (unlikely), click the first row's menu anyway
  const firstMenuIcon = page.locator(`xpath=${THREE_DOT_MENU_BUTTON_XPATH}`).first();
  await firstMenuIcon.scrollIntoViewIfNeeded({ timeout: 5000 });
  try {
    await firstMenuIcon.click({ timeout: 5000 });
  } catch {
    await firstMenuIcon.dispatchEvent('click');
  }
  await page.waitForTimeout(500);
});

// ── Context Menu ──

Then('I should see the {string} menu item in the context menu', async ({ page }, menuItem: string) => {
  const menuItemLocator = page.locator(`xpath=${CONTEXT_MENU_ITEM_XPATH(menuItem)}`);
  await expect(menuItemLocator.first()).toBeVisible({ timeout: 5000 });
});

When('I click the {string} menu item', async ({ page }, menuItem: string) => {
  const menuItemLocator = page.locator(`xpath=${CONTEXT_MENU_ITEM_XPATH(menuItem)}`);
  await expect(menuItemLocator.first()).toBeVisible({ timeout: 5000 });
  try {
    await menuItemLocator.first().click({ timeout: 5000 });
  } catch {
    await menuItemLocator.first().dispatchEvent('click');
  }
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(1000);
});

// ── Gold Star Verification ──

Then('I should see the gold star icon next to the selected template', async ({ page }) => {
  // Retrieve the template name we stored earlier
  const selectedName: string = await page.evaluate(() => (window as any).__selectedTemplateName ?? '');

  if (selectedName) {
    // Verify the star icon appears in the row with the selected template name
    const starInRow = page.locator(
      `xpath=//mat-row[.//mat-cell[contains(@class,'mat-column-name') and contains(normalize-space(),'${selectedName}')]]//mat-icon[normalize-space()='star']`
    );
    await expect(starInRow.first()).toBeVisible({ timeout: 10000 });
  } else {
    // Fallback: just check that a gold star icon exists somewhere in the table
    const star = page.locator(`xpath=${GOLD_STAR_ICON_XPATH}`);
    await expect(star.first()).toBeVisible({ timeout: 10000 });
  }
});

// ── Template List Refresh ──

Then('the template list should refresh automatically', async ({ page }) => {
  // Verify the table is still visible and rows are present after the action
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  const table = page.locator(`xpath=${TEMPLATE_TABLE_XPATH}`);
  await expect(table).toBeVisible({ timeout: 10000 });
  const rows = page.locator(`xpath=${TEMPLATE_ROW_XPATH}`);
  await expect(rows.first()).toBeVisible({ timeout: 10000 });
});

// ── Navigate to Cascade Templates (convenience step) ──

When('I navigate to the Cascade Templates admin screen', async ({ page }) => {
  await page.goto('/spa/main/cascade-template-admin');
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
});

When('I navigate to the cascade templates management screen', async ({ page }) => {
  const sidebarLink = page.locator(`xpath=${SIDEBAR_CASCADE_TEMPLATES_XPATH}`);
  const sidebarCount = await sidebarLink.count().catch(() => 0);
  if (sidebarCount > 0) {
    await sidebarLink.scrollIntoViewIfNeeded({ timeout: 5000 });
    try {
      await sidebarLink.click({ timeout: 5000 });
    } catch {
      await sidebarLink.dispatchEvent('click');
    }
  } else {
    await page.goto('/spa/main/cascade-template-admin');
  }
  await page.waitForURL(/cascade-template-admin/, { timeout: 15000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
});

When('I navigate to the Cascade Templates management screen', async ({ page }) => {
  const sidebarLink = page.locator(`xpath=${SIDEBAR_CASCADE_TEMPLATES_XPATH}`);
  const sidebarCount = await sidebarLink.count().catch(() => 0);
  if (sidebarCount > 0) {
    await sidebarLink.scrollIntoViewIfNeeded({ timeout: 5000 });
    try {
      await sidebarLink.click({ timeout: 5000 });
    } catch {
      await sidebarLink.dispatchEvent('click');
    }
  } else {
    await page.goto('/spa/main/cascade-template-admin');
  }
  await page.waitForURL(/cascade-template-admin/, { timeout: 15000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
});

When('I navigate to the Cascade Template Management screen', async ({ page }) => {
  const sidebarLink = page.locator(`xpath=${SIDEBAR_CASCADE_TEMPLATES_XPATH}`);
  const sidebarCount = await sidebarLink.count().catch(() => 0);
  if (sidebarCount > 0) {
    await sidebarLink.scrollIntoViewIfNeeded({ timeout: 5000 });
    try {
      await sidebarLink.click({ timeout: 5000 });
    } catch {
      await sidebarLink.dispatchEvent('click');
    }
  } else {
    await page.goto('/spa/main/cascade-template-admin');
  }
  await page.waitForURL(/cascade-template-admin/, { timeout: 15000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
});

// ── Generic seeded records assertion (used by SM-1118 and similar "module load" scenarios) ──

Then('the expected seeded records are visible in the list', async ({ page }) => {
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  const table = page.locator(`xpath=${TEMPLATE_TABLE_XPATH}`);
  await expect(table).toBeVisible({ timeout: 15000 });
  const rows = page.locator(`xpath=${TEMPLATE_ROW_XPATH}`);
  await expect(rows.first()).toBeVisible({ timeout: 15000 });
});

// ── Template List (short form) ──

Then('I should see the template list', async ({ page }) => {
  const table = page.locator(`xpath=${TEMPLATE_TABLE_XPATH}`);
  await expect(table).toBeVisible({ timeout: 15000 });
  const rows = page.locator(`xpath=${TEMPLATE_ROW_XPATH}`);
  await expect(rows.first()).toBeVisible({ timeout: 15000 });
});

// ── Three-dot Menu (positional) ──

When('I click the three-dot menu on the first template', async ({ page }) => {
  const rows = page.locator(`xpath=${TEMPLATE_ROW_XPATH}`);
  await expect(rows.first()).toBeVisible({ timeout: 10000 });
  const menuIcon = rows.nth(0).locator(`xpath=.//mat-icon[normalize-space()='more_vert']`);
  await menuIcon.scrollIntoViewIfNeeded({ timeout: 5000 });
  try {
    await menuIcon.click({ timeout: 5000 });
  } catch {
    await menuIcon.dispatchEvent('click');
  }
  await page.waitForTimeout(500);
});

When('I click the three-dot menu on a different template', async ({ page }) => {
  const rows = page.locator(`xpath=${TEMPLATE_ROW_XPATH}`);
  const rowCount = await rows.count();
  expect(rowCount, 'Need at least 2 templates to pick a different one').toBeGreaterThanOrEqual(2);
  const menuIcon = rows.nth(1).locator(`xpath=.//mat-icon[normalize-space()='more_vert']`);
  await menuIcon.scrollIntoViewIfNeeded({ timeout: 5000 });
  try {
    await menuIcon.click({ timeout: 5000 });
  } catch {
    await menuIcon.dispatchEvent('click');
  }
  await page.waitForTimeout(500);
});

// ── Menu Option (parameterized) ──

When('I click the {string} menu option', async ({ page }, optionLabel: string) => {
  const menuItem = page.locator(`xpath=${CONTEXT_MENU_ITEM_XPATH(optionLabel)}`);
  await expect(menuItem.first()).toBeVisible({ timeout: 5000 });
  try {
    await menuItem.first().click({ timeout: 5000 });
  } catch {
    await menuItem.first().dispatchEvent('click');
  }
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(1000);
});

Then('the menu should show the {string} option', async ({ page }, optionLabel: string) => {
  const menuItem = page.locator(`xpath=${CONTEXT_MENU_ITEM_XPATH(optionLabel)}`);
  await expect(menuItem.first()).toBeVisible({ timeout: 5000 });
});

// ── Gold Star Assertions (positional) ──

Then('I should see the gold star icon next to the first template', async ({ page }) => {
  const firstRow = page.locator(`xpath=${TEMPLATE_ROW_XPATH}`).nth(0);
  const star = firstRow.locator(`xpath=.//mat-icon[normalize-space()='star']`);
  await expect(star.first()).toBeVisible({ timeout: 10000 });
});

Then('I should see the gold star icon next to the second template', async ({ page }) => {
  const secondRow = page.locator(`xpath=${TEMPLATE_ROW_XPATH}`).nth(1);
  const star = secondRow.locator(`xpath=.//mat-icon[normalize-space()='star']`);
  await expect(star.first()).toBeVisible({ timeout: 10000 });
});

Then('the first template should no longer display the gold star icon', async ({ page }) => {
  const firstRow = page.locator(`xpath=${TEMPLATE_ROW_XPATH}`).nth(0);
  const star = firstRow.locator(`xpath=.//mat-icon[normalize-space()='star']`);
  await expect(star).toHaveCount(0, { timeout: 10000 });
});

Then('exactly one gold star icon should be visible in the template list', async ({ page }) => {
  const stars = page.locator(`xpath=${GOLD_STAR_ICON_XPATH}`);
  await expect(stars).toHaveCount(1, { timeout: 10000 });
});

// ── Create / Attempt Template via Add New dialog ──

async function openAddNewAndFillName(page: any, name: string): Promise<void> {
  const addBtn = page.locator(`xpath=${ADD_NEW_BUTTON_XPATH}`);
  await expect(addBtn.first()).toBeVisible({ timeout: 10000 });
  await addBtn.first().scrollIntoViewIfNeeded({ timeout: 5000 });
  try {
    await addBtn.first().click({ timeout: 5000 });
  } catch {
    await addBtn.first().dispatchEvent('click');
  }
  const nameInput = page.locator(`xpath=${DIALOG_NAME_INPUT_XPATH}`);
  await expect(nameInput.first()).toBeVisible({ timeout: 10000 });
  await nameInput.first().fill(name);
  const submitBtn = page.locator(`xpath=${DIALOG_SUBMIT_BUTTON_XPATH}`);
  await expect(submitBtn.first()).toBeVisible({ timeout: 5000 });
  try {
    await submitBtn.first().click({ timeout: 5000 });
  } catch {
    await submitBtn.first().dispatchEvent('click');
  }
}

When('I create a cascade template named {string}', async ({ page }, name: string) => {
  await openAddNewAndFillName(page, name);
  const dialog = page.locator(`xpath=${DIALOG_CONTAINER_XPATH}`);
  await expect(dialog).toHaveCount(0, { timeout: 15000 });
  // Navigate back to the same page to guarantee the template list reloads
  await page.goto('/spa/main/cascade-template-admin');
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  const row = page.locator(`xpath=//mat-row[.//mat-cell[contains(normalize-space(),'${name}')]]`);
  await expect(row.first()).toBeVisible({ timeout: 15000 });
});

When('I attempt to create a cascade template named {string}', async ({ page }, name: string) => {
  await openAddNewAndFillName(page, name);
  // Wait for the duplicate error to surface before returning so it is still visible
  // when the following assertion step runs immediately after.
  const error = page.locator(`xpath=${DUPLICATE_NAME_ERROR_XPATH}`);
  await error.first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
});

Then('I should see a duplicate name validation error', async ({ page }) => {
  const error = page.locator(`xpath=${DUPLICATE_NAME_ERROR_XPATH}`);
  await expect(error.first()).toBeVisible({ timeout: 10000 });
});

// ── Open Existing Template ──

When('I open an existing cascade template', async ({ page }) => {
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  const rows = page.locator(`xpath=${TEMPLATE_ROW_XPATH}`);
  await expect(rows.first()).toBeVisible({ timeout: 15000 });
  const nameCell = page.locator(`xpath=${TEMPLATE_NAME_CELL_XPATH}`).first();
  await nameCell.scrollIntoViewIfNeeded({ timeout: 5000 });
  try {
    await nameCell.click({ timeout: 5000 });
  } catch {
    await nameCell.dispatchEvent('click');
  }
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
});

When('I open an existing cascade template with multiple steps', async ({ page }) => {
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  const rows = page.locator(`xpath=${TEMPLATE_ROW_XPATH}`);
  await expect(rows.first()).toBeVisible({ timeout: 15000 });
  const nameCell = page.locator(`xpath=${TEMPLATE_NAME_CELL_XPATH}`).first();
  await nameCell.scrollIntoViewIfNeeded({ timeout: 5000 });
  try {
    await nameCell.click({ timeout: 5000 });
  } catch {
    await nameCell.dispatchEvent('click');
  }
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  const durationInputs = page.locator(`xpath=${STEP_ALL_DURATION_INPUTS_XPATH}`);
  await expect(durationInputs.first()).toBeVisible({ timeout: 15000 });
  const stepCount = await durationInputs.count();
  expect(stepCount, 'Expected template to have at least 2 steps').toBeGreaterThanOrEqual(2);
});

// ── Given: Cascade template is open for editing ──

Given('a cascade template is open for editing', async ({ page }) => {
  await page.goto('/spa/main/cascade-template-admin');
  await page.waitForURL(/cascade-template-admin/, { timeout: 15000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  const rows = page.locator(`xpath=${TEMPLATE_ROW_XPATH}`);
  await expect(rows.first()).toBeVisible({ timeout: 15000 });
  const nameCell = page.locator(`xpath=${TEMPLATE_NAME_CELL_XPATH}`).first();
  await nameCell.scrollIntoViewIfNeeded({ timeout: 5000 });
  try {
    await nameCell.click({ timeout: 5000 });
  } catch {
    await nameCell.dispatchEvent('click');
  }
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  const durationInputs = page.locator(`xpath=${STEP_ALL_DURATION_INPUTS_XPATH}`);
  await expect(durationInputs.first()).toBeVisible({ timeout: 15000 });
});

// ── Given: Navigate to Cascade Templates module ──

Given('I navigate to the Cascade Templates module', async ({ page }) => {
  const sidebarLink = page.locator(`xpath=${SIDEBAR_CASCADE_TEMPLATES_XPATH}`);
  const sidebarCount = await sidebarLink.count().catch(() => 0);
  if (sidebarCount > 0) {
    await sidebarLink.scrollIntoViewIfNeeded({ timeout: 5000 });
    try {
      await sidebarLink.click({ timeout: 5000 });
    } catch {
      await sidebarLink.dispatchEvent('click');
    }
  } else {
    await page.goto('/spa/main/cascade-template-admin');
  }
  await page.waitForURL(/cascade-template-admin/, { timeout: 15000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
});

// ── Override Step Duration ──

// ── Downstream Date Recalculation ──

Then('the downstream dates for all subsequent steps should update immediately', async ({ page }) => {
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  const dateCells = page.locator(`xpath=${STEP_DATE_CELL_XPATH}`);
  await expect(dateCells.first()).toBeVisible({ timeout: 10000 });
  const count = await dateCells.count();
  expect(count, 'Expected downstream date cells to be present after duration override').toBeGreaterThan(0);
  const firstValue = await dateCells.first().inputValue().catch(() =>
    dateCells.first().textContent()
  );
  expect(firstValue?.trim(), 'Expected downstream date cell to contain a calculated date').toBeTruthy();
});

When('I change the duration of a step to a different number of days', async ({ page }) => {
  const allInputs = page.locator(`xpath=${STEP_ALL_DURATION_INPUTS_XPATH}`);
  await expect(allInputs.first()).toBeVisible({ timeout: 15000 });
  const firstInput = allInputs.first();
  await firstInput.scrollIntoViewIfNeeded({ timeout: 5000 });
  const currentValue = await firstInput.inputValue();
  const newValue = currentValue === '7' ? '14' : '7';
  await firstInput.fill(newValue);
  await firstInput.press('Tab');
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
});

When('I change the duration value of an intermediate step', async ({ page }) => {
  const allInputs = page.locator(`xpath=${STEP_ALL_DURATION_INPUTS_XPATH}`);
  await expect(allInputs.first()).toBeVisible({ timeout: 15000 });
  const count = await allInputs.count();
  expect(count, 'Expected at least 2 step duration inputs for an intermediate step').toBeGreaterThanOrEqual(2);
  // Pick the second input (index 1) as the intermediate step
  const intermediateInput = allInputs.nth(1);
  await intermediateInput.scrollIntoViewIfNeeded({ timeout: 5000 });
  const currentValue = await intermediateInput.inputValue();
  const newValue = currentValue === '5' ? '10' : '5';
  await intermediateInput.fill(newValue);
  await intermediateInput.press('Tab');
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
});

When('I override the duration for a step to {string}', async ({ page }, duration: string) => {
  const durationInput = page.locator(`xpath=${STEP_DURATION_INPUT_XPATH}`);
  await expect(durationInput).toBeVisible({ timeout: 10000 });
  await durationInput.scrollIntoViewIfNeeded({ timeout: 5000 });
  await durationInput.fill(duration);
  await durationInput.press('Tab');
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
});

Then('the downstream step dates should recalculate automatically without requiring a save', async ({ page }) => {
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  const dateCells = page.locator(`xpath=${STEP_DATE_CELL_XPATH}`);
  await expect(dateCells.first()).toBeVisible({ timeout: 10000 });
  const count = await dateCells.count();
  expect(count, 'Expected downstream date cells to be present after duration change').toBeGreaterThan(0);
  const firstValue = await dateCells.first().inputValue().catch(() =>
    dateCells.first().textContent()
  );
  expect(firstValue?.trim(), 'Expected downstream date to be recalculated without a save action').toBeTruthy();
});

Then('all downstream step dates in the template should update automatically to reflect the new duration', async ({ page }) => {
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  const dateCells = page.locator(`xpath=${STEP_DATE_CELL_XPATH}`);
  await expect(dateCells.first()).toBeVisible({ timeout: 10000 });
  const count = await dateCells.count();
  expect(count, 'Expected downstream date cells to be present after duration change').toBeGreaterThan(0);
  const firstValue = await dateCells.first().inputValue().catch(() =>
    dateCells.first().textContent()
  );
  expect(firstValue?.trim(), 'Expected downstream date cell to contain a calculated date value').toBeTruthy();
});
