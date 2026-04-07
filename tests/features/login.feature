Feature: Login

  Scenario: Display the username page
    Given I am on the login page
    Then I should see the app logo
    And I should see the app title "Site Manager"
    And I should see the username input
    And I should see the next button

  Scenario: Submit username and see password page
    Given I am on the login page
    When I enter my username
    And I click the next button
    Then I should be redirected to the password page
    And I should see the password input
    And I should see the "Let's go" button
    And I should see the back button

  Scenario: Login with valid credentials
    Given I am on the login page
    When I enter my username
    And I click the next button
    And I enter my password
    And I click the "Let's go" button
    Then I should see the Safe Day's Alert modal
    When I dismiss the Safe Day's Alert
    Then I should be on the dashboard
