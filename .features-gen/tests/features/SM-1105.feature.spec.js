// Generated from: tests/features/SM-1105.feature
import { test } from "playwright-bdd";

test.describe('Test Plan: SM-1105 — Set Default Template in Cascade Template Management Tool', () => {

  test.beforeEach('Background', async ({ Given, When, Then, And, page }, testInfo) => { if (testInfo.error) return;
    await Given('I am on the login page', null, { page }); 
    await When('I enter my username', null, { page }); 
    await And('I click the next button', null, { page }); 
    await And('I enter my password', null, { page }); 
    await And('I click the "Let\'s go" button', null, { page }); 
    await Then('I should see the Safe Day\'s Alert modal', null, { page }); 
    await When('I dismiss the Safe Day\'s Alert', null, { page }); 
    await Then('I should be on the dashboard', null, { page }); 
  });
  
  test('Set a cascade template as default via the three-dot menu', { tag: ['@TC-1', '@SM-1105'] }, async ({ When, Then, And, page }) => { 
    await When('I click the "Project Admin" sidebar parent menu', null, { page }); 
    await Then('the "Project Admin" submenu should expand', null, { page }); 
    await When('I click the "Cascade Templates" sidebar menu item', null, { page }); 
    await Then('I should see the page title "Cascade Templates"', null, { page }); 
    await And('I should see the template list with available templates', null, { page }); 
    await When('I note the current default template state', null, { page }); 
    await And('I click the three-dot menu on a non-default template', null, { page }); 
    await Then('I should see the "Set as Default" menu item in the context menu', null, { page }); 
    await When('I click the "Set as Default" menu item', null, { page }); 
    await Then('I should see the gold star icon next to the selected template', null, { page }); 
    await And('the template list should refresh automatically', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests/features/SM-1105.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":17,"pickleLine":16,"tags":["@TC-1","@SM-1105"],"steps":[{"pwStepLine":7,"gherkinStepLine":6,"keywordType":"Context","textWithKeyword":"Given I am on the login page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":7,"keywordType":"Action","textWithKeyword":"When I enter my username","isBg":true,"stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":8,"keywordType":"Action","textWithKeyword":"And I click the next button","isBg":true,"stepMatchArguments":[]},{"pwStepLine":10,"gherkinStepLine":9,"keywordType":"Action","textWithKeyword":"And I enter my password","isBg":true,"stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":10,"keywordType":"Action","textWithKeyword":"And I click the \"Let's go\" button","isBg":true,"stepMatchArguments":[{"group":{"start":12,"value":"\"Let's go\"","children":[{"start":13,"value":"Let's go","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":12,"gherkinStepLine":11,"keywordType":"Outcome","textWithKeyword":"Then I should see the Safe Day's Alert modal","isBg":true,"stepMatchArguments":[]},{"pwStepLine":13,"gherkinStepLine":12,"keywordType":"Action","textWithKeyword":"When I dismiss the Safe Day's Alert","isBg":true,"stepMatchArguments":[]},{"pwStepLine":14,"gherkinStepLine":13,"keywordType":"Outcome","textWithKeyword":"Then I should be on the dashboard","isBg":true,"stepMatchArguments":[]},{"pwStepLine":18,"gherkinStepLine":17,"keywordType":"Action","textWithKeyword":"When I click the \"Project Admin\" sidebar parent menu","stepMatchArguments":[{"group":{"start":12,"value":"\"Project Admin\"","children":[{"start":13,"value":"Project Admin","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":19,"gherkinStepLine":18,"keywordType":"Outcome","textWithKeyword":"Then the \"Project Admin\" submenu should expand","stepMatchArguments":[{"group":{"start":4,"value":"\"Project Admin\"","children":[{"start":5,"value":"Project Admin","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":20,"gherkinStepLine":19,"keywordType":"Action","textWithKeyword":"When I click the \"Cascade Templates\" sidebar menu item","stepMatchArguments":[{"group":{"start":12,"value":"\"Cascade Templates\"","children":[{"start":13,"value":"Cascade Templates","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":21,"gherkinStepLine":20,"keywordType":"Outcome","textWithKeyword":"Then I should see the page title \"Cascade Templates\"","stepMatchArguments":[{"group":{"start":28,"value":"\"Cascade Templates\"","children":[{"start":29,"value":"Cascade Templates","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":22,"gherkinStepLine":21,"keywordType":"Outcome","textWithKeyword":"And I should see the template list with available templates","stepMatchArguments":[]},{"pwStepLine":23,"gherkinStepLine":22,"keywordType":"Action","textWithKeyword":"When I note the current default template state","stepMatchArguments":[]},{"pwStepLine":24,"gherkinStepLine":23,"keywordType":"Action","textWithKeyword":"And I click the three-dot menu on a non-default template","stepMatchArguments":[]},{"pwStepLine":25,"gherkinStepLine":24,"keywordType":"Outcome","textWithKeyword":"Then I should see the \"Set as Default\" menu item in the context menu","stepMatchArguments":[{"group":{"start":17,"value":"\"Set as Default\"","children":[{"start":18,"value":"Set as Default","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":26,"gherkinStepLine":25,"keywordType":"Action","textWithKeyword":"When I click the \"Set as Default\" menu item","stepMatchArguments":[{"group":{"start":12,"value":"\"Set as Default\"","children":[{"start":13,"value":"Set as Default","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":27,"gherkinStepLine":26,"keywordType":"Outcome","textWithKeyword":"Then I should see the gold star icon next to the selected template","stepMatchArguments":[]},{"pwStepLine":28,"gherkinStepLine":27,"keywordType":"Outcome","textWithKeyword":"And the template list should refresh automatically","stepMatchArguments":[]}]},
]; // bdd-data-end