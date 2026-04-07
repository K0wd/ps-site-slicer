/**
 * Login Password Page (SPA - Angular 9) — /spa/auth/login
 * Source: html/login-password.html
 * Captured: 2026-04-07
 *
 * Shown after valid username is submitted from the PWA username step.
 */

// ── Navigation Bar ──
export const NAVBAR_LOGO_XPATH = "//img[@src='/main/downloads/logoimage']";
export const FORGOT_PASSWORD_LINK_XPATH = "//a[contains(@href, '/main/users/forgot')]";

// ── Login Card ──
export const LOGIN_CARD_TITLE_XPATH = "//h4[@class='card-title' and text()='Site Manager']";
export const PASSWORD_ICON_XPATH = "//i[@class='material-icons' and text()='lock_outline']";
export const PASSWORD_INPUT_XPATH = "//input[@name='password' and @type='password']";
export const VISIBILITY_TOGGLE_XPATH = "//mat-icon[text()='visibility_off']";
export const BACK_BUTTON_XPATH = "//button[@type='button' and contains(text(), 'Back')]";
export const LETS_GO_BUTTON_XPATH = "//button[@type='submit' and contains(text(), \"Let's go\")]";

// ── Footer ──
export const FOOTER_COMPANY_LINK_XPATH = "//a[@href='http://betacominc.com']";
export const FOOTER_HELP_LINK_XPATH = "//a[@href='mailto:itadmins@betacom.com']";
export const FOOTER_COPYRIGHT_XPATH = "//p[@class='copyright pull-right']";

// ── Safe Day's Alert Modal ──
export const SAFETY_MODAL_TITLE_XPATH = "//h1[@id='mat-dialog-title-0' and text()=\"Safe Day's Alert\"]";
export const SAFETY_MODAL_OK_XPATH = "//button[contains(@class, 'mat-raised-button') and text()='OK']";

// ── Notifications ──
export const ERROR_NOTIFICATION_XPATH = "//div[@role='alert']//span[@data-notify='message']";
export const NOTIFICATION_CLOSE_XPATH = "//button[@data-notify='dismiss']";

// ── Element Map (Gherkin-facing) ──
export const LOGIN_PASSWORD_ELEMENTS: Record<string, string> = {
  'navbar logo': NAVBAR_LOGO_XPATH,
  'forgot password link': FORGOT_PASSWORD_LINK_XPATH,
  'login card title': LOGIN_CARD_TITLE_XPATH,
  'password icon': PASSWORD_ICON_XPATH,
  'password input': PASSWORD_INPUT_XPATH,
  'visibility toggle': VISIBILITY_TOGGLE_XPATH,
  'back button': BACK_BUTTON_XPATH,
  "let's go button": LETS_GO_BUTTON_XPATH,
  'company link': FOOTER_COMPANY_LINK_XPATH,
  'help link': FOOTER_HELP_LINK_XPATH,
  'copyright': FOOTER_COPYRIGHT_XPATH,
  'safety modal title': SAFETY_MODAL_TITLE_XPATH,
  'safety modal ok': SAFETY_MODAL_OK_XPATH,
  'error notification': ERROR_NOTIFICATION_XPATH,
  'notification close': NOTIFICATION_CLOSE_XPATH,
};
