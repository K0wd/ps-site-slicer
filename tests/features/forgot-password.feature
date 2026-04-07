Feature: Forgot Password

  Background:
    Given I am on the forgot password page

  Scenario: Display page branding
    Then I should see the page title "Site Manager"
    And I should see the section title "Password Reset"
    And I should see the instructions text

  Scenario: Display reset form elements
    Then I should see the username input field
    And I should see the email input field
    And I should see the send access link button

  Scenario: Display navigation links
    Then I should see the login link
    And I should see the version info
