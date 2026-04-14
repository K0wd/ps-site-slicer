Feature: Purchasing Tracker Filters (SM-754)

  Background: User is logged in and on the Purchasing Tracker
    Given I am logged in and on the dashboard
    When I click the "Purchasing" sidebar menu item
    Then I should be on the Purchasing Tracker page

  # ── TC-01: ID Filter — Table View ──
  Scenario: Filter by ID filters the table correctly
    When I open the filter on the "ID" column
    And I enter "POR" in the text filter
    Then the table should show filtered rows
    And the visible row count should be greater than zero
    When I clear the active filter
    Then the table should return to unfiltered state

  # ── TC-02: ID Filter — Export ──
  Scenario: Export filtered ID data matches the table
    When I open the filter on the "ID" column
    And I enter "POR" in the text filter
    Then the table should show filtered rows
    When I click the export button
    Then the export should complete successfully

  # ── TC-03: Request Date Filter — Table View ──
  Scenario: Filter by Request Date filters the table correctly
    When I open the filter on the "Request Date" column
    And I set a date range filter with "after" and "2025-01-01"
    Then the table should show filtered rows

  # ── TC-04: Request Date Filter — Export ──
  Scenario: Export filtered Request Date data
    When I open the filter on the "Request Date" column
    And I set a date range filter with "after" and "2025-01-01"
    Then the table should show filtered rows
    When I click the export button
    Then the export should complete successfully

  # ── TC-05: Request By Date Filter — Table View + Export ──
  Scenario: Filter by Request By Date filters the table correctly
    When I open the filter on the "Request By Date" column
    And I set a date range filter with "after" and "2025-01-01"
    Then the table should show filtered rows

  Scenario: Export filtered Request By Date data
    When I open the filter on the "Request By Date" column
    And I set a date range filter with "after" and "2025-01-01"
    Then the table should show filtered rows
    When I click the export button
    Then the export should complete successfully

  # ── TC-06: WO# Filter — Table View + Export ──
  Scenario: Filter by WO number filters the table correctly
    When I open the filter on the "WO#" column
    And I enter "0-00008" in the text filter
    Then the table should show filtered rows

  Scenario: Export filtered WO number data
    When I open the filter on the "WO#" column
    And I enter "0-00008" in the text filter
    Then the table should show filtered rows
    When I click the export button
    Then the export should complete successfully

  # ── TC-07: Requested Total Filter — Table View + Export ──
  Scenario: Filter by Requested Total filters the table correctly
    When I open the filter on the "Requested Total" column
    And I enter "100" in the number filter
    Then the table should show filtered rows

  Scenario: Export filtered Requested Total data
    When I open the filter on the "Requested Total" column
    And I enter "100" in the number filter
    Then the table should show filtered rows
    When I click the export button
    Then the export should complete successfully

  # ── TC-08: Division Column — Filter Removed ──
  Scenario: Division column has no filter icon
    Then the "Division" column should not have a filter menu button

  # ── TC-09: Type Filter — Table View + Export ──
  Scenario: Filter by Type filters the table correctly
    When I open the filter on the "Type" column
    And I select "PO" from the set filter
    Then the table should show filtered rows

  Scenario: Export filtered Type data
    When I open the filter on the "Type" column
    And I select "PO" from the set filter
    Then the table should show filtered rows
    When I click the export button
    Then the export should complete successfully

  # ── TC-10: Description Filter — Table View + Export ──
  Scenario: Filter by Description filters the table correctly
    When I open the filter on the "Description" column
    And I enter "cable" in the text filter
    Then the table should show filtered rows

  Scenario: Export filtered Description data
    When I open the filter on the "Description" column
    And I enter "cable" in the text filter
    Then the table should show filtered rows
    When I click the export button
    Then the export should complete successfully

  # ── TC-11: Status Filter — Table View + Export ──
  Scenario: Filter by Status filters the table correctly
    When I open the filter on the "Status" column
    And I select "Open" from the set filter
    Then the table should show filtered rows

  Scenario: Export filtered Status data
    When I open the filter on the "Status" column
    And I select "Open" from the set filter
    Then the table should show filtered rows
    When I click the export button
    Then the export should complete successfully

  # ── TC-12: Approval Filter — Dropdown with Checkboxes ──
  Scenario: Approval filter is a dropdown with checkable options
    When I open the filter on the "Approval" column
    Then the filter should show a set filter list
    And the set filter should have option "Approved"
    And the set filter should have option "Pending Approval"
    And the set filter should have option "Override"
    And the set filter should have option "Rejected"
    And the set filter should have option "Blank"

  Scenario: Approval Approved filter shows only approved rows
    When I open the filter on the "Approval" column
    And I select "Approved" from the set filter
    Then the table should show filtered rows

  Scenario: Approval Pending Approval filter works
    When I open the filter on the "Approval" column
    And I select "Pending Approval" from the set filter
    Then the table should show filtered rows or zero results

  Scenario: Approval Override filter shows override rows
    When I open the filter on the "Approval" column
    And I select "Override" from the set filter
    Then the table should show filtered rows or zero results

  Scenario: Approval Blank filter shows rows with no approval value
    When I open the filter on the "Approval" column
    And I select "Blank" from the set filter
    Then the table should show filtered rows or zero results

  # ── TC-13: Approval Filter — Export ──
  Scenario: Export filtered Approval data
    When I open the filter on the "Approval" column
    And I select "Approved" from the set filter
    Then the table should show filtered rows
    When I click the export button
    Then the export should complete successfully

  # ── TC-14: Approver(s) Filter — Table View ──
  Scenario: Filter by Approver filters the table correctly
    When I open the filter on the "Approver(s)" column
    And I select a known approver from the set filter
    Then the table should show filtered rows

  Scenario: Approver Blank filter shows rows with no approvers
    When I open the filter on the "Approver(s)" column
    And I select "Blank" from the set filter
    Then the table should show filtered rows or zero results

  # ── TC-15: Approver(s) Filter — Export ──
  Scenario: Export filtered Approver data
    When I open the filter on the "Approver(s)" column
    And I select a known approver from the set filter
    Then the table should show filtered rows
    When I click the export button
    Then the export should complete successfully

  # ── TC-16: Assigned To Filter — Table View + Export ──
  Scenario: Filter by Assigned To filters the table correctly
    When I open the filter on the "Assigned To" column
    And I select "Inc, Betacom" from the set filter
    Then the table should show filtered rows

  Scenario: Export filtered Assigned To data
    When I open the filter on the "Assigned To" column
    And I select "Inc, Betacom" from the set filter
    Then the table should show filtered rows
    When I click the export button
    Then the export should complete successfully

  # ── TC-17: Dept Filter — Table View + Clear Behavior ──
  Scenario: Filter by Dept and clear removes filter icon
    When I open the filter on the "Dept" column
    And I select the first available set filter option
    Then the table should show filtered rows
    When I clear the active filter
    Then the filter icon should not be visible on the "Dept" column
    And the table should return to unfiltered state

  # ── TC-18: Dept Filter — Export ──
  Scenario: Export filtered Dept data
    When I open the filter on the "Dept" column
    And I select the first available set filter option
    Then the table should show filtered rows
    When I click the export button
    Then the export should complete successfully

  # ── TC-19: Priority Filter — Table View + Export ──
  Scenario: Filter by Priority filters the table correctly
    When I open the filter on the "Priority" column
    And I select "H" from the set filter
    Then the table should show filtered rows

  Scenario: Priority Blank filter shows rows with blank priority
    When I open the filter on the "Priority" column
    And I select "Blank" from the set filter
    Then the table should show filtered rows or zero results

  Scenario: Export filtered Priority data
    When I open the filter on the "Priority" column
    And I select "H" from the set filter
    Then the table should show filtered rows
    When I click the export button
    Then the export should complete successfully

  # ── TC-20: Vendor Filter — Table View + Export ──
  Scenario: Filter by Vendor filters the table correctly
    When I open the filter on the "Vendor" column
    And I enter "Anixter" in the text filter
    Then the table should show filtered rows

  Scenario: Export filtered Vendor data
    When I open the filter on the "Vendor" column
    And I enter "Anixter" in the text filter
    Then the table should show filtered rows
    When I click the export button
    Then the export should complete successfully

  # ── TC-21: PO# Filter — Table View + Export ──
  Scenario: Filter by PO number filters the table correctly
    When I open the filter on the "PO#" column
    And I enter "PO" in the text filter
    Then the table should show filtered rows

  Scenario: Export filtered PO number data
    When I open the filter on the "PO#" column
    And I enter "PO" in the text filter
    Then the table should show filtered rows
    When I click the export button
    Then the export should complete successfully

  # ── TC-22: Needs My Approval Filter — Table View ──
  Scenario: Needs My Approval Yes filter works
    When I open the filter on the "Needs My Approval" column
    And I select "Yes" from the set filter
    Then the table should show filtered rows or zero results

  Scenario: Needs My Approval No filter works
    When I open the filter on the "Needs My Approval" column
    And I select "No" from the set filter
    Then the table should show filtered rows or zero results

  Scenario: Needs My Approval Blank filter works
    When I open the filter on the "Needs My Approval" column
    And I select "Blank" from the set filter
    Then the table should show filtered rows or zero results

  # ── TC-23: Needs My Approval Filter — Export ──
  Scenario: Export filtered Needs My Approval data
    When I open the filter on the "Needs My Approval" column
    And I select "Yes" from the set filter
    Then the table should show filtered rows or zero results
    When I click the export button
    Then the export should complete successfully

  # ── Edge Cases ──

  # EC-03: Override partial match
  Scenario: Override filter matches partial "Override Provided by" values
    When I open the filter on the "Approval" column
    And I select "Override" from the set filter
    Then the table should show filtered rows or zero results
    And all visible "Approval" cells should contain "Override"

  # EC-04: Multi-value filter selection
  Scenario: Multiple filter values can be selected simultaneously
    When I open the filter on the "Approval" column
    And I select multiple values "Approved" and "Pending Approval" from the set filter
    Then the table should show filtered rows

  # EC-05: Clear filter removes filter symbol
  Scenario: Clearing a filter removes the filter icon from the column header
    When I open the filter on the "ID" column
    And I enter "POR" in the text filter
    Then the table should show filtered rows
    When I clear the active filter
    Then the filter icon should not be visible on the "ID" column

  # EC-06: Approval stays dropdown after re-navigation
  Scenario: Approval filter remains a dropdown after re-navigation
    When I open the filter on the "Approval" column
    Then the filter should show a set filter list
    When I press Escape to close the filter
    And I navigate away and return to Purchasing Tracker
    And I open the filter on the "Approval" column
    Then the filter should show a set filter list

  # EC-08: Date filter "equal" condition removed
  Scenario: Request Date filter does not have an equal condition
    When I open the filter on the "Request Date" column
    Then the date filter should not have an "equals" option

  # EC-04 continued: Multiple filters applied simultaneously
  Scenario: Multiple column filters can be applied simultaneously
    When I open the filter on the "Status" column
    And I select "Open" from the set filter
    Then the table should show filtered rows
    When I open the filter on the "Type" column
    And I select "PO" from the set filter
    Then the table should show filtered rows
