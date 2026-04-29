import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import {
  DEPT_NAME_INPUT_XPATH,
  DEPT_LIST_CELL_XPATH,
} from '../properties/maintenance-admin.properties';
import { LEGACY_IFRAME_SELECTOR } from '../properties/import-costs.properties';

const { Given, When, Then } = createBdd();

const UNIQUE_DEPT_KEY = '__maintAdminUniqueDeptName';

When('I enter a unique department name', async ({ page }) => {
  const uniqueName = `Test Dept ${Date.now()}`;
  await page.evaluate((name) => { (window as any)[UNIQUE_DEPT_KEY] = name; }, uniqueName);

  const frame = page.frameLocator(LEGACY_IFRAME_SELECTOR);
  const input = frame.locator(`xpath=${DEPT_NAME_INPUT_XPATH}`).first();
  await input.waitFor({ state: 'visible', timeout: 10000 });
  await input.fill(uniqueName);
});

Then('the new department should appear in the departments list', async ({ page }) => {
  const uniqueName: string = await page.evaluate((key) => (window as any)[key] ?? '', UNIQUE_DEPT_KEY);
  expect(uniqueName, 'No department name was stored — did "I enter a unique department name" run?').toBeTruthy();

  const frame = page.frameLocator(LEGACY_IFRAME_SELECTOR);
  const cell = frame.locator(`xpath=${DEPT_LIST_CELL_XPATH(uniqueName)}`).first();
  await expect(cell).toBeVisible({ timeout: 15000 });
});

// ── MAINT-2 stubs ─────────────────────────────────────────────────────────────

When('I enter the name of an existing department', async ({}) => {
  // TODO: SC-02
});

Then('I should see a validation error blocking the duplicate department name', async ({}) => {
  // TODO: SC-02
});

// ── MAINT-3 stubs ─────────────────────────────────────────────────────────────

When('I enter {string} in the department name field and click the {string} button', async ({}, _name: string, _button: string) => {
  // TODO: EC-01
});

Then('no blank or whitespace department entry should appear in the list', async ({}) => {
  // TODO: EC-01
});

Then('I should see a validation message preventing the save', async ({}) => {
  // TODO: EC-01
});

// ── MAINT-4 stubs ─────────────────────────────────────────────────────────────

Given('a record with the same identifying value already exists in the system', async ({}) => {
  // TODO: EC-02
});

When('I submit a second record with the same identifying value bypassing the frontend duplicate check', async ({}) => {
  // TODO: EC-02
});

Then('the system should display a duplicate entry error message', async ({}) => {
  // TODO: EC-02
});

Then('no additional duplicate record should be created', async ({}) => {
  // TODO: EC-02
});
