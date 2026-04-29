Feature: Maintenance Admin
  Jira: SM-742 — Prevent Duplicate Departments

  Background:
    Given I am logged in and on the dashboard

  @MAINT-1 @SC-01 @SM-742
  Scenario: MAINT-1 Add a unique department successfully
    When I click the "Admin" sidebar parent menu
    And I click the "Departments" sidebar menu item
    And I click the "Add Department" button
    And I enter a unique department name
    And I click the "Save" button
    Then the new department should appear in the departments list

  @MAINT-2 @SC-02 @SM-742
  Scenario: MAINT-2 Block exact duplicate department name
    When I click the "Admin" sidebar parent menu
    And I click the "Departments" sidebar menu item
    And I click the "Add" button
    And I enter the name of an existing department
    And I click the "Save" button
    Then I should see a validation error blocking the duplicate department name

  @MAINT-3 @EC-01 @SM-742
  Scenario: MAINT-3 Empty or whitespace-only department name is not saved
    When I click the "Maintenance" sidebar parent menu
    And I click the "Maintenance Admin" sidebar menu item
    And I enter "     " in the department name field and click the "Add" button
    Then no blank or whitespace department entry should appear in the list
    And I should see a validation message preventing the save

  @MAINT-4 @EC-02 @SM-742
  Scenario: MAINT-4 Server-side duplicate check rejects a duplicate record when frontend validation is bypassed
    Given a record with the same identifying value already exists in the system
    When I submit a second record with the same identifying value bypassing the frontend duplicate check
    Then the system should display a duplicate entry error message
    And no additional duplicate record should be created
