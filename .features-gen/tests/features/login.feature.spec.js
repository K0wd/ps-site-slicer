// Generated from: tests/features/login.feature
import { test } from "playwright-bdd";

test.describe('Login', () => {

  test('LOGIN-1 Login flow — UI branding and full authentication', { tag: ['@LOGIN-1', '@smoke'] }, async ({ Given, When, Then, And, page }) => { 
    await Given('I am on the login page', null, { page }); 
    await Then('I should see the app logo', null, { page }); 
    await And('I should see the app title "Site Manager"', null, { page }); 
    await And('I should see the username input', null, { page }); 
    await And('I should see the next button', null, { page }); 
    await When('I enter my username', null, { page }); 
    await And('I click the next button', null, { page }); 
    await Then('I should be redirected to the password page', null, { page }); 
    await And('I should see the password input', null, { page }); 
    await And('I should see the "Let\'s go" button', null, { page }); 
    await And('I should see the back button', null, { page }); 
    await When('I enter my password', null, { page }); 
    await And('I click the "Let\'s go" button', null, { page }); 
    await Then('I should see the Safe Day\'s Alert modal', null, { page }); 
    await When('I dismiss the Safe Day\'s Alert', null, { page }); 
    await Then('I should be on the dashboard', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests/features/login.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":4,"tags":["@LOGIN-1","@smoke"],"steps":[{"pwStepLine":7,"gherkinStepLine":6,"keywordType":"Context","textWithKeyword":"Given I am on the login page","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":7,"keywordType":"Outcome","textWithKeyword":"Then I should see the app logo","stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":8,"keywordType":"Outcome","textWithKeyword":"And I should see the app title \"Site Manager\"","stepMatchArguments":[{"group":{"start":27,"value":"\"Site Manager\"","children":[{"start":28,"value":"Site Manager","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":10,"gherkinStepLine":9,"keywordType":"Outcome","textWithKeyword":"And I should see the username input","stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"And I should see the next button","stepMatchArguments":[]},{"pwStepLine":12,"gherkinStepLine":12,"keywordType":"Action","textWithKeyword":"When I enter my username","stepMatchArguments":[]},{"pwStepLine":13,"gherkinStepLine":13,"keywordType":"Action","textWithKeyword":"And I click the next button","stepMatchArguments":[]},{"pwStepLine":14,"gherkinStepLine":15,"keywordType":"Outcome","textWithKeyword":"Then I should be redirected to the password page","stepMatchArguments":[]},{"pwStepLine":15,"gherkinStepLine":16,"keywordType":"Outcome","textWithKeyword":"And I should see the password input","stepMatchArguments":[]},{"pwStepLine":16,"gherkinStepLine":17,"keywordType":"Outcome","textWithKeyword":"And I should see the \"Let's go\" button","stepMatchArguments":[{"group":{"start":17,"value":"\"Let's go\"","children":[{"start":18,"value":"Let's go","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":17,"gherkinStepLine":18,"keywordType":"Outcome","textWithKeyword":"And I should see the back button","stepMatchArguments":[]},{"pwStepLine":18,"gherkinStepLine":20,"keywordType":"Action","textWithKeyword":"When I enter my password","stepMatchArguments":[]},{"pwStepLine":19,"gherkinStepLine":21,"keywordType":"Action","textWithKeyword":"And I click the \"Let's go\" button","stepMatchArguments":[{"group":{"start":12,"value":"\"Let's go\"","children":[{"start":13,"value":"Let's go","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":20,"gherkinStepLine":22,"keywordType":"Outcome","textWithKeyword":"Then I should see the Safe Day's Alert modal","stepMatchArguments":[]},{"pwStepLine":21,"gherkinStepLine":23,"keywordType":"Action","textWithKeyword":"When I dismiss the Safe Day's Alert","stepMatchArguments":[]},{"pwStepLine":22,"gherkinStepLine":24,"keywordType":"Outcome","textWithKeyword":"Then I should be on the dashboard","stepMatchArguments":[]}]},
]; // bdd-data-end