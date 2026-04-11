Feature: Nav Bar

  Background:
    Given I am logged in and on the dashboard

  Scenario: Display sidebar toggle button
    Then I should see the "sidebar toggle button" in the nav bar

  Scenario: Display navbar brand link
    Then I should see the "navbar brand link" in the nav bar

  Scenario: Display navbar refresh icon
    Then I should see the "navbar refresh icon" in the nav bar

  Scenario: Display navbar dashboard icon
    Then I should see the "navbar dashboard icon" in the nav bar

  Scenario: Display navbar notifications icon
    Then I should see the "navbar notifications icon" in the nav bar
    And I should see the "navbar notifications badge" in the nav bar

  Scenario: Display navbar contact support icon
    Then I should see the "navbar contact support icon" in the nav bar

  Scenario: Display navbar search controls
    Then I should see the "navbar search input" in the nav bar
    And I should see the "navbar search button" in the nav bar

  Scenario: Toggle sidebar collapse and expand
    When I click the sidebar toggle button
    Then the sidebar should be collapsed
    When I click the sidebar toggle button
    Then the sidebar should be expanded

  Scenario: Navigate to dashboard via navbar brand
    When I click the "navbar brand link" in the nav bar
    Then I should be on the dashboard page

  Scenario: Click navbar refresh icon
    When I click the "navbar refresh icon" in the nav bar
    Then the dashboard should reload

  Scenario: Open notifications panel
    When I click the "navbar notifications icon" in the nav bar
    Then the notifications panel should be visible

  Scenario: Open contact support panel
    When I click the "navbar contact support icon" in the nav bar
    Then the contact support panel should be visible

  Scenario: Search from navbar
    When I type "test" in the navbar search input
    And I click the "navbar search button" in the nav bar
    Then I should be navigated to search results
