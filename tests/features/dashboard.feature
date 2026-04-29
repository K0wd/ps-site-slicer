Feature: Dashboard

  Background:
    Given I am logged in and on the dashboard

  @DASH-1
  Scenario: DASH-1 Display top bar elements
    Then I should see the search input
    And I should see the refresh button
    And I should see the add widget button

  @DASH-2
  Scenario: DASH-2 Display user profile controls
    Then I should see the my profile link
    And I should see the logout link

  @DASH-3
  Scenario: DASH-3 Display sidebar navigation
    Then I should see the sidebar filter
    And I should see the "Account Management" menu item
    And I should see the "Dashboard" menu item
    And I should see the "Timesheets" menu item
    And I should see the "Reports" menu item

  @DASH-4
  Scenario: DASH-4 Filter sidebar menu
    When I type "Admin" in the sidebar filter
    Then I should see the "Admin Alerts" menu item
    And I should see the "BI Admin" menu item

  @DASH-5
  Scenario: DASH-5 Display version info
    Then I should see the SM version in the sidebar

  @DASH-6
  Scenario: DASH-6 Add widget - Site Manager Performance
    When I add the "Site Manager Performance" widget
    Then I should see the "Site Manager Performance" widget on the dashboard
    And I delete all widgets from the dashboard

  @DASH-7
  Scenario: DASH-7 Add widget - Known Employee Locations
    When I add the "Known Employee Locations" widget
    Then I should see the "Known Employee Locations" widget on the dashboard
    And I delete all widgets from the dashboard

  @DASH-8
  Scenario: DASH-8 Add widget - Announcements
    When I add the "Announcements" widget
    Then I should see the "Announcements" widget on the dashboard
    And I delete all widgets from the dashboard

  @DASH-9
  Scenario: DASH-9 Add widget - Favorites
    When I add the "Favorites" widget
    Then I should see the "Favorites" widget on the dashboard
    And I delete all widgets from the dashboard

  @DASH-10
  Scenario: DASH-10 Add widget - Alerts
    When I add the "Alerts" widget
    Then I should see the "Alerts" widget on the dashboard
    And I delete all widgets from the dashboard

  @DASH-11
  Scenario: DASH-11 Add widget - Clocked In
    When I add the "Clocked In" widget
    Then I should see the "Clocked In" widget on the dashboard
    And I delete all widgets from the dashboard

  @DASH-12
  Scenario: DASH-12 Add widget - Materials Over Budget
    When I add the "Materials Over Budget" widget
    Then I should see the "Materials Over Budget" widget on the dashboard
    And I delete all widgets from the dashboard

  @DASH-13
  Scenario: DASH-13 Add widget - Subcontractors Over Budget
    When I add the "Subcontractors Over Budget" widget
    Then I should see the "Subcontractors Over Budget" widget on the dashboard
    And I delete all widgets from the dashboard

  @DASH-14
  Scenario: DASH-14 Add widget - Equipment Over Budget
    When I add the "Equipment Over Budget" widget
    Then I should see the "Equipment Over Budget" widget on the dashboard
    And I delete all widgets from the dashboard

  @DASH-15
  Scenario: DASH-15 Add widget - Profitability By Department
    When I add the "Profitability By Department" widget
    Then I should see the "Profitability By Department" widget on the dashboard
    And I delete all widgets from the dashboard

  @DASH-16
  Scenario: DASH-16 Add widget - Past Due Tickets
    When I add the "Past Due Tickets" widget
    Then I should see the "Past Due Tickets" widget on the dashboard
    And I delete all widgets from the dashboard

  @DASH-17
  Scenario: DASH-17 Add widget - Timesheet/WO discrepancies
    When I add the "Timesheet/WO discrepancies" widget
    Then I should see the "Timesheet/WO discrepancies" widget on the dashboard
    And I delete all widgets from the dashboard

  @DASH-18
  Scenario: DASH-18 Add widget - Scheduled Tickets
    When I add the "Scheduled Tickets" widget
    Then I should see the "Scheduled Tickets" widget on the dashboard
    And I delete all widgets from the dashboard

  @DASH-19
  Scenario: DASH-19 Add widget - Vendor Announcements
    When I add the "Vendor Announcements" widget
    Then I should see the "Vendor Announcements" widget on the dashboard
    And I delete all widgets from the dashboard

  @DASH-20
  Scenario: DASH-20 Add widget - Manager Announcements
    When I add the "Manager Announcements" widget
    Then I should see the "Manager Announcements" widget on the dashboard
    And I delete all widgets from the dashboard

  @DASH-21
  Scenario: DASH-21 Add widget - Weather Widget
    When I add the "Weather Widget" widget
    Then I should see the "Weather Widget" widget on the dashboard
    And I delete all widgets from the dashboard

  @DASH-22
  Scenario: DASH-22 Add widget - TEST HTML
    When I add the "TEST HTML" widget
    Then I should see the "TEST HTML" widget on the dashboard
    And I delete all widgets from the dashboard

  @DASH-23
  Scenario: DASH-23 Add widget - Add Client Shares
    When I add the "Add Client Shares" widget
    Then I should see the "Add Client Shares" widget on the dashboard
    And I delete all widgets from the dashboard

  @DASH-24
  Scenario: DASH-24 Add widget - View Client Shares
    When I add the "View Client Shares" widget
    Then I should see the "View Client Shares" widget on the dashboard
    And I delete all widgets from the dashboard

  @DASH-25
  Scenario: DASH-25 Add widget - Vendor PO List
    When I add the "Vendor PO List" widget
    Then I should see the "Vendor PO List" widget on the dashboard
    And I delete all widgets from the dashboard

  @DASH-26 @EC-01 @SM-754
  Scenario: DASH-26 Sidebar filter text persists after navigation and clears when emptied
    When I type "Admin" in the sidebar filter
    Then the sidebar should show only menu items matching "Admin"
    When I click the "Dashboard" sidebar menu item
    Then the sidebar filter should still contain "Admin"
    When I type "" in the sidebar filter
    Then the sidebar should show all menu items
