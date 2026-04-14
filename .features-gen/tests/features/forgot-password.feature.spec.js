// Generated from: tests/features/forgot-password.feature
import { test } from "playwright-bdd";

test.describe('Forgot Password', () => {

  test.beforeEach('Background', async ({ Given, page }, testInfo) => { if (testInfo.error) return;
    await Given('I am on the forgot password page', null, { page }); 
  });
  
  test('Display page branding', async ({ Then, And, page }) => { 
    await Then('I should see the page title "Site Manager"', null, { page }); 
    await And('I should see the section title "Password Reset"', null, { page }); 
    await And('I should see the instructions text', null, { page }); 
  });

  test('Display reset form elements', async ({ Then, And, page }) => { 
    await Then('I should see the username input field', null, { page }); 
    await And('I should see the email input field', null, { page }); 
    await And('I should see the send access link button', null, { page }); 
  });

  test('Display navigation links', async ({ Then, And, page }) => { 
    await Then('I should see the login link', null, { page }); 
    await And('I should see the version info', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests/features/forgot-password.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":10,"pickleLine":6,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am on the forgot password page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":7,"keywordType":"Outcome","textWithKeyword":"Then I should see the page title \"Site Manager\"","stepMatchArguments":[{"group":{"start":28,"value":"\"Site Manager\"","children":[{"start":29,"value":"Site Manager","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":12,"gherkinStepLine":8,"keywordType":"Outcome","textWithKeyword":"And I should see the section title \"Password Reset\"","stepMatchArguments":[{"group":{"start":31,"value":"\"Password Reset\"","children":[{"start":32,"value":"Password Reset","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":13,"gherkinStepLine":9,"keywordType":"Outcome","textWithKeyword":"And I should see the instructions text","stepMatchArguments":[]}]},
  {"pwTestLine":16,"pickleLine":11,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am on the forgot password page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":17,"gherkinStepLine":12,"keywordType":"Outcome","textWithKeyword":"Then I should see the username input field","stepMatchArguments":[]},{"pwStepLine":18,"gherkinStepLine":13,"keywordType":"Outcome","textWithKeyword":"And I should see the email input field","stepMatchArguments":[]},{"pwStepLine":19,"gherkinStepLine":14,"keywordType":"Outcome","textWithKeyword":"And I should see the send access link button","stepMatchArguments":[]}]},
  {"pwTestLine":22,"pickleLine":16,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am on the forgot password page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":23,"gherkinStepLine":17,"keywordType":"Outcome","textWithKeyword":"Then I should see the login link","stepMatchArguments":[]},{"pwStepLine":24,"gherkinStepLine":18,"keywordType":"Outcome","textWithKeyword":"And I should see the version info","stepMatchArguments":[]}]},
]; // bdd-data-end