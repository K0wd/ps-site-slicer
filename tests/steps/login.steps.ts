import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import {
  NAVBAR_LOGO_XPATH,
  LOGIN_CARD_TITLE_XPATH,
  USERNAME_LABEL_XPATH,
  USERNAME_INPUT_XPATH,
  NEXT_BUTTON_XPATH,
} from '../properties/login-username.properties';
import {
  PASSWORD_INPUT_XPATH,
  LETS_GO_BUTTON_XPATH,
  BACK_BUTTON_XPATH,
  SAFETY_MODAL_TITLE_XPATH,
  SAFETY_MODAL_OK_XPATH,
} from '../properties/login-password.properties';
import {
  LEGACY_IFRAME_SELECTOR,
  IMPORT_COSTS_ELEMENTS,
} from '../properties/import-costs.properties';

const { Given, When, Then } = createBdd();

// ─── Navigation (hard assertions — stops test on failure) ─────────────────────

Given('I am on the login page', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
});

Then('I should be redirected to the password page', async ({ page }) => {
  await expect(page.locator(`xpath=${PASSWORD_INPUT_XPATH}`)).toBeVisible();
});

Then('I should be on the dashboard', async ({ page }) => {
  await expect(page).toHaveURL(/\/spa\/dashboard\/index/);
});

// ─── UI branding checks (soft assertions — logs failure, continues test) ──────

Then('I should see the app logo', async ({ page }) => {
  await expect.soft(page.locator(`xpath=${NAVBAR_LOGO_XPATH}`)).toBeVisible();
});

Then('I should see the app title {string}', async ({ page }, title: string) => {
  await expect.soft(page.locator(`xpath=${LOGIN_CARD_TITLE_XPATH}`)).toHaveText(title);
});

Then('I should see the subtitle {string}', async ({ page }, _subtitle: string) => {
  await expect.soft(page.locator(`xpath=${USERNAME_LABEL_XPATH}`)).toBeVisible();
});

Then('I should see the username input', async ({ page }) => {
  await expect.soft(page.locator(`xpath=${USERNAME_INPUT_XPATH}`)).toBeVisible();
});

Then('I should see the next button', async ({ page }) => {
  await expect.soft(page.locator(`xpath=${NEXT_BUTTON_XPATH}`)).toBeVisible();
});

Then('I should see the password input', async ({ page }) => {
  await expect.soft(page.locator(`xpath=${PASSWORD_INPUT_XPATH}`)).toBeVisible();
});

Then('I should see the {string} button', async ({ page }, name: string) => {
  if (name === "Let's go") {
    await expect.soft(page.locator(`xpath=${LETS_GO_BUTTON_XPATH}`)).toBeVisible();
  }
});

Then('I should see the back button', async ({ page }) => {
  await expect.soft(page.locator(`xpath=${BACK_BUTTON_XPATH}`)).toBeVisible();
});

Then('I should see the Safe Day\'s Alert modal', async ({ page }) => {
  await expect.soft(page.locator(`xpath=${SAFETY_MODAL_TITLE_XPATH}`)).toBeVisible();
});

// ─── Actions (hard assertions — stops test on failure) ────────────────────────

When('I enter my username', async ({ page }) => {
  await page.locator(`xpath=${USERNAME_INPUT_XPATH}`).fill(process.env.TEST_USERNAME || '');
});

When('I click the next button', async ({ page }) => {
  await page.locator(`xpath=${NEXT_BUTTON_XPATH}`).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
});

When('I enter my password', async ({ page }) => {
  await page.locator(`xpath=${PASSWORD_INPUT_XPATH}`).fill(process.env.TEST_PASSWORD || '');
});

When('I click the {string} button', async ({ page }, name: string) => {
  if (name === "Let's go") {
    await page.locator(`xpath=${LETS_GO_BUTTON_XPATH}`).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
  } else {
    if (!page.url().includes('/requests/importcosts')) {
      await page.goto('/spa/requests/importcosts');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }
    const xpath = IMPORT_COSTS_ELEMENTS[name] ?? `//button[normalize-space(.)='${name}']`;
    const frame = page.frameLocator(LEGACY_IFRAME_SELECTOR);
    const btn = frame.locator(`xpath=${xpath}`).first();
    await btn.waitFor({ state: 'visible', timeout: 10000 });
    await btn.click();
  }
});

When('I dismiss the Safe Day\'s Alert', async ({ page }) => {
  await page.locator(`xpath=${SAFETY_MODAL_OK_XPATH}`).click();
  await page.waitForTimeout(2000);
  await page.waitForLoadState('networkidle');
});
