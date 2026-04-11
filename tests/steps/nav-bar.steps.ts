import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import {
  NAV_BAR_ELEMENTS,
  SIDEBAR_TOGGLE_BUTTON_XPATH,
  NAVBAR_SEARCH_INPUT_XPATH,
} from '../properties/nav-bar.properties';

const { When, Then } = createBdd();

// ── Visibility Checks ──

Then(
  'I should see the {string} in the nav bar',
  async ({ page }, elementName: string) => {
    const xpath = NAV_BAR_ELEMENTS[elementName];
    expect(xpath, `Unknown nav bar element: "${elementName}"`).toBeTruthy();
    await expect(page.locator(`xpath=${xpath}`).first()).toBeVisible({ timeout: 10000 });
  }
);

// ── Click Actions ──

When(
  'I click the {string} in the nav bar',
  async ({ page }, elementName: string) => {
    const xpath = NAV_BAR_ELEMENTS[elementName];
    expect(xpath, `Unknown nav bar element: "${elementName}"`).toBeTruthy();
    const el = page.locator(`xpath=${xpath}`).first();
    await el.scrollIntoViewIfNeeded({ timeout: 5000 });
    try {
      await el.click({ timeout: 5000 });
    } catch {
      await el.dispatchEvent('click');
    }
    await page.waitForTimeout(1000);
  }
);

// ── Sidebar Toggle ──

When('I click the sidebar toggle button', async ({ page }) => {
  const toggle = page.locator(`xpath=${SIDEBAR_TOGGLE_BUTTON_XPATH}`);
  await toggle.click();
  await page.waitForTimeout(500);
});

Then('the sidebar should be collapsed', async ({ page }) => {
  // After toggle, the sidebar width shrinks — check that the sidebar is narrower
  // or that the visible-on-sidebar-mini icon is now displayed
  const miniIcon = page.locator('i.visible-on-sidebar-mini');
  const sidebar = page.locator('.sidebar');
  const isCollapsed = await sidebar.evaluate((el) => {
    const width = el.getBoundingClientRect().width;
    return width < 200;
  }).catch(() => false);
  const miniVisible = await miniIcon.isVisible({ timeout: 3000 }).catch(() => false);
  expect(
    isCollapsed || miniVisible,
    'Sidebar did not collapse — width still >= 200px and mini icon not visible'
  ).toBeTruthy();
});

Then('the sidebar should be expanded', async ({ page }) => {
  const sidebar = page.locator('.sidebar');
  const isExpanded = await sidebar.evaluate((el) => {
    const width = el.getBoundingClientRect().width;
    return width >= 200;
  }).catch(() => false);
  expect(isExpanded, 'Sidebar did not expand — width still < 200px').toBeTruthy();
});

// ── Dashboard Navigation ──

Then('I should be on the dashboard page', async ({ page }) => {
  await expect(page).toHaveURL(/\/spa\/dashboard\/index/);
});

// ── Refresh ──

Then('the dashboard should reload', async ({ page }) => {
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await expect(page).toHaveURL(/\/spa\/dashboard/);
});

// ── Notifications Panel ──

Then('the notifications panel should be visible', async ({ page }) => {
  const panel = page.locator('.notification-drop-down, [class*="notification-list"], [role="listbox"]').first();
  const visible = await panel.isVisible({ timeout: 5000 }).catch(() => false);
  expect(visible, 'Notifications panel did not open after clicking notifications icon').toBeTruthy();
});

// ── Contact Support Panel ──

Then('the contact support panel should be visible', async ({ page }) => {
  const panel = page.locator('.notification-drop-down, [class*="support"], [role="listbox"]').first();
  const visible = await panel.isVisible({ timeout: 5000 }).catch(() => false);
  expect(visible, 'Contact support panel did not open after clicking contact support icon').toBeTruthy();
});

// ── Search ──

When('I type {string} in the navbar search input', async ({ page }, text: string) => {
  await page.locator(`xpath=${NAVBAR_SEARCH_INPUT_XPATH}`).fill(text);
  await page.waitForTimeout(500);
});

Then('I should be navigated to search results', async ({ page }) => {
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  const url = page.url();
  const hasSearch = url.includes('search') || url.includes('Search');
  expect(hasSearch, `Expected search results page, got: ${url}`).toBeTruthy();
});

