import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import {
  PWA_CLOCK_SIMPLE_NAV_XPATH,
  PWA_CLOCK_SIMPLE_HEADING_XPATH,
  PWA_CLOCK_WO_INPUT_XPATH,
  PWA_CLOCK_SUBMIT_BUTTON_XPATH,
  PWA_CLOCK_SUCCESS_INDICATOR_XPATH,
  PWA_TIMESHEET_NAV_XPATH,
  PWA_TIMESHEET_HEADING_XPATH,
  PWA_TIMESHEET_NEW_PERIOD_DATE_XPATH,
  PWA_TIMESHEET_NEW_PERIOD_HOURS_XPATH,
  PWA_TIMESHEET_SAVE_PERIOD_BUTTON_XPATH,
  PWA_WO_NAV_XPATH,
  PWA_WO_SEARCH_INPUT_XPATH,
  PWA_WO_EMPTY_RESULTS_XPATH,
  PWA_CLOCK_DATE_PICKER_XPATH,
  PWA_CLOCK_DATE_OUTSIDE_WEEK_CELL_XPATH,
} from '../properties/pwa-clock-simple.properties';
import { LOGOUT_ICON_XPATH } from '../properties/dashboard.properties';

const { Given, When, Then } = createBdd();

const PWA_BASE_URL = process.env.PWA_URL || 'https://testserver.betacom.com/testpwa';

Given('I navigate to the Clock Simple module in the PWA', async ({ page }) => {
  await page.goto(PWA_BASE_URL);
  await page.waitForLoadState('networkidle');

  const navItem = page.locator(`xpath=${PWA_CLOCK_SIMPLE_NAV_XPATH}`);
  if (await navItem.first().isVisible({ timeout: 5000 }).catch(() => false)) {
    await navItem.first().click();
    await page.waitForLoadState('networkidle');
  }

  await expect(page.locator(`xpath=${PWA_CLOCK_SIMPLE_HEADING_XPATH}`).first()).toBeVisible({ timeout: 15000 });
});

When('I complete the clock entry form with a valid work order and submit', async ({ page }) => {
  const woInput = page.locator(`xpath=${PWA_CLOCK_WO_INPUT_XPATH}`).first();
  await woInput.waitFor({ state: 'visible', timeout: 10000 });
  await woInput.fill(process.env.PWA_TEST_WO || 'TEST-WO-001');

  const submitBtn = page.locator(`xpath=${PWA_CLOCK_SUBMIT_BUTTON_XPATH}`).first();
  await submitBtn.waitFor({ state: 'visible', timeout: 5000 });
  await submitBtn.click();

  await expect(page.locator(`xpath=${PWA_CLOCK_SUCCESS_INDICATOR_XPATH}`).first()).toBeVisible({ timeout: 15000 });
});

When('I navigate to the Timesheet module in the PWA', async ({ page }) => {
  await page.goto(PWA_BASE_URL);
  await page.waitForLoadState('networkidle');

  const navItem = page.locator(`xpath=${PWA_TIMESHEET_NAV_XPATH}`);
  await navItem.first().waitFor({ state: 'visible', timeout: 10000 });
  await navItem.first().click();
  await page.waitForLoadState('networkidle');

  await expect(page.locator(`xpath=${PWA_TIMESHEET_HEADING_XPATH}`).first()).toBeVisible({ timeout: 15000 });
});

When('I fill in the New Period fields with a valid date and hours', async ({ page }) => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const dateInput = page.locator(`xpath=${PWA_TIMESHEET_NEW_PERIOD_DATE_XPATH}`).first();
  await dateInput.waitFor({ state: 'visible', timeout: 10000 });
  await dateInput.fill(today);

  const hoursInput = page.locator(`xpath=${PWA_TIMESHEET_NEW_PERIOD_HOURS_XPATH}`).first();
  await hoursInput.waitFor({ state: 'visible', timeout: 10000 });
  await hoursInput.fill('8');
});

