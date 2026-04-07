/**
 * Forgot Password Page — /main/users/forgot
 * Source: html/forgot-password.html
 * Captured: 2026-04-08
 *
 * Accessible via "Forgot Password" link on the SPA login page.
 * Contains username and email fields for requesting a password reset link.
 */

// ── Branding ──
export const PAGE_TITLE_XPATH = "//h1[contains(., 'Site Manager')]";
export const SECTION_TITLE_XPATH = "//h3[text()='Password Reset']";
export const INSTRUCTIONS_XPATH = "//p[contains(text(), 'Please provide the following information')]";

// ── Form Elements ──
export const USERNAME_INPUT_XPATH = "//input[@id='form-username' and @placeholder='Username...']";
export const EMAIL_INPUT_XPATH = "//input[@id='UserEmail' and @placeholder='Email...']";
export const SEND_ACCESS_LINK_BUTTON_XPATH = "//button[normalize-space()='Send Access Link']";

// ── Navigation ──
export const LOGIN_LINK_XPATH = "//a[contains(@href, '/main/users/login') and contains(normalize-space(), 'Login')]";
export const HELP_ICON_XPATH = "//i[contains(@class, 'fa-question-circle')]";

// ── Footer ──
export const VERSION_XPATH = "//*[contains(text(), 'Betacom Site Manager Version')]";

// ── Element Map (Gherkin-facing) ──
export const FORGOT_PASSWORD_ELEMENTS: Record<string, string> = {
  'page title': PAGE_TITLE_XPATH,
  'section title': SECTION_TITLE_XPATH,
  'instructions': INSTRUCTIONS_XPATH,
  'username input': USERNAME_INPUT_XPATH,
  'email input': EMAIL_INPUT_XPATH,
  'send access link button': SEND_ACCESS_LINK_BUTTON_XPATH,
  'login link': LOGIN_LINK_XPATH,
  'version': VERSION_XPATH,
};
