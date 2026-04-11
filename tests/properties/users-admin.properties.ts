/**
 * Users Admin Page (SPA) — /spa/users/index
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_USERS_ADMIN_XPATH = "//li[@title='Users Admin']//a[@href='/spa/users/index']";
export const SIDEBAR_USERS_ADMIN_ICON_XPATH = "//li[@title='Users Admin']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_USERS_ADMIN_TEXT_XPATH = "//li[@title='Users Admin']//p[normalize-space()='Users Admin']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/users/index and capturing html/users-admin.html

// ── Element Map (Gherkin-facing) ──
export const USERS_ADMIN_ELEMENTS: Record<string, string> = {
  'sidebar users admin': SIDEBAR_USERS_ADMIN_XPATH,
  'sidebar users admin icon': SIDEBAR_USERS_ADMIN_ICON_XPATH,
  'sidebar users admin text': SIDEBAR_USERS_ADMIN_TEXT_XPATH,
};