When('I save the new timesheet period successfully', async ({ page }) => {
  const saveBtn = page.locator(`xpath=${PWA_TIMESHEET_SAVE_PERIOD_BUTTON_XPATH}`).first();
  await saveBtn.waitFor({ state: 'visible', timeout: 10000 });
  await saveBtn.click();
  await page.waitForLoadState('networkidle');
});

When('I navigate to the Work Orders module and search for {string}', async ({ page }, searchTerm: string) => {
  await page.goto(PWA_BASE_URL);
  await page.waitForLoadState('networkidle');

  const navItem = page.locator(`xpath=${PWA_WO_NAV_XPATH}`);
  await navItem.first().waitFor({ state: 'visible', timeout: 10000 });
  await navItem.first().click();
  await page.waitForLoadState('networkidle');

  const searchInput = page.locator(`xpath=${PWA_WO_SEARCH_INPUT_XPATH}`).first();
  await searchInput.waitFor({ state: 'visible', timeout: 10000 });
  await searchInput.fill(searchTerm);
  await page.keyboard.press('Enter');
  await page.waitForLoadState('networkidle');
});

Then('I should see an empty results message', async ({ page }) => {
  await expect(page.locator(`xpath=${PWA_WO_EMPTY_RESULTS_XPATH}`).first()).toBeVisible({ timeout: 10000 });
});

Then('the New Period input fields should be cleared and empty', async ({ page }) => {
  const dateInput = page.locator(`xpath=${PWA_TIMESHEET_NEW_PERIOD_DATE_XPATH}`).first();
  const hoursInput = page.locator(`xpath=${PWA_TIMESHEET_NEW_PERIOD_HOURS_XPATH}`).first();

  await dateInput.waitFor({ state: 'visible', timeout: 10000 });
  await hoursInput.waitFor({ state: 'visible', timeout: 10000 });

  await expect(dateInput).toHaveValue('');
  await expect(hoursInput).toHaveValue('');
});

When('I click the logout option in the side menu', async ({ page }) => {
  const logoutBtn = page.locator(`xpath=${LOGOUT_ICON_XPATH}`).first();
  await logoutBtn.waitFor({ state: 'visible', timeout: 10000 });
  await logoutBtn.click();
  await page.waitForLoadState('networkidle');
});

When('I open the clock entry date picker in the PWA', async ({ page }) => {
  await page.goto(PWA_BASE_URL);
  await page.waitForLoadState('networkidle');

  const navItem = page.locator(`xpath=${PWA_CLOCK_SIMPLE_NAV_XPATH}`);
  if (await navItem.first().isVisible({ timeout: 5000 }).catch(() => false)) {
    await navItem.first().click();
    await page.waitForLoadState('networkidle');
  }

  await expect(page.locator(`xpath=${PWA_CLOCK_SIMPLE_HEADING_XPATH}`).first()).toBeVisible({ timeout: 15000 });

  const datePicker = page.locator(`xpath=${PWA_CLOCK_DATE_PICKER_XPATH}`).first();
  await datePicker.waitFor({ state: 'visible', timeout: 10000 });
  await datePicker.click();
});

When('I attempt to select a date outside the current week', async ({ page }) => {
  const outsideDate = new Date();
  outsideDate.setDate(outsideDate.getDate() - 7);
  const outsideDateStr = outsideDate.toISOString().split('T')[0];

  const dateInput = page.locator(`xpath=${PWA_CLOCK_DATE_PICKER_XPATH}`).first();
  if (await dateInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await dateInput.fill(outsideDateStr);
    await dateInput.dispatchEvent('change');
    return;
  }

  const outsideCell = page.locator(`xpath=${PWA_CLOCK_DATE_OUTSIDE_WEEK_CELL_XPATH}`).first();
  await outsideCell.waitFor({ state: 'visible', timeout: 10000 });
  await outsideCell.click();
});

When('I navigate directly to the dashboard', async ({ page }) => {
  await page.goto('https://testserver.betacom.com/spa/dashboard/index');
  await page.waitForLoadState('networkidle');
});
