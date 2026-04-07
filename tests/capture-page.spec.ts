import { test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const saveSnapshot = async (page: any, name: string) => {
  await page.screenshot({ path: `html/${name}.png`, fullPage: true });
  fs.writeFileSync(path.resolve('html', `${name}.html`), await page.content(), 'utf-8');
  console.log(`Saved: html/${name}.png + html/${name}.html`);
};

test('Capture forgot password page', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto(process.env.BASE_URL || '/');
  await page.waitForLoadState('networkidle');
  await page.getByRole('link', { name: /Forgot Password/i }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  await saveSnapshot(page, 'forgot-password');
  console.log(`Forgot password page captured (URL: ${page.url()})`);
});

test('Full login flow capture', async ({ page }) => {
  test.setTimeout(90_000);

  // Step 1: Visit BASE_URL, capture username page
  await page.goto(process.env.BASE_URL || '/');
  await page.waitForLoadState('networkidle');
  await saveSnapshot(page, 'login-username');
  console.log(`Step 1: Username page captured (URL: ${page.url()})`);

  // Step 2: Enter TEST_USERNAME, click Next, capture password page
  await page.getByRole('textbox').fill(process.env.TEST_USERNAME || '');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  await saveSnapshot(page, 'login-password');
  console.log(`Step 2: Password page captured (URL: ${page.url()})`);

  // Step 3: Enter TEST_PASSWORD, click "Let's go"
  await page.locator('input[type="password"]').fill(process.env.TEST_PASSWORD || '');
  await page.getByRole('button', { name: "Let's go" }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);
  await saveSnapshot(page, 'home-with-modal');
  console.log(`Step 3: After login captured (URL: ${page.url()})`);

  // Step 4: Dismiss modal if present
  const okButton = page.locator('button', { hasText: 'OK' });
  if (await okButton.count() > 0) {
    await okButton.click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    await saveSnapshot(page, 'home');
    console.log(`Step 4: Home dashboard captured (URL: ${page.url()})`);
  }
});
