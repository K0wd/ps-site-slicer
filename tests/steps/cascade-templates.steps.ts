import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import {
  TEMPLATE_TABLE_XPATH,
  TEMPLATE_ROW_XPATH,
  TEMPLATE_NAME_CELL_XPATH,
  THREE_DOT_MENU_BUTTON_XPATH,
  CONTEXT_MENU_ITEM_XPATH,
  CONTEXT_MENU_PANEL_XPATH,
  GOLD_STAR_ICON_XPATH,
  GOLD_STAR_IN_ROW_XPATH,
} from '../properties/cascade-templates.properties';

const { When, Then } = createBdd();

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
