// Generated from: tests/features/nav-bar.feature
import { test } from "playwright-bdd";

test.describe('Nav Bar', () => {

  test.beforeEach('Background', async ({ Given, page }, testInfo) => { if (testInfo.error) return;
    await Given('I am logged in and on the dashboard', null, { page }); 
  });
  
  test('NAV-1 Display sidebar toggle button', { tag: ['@NAV-1'] }, async ({ Then, page }) => { 
    await Then('I should see the "sidebar toggle button" in the nav bar', null, { page }); 
  });

  test('NAV-2 Display navbar brand link', { tag: ['@NAV-2'] }, async ({ Then, page }) => { 
    await Then('I should see the "navbar brand link" in the nav bar', null, { page }); 
  });

  test('NAV-3 Display navbar refresh icon', { tag: ['@NAV-3'] }, async ({ Then, page }) => { 
    await Then('I should see the "navbar refresh icon" in the nav bar', null, { page }); 
  });

  test('NAV-4 Display navbar dashboard icon', { tag: ['@NAV-4'] }, async ({ Then, page }) => { 
    await Then('I should see the "navbar dashboard icon" in the nav bar', null, { page }); 
  });

  test('NAV-5 Display navbar notifications icon', { tag: ['@NAV-5'] }, async ({ Then, And, page }) => { 
    await Then('I should see the "navbar notifications icon" in the nav bar', null, { page }); 
    await And('I should see the "navbar notifications badge" in the nav bar', null, { page }); 
  });

  test('NAV-6 Display navbar contact support icon', { tag: ['@NAV-6'] }, async ({ Then, page }) => { 
    await Then('I should see the "navbar contact support icon" in the nav bar', null, { page }); 
  });

  test('NAV-7 Display navbar search controls', { tag: ['@NAV-7'] }, async ({ Then, And, page }) => { 
    await Then('I should see the "navbar search input" in the nav bar', null, { page }); 
    await And('I should see the "navbar search button" in the nav bar', null, { page }); 
  });

  test('NAV-8 Toggle sidebar collapse and expand', { tag: ['@NAV-8'] }, async ({ When, Then, page }) => { 
    await When('I click the sidebar toggle button', null, { page }); 
    await Then('the sidebar should be collapsed', null, { page }); 
    await When('I click the sidebar toggle button', null, { page }); 
    await Then('the sidebar should be expanded', null, { page }); 
  });

  test('NAV-9 Navigate to dashboard via navbar brand', { tag: ['@NAV-9'] }, async ({ When, Then, page }) => { 
    await When('I click the "navbar brand link" in the nav bar', null, { page }); 
    await Then('I should be on the dashboard page', null, { page }); 
  });

  test('NAV-10 Click navbar refresh icon', { tag: ['@NAV-10'] }, async ({ When, Then, page }) => { 
    await When('I click the "navbar refresh icon" in the nav bar', null, { page }); 
    await Then('the dashboard should reload', null, { page }); 
  });

  test('NAV-11 Open notifications panel', { tag: ['@NAV-11'] }, async ({ When, Then, page }) => { 
    await When('I click the "navbar notifications icon" in the nav bar', null, { page }); 
    await Then('the notifications panel should be visible', null, { page }); 
  });

  test('NAV-12 Open contact support panel', { tag: ['@NAV-12'] }, async ({ When, Then, page }) => { 
    await When('I click the "navbar contact support icon" in the nav bar', null, { page }); 
    await Then('the contact support panel should be visible', null, { page }); 
  });

  test('NAV-13 Search from navbar', { tag: ['@NAV-13'] }, async ({ When, Then, And, page }) => { 
    await When('I type "test" in the navbar search input', null, { page }); 
    await And('I click the "navbar search button" in the nav bar', null, { page }); 
    await Then('I should be navigated to search results', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests/features/nav-bar.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":10,"pickleLine":7,"tags":["@NAV-1"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":8,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"sidebar toggle button\" in the nav bar","stepMatchArguments":[{"group":{"start":17,"value":"\"sidebar toggle button\"","children":[{"start":18,"value":"sidebar toggle button","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":14,"pickleLine":11,"tags":["@NAV-2"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":15,"gherkinStepLine":12,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"navbar brand link\" in the nav bar","stepMatchArguments":[{"group":{"start":17,"value":"\"navbar brand link\"","children":[{"start":18,"value":"navbar brand link","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":18,"pickleLine":15,"tags":["@NAV-3"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":19,"gherkinStepLine":16,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"navbar refresh icon\" in the nav bar","stepMatchArguments":[{"group":{"start":17,"value":"\"navbar refresh icon\"","children":[{"start":18,"value":"navbar refresh icon","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":22,"pickleLine":19,"tags":["@NAV-4"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":23,"gherkinStepLine":20,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"navbar dashboard icon\" in the nav bar","stepMatchArguments":[{"group":{"start":17,"value":"\"navbar dashboard icon\"","children":[{"start":18,"value":"navbar dashboard icon","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":26,"pickleLine":23,"tags":["@NAV-5"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":27,"gherkinStepLine":24,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"navbar notifications icon\" in the nav bar","stepMatchArguments":[{"group":{"start":17,"value":"\"navbar notifications icon\"","children":[{"start":18,"value":"navbar notifications icon","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":28,"gherkinStepLine":25,"keywordType":"Outcome","textWithKeyword":"And I should see the \"navbar notifications badge\" in the nav bar","stepMatchArguments":[{"group":{"start":17,"value":"\"navbar notifications badge\"","children":[{"start":18,"value":"navbar notifications badge","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":31,"pickleLine":28,"tags":["@NAV-6"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":32,"gherkinStepLine":29,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"navbar contact support icon\" in the nav bar","stepMatchArguments":[{"group":{"start":17,"value":"\"navbar contact support icon\"","children":[{"start":18,"value":"navbar contact support icon","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":35,"pickleLine":32,"tags":["@NAV-7"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":36,"gherkinStepLine":33,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"navbar search input\" in the nav bar","stepMatchArguments":[{"group":{"start":17,"value":"\"navbar search input\"","children":[{"start":18,"value":"navbar search input","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":37,"gherkinStepLine":34,"keywordType":"Outcome","textWithKeyword":"And I should see the \"navbar search button\" in the nav bar","stepMatchArguments":[{"group":{"start":17,"value":"\"navbar search button\"","children":[{"start":18,"value":"navbar search button","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":40,"pickleLine":37,"tags":["@NAV-8"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":41,"gherkinStepLine":38,"keywordType":"Action","textWithKeyword":"When I click the sidebar toggle button","stepMatchArguments":[]},{"pwStepLine":42,"gherkinStepLine":39,"keywordType":"Outcome","textWithKeyword":"Then the sidebar should be collapsed","stepMatchArguments":[]},{"pwStepLine":43,"gherkinStepLine":40,"keywordType":"Action","textWithKeyword":"When I click the sidebar toggle button","stepMatchArguments":[]},{"pwStepLine":44,"gherkinStepLine":41,"keywordType":"Outcome","textWithKeyword":"Then the sidebar should be expanded","stepMatchArguments":[]}]},
  {"pwTestLine":47,"pickleLine":44,"tags":["@NAV-9"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":48,"gherkinStepLine":45,"keywordType":"Action","textWithKeyword":"When I click the \"navbar brand link\" in the nav bar","stepMatchArguments":[{"group":{"start":12,"value":"\"navbar brand link\"","children":[{"start":13,"value":"navbar brand link","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":49,"gherkinStepLine":46,"keywordType":"Outcome","textWithKeyword":"Then I should be on the dashboard page","stepMatchArguments":[]}]},
  {"pwTestLine":52,"pickleLine":49,"tags":["@NAV-10"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":53,"gherkinStepLine":50,"keywordType":"Action","textWithKeyword":"When I click the \"navbar refresh icon\" in the nav bar","stepMatchArguments":[{"group":{"start":12,"value":"\"navbar refresh icon\"","children":[{"start":13,"value":"navbar refresh icon","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":54,"gherkinStepLine":51,"keywordType":"Outcome","textWithKeyword":"Then the dashboard should reload","stepMatchArguments":[]}]},
  {"pwTestLine":57,"pickleLine":54,"tags":["@NAV-11"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":58,"gherkinStepLine":55,"keywordType":"Action","textWithKeyword":"When I click the \"navbar notifications icon\" in the nav bar","stepMatchArguments":[{"group":{"start":12,"value":"\"navbar notifications icon\"","children":[{"start":13,"value":"navbar notifications icon","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":59,"gherkinStepLine":56,"keywordType":"Outcome","textWithKeyword":"Then the notifications panel should be visible","stepMatchArguments":[]}]},
  {"pwTestLine":62,"pickleLine":59,"tags":["@NAV-12"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":63,"gherkinStepLine":60,"keywordType":"Action","textWithKeyword":"When I click the \"navbar contact support icon\" in the nav bar","stepMatchArguments":[{"group":{"start":12,"value":"\"navbar contact support icon\"","children":[{"start":13,"value":"navbar contact support icon","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":64,"gherkinStepLine":61,"keywordType":"Outcome","textWithKeyword":"Then the contact support panel should be visible","stepMatchArguments":[]}]},
  {"pwTestLine":67,"pickleLine":64,"tags":["@NAV-13"],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":68,"gherkinStepLine":65,"keywordType":"Action","textWithKeyword":"When I type \"test\" in the navbar search input","stepMatchArguments":[{"group":{"start":7,"value":"\"test\"","children":[{"start":8,"value":"test","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":69,"gherkinStepLine":66,"keywordType":"Action","textWithKeyword":"And I click the \"navbar search button\" in the nav bar","stepMatchArguments":[{"group":{"start":12,"value":"\"navbar search button\"","children":[{"start":13,"value":"navbar search button","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":70,"gherkinStepLine":67,"keywordType":"Outcome","textWithKeyword":"Then I should be navigated to search results","stepMatchArguments":[]}]},
]; // bdd-data-end