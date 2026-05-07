import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import {
  TARGET_URL,
  SIDEBAR_TITLE_CANDIDATES,
  sidebarLinkByTitleXpath,
  PAGE_CONTAINER_XPATH,
} from '../properties/intake-email-admin.properties';

const { When, Then } = createBdd();

When('I navigate to the module under test', async ({ page }) => {
  for (const title of SIDEBAR_TITLE_CANDIDATES) {
    const link = page.locator(`xpath=${sidebarLinkByTitleXpath(title)}`);
    const count = await link.count().catch(() => 0);
    if (count > 0) {
      await link.scrollIntoViewIfNeeded({ timeout: 5000 });
      try {
        await link.click({ timeout: 5000 });
      } catch {
        await link.dispatchEvent('click');
      }
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      return;
    }
  }
  await page.goto(TARGET_URL);
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
});

Then('the module page loads without error', async ({ page }) => {
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  const url = page.url();
  expect(url).not.toContain('oops');
  expect(url).not.toContain('/error');
  const container = page.locator(`xpath=${PAGE_CONTAINER_XPATH}`);
  await expect(container.first()).toBeVisible({ timeout: 10000 });
});

When('I navigate to the Email Rules Admin module', async ({ page }) => {
  for (const title of SIDEBAR_TITLE_CANDIDATES) {
    const link = page.locator(`xpath=${sidebarLinkByTitleXpath(title)}`);
    const count = await link.count().catch(() => 0);
    if (count > 0) {
      await link.scrollIntoViewIfNeeded({ timeout: 5000 });
      try {
        await link.click({ timeout: 5000 });
      } catch {
        await link.dispatchEvent('click');
      }
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      return;
    }
  }
  await page.goto(TARGET_URL);
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
});

When('I navigate to the rules management module', async ({ page }) => {
  for (const title of SIDEBAR_TITLE_CANDIDATES) {
    const link = page.locator(`xpath=${sidebarLinkByTitleXpath(title)}`);
    const count = await link.count().catch(() => 0);
    if (count > 0) {
      await link.scrollIntoViewIfNeeded({ timeout: 5000 });
      try {
        await link.click({ timeout: 5000 });
      } catch {
        await link.dispatchEvent('click');
      }
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      return;
    }
  }
  await page.goto(TARGET_URL);
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
});
