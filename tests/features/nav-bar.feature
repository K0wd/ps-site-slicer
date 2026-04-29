Feature: Nav Bar

  Background:
    Given I am logged in and on the dashboard

  @NAV-1
  Scenario: NAV-1 Display sidebar toggle button
    Then I should see the "sidebar toggle button" in the nav bar

  @NAV-2
  Scenario: NAV-2 Display navbar brand link
    Then I should see the "navbar brand link" in the nav bar

  @NAV-3
  Scenario: NAV-3 Display navbar refresh icon
    Then I should see the "navbar refresh icon" in the nav bar

  @NAV-4
  Scenario: NAV-4 Display navbar dashboard icon
    Then I should see the "navbar dashboard icon" in the nav bar

  @NAV-5
  Scenario: NAV-5 Display navbar notifications icon
    Then I should see the "navbar notifications icon" in the nav bar
    And I should see the "navbar notifications badge" in the nav bar

  @NAV-6
  Scenario: NAV-6 Display navbar contact support icon
    Then I should see the "navbar contact support icon" in the nav bar

  @NAV-7
  Scenario: NAV-7 Display navbar search controls
    Then I should see the "navbar search input" in the nav bar
    And I should see the "navbar search button" in the nav bar

  @NAV-8
  Scenario: NAV-8 Toggle sidebar collapse and expand
    When I click the sidebar toggle button
    Then the sidebar should be collapsed
    When I click the sidebar toggle button
    Then the sidebar should be expanded

  @NAV-9
  Scenario: NAV-9 Navigate to dashboard via navbar brand
    When I click the "navbar brand link" in the nav bar
    Then I should be on the dashboard page

  @NAV-10
  Scenario: NAV-10 Click navbar refresh icon
    When I click the "navbar refresh icon" in the nav bar
    Then the dashboard should reload

  @NAV-11
  Scenario: NAV-11 Open notifications panel
    When I click the "navbar notifications icon" in the nav bar
    Then the notifications panel should be visible

  @NAV-12
  Scenario: NAV-12 Open contact support panel
    When I click the "navbar contact support icon" in the nav bar
    Then the contact support panel should be visible

  @NAV-13
  Scenario: NAV-13 Search from navbar
    When I type "test" in the navbar search input
    And I click the "navbar search button" in the nav bar
    Then I should be navigated to search results
