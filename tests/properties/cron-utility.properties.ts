/**
 * Cron Utility Page (SPA) — /spa/admins/cronutility
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_CRON_UTILITY_XPATH = "//li[@title='Cron Utility']//a[@href='/spa/admins/cronutility']";
export const SIDEBAR_CRON_UTILITY_ICON_XPATH = "//li[@title='Cron Utility']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_CRON_UTILITY_TEXT_XPATH = "//li[@title='Cron Utility']//p[normalize-space()='Cron Utility']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/admins/cronutility and capturing html/cron-utility.html

// ── Element Map (Gherkin-facing) ──
export const CRON_UTILITY_ELEMENTS: Record<string, string> = {
  'sidebar cron utility': SIDEBAR_CRON_UTILITY_XPATH,
  'sidebar cron utility icon': SIDEBAR_CRON_UTILITY_ICON_XPATH,
  'sidebar cron utility text': SIDEBAR_CRON_UTILITY_TEXT_XPATH,
};
