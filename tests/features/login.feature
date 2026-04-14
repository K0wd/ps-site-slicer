Feature: Login

  @smoke
  Scenario: Login flow — UI branding and full authentication
    # -- Username page UI (soft: isolates visual regressions) --
    Given I am on the login page
    Then I should see the app logo
    And I should see the app title "Site Manager"
    And I should see the username input
    And I should see the next button
    # -- Submit username --
    When I enter my username
    And I click the next button
    # -- Password page UI (soft: isolates visual regressions) --
    Then I should be redirected to the password page
    And I should see the password input
    And I should see the "Let's go" button
    And I should see the back button
    # -- Full login --
    When I enter my password
    And I click the "Let's go" button
    Then I should see the Safe Day's Alert modal
    When I dismiss the Safe Day's Alert
    Then I should be on the dashboard
