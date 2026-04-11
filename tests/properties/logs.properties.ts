/**
 * Logs Page (SPA) — /spa/admins/logs
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_LOGS_XPATH = "//li[@title='Logs']//a[@href='/spa/admins/logs']";
export const SIDEBAR_LOGS_ICON_XPATH = "//li[@title='Logs']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_LOGS_TEXT_XPATH = "//li[@title='Logs']//p[normalize-space()='Logs']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/admins/logs and capturing html/logs.html

// ── Element Map (Gherkin-facing) ──
export const LOGS_ELEMENTS: Record<string, string> = {
  'sidebar logs': SIDEBAR_LOGS_XPATH,
  'sidebar logs icon': SIDEBAR_LOGS_ICON_XPATH,
  'sidebar logs text': SIDEBAR_LOGS_TEXT_XPATH,
};
