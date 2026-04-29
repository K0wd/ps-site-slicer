Feature: Purchasing Tracker
  Jira: SM-754 — Purchasing Tracker Filters

  Background:
    Given I am logged in and on the dashboard

  @PURCHASE-1 @SC-01 @SM-754
  Scenario: PURCHASE-1 Core text and numeric filters narrow the Purchasing Tracker table and exports reflect the filtered rows
    When I click the "Purchasing" sidebar parent menu
    And I click the "Purchasing Tracker" sidebar menu item
    And I apply the "ID" column filter with a known numeric purchase order ID
    Then the Purchasing Tracker table shows only the matching row
    When I click the "Export" button
    Then the downloaded file contains only rows matching the filtered ID
    When I clear the "ID" column filter and apply the "WO#" column filter with a known work order number
    Then the Purchasing Tracker table shows only purchase orders linked to that work order number
    When I click the "Export" button
    Then the downloaded file contains only the filtered rows and the "WO#" column is populated
    When I clear the "WO#" column filter and apply the "Description" column filter with a partial keyword
    Then the Purchasing Tracker table shows only rows where the description contains that keyword
    When I click the "Export" button
    Then the downloaded file row count matches the filtered table row count

  @PURCHASE-2 @SC-02 @SM-754
  Scenario: PURCHASE-2 Date-based filters narrow the Purchasing Tracker table and the export reflects the filtered date range
    When I click the "Purchasing" sidebar parent menu
    And I click the "Purchasing Tracker" sidebar menu item
    And I open the date filter for the "Request Date" column
    Then the "Equal to" operator should not be available in the date filter options
    When I apply the "Request Date" column filter using a "greater than or equal to" condition with a known date
    Then the Purchasing Tracker table shows only rows with a Request Date on or after that date
    When I export the Purchasing Tracker results
    Then the downloaded file row count matches the filtered table row count
    When I clear the "Request Date" column filter and apply the "Request By Date" column filter with a date condition
    Then the Purchasing Tracker table shows only rows with a Request By Date matching that condition
    When I export the Purchasing Tracker results
    Then the downloaded file row count matches the filtered table row count

  @PURCHASE-3 @SC-03 @SM-754
  Scenario: PURCHASE-3 Categorical and dropdown filters narrow the Purchasing Tracker table and export, and clearing Dept filter removes the column header indicator
    When I click the "Purchasing" sidebar parent menu
    And I click the "Purchasing Tracker" sidebar menu item
    And I apply the "Type" column filter with a single type value
    Then the table should show only rows matching that type
    When I click the "Export" button
    Then the exported file should contain only rows matching that type
    When I clear the "Type" column filter
    And I apply the "Status" column filter with a single status value
    Then the table should show only rows matching that status
    When I click the "Export" button
    Then the exported file should contain only rows matching that status
    When I clear the "Status" column filter
    And I apply the "Priority" column filter with a known priority value
    Then the table should show only rows matching that priority
    When I clear the "Priority" column filter
    And I apply the "Vendor" column filter with a partial vendor name
    Then the table should show only rows matching that vendor
    When I click the "Export" button
    Then the exported file should contain only rows matching that vendor
    When I clear the "Vendor" column filter
    And I apply the "Dept" column filter with a known department
    Then the table should show only rows for that department
    And the Dept column header should show a filter active indicator
    When I clear the "Dept" column filter
    Then the table should display the full record set
    And the Dept column header should show no filter active indicator
    When I apply the "Dept" column filter with a known department
    And I click the "Export" button
    Then the exported file should contain only rows for that department

  @PURCHASE-4 @EC-02 @SM-754
  Scenario: PURCHASE-4 Needs My Approval Yes filter resolves and exports; No filter is a known server performance limitation
    When I click the "Purchasing" sidebar parent menu
    And I click the "Purchasing Tracker" sidebar menu item
    And I apply the "Needs My Approval" column filter with value "Yes"
    Then the table should show only records requiring my approval
    When I click the "Export" button
    Then the exported file should complete successfully with only matching rows
    When I clear the "Needs My Approval" column filter
    And I apply the "Needs My Approval" column filter with value "No"
    Then the Purchasing Tracker page should remain interactive without freezing
