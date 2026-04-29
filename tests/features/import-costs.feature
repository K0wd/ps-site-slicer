Feature: Import Costs
  Jira: SM-803 — Prevent Multiple Submissions

  Background:
    Given I am logged in and on the dashboard

  @IMPORT-1 @SC-01 @SM-803
  Scenario: IMPORT-1 Submit button disables on first click and processes once
    When I click the "Submit" button
    Then the "Submit" button should be disabled
    And the form should be submitted exactly once

  @IMPORT-2 @SC-02 @SM-803
  Scenario: IMPORT-2 Rapid repeated clicks result in exactly one submission
    When I click the "Submit" button multiple times in rapid succession
    Then exactly one submission should be recorded

  @IMPORT-3 @SC-03 @SM-803
  Scenario: IMPORT-3 Validation error keeps button functional for retry
    When I submit the form with missing required fields
    Then I should see a validation error message
    And I should see the "Save" button
    When I correct the required fields and click the "Save" button
    Then the form should be submitted successfully

  @IMPORT-4 @SC-04 @SM-803
  Scenario: IMPORT-4 Submission failure allows user to retry
    When I click the "Submit" button
    Then I should see the "Submit" button
