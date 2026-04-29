import { createBdd } from 'playwright-bdd';

const { When, Then } = createBdd();

// ── VENDOR-1 stubs ────────────────────────────────────────────────────────────

When('I filter the {string} column by a specific approver name', async ({}, _col: string) => {
  // TODO: SC-05
});

Then('only rows matching that approver name should be visible in the grid', async ({}) => {
  // TODO: SC-05
});

When('I filter the {string} column by blank', async ({}, _col: string) => {
  // TODO: SC-05
});

Then('only rows with no approver assigned should be visible in the grid', async ({}) => {
  // TODO: SC-05
});

When('I navigate to the exports queue and refresh until the file is ready', async ({}) => {
  // TODO: SC-05
});

Then('the exported file should contain only the blank-approver rows', async ({}) => {
  // TODO: SC-05
});

// ── VENDOR-2 stubs ────────────────────────────────────────────────────────────

When('I navigate to the Vendor Admin screen', async ({}) => {
  // TODO: EC-03
});

When('I open the filter for the {string} column', async ({}, _col: string) => {
  // TODO: EC-03
});

When('I select the filter value {string}', async ({}, _val: string) => {
  // TODO: EC-03
});

When('I apply the column filter', async ({}) => {
  // TODO: EC-03
});

Then('the grid should display rows matching {string}', async ({}, _val: string) => {
  // TODO: EC-03
});

Then('no rows with other status values should be visible', async ({}) => {
  // TODO: EC-03
});
