/**
 * Time Zone Admin Page (SPA) — /spa/admins/states
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_TIME_ZONE_ADMIN_XPATH = "//li[@title='Time Zone Admin']//a[@href='/spa/admins/states']";
export const SIDEBAR_TIME_ZONE_ADMIN_ICON_XPATH = "//li[@title='Time Zone Admin']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_TIME_ZONE_ADMIN_TEXT_XPATH = "//li[@title='Time Zone Admin']//p[normalize-space()='Time Zone Admin']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/admins/states and capturing html/time-zone-admin.html

// ── Element Map (Gherkin-facing) ──
export const TIME_ZONE_ADMIN_ELEMENTS: Record<string, string> = {
  'sidebar time zone admin': SIDEBAR_TIME_ZONE_ADMIN_XPATH,
  'sidebar time zone admin icon': SIDEBAR_TIME_ZONE_ADMIN_ICON_XPATH,
  'sidebar time zone admin text': SIDEBAR_TIME_ZONE_ADMIN_TEXT_XPATH,
};
