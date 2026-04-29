// Generated from: tests/features/dashboard.feature
import { test } from "playwright-bdd";

test.describe('Dashboard', () => {

  test.beforeEach('Background', async ({ Given, page }, testInfo) => { if (testInfo.error) return;
    await Given('I am logged in and on the dashboard', null, { page }); 
  });
  
  test('DASH-1 Display top bar elements', { tag: ['@DASH-1'] }, async ({ Then, And, page }) => { 
    await Then('I should see the search input', null, { page }); 
    await And('I should see the refresh button', null, { page }); 
    await And('I should see the add widget button', null, { page }); 
  });

  test('DASH-2 Display user profile controls', { tag: ['@DASH-2'] }, async ({ Then, And, page }) => { 
    await Then('I should see the my profile link', null, { page }); 
    await And('I should see the logout link', null, { page }); 
  });

  test('DASH-3 Display sidebar navigation', { tag: ['@DASH-3'] }, async ({ Then, And, page }) => { 
    await Then('I should see the sidebar filter', null, { page }); 
    await And('I should see the "Account Management" menu item', null, { page }); 
    await And('I should see the "Dashboard" menu item', null, { page }); 
    await And('I should see the "Timesheets" menu item', null, { page }); 
    await And('I should see the "Reports" menu item', null, { page }); 
  });

  test('DASH-4 Filter sidebar menu', { tag: ['@DASH-4'] }, async ({ When, Then, And, page }) => { 
    await When('I type "Admin" in the sidebar filter', null, { page }); 
    await Then('I should see the "Admin Alerts" menu item', null, { page }); 
    await And('I should see the "BI Admin" menu item', null, { page }); 
  });

  test('DASH-5 Display version info', { tag: ['@DASH-5'] }, async ({ Then, page }) => { 
    await Then('I should see the SM version in the sidebar', null, { page }); 
  });

  test('DASH-6 Add widget - Site Manager Performance', { tag: ['@DASH-6'] }, async ({ When, Then, And, page }) => { 
    await When('I add the "Site Manager Performance" widget', null, { page }); 
    await Then('I should see the "Site Manager Performance" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

  test('DASH-7 Add widget - Known Employee Locations', { tag: ['@DASH-7'] }, async ({ When, Then, And, page }) => { 
    await When('I add the "Known Employee Locations" widget', null, { page }); 
    await Then('I should see the "Known Employee Locations" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

  test('DASH-8 Add widget - Announcements', { tag: ['@DASH-8'] }, async ({ When, Then, And, page }) => { 
    await When('I add the "Announcements" widget', null, { page }); 
    await Then('I should see the "Announcements" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

  test('DASH-9 Add widget - Favorites', { tag: ['@DASH-9'] }, async ({ When, Then, And, page }) => { 
    await When('I add the "Favorites" widget', null, { page }); 
    await Then('I should see the "Favorites" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

  test('DASH-10 Add widget - Alerts', { tag: ['@DASH-10'] }, async ({ When, Then, And, page }) => { 
    await When('I add the "Alerts" widget', null, { page }); 
    await Then('I should see the "Alerts" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

  test('DASH-11 Add widget - Clocked In', { tag: ['@DASH-11'] }, async ({ When, Then, And, page }) => { 
    await When('I add the "Clocked In" widget', null, { page }); 
    await Then('I should see the "Clocked In" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

  test('DASH-12 Add widget - Materials Over Budget', { tag: ['@DASH-12'] }, async ({ When, Then, And, page }) => { 
    await When('I add the "Materials Over Budget" widget', null, { page }); 
    await Then('I should see the "Materials Over Budget" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

  test('DASH-13 Add widget - Subcontractors Over Budget', { tag: ['@DASH-13'] }, async ({ When, Then, And, page }) => { 
    await When('I add the "Subcontractors Over Budget" widget', null, { page }); 
    await Then('I should see the "Subcontractors Over Budget" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

  test('DASH-14 Add widget - Equipment Over Budget', { tag: ['@DASH-14'] }, async ({ When, Then, And, page }) => { 
    await When('I add the "Equipment Over Budget" widget', null, { page }); 
    await Then('I should see the "Equipment Over Budget" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

  test('DASH-15 Add widget - Profitability By Department', { tag: ['@DASH-15'] }, async ({ When, Then, And, page }) => { 
    await When('I add the "Profitability By Department" widget', null, { page }); 
    await Then('I should see the "Profitability By Department" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

  test('DASH-16 Add widget - Past Due Tickets', { tag: ['@DASH-16'] }, async ({ When, Then, And, page }) => { 
    await When('I add the "Past Due Tickets" widget', null, { page }); 
    await Then('I should see the "Past Due Tickets" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

  test('DASH-17 Add widget - Timesheet/WO discrepancies', { tag: ['@DASH-17'] }, async ({ When, Then, And, page }) => { 
    await When('I add the "Timesheet/WO discrepancies" widget', null, { page }); 
    await Then('I should see the "Timesheet/WO discrepancies" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

  test('DASH-18 Add widget - Scheduled Tickets', { tag: ['@DASH-18'] }, async ({ When, Then, And, page }) => { 
    await When('I add the "Scheduled Tickets" widget', null, { page }); 
    await Then('I should see the "Scheduled Tickets" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

  test('DASH-19 Add widget - Vendor Announcements', { tag: ['@DASH-19'] }, async ({ When, Then, And, page }) => { 
    await When('I add the "Vendor Announcements" widget', null, { page }); 
    await Then('I should see the "Vendor Announcements" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

  test('DASH-20 Add widget - Manager Announcements', { tag: ['@DASH-20'] }, async ({ When, Then, And, page }) => { 
    await When('I add the "Manager Announcements" widget', null, { page }); 
    await Then('I should see the "Manager Announcements" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

  test('DASH-21 Add widget - Weather Widget', { tag: ['@DASH-21'] }, async ({ When, Then, And, page }) => { 
    await When('I add the "Weather Widget" widget', null, { page }); 
    await Then('I should see the "Weather Widget" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

  test('DASH-22 Add widget - TEST HTML', { tag: ['@DASH-22'] }, async ({ When, Then, And, page }) => { 
    await When('I add the "TEST HTML" widget', null, { page }); 
    await Then('I should see the "TEST HTML" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

  test('DASH-23 Add widget - Add Client Shares', { tag: ['@DASH-23'] }, async ({ When, Then, And, page }) => { 
    await When('I add the "Add Client Shares" widget', null, { page }); 
    await Then('I should see the "Add Client Shares" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

  test('DASH-24 Add widget - View Client Shares', { tag: ['@DASH-24'] }, async ({ When, Then, And, page }) => { 
    await When('I add the "View Client Shares" widget', null, { page }); 
    await Then('I should see the "View Client Shares" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

  test('DASH-25 Add widget - Vendor PO List', { tag: ['@DASH-25'] }, async ({ When, Then, And, page }) => { 
    await When('I add the "Vendor PO List" widget', null, { page }); 
    await Then('I should see the "Vendor PO List" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

  test('DASH-26 Sidebar filter text persists after navigation and clears when emptied', { tag: ['@DASH-26', '@EC-01', '@SM-754'] }, async ({ When, Then, page }) => { 
    await When('I type "Admin" in the sidebar filter', null, { page }); 
    await Then('the sidebar should show only menu items matching "Admin"', null, { page }); 
    await When('I click the "Dashboard" sidebar menu item', null, { page }); 
    await Then('the sidebar filter should still contain "Admin"', null, { page }); 
    await When('I type "" in the sidebar filter', null, { page }); 
    await Then('the sidebar should show all menu items', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests/features/dashboard.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":10,"pickleLine":7,"tags":["@DASH-1"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":8,"keywordType":"Outcome","textWithKeyword":"Then I should see the search input","stepMatchArguments":[]},{"pwStepLine":12,"gherkinStepLine":9,"keywordType":"Outcome","textWithKeyword":"And I should see the refresh button","stepMatchArguments":[]},{"pwStepLine":13,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"And I should see the add widget button","stepMatchArguments":[]}]},
  {"pwTestLine":16,"pickleLine":13,"tags":["@DASH-2"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":17,"gherkinStepLine":14,"keywordType":"Outcome","textWithKeyword":"Then I should see the my profile link","stepMatchArguments":[]},{"pwStepLine":18,"gherkinStepLine":15,"keywordType":"Outcome","textWithKeyword":"And I should see the logout link","stepMatchArguments":[]}]},
  {"pwTestLine":21,"pickleLine":18,"tags":["@DASH-3"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":22,"gherkinStepLine":19,"keywordType":"Outcome","textWithKeyword":"Then I should see the sidebar filter","stepMatchArguments":[]},{"pwStepLine":23,"gherkinStepLine":20,"keywordType":"Outcome","textWithKeyword":"And I should see the \"Account Management\" menu item","stepMatchArguments":[{"group":{"start":17,"value":"\"Account Management\"","children":[{"start":18,"value":"Account Management","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":24,"gherkinStepLine":21,"keywordType":"Outcome","textWithKeyword":"And I should see the \"Dashboard\" menu item","stepMatchArguments":[{"group":{"start":17,"value":"\"Dashboard\"","children":[{"start":18,"value":"Dashboard","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":25,"gherkinStepLine":22,"keywordType":"Outcome","textWithKeyword":"And I should see the \"Timesheets\" menu item","stepMatchArguments":[{"group":{"start":17,"value":"\"Timesheets\"","children":[{"start":18,"value":"Timesheets","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":26,"gherkinStepLine":23,"keywordType":"Outcome","textWithKeyword":"And I should see the \"Reports\" menu item","stepMatchArguments":[{"group":{"start":17,"value":"\"Reports\"","children":[{"start":18,"value":"Reports","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":29,"pickleLine":26,"tags":["@DASH-4"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":30,"gherkinStepLine":27,"keywordType":"Action","textWithKeyword":"When I type \"Admin\" in the sidebar filter","stepMatchArguments":[{"group":{"start":7,"value":"\"Admin\"","children":[{"start":8,"value":"Admin","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":31,"gherkinStepLine":28,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"Admin Alerts\" menu item","stepMatchArguments":[{"group":{"start":17,"value":"\"Admin Alerts\"","children":[{"start":18,"value":"Admin Alerts","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":32,"gherkinStepLine":29,"keywordType":"Outcome","textWithKeyword":"And I should see the \"BI Admin\" menu item","stepMatchArguments":[{"group":{"start":17,"value":"\"BI Admin\"","children":[{"start":18,"value":"BI Admin","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":35,"pickleLine":32,"tags":["@DASH-5"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":36,"gherkinStepLine":33,"keywordType":"Outcome","textWithKeyword":"Then I should see the SM version in the sidebar","stepMatchArguments":[]}]},
  {"pwTestLine":39,"pickleLine":36,"tags":["@DASH-6"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":40,"gherkinStepLine":37,"keywordType":"Action","textWithKeyword":"When I add the \"Site Manager Performance\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"Site Manager Performance\"","children":[{"start":11,"value":"Site Manager Performance","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":41,"gherkinStepLine":38,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"Site Manager Performance\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"Site Manager Performance\"","children":[{"start":18,"value":"Site Manager Performance","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":42,"gherkinStepLine":39,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":45,"pickleLine":42,"tags":["@DASH-7"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":46,"gherkinStepLine":43,"keywordType":"Action","textWithKeyword":"When I add the \"Known Employee Locations\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"Known Employee Locations\"","children":[{"start":11,"value":"Known Employee Locations","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":47,"gherkinStepLine":44,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"Known Employee Locations\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"Known Employee Locations\"","children":[{"start":18,"value":"Known Employee Locations","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":48,"gherkinStepLine":45,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":51,"pickleLine":48,"tags":["@DASH-8"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":52,"gherkinStepLine":49,"keywordType":"Action","textWithKeyword":"When I add the \"Announcements\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"Announcements\"","children":[{"start":11,"value":"Announcements","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":53,"gherkinStepLine":50,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"Announcements\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"Announcements\"","children":[{"start":18,"value":"Announcements","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":54,"gherkinStepLine":51,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":57,"pickleLine":54,"tags":["@DASH-9"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":58,"gherkinStepLine":55,"keywordType":"Action","textWithKeyword":"When I add the \"Favorites\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"Favorites\"","children":[{"start":11,"value":"Favorites","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":59,"gherkinStepLine":56,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"Favorites\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"Favorites\"","children":[{"start":18,"value":"Favorites","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":60,"gherkinStepLine":57,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":63,"pickleLine":60,"tags":["@DASH-10"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":64,"gherkinStepLine":61,"keywordType":"Action","textWithKeyword":"When I add the \"Alerts\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"Alerts\"","children":[{"start":11,"value":"Alerts","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":65,"gherkinStepLine":62,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"Alerts\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"Alerts\"","children":[{"start":18,"value":"Alerts","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":66,"gherkinStepLine":63,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":69,"pickleLine":66,"tags":["@DASH-11"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":70,"gherkinStepLine":67,"keywordType":"Action","textWithKeyword":"When I add the \"Clocked In\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"Clocked In\"","children":[{"start":11,"value":"Clocked In","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":71,"gherkinStepLine":68,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"Clocked In\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"Clocked In\"","children":[{"start":18,"value":"Clocked In","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":72,"gherkinStepLine":69,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":75,"pickleLine":72,"tags":["@DASH-12"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":76,"gherkinStepLine":73,"keywordType":"Action","textWithKeyword":"When I add the \"Materials Over Budget\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"Materials Over Budget\"","children":[{"start":11,"value":"Materials Over Budget","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":77,"gherkinStepLine":74,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"Materials Over Budget\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"Materials Over Budget\"","children":[{"start":18,"value":"Materials Over Budget","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":78,"gherkinStepLine":75,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":81,"pickleLine":78,"tags":["@DASH-13"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":82,"gherkinStepLine":79,"keywordType":"Action","textWithKeyword":"When I add the \"Subcontractors Over Budget\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"Subcontractors Over Budget\"","children":[{"start":11,"value":"Subcontractors Over Budget","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":83,"gherkinStepLine":80,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"Subcontractors Over Budget\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"Subcontractors Over Budget\"","children":[{"start":18,"value":"Subcontractors Over Budget","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":84,"gherkinStepLine":81,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":87,"pickleLine":84,"tags":["@DASH-14"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":88,"gherkinStepLine":85,"keywordType":"Action","textWithKeyword":"When I add the \"Equipment Over Budget\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"Equipment Over Budget\"","children":[{"start":11,"value":"Equipment Over Budget","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":89,"gherkinStepLine":86,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"Equipment Over Budget\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"Equipment Over Budget\"","children":[{"start":18,"value":"Equipment Over Budget","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":90,"gherkinStepLine":87,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":93,"pickleLine":90,"tags":["@DASH-15"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":94,"gherkinStepLine":91,"keywordType":"Action","textWithKeyword":"When I add the \"Profitability By Department\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"Profitability By Department\"","children":[{"start":11,"value":"Profitability By Department","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":95,"gherkinStepLine":92,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"Profitability By Department\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"Profitability By Department\"","children":[{"start":18,"value":"Profitability By Department","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":96,"gherkinStepLine":93,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":99,"pickleLine":96,"tags":["@DASH-16"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":100,"gherkinStepLine":97,"keywordType":"Action","textWithKeyword":"When I add the \"Past Due Tickets\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"Past Due Tickets\"","children":[{"start":11,"value":"Past Due Tickets","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":101,"gherkinStepLine":98,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"Past Due Tickets\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"Past Due Tickets\"","children":[{"start":18,"value":"Past Due Tickets","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":102,"gherkinStepLine":99,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":105,"pickleLine":102,"tags":["@DASH-17"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":106,"gherkinStepLine":103,"keywordType":"Action","textWithKeyword":"When I add the \"Timesheet/WO discrepancies\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"Timesheet/WO discrepancies\"","children":[{"start":11,"value":"Timesheet/WO discrepancies","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":107,"gherkinStepLine":104,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"Timesheet/WO discrepancies\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"Timesheet/WO discrepancies\"","children":[{"start":18,"value":"Timesheet/WO discrepancies","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":108,"gherkinStepLine":105,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":111,"pickleLine":108,"tags":["@DASH-18"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":112,"gherkinStepLine":109,"keywordType":"Action","textWithKeyword":"When I add the \"Scheduled Tickets\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"Scheduled Tickets\"","children":[{"start":11,"value":"Scheduled Tickets","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":113,"gherkinStepLine":110,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"Scheduled Tickets\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"Scheduled Tickets\"","children":[{"start":18,"value":"Scheduled Tickets","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":114,"gherkinStepLine":111,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":117,"pickleLine":114,"tags":["@DASH-19"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":118,"gherkinStepLine":115,"keywordType":"Action","textWithKeyword":"When I add the \"Vendor Announcements\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"Vendor Announcements\"","children":[{"start":11,"value":"Vendor Announcements","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":119,"gherkinStepLine":116,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"Vendor Announcements\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"Vendor Announcements\"","children":[{"start":18,"value":"Vendor Announcements","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":120,"gherkinStepLine":117,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":123,"pickleLine":120,"tags":["@DASH-20"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":124,"gherkinStepLine":121,"keywordType":"Action","textWithKeyword":"When I add the \"Manager Announcements\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"Manager Announcements\"","children":[{"start":11,"value":"Manager Announcements","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":125,"gherkinStepLine":122,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"Manager Announcements\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"Manager Announcements\"","children":[{"start":18,"value":"Manager Announcements","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":126,"gherkinStepLine":123,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":129,"pickleLine":126,"tags":["@DASH-21"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":130,"gherkinStepLine":127,"keywordType":"Action","textWithKeyword":"When I add the \"Weather Widget\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"Weather Widget\"","children":[{"start":11,"value":"Weather Widget","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":131,"gherkinStepLine":128,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"Weather Widget\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"Weather Widget\"","children":[{"start":18,"value":"Weather Widget","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":132,"gherkinStepLine":129,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":135,"pickleLine":132,"tags":["@DASH-22"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":136,"gherkinStepLine":133,"keywordType":"Action","textWithKeyword":"When I add the \"TEST HTML\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"TEST HTML\"","children":[{"start":11,"value":"TEST HTML","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":137,"gherkinStepLine":134,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"TEST HTML\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"TEST HTML\"","children":[{"start":18,"value":"TEST HTML","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":138,"gherkinStepLine":135,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":141,"pickleLine":138,"tags":["@DASH-23"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":142,"gherkinStepLine":139,"keywordType":"Action","textWithKeyword":"When I add the \"Add Client Shares\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"Add Client Shares\"","children":[{"start":11,"value":"Add Client Shares","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":143,"gherkinStepLine":140,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"Add Client Shares\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"Add Client Shares\"","children":[{"start":18,"value":"Add Client Shares","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":144,"gherkinStepLine":141,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":147,"pickleLine":144,"tags":["@DASH-24"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":148,"gherkinStepLine":145,"keywordType":"Action","textWithKeyword":"When I add the \"View Client Shares\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"View Client Shares\"","children":[{"start":11,"value":"View Client Shares","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":149,"gherkinStepLine":146,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"View Client Shares\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"View Client Shares\"","children":[{"start":18,"value":"View Client Shares","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":150,"gherkinStepLine":147,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":153,"pickleLine":150,"tags":["@DASH-25"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":154,"gherkinStepLine":151,"keywordType":"Action","textWithKeyword":"When I add the \"Vendor PO List\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"Vendor PO List\"","children":[{"start":11,"value":"Vendor PO List","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":155,"gherkinStepLine":152,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"Vendor PO List\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"Vendor PO List\"","children":[{"start":18,"value":"Vendor PO List","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":156,"gherkinStepLine":153,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":159,"pickleLine":156,"tags":["@DASH-26","@EC-01","@SM-754"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":160,"gherkinStepLine":157,"keywordType":"Action","textWithKeyword":"When I type \"Admin\" in the sidebar filter","stepMatchArguments":[{"group":{"start":7,"value":"\"Admin\"","children":[{"start":8,"value":"Admin","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":161,"gherkinStepLine":158,"keywordType":"Outcome","textWithKeyword":"Then the sidebar should show only menu items matching \"Admin\"","stepMatchArguments":[{"group":{"start":49,"value":"\"Admin\"","children":[{"start":50,"value":"Admin","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":162,"gherkinStepLine":159,"keywordType":"Action","textWithKeyword":"When I click the \"Dashboard\" sidebar menu item","stepMatchArguments":[{"group":{"start":12,"value":"\"Dashboard\"","children":[{"start":13,"value":"Dashboard","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":163,"gherkinStepLine":160,"keywordType":"Outcome","textWithKeyword":"Then the sidebar filter should still contain \"Admin\"","stepMatchArguments":[{"group":{"start":40,"value":"\"Admin\"","children":[{"start":41,"value":"Admin","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":164,"gherkinStepLine":161,"keywordType":"Action","textWithKeyword":"When I type \"\" in the sidebar filter","stepMatchArguments":[{"group":{"start":7,"value":"\"\"","children":[{"start":8,"value":"","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":165,"gherkinStepLine":162,"keywordType":"Outcome","textWithKeyword":"Then the sidebar should show all menu items","stepMatchArguments":[]}]},
]; // bdd-data-end