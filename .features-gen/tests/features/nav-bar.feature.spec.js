// Generated from: tests\features\nav-bar.feature
import { test } from "playwright-bdd";

test.describe('Nav Bar', () => {

  test.beforeEach('Background', async ({ Given, page }, testInfo) => { if (testInfo.error) return;
    await Given('I am logged in and on the dashboard', null, { page }); 
  });
  
  test('Display sidebar toggle button', async ({ Then, page }) => { 
    await Then('I should see the "sidebar toggle button" in the nav bar', null, { page }); 
  });

  test('Display navbar brand link', async ({ Then, page }) => { 
    await Then('I should see the "navbar brand link" in the nav bar', null, { page }); 
  });

  test('Display navbar refresh icon', async ({ Then, page }) => { 
    await Then('I should see the "navbar refresh icon" in the nav bar', null, { page }); 
  });

  test('Display navbar dashboard icon', async ({ Then, page }) => { 
    await Then('I should see the "navbar dashboard icon" in the nav bar', null, { page }); 
  });

  test('Display navbar notifications icon', async ({ Then, And, page }) => { 
    await Then('I should see the "navbar notifications icon" in the nav bar', null, { page }); 
    await And('I should see the "navbar notifications badge" in the nav bar', null, { page }); 
  });

  test('Display navbar contact support icon', async ({ Then, page }) => { 
    await Then('I should see the "navbar contact support icon" in the nav bar', null, { page }); 
  });

  test('Display navbar search controls', async ({ Then, And, page }) => { 
    await Then('I should see the "navbar search input" in the nav bar', null, { page }); 
    await And('I should see the "navbar search button" in the nav bar', null, { page }); 
  });

  test('Toggle sidebar collapse and expand', async ({ When, Then, page }) => { 
    await When('I click the sidebar toggle button', null, { page }); 
    await Then('the sidebar should be collapsed', null, { page }); 
    await When('I click the sidebar toggle button', null, { page }); 
    await Then('the sidebar should be expanded', null, { page }); 
  });

  test('Navigate to dashboard via navbar brand', async ({ When, Then, page }) => { 
    await When('I click the "navbar brand link" in the nav bar', null, { page }); 
    await Then('I should be on the dashboard page', null, { page }); 
  });

  test('Click navbar refresh icon', async ({ When, Then, page }) => { 
    await When('I click the "navbar refresh icon" in the nav bar', null, { page }); 
    await Then('the dashboard should reload', null, { page }); 
  });

  test('Open notifications panel', async ({ When, Then, page }) => { 
    await When('I click the "navbar notifications icon" in the nav bar', null, { page }); 
    await Then('the notifications panel should be visible', null, { page }); 
  });

  test('Open contact support panel', async ({ When, Then, page }) => { 
    await When('I click the "navbar contact support icon" in the nav bar', null, { page }); 
    await Then('the contact support panel should be visible', null, { page }); 
  });

  test('Search from navbar', async ({ When, Then, And, page }) => { 
    await When('I type "test" in the navbar search input', null, { page }); 
    await And('I click the "navbar search button" in the nav bar', null, { page }); 
    await Then('I should be navigated to search results', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests\\features\\nav-bar.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":10,"pickleLine":6,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":7,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"sidebar toggle button\" in the nav bar","stepMatchArguments":[{"group":{"start":17,"value":"\"sidebar toggle button\"","children":[{"start":18,"value":"sidebar toggle button","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":14,"pickleLine":9,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":15,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"navbar brand link\" in the nav bar","stepMatchArguments":[{"group":{"start":17,"value":"\"navbar brand link\"","children":[{"start":18,"value":"navbar brand link","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":18,"pickleLine":12,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":19,"gherkinStepLine":13,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"navbar refresh icon\" in the nav bar","stepMatchArguments":[{"group":{"start":17,"value":"\"navbar refresh icon\"","children":[{"start":18,"value":"navbar refresh icon","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":22,"pickleLine":15,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":23,"gherkinStepLine":16,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"navbar dashboard icon\" in the nav bar","stepMatchArguments":[{"group":{"start":17,"value":"\"navbar dashboard icon\"","children":[{"start":18,"value":"navbar dashboard icon","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":26,"pickleLine":18,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":27,"gherkinStepLine":19,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"navbar notifications icon\" in the nav bar","stepMatchArguments":[{"group":{"start":17,"value":"\"navbar notifications icon\"","children":[{"start":18,"value":"navbar notifications icon","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":28,"gherkinStepLine":20,"keywordType":"Outcome","textWithKeyword":"And I should see the \"navbar notifications badge\" in the nav bar","stepMatchArguments":[{"group":{"start":17,"value":"\"navbar notifications badge\"","children":[{"start":18,"value":"navbar notifications badge","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":31,"pickleLine":22,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":32,"gherkinStepLine":23,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"navbar contact support icon\" in the nav bar","stepMatchArguments":[{"group":{"start":17,"value":"\"navbar contact support icon\"","children":[{"start":18,"value":"navbar contact support icon","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":35,"pickleLine":25,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":36,"gherkinStepLine":26,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"navbar search input\" in the nav bar","stepMatchArguments":[{"group":{"start":17,"value":"\"navbar search input\"","children":[{"start":18,"value":"navbar search input","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":37,"gherkinStepLine":27,"keywordType":"Outcome","textWithKeyword":"And I should see the \"navbar search button\" in the nav bar","stepMatchArguments":[{"group":{"start":17,"value":"\"navbar search button\"","children":[{"start":18,"value":"navbar search button","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":40,"pickleLine":29,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":41,"gherkinStepLine":30,"keywordType":"Action","textWithKeyword":"When I click the sidebar toggle button","stepMatchArguments":[]},{"pwStepLine":42,"gherkinStepLine":31,"keywordType":"Outcome","textWithKeyword":"Then the sidebar should be collapsed","stepMatchArguments":[]},{"pwStepLine":43,"gherkinStepLine":32,"keywordType":"Action","textWithKeyword":"When I click the sidebar toggle button","stepMatchArguments":[]},{"pwStepLine":44,"gherkinStepLine":33,"keywordType":"Outcome","textWithKeyword":"Then the sidebar should be expanded","stepMatchArguments":[]}]},
  {"pwTestLine":47,"pickleLine":35,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":48,"gherkinStepLine":36,"keywordType":"Action","textWithKeyword":"When I click the \"navbar brand link\" in the nav bar","stepMatchArguments":[{"group":{"start":12,"value":"\"navbar brand link\"","children":[{"start":13,"value":"navbar brand link","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":49,"gherkinStepLine":37,"keywordType":"Outcome","textWithKeyword":"Then I should be on the dashboard page","stepMatchArguments":[]}]},
  {"pwTestLine":52,"pickleLine":39,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":53,"gherkinStepLine":40,"keywordType":"Action","textWithKeyword":"When I click the \"navbar refresh icon\" in the nav bar","stepMatchArguments":[{"group":{"start":12,"value":"\"navbar refresh icon\"","children":[{"start":13,"value":"navbar refresh icon","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":54,"gherkinStepLine":41,"keywordType":"Outcome","textWithKeyword":"Then the dashboard should reload","stepMatchArguments":[]}]},
  {"pwTestLine":57,"pickleLine":43,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":58,"gherkinStepLine":44,"keywordType":"Action","textWithKeyword":"When I click the \"navbar notifications icon\" in the nav bar","stepMatchArguments":[{"group":{"start":12,"value":"\"navbar notifications icon\"","children":[{"start":13,"value":"navbar notifications icon","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":59,"gherkinStepLine":45,"keywordType":"Outcome","textWithKeyword":"Then the notifications panel should be visible","stepMatchArguments":[]}]},
  {"pwTestLine":62,"pickleLine":47,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":63,"gherkinStepLine":48,"keywordType":"Action","textWithKeyword":"When I click the \"navbar contact support icon\" in the nav bar","stepMatchArguments":[{"group":{"start":12,"value":"\"navbar contact support icon\"","children":[{"start":13,"value":"navbar contact support icon","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":64,"gherkinStepLine":49,"keywordType":"Outcome","textWithKeyword":"Then the contact support panel should be visible","stepMatchArguments":[]}]},
  {"pwTestLine":67,"pickleLine":51,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am logged in and on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":68,"gherkinStepLine":52,"keywordType":"Action","textWithKeyword":"When I type \"test\" in the navbar search input","stepMatchArguments":[{"group":{"start":7,"value":"\"test\"","children":[{"start":8,"value":"test","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":69,"gherkinStepLine":53,"keywordType":"Action","textWithKeyword":"And I click the \"navbar search button\" in the nav bar","stepMatchArguments":[{"group":{"start":12,"value":"\"navbar search button\"","children":[{"start":13,"value":"navbar search button","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":70,"gherkinStepLine":54,"keywordType":"Outcome","textWithKeyword":"Then I should be navigated to search results","stepMatchArguments":[]}]},
]; // bdd-data-end