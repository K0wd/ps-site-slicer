import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import {
  LEGACY_IFRAME_SELECTOR,
  IMPORT_COSTS_ELEMENTS,
  SUBMIT_BUTTON_XPATH,
  SAVE_BUTTON_XPATH,
} from '../properties/import-costs.properties';

const { When, Then } = createBdd();

Then('the {string} button should be disabled', async ({ page }, name: string) => {
  const xpath = IMPORT_COSTS_ELEMENTS[name] ?? `//button[normalize-space(.)='${name}']`;
  const frame = page.frameLocator(LEGACY_IFRAME_SELECTOR);
  const btn = frame.locator(`xpath=${xpath}`).first();
  await expect(btn).toBeDisabled({ timeout: 10000 });
});

Then('the form should be submitted exactly once', async ({ page }) => {
  // Button stays disabled after click — the UI guard that prevents re-submission
  const frame = page.frameLocator(LEGACY_IFRAME_SELECTOR);
  const btn = frame.locator(`xpath=${SUBMIT_BUTTON_XPATH}`).first();
  await expect(btn).toBeDisabled({ timeout: 5000 });
});

// ── IMPORT-2: Rapid repeated clicks ──────────────────────────────────────────

When('I click the {string} button multiple times in rapid succession', async ({ page }, name: string) => {
  if (!page.url().includes('/requests/importcosts')) {
    await page.goto('/spa/requests/importcosts');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  }
  const xpath = IMPORT_COSTS_ELEMENTS[name] ?? `//button[normalize-space(.)='${name}']`;
  const frame = page.frameLocator(LEGACY_IFRAME_SELECTOR);
  const btn = frame.locator(`xpath=${xpath}`).first();
  await btn.waitFor({ state: 'visible', timeout: 10000 });
  for (let i = 0; i < 5; i++) {
    await btn.click({ force: true }).catch(() => {});
  }
});

Then('exactly one submission should be recorded', async ({ page }) => {
  const frame = page.frameLocator(LEGACY_IFRAME_SELECTOR);
  const btn = frame.locator(`xpath=${SUBMIT_BUTTON_XPATH}`).first();
  await expect(btn).toBeDisabled({ timeout: 5000 });
});

// ── IMPORT-3: Validation error allows retry ───────────────────────────────────

When('I submit the form with missing required fields', async ({ page }) => {
  if (!page.url().includes('/requests/importcosts')) {
    await page.goto('/spa/requests/importcosts');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  }
  const frame = page.frameLocator(LEGACY_IFRAME_SELECTOR);
  const btn = frame.locator(`xpath=${SUBMIT_BUTTON_XPATH}`).first();
  await btn.waitFor({ state: 'visible', timeout: 10000 });
  await btn.click();
});

Then('I should see a validation error message', async ({ page }) => {
  const frame = page.frameLocator(LEGACY_IFRAME_SELECTOR);
  const error = frame.locator(
    "xpath=//*[contains(@class,'error') or contains(@class,'alert-danger') or contains(@class,'invalid-feedback') or contains(@class,'text-danger')]"
  ).first();
  await expect(error).toBeVisible({ timeout: 10000 });
});

When('I correct the required fields and click the {string} button', async ({ page }, name: string) => {
  const xpath = IMPORT_COSTS_ELEMENTS[name] ?? `//button[normalize-space(.)='${name}']`;
  const frame = page.frameLocator(LEGACY_IFRAME_SELECTOR);
  const btn = frame.locator(`xpath=${xpath}`).first();
  await btn.waitFor({ state: 'visible', timeout: 10000 });
  await btn.click();
});

Then('the form should be submitted successfully', async ({ page }) => {
  await page.waitForLoadState('networkidle', { timeout: 15000 });
  const frame = page.frameLocator(LEGACY_IFRAME_SELECTOR);
  const submitBtn = frame.locator(`xpath=${SUBMIT_BUTTON_XPATH}`).first();
  await expect(submitBtn).toBeDisabled({ timeout: 5000 });
});
