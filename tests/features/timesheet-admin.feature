Feature: Timesheet Admin
  Jira: SM-754 — Approval Filters, SM-775 — Alternate Approver Rectify Access

  Background:
    Given I am logged in and on the dashboard

  @TIMESHEET-1 @SC-04 @SM-754
  Scenario: TIMESHEET-1 Approval column filter shows all dropdown options including blank and export reflects active filter
    When I navigate to the timesheet admin screen
    And I open the column filter for "Approval"
    Then the filter dropdown should include "Approved", "Pending", "Rejected", "Blacklisted", and a blank option
    When I select the blank option from the "Approval" column filter
    Then the grid should display only rows with no approval status set
    When I click the "Export" button
    And I view the exports and refresh until the file is ready
    And I download the exported file
    Then the exported file should contain only rows matching the active blank approval filter

  @TIMESHEET-2 @SC-01 @SM-775
  Scenario: TIMESHEET-2 Alternate Approver Gains Rectify Access for Covered Manager's Employees
    Given an alternate approver is configured to cover a manager with assigned employees
    When I log in as the alternate approver and navigate to the timesheet approval screen
    Then the alternate approver should see the Rectify option for each employee belonging to the covered manager

  @TIMESHEET-3 @SC-02 @SM-775
  Scenario: TIMESHEET-3 Removing alternate approver relationship revokes Rectify access
    Given a user has Rectify access granted through an Alternate Approver relationship
    When I remove the Alternate Approver relationship from that user's profile
    Then the user should no longer have Rectify access in the UAC system

  @TIMESHEET-4 @SC-03 @SM-775
  Scenario: TIMESHEET-4 Existing direct manager rectify entry is unaffected by timesheet admin changes
    When I navigate to a timesheet that already has a direct manager rectify entry
    Then the direct manager rectify entry should remain intact and unchanged

  @TIMESHEET-5 @SC-04 @SM-775
  Scenario: TIMESHEET-5 Alternate Approver Covering Multiple Managers Sees All Covered Employees
    When I click the "Timesheets" sidebar parent menu
    And I click the "Timesheet Admin" sidebar menu item
    Then I should see employees from all managers covered by the alternate approver assignment

  @TIMESHEET-6 @EC-01 @SM-775
  Scenario: TIMESHEET-6 User with no alternate approver relationship cannot view another manager's employees
    When I click the "Timesheets" sidebar parent menu
    And I click the "Timesheet Admin" sidebar menu item
    Then I should not see employees belonging to other managers in the employee list

  @TIMESHEET-7 @EC-02 @SM-775
  Scenario: TIMESHEET-7 Alternate approver cannot rectify timesheets for employees outside their approval scope
    When I navigate to the timesheet rectification screen as an alternate approver
    And I search for an employee who is not assigned to me
    Then the rectify action should not be available for that employee
