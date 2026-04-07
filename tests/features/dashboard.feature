Feature: Dashboard

  Background:
    Given I am logged in and on the dashboard

  Scenario: Display top bar elements
    Then I should see the search input
    And I should see the refresh button
    And I should see the add widget button

  Scenario: Display user profile controls
    Then I should see the my profile link
    And I should see the logout link

  Scenario: Display sidebar navigation
    Then I should see the sidebar filter
    And I should see the "Account Management" menu item
    And I should see the "Dashboard" menu item
    And I should see the "Timesheets" menu item
    And I should see the "Reports" menu item

  Scenario: Filter sidebar menu
    When I type "Admin" in the sidebar filter
    Then I should see the "Admin Alerts" menu item
    And I should see the "BI Admin" menu item

  Scenario: Display version info
    Then I should see the SM version in the sidebar

  Scenario: Add widget - Site Manager Performance
    When I add the "Site Manager Performance" widget
    Then I should see the "Site Manager Performance" widget on the dashboard
    And I delete all widgets from the dashboard

  Scenario: Add widget - Known Employee Locations
    When I add the "Known Employee Locations" widget
    Then I should see the "Known Employee Locations" widget on the dashboard
    And I delete all widgets from the dashboard

  Scenario: Add widget - Announcements
    When I add the "Announcements" widget
    Then I should see the "Announcements" widget on the dashboard
    And I delete all widgets from the dashboard

  Scenario: Add widget - Favorites
    When I add the "Favorites" widget
    Then I should see the "Favorites" widget on the dashboard
    And I delete all widgets from the dashboard

  Scenario: Add widget - Alerts
    When I add the "Alerts" widget
    Then I should see the "Alerts" widget on the dashboard
    And I delete all widgets from the dashboard

  Scenario: Add widget - Clocked In
    When I add the "Clocked In" widget
    Then I should see the "Clocked In" widget on the dashboard
    And I delete all widgets from the dashboard

  Scenario: Add widget - Materials Over Budget
    When I add the "Materials Over Budget" widget
    Then I should see the "Materials Over Budget" widget on the dashboard
    And I delete all widgets from the dashboard

  Scenario: Add widget - Subcontractors Over Budget
    When I add the "Subcontractors Over Budget" widget
    Then I should see the "Subcontractors Over Budget" widget on the dashboard
    And I delete all widgets from the dashboard

  Scenario: Add widget - Equipment Over Budget
    When I add the "Equipment Over Budget" widget
    Then I should see the "Equipment Over Budget" widget on the dashboard
    And I delete all widgets from the dashboard

  Scenario: Add widget - Profitability By Department
    When I add the "Profitability By Department" widget
    Then I should see the "Profitability By Department" widget on the dashboard
    And I delete all widgets from the dashboard

  Scenario: Add widget - Past Due Tickets
    When I add the "Past Due Tickets" widget
    Then I should see the "Past Due Tickets" widget on the dashboard
    And I delete all widgets from the dashboard

  Scenario: Add widget - Timesheet/WO discrepancies
    When I add the "Timesheet/WO discrepancies" widget
    Then I should see the "Timesheet/WO discrepancies" widget on the dashboard
    And I delete all widgets from the dashboard

  Scenario: Add widget - Scheduled Tickets
    When I add the "Scheduled Tickets" widget
    Then I should see the "Scheduled Tickets" widget on the dashboard
    And I delete all widgets from the dashboard

  Scenario: Add widget - Vendor Announcements
    When I add the "Vendor Announcements" widget
    Then I should see the "Vendor Announcements" widget on the dashboard
    And I delete all widgets from the dashboard

  Scenario: Add widget - Manager Announcements
    When I add the "Manager Announcements" widget
    Then I should see the "Manager Announcements" widget on the dashboard
    And I delete all widgets from the dashboard

  Scenario: Add widget - Weather Widget
    When I add the "Weather Widget" widget
    Then I should see the "Weather Widget" widget on the dashboard
    And I delete all widgets from the dashboard

  Scenario: Add widget - TEST HTML
    When I add the "TEST HTML" widget
    Then I should see the "TEST HTML" widget on the dashboard
    And I delete all widgets from the dashboard

  Scenario: Add widget - Add Client Shares
    When I add the "Add Client Shares" widget
    Then I should see the "Add Client Shares" widget on the dashboard
    And I delete all widgets from the dashboard

  Scenario: Add widget - View Client Shares
    When I add the "View Client Shares" widget
    Then I should see the "View Client Shares" widget on the dashboard
    And I delete all widgets from the dashboard

  Scenario: Add widget - Vendor PO List
    When I add the "Vendor PO List" widget
    Then I should see the "Vendor PO List" widget on the dashboard
    And I delete all widgets from the dashboard
