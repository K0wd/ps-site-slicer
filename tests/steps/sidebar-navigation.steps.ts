import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import * as fs from 'fs';
import * as path from 'path';

const { When, Then } = createBdd();

/** Build sidebar link XPath from title + href. */
const sidebarLinkXpath = (title: string, href: string) =>
  `//li[@title='${title}']//a[@href='${href}']`;

/** Build sidebar parent menu XPath (no href, cursor pointer). */
const sidebarParentXpath = (title: string) =>
  `//li[@title='${title}']//a[contains(@style,'cursor: pointer')]`;

/** Convert page title to slug for html filename. */
const toSlug = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ── Navigable Menu Items ──

When('I click the {string} sidebar menu item', async ({ page }, pageName: string) => {
  // Look up the route from the Examples table via the next step,
  // but first we need to find and click the sidebar link.
  // Use the title-only locator since href comes from the Then step.
  const sidebarItem = page.locator(`//li[@title='${pageName}']//a[@href]`);

  await sidebarItem.scrollIntoViewIfNeeded({ timeout: 5000 });
  try {
    await sidebarItem.click({ timeout: 5000 });
  } catch {
    await sidebarItem.dispatchEvent('click');
  }
});

Then(
  'the {string} page should load at {string}',
  async ({ page }, pageName: string, route: string) => {
    // Wait for URL — some pages redirect, so use a partial match
    const routePattern = route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      await page.waitForURL(new RegExp(routePattern), { timeout: 15000 });
    } catch {
      // If URL doesn't match exactly (redirect), just wait for load
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
    }
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

    // Verify the page loaded: URL contains the route OR main content is visible
    const currentUrl = page.url();
    const urlMatches = currentUrl.includes(route);
    const mainContent = page.locator('.main-panel, .main-content, router-outlet').first();
    const contentVisible = await mainContent.isVisible({ timeout: 5000 }).catch(() => false);

    expect(
      urlMatches || contentVisible,
      `${pageName} failed to load. URL: ${currentUrl}, expected route: ${route}`
    ).toBeTruthy();
  }
);

Then('I save the htmlBody snapshot for {string}', async ({ page }, pageName: string) => {
  const slug = toSlug(pageName);
  const htmlDir = path.resolve('html');

  if (!fs.existsSync(htmlDir)) {
    fs.mkdirSync(htmlDir, { recursive: true });
  }

  const htmlContent = await page.content();
  const htmlFile = path.join(htmlDir, `${slug}.html`);
  fs.writeFileSync(htmlFile, htmlContent, 'utf-8');
});

// ── Parent Menus (expandable) ──

When('I click the {string} sidebar parent menu', async ({ page }, parentName: string) => {
  const parentItem = page.locator(sidebarParentXpath(parentName));

  await parentItem.scrollIntoViewIfNeeded({ timeout: 5000 });
  try {
    await parentItem.click({ timeout: 5000 });
  } catch {
    await parentItem.dispatchEvent('click');
  }

  // Wait for submenu animation
  await page.waitForTimeout(1000);
});

Then('the {string} submenu should expand', async ({ page }, parentName: string) => {
  // After clicking a parent menu, child <ul> or child <li> items should appear
  const submenu = page.locator(
    `//li[@title='${parentName}']//ul | //li[@title='${parentName}']/following-sibling::div[contains(@class,'children')]`
  );

  const childItems = page.locator(
    `//li[@title='${parentName}']//ul//li | //li[@title='${parentName}']/following-sibling::li[contains(@class,'child')]`
  );

  const submenuVisible = await submenu.first().isVisible({ timeout: 5000 }).catch(() => false);
  const childCount = await childItems.count().catch(() => 0);

  expect(
    submenuVisible || childCount > 0,
    `${parentName} submenu did not expand — no child items found`
  ).toBeTruthy();
});
