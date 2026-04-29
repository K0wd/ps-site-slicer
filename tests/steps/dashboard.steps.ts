import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import {
  USERNAME_INPUT_XPATH,
  NEXT_BUTTON_XPATH,
} from '../properties/login-username.properties';
import {
  PASSWORD_INPUT_XPATH,
  LETS_GO_BUTTON_XPATH,
  SAFETY_MODAL_OK_XPATH,
} from '../properties/login-password.properties';
import {
  SEARCH_INPUT_XPATH,
  REFRESH_ICON_XPATH,
  ADD_WIDGET_BUTTON_XPATH,
  USER_PROFILE_XPATH,
  LOGOUT_ICON_XPATH,
  SIDEBAR_FILTER_INPUT_XPATH,
  SIDEBAR_NAV_ITEMS_XPATH,
  VERSION_XPATH,
  menuItemXpath,
  WIDGET_MENU_ITEM_XPATH,
  WIDGET_TITLE_XPATH,
  WIDGET_ICONS_CSS,
  WIDGET_REMOVE_XPATH,
} from '../properties/dashboard.properties';

const { Given, When, Then } = createBdd();

Given('I am logged in and on the dashboard', async ({ page }) => {
  // Step 1: Enter username and click Next
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.locator(`xpath=${USERNAME_INPUT_XPATH}`).fill(process.env.TEST_USERNAME || '');
  await page.locator(`xpath=${NEXT_BUTTON_XPATH}`).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // Step 2: Enter password and click Let's go
  await page.locator(`xpath=${PASSWORD_INPUT_XPATH}`).fill(process.env.TEST_PASSWORD || '');
  await page.locator(`xpath=${LETS_GO_BUTTON_XPATH}`).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);

  // Step 3: Dismiss safety modal
  const okButton = page.locator(`xpath=${SAFETY_MODAL_OK_XPATH}`);
  if (await okButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    await okButton.click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');
  }

  // Dismiss any snackbar
  const snackOk = page.getByRole('button', { name: 'OK' });
  if (await snackOk.isVisible({ timeout: 2000 }).catch(() => false)) {
    await snackOk.click();
    await page.waitForTimeout(500);
  }

  await expect(page).toHaveURL(/\/spa\/dashboard\/index/);
});

Then('I should see the search input', async ({ page }) => {
  await expect(page.locator(`xpath=${SEARCH_INPUT_XPATH}`)).toBeVisible();
});

Then('I should see the refresh button', async ({ page }) => {
  await expect(page.locator(`xpath=${REFRESH_ICON_XPATH}`).first()).toBeVisible();
});

Then('I should see the add widget button', async ({ page }) => {
  await expect(page.locator(`xpath=${ADD_WIDGET_BUTTON_XPATH}`)).toBeVisible();
});

Then('I should see the my profile link', async ({ page }) => {
  await expect(page.locator(`xpath=${USER_PROFILE_XPATH}`)).toBeVisible();
});

Then('I should see the logout link', async ({ page }) => {
  await expect(page.locator(`xpath=${LOGOUT_ICON_XPATH}`)).toBeVisible();
});

Then('I should see the sidebar filter', async ({ page }) => {
  await expect(page.locator(`xpath=${SIDEBAR_FILTER_INPUT_XPATH}`)).toBeVisible();
});

Then('I should see the {string} menu item', async ({ page }, menuName: string) => {
  await expect(page.locator(`xpath=${menuItemXpath(menuName)}`).first()).toBeVisible();
});

When('I type {string} in the sidebar filter', async ({ page }, text: string) => {
  await page.locator(`xpath=${SIDEBAR_FILTER_INPUT_XPATH}`).fill(text);
  await page.waitForTimeout(500);
});

Then('the sidebar should show only menu items matching {string}', async ({ page }, filterText: string) => {
  await page.waitForTimeout(500);
  const items = page.locator(`xpath=${SIDEBAR_NAV_ITEMS_XPATH}`);
  const count = await items.count();
  for (let i = 0; i < count; i++) {
    const item = items.nth(i);
    if (await item.isVisible()) {
      const title = (await item.getAttribute('title')) ?? '';
      expect(title.toLowerCase()).toContain(filterText.toLowerCase());
    }
  }
});

Then('the sidebar filter should still contain {string}', async ({ page }, filterText: string) => {
  const value = await page.locator(`xpath=${SIDEBAR_FILTER_INPUT_XPATH}`).inputValue();
  expect(value).toBe(filterText);
});

Then('the sidebar should show all menu items', async ({ page }) => {
  await page.waitForTimeout(500);
  // A non-"Admin" item that must be visible when the filter is cleared
  await expect(
    page.locator('xpath=//app-sidebar-cmp//li[@title="Dashboard"]')
  ).toBeVisible({ timeout: 5000 });
});

Then('I should see the SM version in the sidebar', async ({ page }) => {
  await expect(page.locator(`xpath=${VERSION_XPATH}`)).toBeVisible();
});

// ── Widget Steps ──

When('I add the {string} widget', async ({ page }, widgetName: string) => {
  await page.locator(`xpath=${ADD_WIDGET_BUTTON_XPATH}`).click();
  await page.waitForTimeout(1000);
  await page.locator(`xpath=${WIDGET_MENU_ITEM_XPATH(widgetName)}`).click();
  await page.waitForTimeout(2000);

  // Dismiss "already exists" snackbar if present
  const snackOk = page.getByRole('button', { name: 'OK' });
  if (await snackOk.isVisible({ timeout: 2000 }).catch(() => false)) {
    await snackOk.click();
    await page.waitForTimeout(500);
  }
});

Then('I should see the {string} widget on the dashboard', async ({ page }, widgetName: string) => {
  await expect(page.locator(`xpath=//span[contains(@class, 'widget-title') and normalize-space()='${widgetName}']`)).toBeVisible({ timeout: 10_000 });
});

Then('I delete all widgets from the dashboard', async ({ page }) => {
  let widgetIcons = page.locator(WIDGET_ICONS_CSS);
  let count = await widgetIcons.count();

  while (count > 0) {
    // Force visibility and click the widget menu icon
    await widgetIcons.first().evaluate((el: HTMLElement) => el.style.visibility = 'visible');
    await widgetIcons.first().click();
    await page.waitForTimeout(500);

    // Click Remove from the dropdown menu
    const removeBtn = page.locator(`xpath=${WIDGET_REMOVE_XPATH}`);
    if (await removeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await removeBtn.click();
      await page.waitForTimeout(1000);
    } else {
      // Close menu if Remove not found
      await page.keyboard.press('Escape');
      break;
    }

    count = await widgetIcons.count();
  }
});
