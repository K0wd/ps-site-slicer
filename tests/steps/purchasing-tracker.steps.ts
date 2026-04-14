import { expect } from '@playwright/test';
import { Page } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import {
  COL_IDS,
  AG_GRID_ROOT_XPATH,
  TABLE_ROW_XPATH,
  SIDEBAR_PURCHASING_XPATH,
  FILTER_MENU_BUTTON_XPATH_FN,
  FILTER_ACTIVE_ICON_XPATH_FN,
  COLUMN_HEADER_XPATH_FN,
  AG_TEXT_FILTER_INPUT_XPATH,
  AG_SET_FILTER_LIST_XPATH,
  AG_SET_FILTER_ITEM_XPATH_FN,
  AG_SET_FILTER_CHECKBOX_XPATH_FN,
  AG_SET_FILTER_SELECT_ALL_XPATH,
  AG_DATE_FILTER_CONDITION_XPATH,
  AG_DATE_FILTER_INPUT_XPATH,
  AG_DATE_FILTER_CONDITION_OPTIONS_XPATH,
  AG_NUMBER_FILTER_INPUT_XPATH,
  AG_NUMBER_FILTER_CONDITION_XPATH,
  AG_MENU_XPATH,
  EXPORT_BUTTON_XPATH,
  EXPORT_DIALOG_OVERLAY_XPATH,
  ALL_CELLS_FOR_COL_XPATH_FN,
} from '../properties/purchasing-tracker.properties';

const { When, Then } = createBdd();

// ── Helper: Resolve column name to ag-Grid col-id ──
function getColId(columnName: string): string {
  const colId = COL_IDS[columnName];
  if (!colId) {
    throw new Error(`Unknown column name: "${columnName}". Add it to COL_IDS in purchasing-tracker.properties.ts`);
  }
  return colId;
}

// ── Helper: Close any open ag-Grid popup ──
async function closeFilterPopup(page: Page) {
  const menu = page.locator(`xpath=${AG_MENU_XPATH}`);
  if (await menu.isVisible({ timeout: 1000 }).catch(() => false)) {
    await page.keyboard.press('Escape');
    await menu.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
  }
}

// ── Helper: Wait for ag-Grid to finish filtering (rows re-render) ──
async function waitForGridUpdate(page: Page) {
  await page.waitForTimeout(1500);
  await page.locator(`xpath=${AG_GRID_ROOT_XPATH}`).waitFor({ state: 'visible', timeout: 10000 });
}

// ── Navigation ──

