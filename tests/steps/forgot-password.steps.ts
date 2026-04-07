import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import {
  PAGE_TITLE_XPATH,
  SECTION_TITLE_XPATH,
  INSTRUCTIONS_XPATH,
  USERNAME_INPUT_XPATH,
  EMAIL_INPUT_XPATH,
  SEND_ACCESS_LINK_BUTTON_XPATH,
  LOGIN_LINK_XPATH,
  VERSION_XPATH,
} from '../properties/forgot-password.properties';

const { Given, Then } = createBdd();

Given('I am on the forgot password page', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.getByRole('link', { name: /Forgot Password/i }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
});

Then('I should see the page title {string}', async ({ page }, title: string) => {
  await expect(page.locator(`xpath=${PAGE_TITLE_XPATH}`)).toContainText(title);
});

Then('I should see the section title {string}', async ({ page }, title: string) => {
  await expect(page.locator(`xpath=${SECTION_TITLE_XPATH}`)).toHaveText(title);
});

Then('I should see the instructions text', async ({ page }) => {
  await expect(page.locator(`xpath=${INSTRUCTIONS_XPATH}`)).toBeVisible();
});

Then('I should see the username input field', async ({ page }) => {
  await expect(page.locator(`xpath=${USERNAME_INPUT_XPATH}`)).toBeVisible();
});

Then('I should see the email input field', async ({ page }) => {
  await expect(page.locator(`xpath=${EMAIL_INPUT_XPATH}`)).toBeVisible();
});

Then('I should see the send access link button', async ({ page }) => {
  await expect(page.locator(`xpath=${SEND_ACCESS_LINK_BUTTON_XPATH}`)).toBeVisible();
});

Then('I should see the login link', async ({ page }) => {
  await expect(page.locator(`xpath=${LOGIN_LINK_XPATH}`)).toBeVisible();
});

Then('I should see the version info', async ({ page }) => {
  await expect(page.locator(`xpath=${VERSION_XPATH}`)).toBeVisible();
});
