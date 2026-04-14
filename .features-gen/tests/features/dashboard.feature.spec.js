// Generated from: tests/features/dashboard.feature
import { test } from "playwright-bdd";

test.describe('Dashboard', () => {

  test.beforeEach('Background', async ({ Given, page }, testInfo) => { if (testInfo.error) return;
    await Given('I am logged in and on the dashboard', null, { page }); 
  });
  
  test('Display top bar elements', async ({ Then, And, page }) => { 
    await Then('I should see the search input', null, { page }); 
    await And('I should see the refresh button', null, { page }); 
    await And('I should see the add widget button', null, { page }); 
  });

  test('Display user profile controls', async ({ Then, And, page }) => { 
    await Then('I should see the my profile link', null, { page }); 
    await And('I should see the logout link', null, { page }); 
  });

  test('Display sidebar navigation', async ({ Then, And, page }) => { 
    await Then('I should see the sidebar filter', null, { page }); 
    await And('I should see the "Account Management" menu item', null, { page }); 
    await And('I should see the "Dashboard" menu item', null, { page }); 
    await And('I should see the "Timesheets" menu item', null, { page }); 
    await And('I should see the "Reports" menu item', null, { page }); 
  });

  test('Filter sidebar menu', async ({ When, Then, And, page }) => { 
    await When('I type "Admin" in the sidebar filter', null, { page }); 
    await Then('I should see the "Admin Alerts" menu item', null, { page }); 
    await And('I should see the "BI Admin" menu item', null, { page }); 
  });

  test('Display version info', async ({ Then, page }) => { 
    await Then('I should see the SM version in the sidebar', null, { page }); 
  });

  test('Add widget - Site Manager Performance', async ({ When, Then, And, page }) => { 
    await When('I add the "Site Manager Performance" widget', null, { page }); 
    await Then('I should see the "Site Manager Performance" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

  test('Add widget - Known Employee Locations', async ({ When, Then, And, page }) => { 
    await When('I add the "Known Employee Locations" widget', null, { page }); 
    await Then('I should see the "Known Employee Locations" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

  test('Add widget - Announcements', async ({ When, Then, And, page }) => { 
    await When('I add the "Announcements" widget', null, { page }); 
    await Then('I should see the "Announcements" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

  test('Add widget - Favorites', async ({ When, Then, And, page }) => { 
    await When('I add the "Favorites" widget', null, { page }); 
    await Then('I should see the "Favorites" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

  test('Add widget - Alerts', async ({ When, Then, And, page }) => { 
    await When('I add the "Alerts" widget', null, { page }); 
    await Then('I should see the "Alerts" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

  test('Add widget - Clocked In', async ({ When, Then, And, page }) => { 
    await When('I add the "Clocked In" widget', null, { page }); 
    await Then('I should see the "Clocked In" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

  test('Add widget - Materials Over Budget', async ({ When, Then, And, page }) => { 
    await When('I add the "Materials Over Budget" widget', null, { page }); 
    await Then('I should see the "Materials Over Budget" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

  test('Add widget - Subcontractors Over Budget', async ({ When, Then, And, page }) => { 
    await When('I add the "Subcontractors Over Budget" widget', null, { page }); 
    await Then('I should see the "Subcontractors Over Budget" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

  test('Add widget - Equipment Over Budget', async ({ When, Then, And, page }) => { 
    await When('I add the "Equipment Over Budget" widget', null, { page }); 
    await Then('I should see the "Equipment Over Budget" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

  test('Add widget - Profitability By Department', async ({ When, Then, And, page }) => { 
    await When('I add the "Profitability By Department" widget', null, { page }); 
    await Then('I should see the "Profitability By Department" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

  test('Add widget - Past Due Tickets', async ({ When, Then, And, page }) => { 
    await When('I add the "Past Due Tickets" widget', null, { page }); 
    await Then('I should see the "Past Due Tickets" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

  test('Add widget - Timesheet/WO discrepancies', async ({ When, Then, And, page }) => { 
    await When('I add the "Timesheet/WO discrepancies" widget', null, { page }); 
    await Then('I should see the "Timesheet/WO discrepancies" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

  test('Add widget - Scheduled Tickets', async ({ When, Then, And, page }) => { 
    await When('I add the "Scheduled Tickets" widget', null, { page }); 
    await Then('I should see the "Scheduled Tickets" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

  test('Add widget - Vendor Announcements', async ({ When, Then, And, page }) => { 
    await When('I add the "Vendor Announcements" widget', null, { page }); 
    await Then('I should see the "Vendor Announcements" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

  test('Add widget - Manager Announcements', async ({ When, Then, And, page }) => { 
    await When('I add the "Manager Announcements" widget', null, { page }); 
    await Then('I should see the "Manager Announcements" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

  test('Add widget - Weather Widget', async ({ When, Then, And, page }) => { 
    await When('I add the "Weather Widget" widget', null, { page }); 
    await Then('I should see the "Weather Widget" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

  test('Add widget - TEST HTML', async ({ When, Then, And, page }) => { 
    await When('I add the "TEST HTML" widget', null, { page }); 
    await Then('I should see the "TEST HTML" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

  test('Add widget - Add Client Shares', async ({ When, Then, And, page }) => { 
    await When('I add the "Add Client Shares" widget', null, { page }); 
    await Then('I should see the "Add Client Shares" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

  test('Add widget - View Client Shares', async ({ When, Then, And, page }) => { 
    await When('I add the "View Client Shares" widget', null, { page }); 
    await Then('I should see the "View Client Shares" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

  test('Add widget - Vendor PO List', async ({ When, Then, And, page }) => { 
    await When('I add the "Vendor PO List" widget', null, { page }); 
    await Then('I should see the "Vendor PO List" widget on the dashboard', null, { page }); 
    await And('I delete all widgets from the dashboard', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests/features/dashboard.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":10,"pickleLine":6,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":7,"keywordType":"Outcome","textWithKeyword":"Then I should see the search input","stepMatchArguments":[]},{"pwStepLine":12,"gherkinStepLine":8,"keywordType":"Outcome","textWithKeyword":"And I should see the refresh button","stepMatchArguments":[]},{"pwStepLine":13,"gherkinStepLine":9,"keywordType":"Outcome","textWithKeyword":"And I should see the add widget button","stepMatchArguments":[]}]},
  {"pwTestLine":16,"pickleLine":11,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":17,"gherkinStepLine":12,"keywordType":"Outcome","textWithKeyword":"Then I should see the my profile link","stepMatchArguments":[]},{"pwStepLine":18,"gherkinStepLine":13,"keywordType":"Outcome","textWithKeyword":"And I should see the logout link","stepMatchArguments":[]}]},
  {"pwTestLine":21,"pickleLine":15,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":22,"gherkinStepLine":16,"keywordType":"Outcome","textWithKeyword":"Then I should see the sidebar filter","stepMatchArguments":[]},{"pwStepLine":23,"gherkinStepLine":17,"keywordType":"Outcome","textWithKeyword":"And I should see the \"Account Management\" menu item","stepMatchArguments":[{"group":{"start":17,"value":"\"Account Management\"","children":[{"start":18,"value":"Account Management","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":24,"gherkinStepLine":18,"keywordType":"Outcome","textWithKeyword":"And I should see the \"Dashboard\" menu item","stepMatchArguments":[{"group":{"start":17,"value":"\"Dashboard\"","children":[{"start":18,"value":"Dashboard","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":25,"gherkinStepLine":19,"keywordType":"Outcome","textWithKeyword":"And I should see the \"Timesheets\" menu item","stepMatchArguments":[{"group":{"start":17,"value":"\"Timesheets\"","children":[{"start":18,"value":"Timesheets","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":26,"gherkinStepLine":20,"keywordType":"Outcome","textWithKeyword":"And I should see the \"Reports\" menu item","stepMatchArguments":[{"group":{"start":17,"value":"\"Reports\"","children":[{"start":18,"value":"Reports","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":29,"pickleLine":22,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":30,"gherkinStepLine":23,"keywordType":"Action","textWithKeyword":"When I type \"Admin\" in the sidebar filter","stepMatchArguments":[{"group":{"start":7,"value":"\"Admin\"","children":[{"start":8,"value":"Admin","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":31,"gherkinStepLine":24,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"Admin Alerts\" menu item","stepMatchArguments":[{"group":{"start":17,"value":"\"Admin Alerts\"","children":[{"start":18,"value":"Admin Alerts","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":32,"gherkinStepLine":25,"keywordType":"Outcome","textWithKeyword":"And I should see the \"BI Admin\" menu item","stepMatchArguments":[{"group":{"start":17,"value":"\"BI Admin\"","children":[{"start":18,"value":"BI Admin","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":35,"pickleLine":27,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":36,"gherkinStepLine":28,"keywordType":"Outcome","textWithKeyword":"Then I should see the SM version in the sidebar","stepMatchArguments":[]}]},
  {"pwTestLine":39,"pickleLine":30,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":40,"gherkinStepLine":31,"keywordType":"Action","textWithKeyword":"When I add the \"Site Manager Performance\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"Site Manager Performance\"","children":[{"start":11,"value":"Site Manager Performance","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":41,"gherkinStepLine":32,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"Site Manager Performance\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"Site Manager Performance\"","children":[{"start":18,"value":"Site Manager Performance","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":42,"gherkinStepLine":33,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":45,"pickleLine":35,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":46,"gherkinStepLine":36,"keywordType":"Action","textWithKeyword":"When I add the \"Known Employee Locations\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"Known Employee Locations\"","children":[{"start":11,"value":"Known Employee Locations","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":47,"gherkinStepLine":37,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"Known Employee Locations\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"Known Employee Locations\"","children":[{"start":18,"value":"Known Employee Locations","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":48,"gherkinStepLine":38,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":51,"pickleLine":40,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":52,"gherkinStepLine":41,"keywordType":"Action","textWithKeyword":"When I add the \"Announcements\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"Announcements\"","children":[{"start":11,"value":"Announcements","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":53,"gherkinStepLine":42,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"Announcements\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"Announcements\"","children":[{"start":18,"value":"Announcements","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":54,"gherkinStepLine":43,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":57,"pickleLine":45,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":58,"gherkinStepLine":46,"keywordType":"Action","textWithKeyword":"When I add the \"Favorites\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"Favorites\"","children":[{"start":11,"value":"Favorites","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":59,"gherkinStepLine":47,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"Favorites\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"Favorites\"","children":[{"start":18,"value":"Favorites","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":60,"gherkinStepLine":48,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":63,"pickleLine":50,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":64,"gherkinStepLine":51,"keywordType":"Action","textWithKeyword":"When I add the \"Alerts\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"Alerts\"","children":[{"start":11,"value":"Alerts","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":65,"gherkinStepLine":52,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"Alerts\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"Alerts\"","children":[{"start":18,"value":"Alerts","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":66,"gherkinStepLine":53,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":69,"pickleLine":55,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":70,"gherkinStepLine":56,"keywordType":"Action","textWithKeyword":"When I add the \"Clocked In\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"Clocked In\"","children":[{"start":11,"value":"Clocked In","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":71,"gherkinStepLine":57,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"Clocked In\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"Clocked In\"","children":[{"start":18,"value":"Clocked In","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":72,"gherkinStepLine":58,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":75,"pickleLine":60,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":76,"gherkinStepLine":61,"keywordType":"Action","textWithKeyword":"When I add the \"Materials Over Budget\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"Materials Over Budget\"","children":[{"start":11,"value":"Materials Over Budget","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":77,"gherkinStepLine":62,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"Materials Over Budget\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"Materials Over Budget\"","children":[{"start":18,"value":"Materials Over Budget","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":78,"gherkinStepLine":63,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":81,"pickleLine":65,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":82,"gherkinStepLine":66,"keywordType":"Action","textWithKeyword":"When I add the \"Subcontractors Over Budget\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"Subcontractors Over Budget\"","children":[{"start":11,"value":"Subcontractors Over Budget","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":83,"gherkinStepLine":67,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"Subcontractors Over Budget\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"Subcontractors Over Budget\"","children":[{"start":18,"value":"Subcontractors Over Budget","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":84,"gherkinStepLine":68,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":87,"pickleLine":70,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":88,"gherkinStepLine":71,"keywordType":"Action","textWithKeyword":"When I add the \"Equipment Over Budget\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"Equipment Over Budget\"","children":[{"start":11,"value":"Equipment Over Budget","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":89,"gherkinStepLine":72,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"Equipment Over Budget\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"Equipment Over Budget\"","children":[{"start":18,"value":"Equipment Over Budget","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":90,"gherkinStepLine":73,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":93,"pickleLine":75,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":94,"gherkinStepLine":76,"keywordType":"Action","textWithKeyword":"When I add the \"Profitability By Department\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"Profitability By Department\"","children":[{"start":11,"value":"Profitability By Department","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":95,"gherkinStepLine":77,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"Profitability By Department\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"Profitability By Department\"","children":[{"start":18,"value":"Profitability By Department","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":96,"gherkinStepLine":78,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":99,"pickleLine":80,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":100,"gherkinStepLine":81,"keywordType":"Action","textWithKeyword":"When I add the \"Past Due Tickets\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"Past Due Tickets\"","children":[{"start":11,"value":"Past Due Tickets","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":101,"gherkinStepLine":82,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"Past Due Tickets\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"Past Due Tickets\"","children":[{"start":18,"value":"Past Due Tickets","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":102,"gherkinStepLine":83,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":105,"pickleLine":85,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":106,"gherkinStepLine":86,"keywordType":"Action","textWithKeyword":"When I add the \"Timesheet/WO discrepancies\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"Timesheet/WO discrepancies\"","children":[{"start":11,"value":"Timesheet/WO discrepancies","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":107,"gherkinStepLine":87,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"Timesheet/WO discrepancies\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"Timesheet/WO discrepancies\"","children":[{"start":18,"value":"Timesheet/WO discrepancies","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":108,"gherkinStepLine":88,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":111,"pickleLine":90,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":112,"gherkinStepLine":91,"keywordType":"Action","textWithKeyword":"When I add the \"Scheduled Tickets\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"Scheduled Tickets\"","children":[{"start":11,"value":"Scheduled Tickets","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":113,"gherkinStepLine":92,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"Scheduled Tickets\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"Scheduled Tickets\"","children":[{"start":18,"value":"Scheduled Tickets","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":114,"gherkinStepLine":93,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":117,"pickleLine":95,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":118,"gherkinStepLine":96,"keywordType":"Action","textWithKeyword":"When I add the \"Vendor Announcements\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"Vendor Announcements\"","children":[{"start":11,"value":"Vendor Announcements","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":119,"gherkinStepLine":97,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"Vendor Announcements\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"Vendor Announcements\"","children":[{"start":18,"value":"Vendor Announcements","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":120,"gherkinStepLine":98,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":123,"pickleLine":100,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":124,"gherkinStepLine":101,"keywordType":"Action","textWithKeyword":"When I add the \"Manager Announcements\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"Manager Announcements\"","children":[{"start":11,"value":"Manager Announcements","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":125,"gherkinStepLine":102,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"Manager Announcements\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"Manager Announcements\"","children":[{"start":18,"value":"Manager Announcements","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":126,"gherkinStepLine":103,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":129,"pickleLine":105,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":130,"gherkinStepLine":106,"keywordType":"Action","textWithKeyword":"When I add the \"Weather Widget\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"Weather Widget\"","children":[{"start":11,"value":"Weather Widget","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":131,"gherkinStepLine":107,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"Weather Widget\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"Weather Widget\"","children":[{"start":18,"value":"Weather Widget","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":132,"gherkinStepLine":108,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":135,"pickleLine":110,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":136,"gherkinStepLine":111,"keywordType":"Action","textWithKeyword":"When I add the \"TEST HTML\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"TEST HTML\"","children":[{"start":11,"value":"TEST HTML","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":137,"gherkinStepLine":112,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"TEST HTML\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"TEST HTML\"","children":[{"start":18,"value":"TEST HTML","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":138,"gherkinStepLine":113,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":141,"pickleLine":115,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":142,"gherkinStepLine":116,"keywordType":"Action","textWithKeyword":"When I add the \"Add Client Shares\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"Add Client Shares\"","children":[{"start":11,"value":"Add Client Shares","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":143,"gherkinStepLine":117,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"Add Client Shares\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"Add Client Shares\"","children":[{"start":18,"value":"Add Client Shares","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":144,"gherkinStepLine":118,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":147,"pickleLine":120,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":148,"gherkinStepLine":121,"keywordType":"Action","textWithKeyword":"When I add the \"View Client Shares\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"View Client Shares\"","children":[{"start":11,"value":"View Client Shares","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":149,"gherkinStepLine":122,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"View Client Shares\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"View Client Shares\"","children":[{"start":18,"value":"View Client Shares","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":150,"gherkinStepLine":123,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":153,"pickleLine":125,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":154,"gherkinStepLine":126,"keywordType":"Action","textWithKeyword":"When I add the \"Vendor PO List\" widget","stepMatchArguments":[{"group":{"start":10,"value":"\"Vendor PO List\"","children":[{"start":11,"value":"Vendor PO List","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":155,"gherkinStepLine":127,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"Vendor PO List\" widget on the dashboard","stepMatchArguments":[{"group":{"start":17,"value":"\"Vendor PO List\"","children":[{"start":18,"value":"Vendor PO List","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":156,"gherkinStepLine":128,"keywordType":"Outcome","textWithKeyword":"And I delete all widgets from the dashboard","stepMatchArguments":[]}]},
]; // bdd-data-end