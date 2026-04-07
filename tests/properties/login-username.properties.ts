/**
 * Login Username Page (SPA - Angular 9) — /spa/auth/login
 * Source: html/login-username.html
 * Captured: 2026-04-07
 *
 * First step of the SPA login. User enters username and clicks Next.
 */

// ── Navigation Bar ──
export const NAVBAR_LOGO_XPATH = "//img[@src='/main/downloads/logoimage']";
export const FORGOT_PASSWORD_LINK_XPATH = "//a[contains(@href, '/main/users/forgot')]";
export const FORGOT_PASSWORD_ICON_XPATH = "//i[@class='material-icons' and text()='fingerprint']";

// ── Login Card ──
export const LOGIN_CARD_TITLE_XPATH = "//h4[@class='card-title' and text()='Site Manager']";
export const USERNAME_ICON_XPATH = "//i[@class='material-icons' and text()='person']";
export const USERNAME_LABEL_XPATH = "//label[@class='control-label' and text()='Username']";
export const USERNAME_INPUT_XPATH = "//input[@name='username' and @type='username']";
export const NEXT_BUTTON_XPATH = "//button[@type='submit' and contains(text(), 'Next')]";

// ── Footer ──
export const FOOTER_COMPANY_LINK_XPATH = "//a[@href='http://betacominc.com']";
export const FOOTER_HELP_LINK_XPATH = "//a[@href='mailto:itadmins@betacom.com']";
export const FOOTER_COPYRIGHT_XPATH = "//p[@class='copyright pull-right']";

// ── Element Map (Gherkin-facing) ──
export const LOGIN_USERNAME_ELEMENTS: Record<string, string> = {
  'navbar logo': NAVBAR_LOGO_XPATH,
  'forgot password link': FORGOT_PASSWORD_LINK_XPATH,
  'forgot password icon': FORGOT_PASSWORD_ICON_XPATH,
  'login card title': LOGIN_CARD_TITLE_XPATH,
  'username icon': USERNAME_ICON_XPATH,
  'username label': USERNAME_LABEL_XPATH,
  'username input': USERNAME_INPUT_XPATH,
  'next button': NEXT_BUTTON_XPATH,
  'company link': FOOTER_COMPANY_LINK_XPATH,
  'help link': FOOTER_HELP_LINK_XPATH,
  'copyright': FOOTER_COPYRIGHT_XPATH,
};
