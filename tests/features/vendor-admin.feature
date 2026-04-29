Feature: Vendor Admin
  Jira: SM-754 — Vendor Admin Filters

  Background:
    Given I am logged in and on the dashboard

  @VENDOR-1 @SC-05 @SM-754
  Scenario: VENDOR-1 Filter Approver(s) column by specific name, by blank, and export results
    When I click the "Vendors" sidebar parent menu
    And I click the "Vendor Admin" sidebar menu item
    And I filter the "Approver(s)" column by a specific approver name
    Then only rows matching that approver name should be visible in the grid
    When I filter the "Approver(s)" column by blank
    Then only rows with no approver assigned should be visible in the grid
    When I click the "Export" button
    And I navigate to the exports queue and refresh until the file is ready
    Then the exported file should contain only the blank-approver rows

  @VENDOR-2 @EC-03 @SM-754
  Scenario: VENDOR-2 Multi-value filter selects multiple items simultaneously
    When I navigate to the Vendor Admin screen
    And I open the filter for the "Status" column
    And I select the filter value "Approved"
    And I select the filter value "Pending"
    And I apply the column filter
    Then the grid should display rows matching "Approved"
    And the grid should display rows matching "Pending"
    And no rows with other status values should be visible
