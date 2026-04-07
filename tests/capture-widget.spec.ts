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

test('Find widget delete via hidden icon', async ({ page }) => {
  test.setTimeout(120_000);

  // Login
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.getByRole('textbox').fill(process.env.TEST_USERNAME || '');
  await page.locator('button[type="submit"]').click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  await page.locator('input[type="password"]').fill(process.env.TEST_PASSWORD || '');
  await page.getByRole('button', { name: "Let's go" }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);
  const okBtn = page.locator('button', { hasText: 'OK' });
  if (await okBtn.count() > 0) { await okBtn.click(); await page.waitForTimeout(2000); }

  // Hover over the widget to reveal the hidden icon
  const widgetTitle = page.locator('.widget-title').first();
  await widgetTitle.hover();
  await page.waitForTimeout(500);
  await saveSnapshot(page, 'widget-hover');

  // Force visibility and click the icon
  const widgetIcon = page.locator('.widget-icons').first();
  await widgetIcon.evaluate((el: HTMLElement) => el.style.visibility = 'visible');
  await page.waitForTimeout(500);
  await saveSnapshot(page, 'widget-icon-visible');

  await widgetIcon.click();
  await page.waitForTimeout(1000);
  await saveSnapshot(page, 'widget-icon-menu');
});