Then('I should be on the Purchasing Tracker page', async ({ page }) => {
  await page.waitForURL(/\/spa\/pos\/index-new/, { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  await expect(page.locator(`xpath=${AG_GRID_ROOT_XPATH}`)).toBeVisible({ timeout: 15000 });
});

// ── Open Filter ──

When('I open the filter on the {string} column', async ({ page }, columnName: string) => {
  await closeFilterPopup(page);

  const colId = getColId(columnName);
  const headerCell = page.locator(`xpath=${COLUMN_HEADER_XPATH_FN(colId)}`);
  await headerCell.scrollIntoViewIfNeeded();
  await headerCell.hover();
  await page.waitForTimeout(500);

  const menuButton = page.locator(`xpath=${FILTER_MENU_BUTTON_XPATH_FN(colId)}`);
  await expect(menuButton).toBeVisible({ timeout: 5000 });
  await menuButton.click();
  await page.waitForTimeout(1000);

  await expect(page.locator(`xpath=${AG_MENU_XPATH}`)).toBeVisible({ timeout: 5000 });

  // Click the filter tab if the menu has tabs (ag-Grid shows columns/filter/general tabs)
  const filterTab = page.locator(`xpath=//div[contains(@class,'ag-popup')]//span[contains(@class,'ag-tab')][.//span[contains(@class,'ag-icon-filter')]]`);
  if (await filterTab.isVisible({ timeout: 2000 }).catch(() => false)) {
    await filterTab.click();
    await page.waitForTimeout(500);
  }
});

// ── Text Filter ──

When('I enter {string} in the text filter', async ({ page }, value: string) => {
  const filterInput = page.locator(`xpath=${AG_TEXT_FILTER_INPUT_XPATH}`).first();
  await expect(filterInput).toBeVisible({ timeout: 5000 });
  await filterInput.fill(value);
  await waitForGridUpdate(page);
});

// ── Number Filter ──

When('I enter {string} in the number filter', async ({ page }, value: string) => {
  const conditionSelect = page.locator(`xpath=${AG_NUMBER_FILTER_CONDITION_XPATH}`).first();
  if (await conditionSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
    await conditionSelect.selectOption({ label: 'Greater than' });
    await page.waitForTimeout(500);
  }
  const filterInput = page.locator(`xpath=${AG_NUMBER_FILTER_INPUT_XPATH}`).first();
  await expect(filterInput).toBeVisible({ timeout: 5000 });
  await filterInput.fill(value);
  await waitForGridUpdate(page);
});

// ── Date Range Filter ──

When('I set a date range filter with {string} and {string}', async ({ page }, condition: string, dateValue: string) => {
  const conditionSelect = page.locator(`xpath=${AG_DATE_FILTER_CONDITION_XPATH}`).first();
  await expect(conditionSelect).toBeVisible({ timeout: 5000 });

  // Map Gherkin-friendly condition names to ag-Grid filter option values
  const conditionMap: Record<string, string> = {
    'after': 'greaterThan',
    'before': 'lessThan',
    'equals': 'equals',
    'not equal': 'notEqual',
    'in range': 'inRange',
  };
  const optionValue = conditionMap[condition] || condition;

  await conditionSelect.selectOption({ value: optionValue }).catch(async () => {
    // Fallback: try matching by visible label text
    await conditionSelect.selectOption({ label: condition });
  });
  await page.waitForTimeout(500);

  const dateInput = page.locator(`xpath=${AG_DATE_FILTER_INPUT_XPATH}`).first();
  await expect(dateInput).toBeVisible({ timeout: 5000 });
  await dateInput.fill(dateValue);
  await waitForGridUpdate(page);
});

// ── Set Filter (checkbox dropdown) ──

When('I select {string} from the set filter', async ({ page }, optionText: string) => {
  // ag-Grid set filters start with all items checked.
  // To filter to one value: uncheck "(Select All)" first, then check the desired option.
  const selectAllCheckbox = page.locator(`xpath=${AG_SET_FILTER_SELECT_ALL_XPATH}`);
  if (await selectAllCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) {
    await selectAllCheckbox.click();
    await page.waitForTimeout(500);
  }

  const optionCheckbox = page.locator(`xpath=${AG_SET_FILTER_CHECKBOX_XPATH_FN(optionText)}`);
  await expect(optionCheckbox).toBeVisible({ timeout: 5000 });
  await optionCheckbox.click();
  await waitForGridUpdate(page);
});

When('I select multiple values {string} and {string} from the set filter', async ({ page }, value1: string, value2: string) => {
  const selectAllCheckbox = page.locator(`xpath=${AG_SET_FILTER_SELECT_ALL_XPATH}`);
  if (await selectAllCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) {
    await selectAllCheckbox.click();
    await page.waitForTimeout(500);
  }

  const checkbox1 = page.locator(`xpath=${AG_SET_FILTER_CHECKBOX_XPATH_FN(value1)}`);
  await expect(checkbox1).toBeVisible({ timeout: 5000 });
  await checkbox1.click();
  await page.waitForTimeout(500);

  const checkbox2 = page.locator(`xpath=${AG_SET_FILTER_CHECKBOX_XPATH_FN(value2)}`);
  await expect(checkbox2).toBeVisible({ timeout: 5000 });
  await checkbox2.click();
  await waitForGridUpdate(page);
});

When('I select a known approver from the set filter', async ({ page }) => {
  const selectAllCheckbox = page.locator(`xpath=${AG_SET_FILTER_SELECT_ALL_XPATH}`);
  if (await selectAllCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) {
    await selectAllCheckbox.click();
    await page.waitForTimeout(500);
  }

  // Select the first real option (skip Select All and Blank)
  const items = page.locator(
    `xpath=//div[contains(@class,'ag-popup')]//div[contains(@class,'ag-set-filter-item')]//span[contains(@class,'ag-set-filter-item-value')]`
  );
  const count = await items.count();
  let selected = false;
  for (let i = 0; i < count; i++) {
    const text = await items.nth(i).textContent();
    if (text && text.trim() !== '' && !text.includes('Select All') && !text.includes('Blank') && !text.includes('(Blanks)')) {
      const safeText = text.trim().replace(/'/g, "\\'");
      const checkbox = page.locator(
        `xpath=//div[contains(@class,'ag-popup')]//div[contains(@class,'ag-set-filter-item')][.//span[contains(text(),'${safeText}')]]//div[contains(@class,'ag-checkbox')]`
      );
      await checkbox.click();
      selected = true;
      break;
    }
  }
  if (!selected) {
    throw new Error('No approver options found in set filter (all items were blank or empty)');
  }
  await waitForGridUpdate(page);
});

When('I select the first available set filter option', async ({ page }) => {
  const selectAllCheckbox = page.locator(`xpath=${AG_SET_FILTER_SELECT_ALL_XPATH}`);
  if (await selectAllCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) {
    await selectAllCheckbox.click();
    await page.waitForTimeout(500);
  }

  const items = page.locator(
    `xpath=//div[contains(@class,'ag-popup')]//div[contains(@class,'ag-set-filter-item')]//span[contains(@class,'ag-set-filter-item-value')]`
  );
  const count = await items.count();
  let selected = false;
  for (let i = 0; i < count; i++) {
    const text = await items.nth(i).textContent();
    if (text && text.trim() !== '' && !text.includes('Select All')) {
      const safeText = text.trim().replace(/'/g, "\\'");
      const checkbox = page.locator(
        `xpath=//div[contains(@class,'ag-popup')]//div[contains(@class,'ag-set-filter-item')][.//span[contains(text(),'${safeText}')]]//div[contains(@class,'ag-checkbox')]`
      );
      await checkbox.click();
      selected = true;
      break;
    }
  }
  if (!selected) {
    throw new Error('No options found in set filter');
  }
  await waitForGridUpdate(page);
});

// ── Clear Filter ──

When('I clear the active filter', async ({ page }) => {
  const menu = page.locator(`xpath=${AG_MENU_XPATH}`);
  const menuVisible = await menu.isVisible({ timeout: 1000 }).catch(() => false);

  if (menuVisible) {
    // Try clearing a text/number filter input
    const textInput = page.locator(`xpath=${AG_TEXT_FILTER_INPUT_XPATH}`).first();
    const textVisible = await textInput.isVisible({ timeout: 1000 }).catch(() => false);

    if (textVisible) {
      await textInput.fill('');
      await page.waitForTimeout(1000);
    } else {
      // For set filters, re-check "(Select All)" to restore all items
      const selectAllCheckbox = page.locator(`xpath=${AG_SET_FILTER_SELECT_ALL_XPATH}`);
      if (await selectAllCheckbox.isVisible({ timeout: 1000 }).catch(() => false)) {
        await selectAllCheckbox.click();
        await page.waitForTimeout(1000);
      }
    }
  }

  await page.keyboard.press('Escape');
  await menu.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
  await waitForGridUpdate(page);
});

// ── Close Filter Popup ──

When('I press Escape to close the filter', async ({ page }) => {
  await page.keyboard.press('Escape');
  const menu = page.locator(`xpath=${AG_MENU_XPATH}`);
  await menu.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
});

// ── Export ──

When('I click the export button', async ({ page }) => {
  await closeFilterPopup(page);

  const exportButton = page.locator(`xpath=${EXPORT_BUTTON_XPATH}`);
  await exportButton.scrollIntoViewIfNeeded();
  await expect(exportButton).toBeVisible({ timeout: 5000 });
  await exportButton.click();
  await page.waitForTimeout(2000);
});

Then('the export should complete successfully', async ({ page }) => {
  const exportDialog = page.locator(`xpath=${EXPORT_DIALOG_OVERLAY_XPATH}`);
  const dialogVisible = await exportDialog.isVisible({ timeout: 3000 }).catch(() => false);

  if (dialogVisible) {
    await expect(exportDialog).toBeHidden({ timeout: 60000 });
  } else {
    await page.waitForTimeout(3000);
  }

  await expect(page.locator(`xpath=${AG_GRID_ROOT_XPATH}`)).toBeVisible({ timeout: 10000 });
});

// ── Re-navigation ──

When('I navigate away and return to Purchasing Tracker', async ({ page }) => {
  await page.goto('/spa/dashboard/index');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const sidebarItem = page.locator(`xpath=${SIDEBAR_PURCHASING_XPATH}`);
  await sidebarItem.scrollIntoViewIfNeeded({ timeout: 5000 });
  await sidebarItem.click();
  await page.waitForURL(/\/spa\/pos\/index-new/, { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  await expect(page.locator(`xpath=${AG_GRID_ROOT_XPATH}`)).toBeVisible({ timeout: 15000 });
});

// ── Assertions ──

Then('the table should show filtered rows', async ({ page }) => {
  await closeFilterPopup(page);
  await waitForGridUpdate(page);

  await expect(page.locator(`xpath=${AG_GRID_ROOT_XPATH}`)).toBeVisible({ timeout: 10000 });
  const rows = page.locator(`xpath=${TABLE_ROW_XPATH}`);
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);
});

Then('the table should show filtered rows or zero results', async ({ page }) => {
  await closeFilterPopup(page);
  await waitForGridUpdate(page);

  await expect(page.locator(`xpath=${AG_GRID_ROOT_XPATH}`)).toBeVisible({ timeout: 15000 });
  // Zero results is acceptable — grid should still be visible
});

Then('the visible row count should be greater than zero', async ({ page }) => {
  const rows = page.locator(`xpath=${TABLE_ROW_XPATH}`);
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);
});

Then('the table should return to unfiltered state', async ({ page }) => {
  await waitForGridUpdate(page);
  const rows = page.locator(`xpath=${TABLE_ROW_XPATH}`);
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);
});

// ── Division Column — No Filter ──

Then('the {string} column should not have a filter menu button', async ({ page }, columnName: string) => {
  const colId = getColId(columnName);
  const headerCell = page.locator(`xpath=${COLUMN_HEADER_XPATH_FN(colId)}`);
  await headerCell.scrollIntoViewIfNeeded();
  await headerCell.hover();
  await page.waitForTimeout(500);

  const menuButton = page.locator(`xpath=${FILTER_MENU_BUTTON_XPATH_FN(colId)}`);
  // The menu button should either not exist or not be visible
  const count = await menuButton.count();
  if (count > 0) {
    await expect(menuButton).not.toBeVisible();
  }
});

// ── Set Filter Assertions ──

Then('the filter should show a set filter list', async ({ page }) => {
  await expect(page.locator(`xpath=${AG_SET_FILTER_LIST_XPATH}`)).toBeVisible({ timeout: 5000 });
});

Then('the set filter should have option {string}', async ({ page }, optionText: string) => {
  const option = page.locator(`xpath=${AG_SET_FILTER_ITEM_XPATH_FN(optionText)}`);
  await expect(option).toBeVisible({ timeout: 5000 });
});

// ── Filter Icon Assertions ──

Then('the filter icon should not be visible on the {string} column', async ({ page }, columnName: string) => {
  const colId = getColId(columnName);
  const filterIcon = page.locator(`xpath=${FILTER_ACTIVE_ICON_XPATH_FN(colId)}`);
  // The icon should either not exist or not be visible after clearing the filter
  const count = await filterIcon.count();
  if (count > 0) {
    await expect(filterIcon).not.toBeVisible();
  }
});

// ── Cell Content Assertions ──

Then('all visible {string} cells should contain {string}', async ({ page }, columnName: string, expectedText: string) => {
  const colId = getColId(columnName);
  const cells = page.locator(`xpath=${ALL_CELLS_FOR_COL_XPATH_FN(colId)}`);
  const count = await cells.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const cellText = await cells.nth(i).textContent();
    expect(cellText?.toLowerCase()).toContain(expectedText.toLowerCase());
  }
});

// ── Date Filter Condition Assertions ──

Then('the date filter should not have an {string} option', async ({ page }, conditionName: string) => {
  const options = page.locator(`xpath=${AG_DATE_FILTER_CONDITION_OPTIONS_XPATH}`);
  const count = await options.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const text = await options.nth(i).textContent();
    expect(text?.toLowerCase()).not.toBe(conditionName.toLowerCase());
  }
});
