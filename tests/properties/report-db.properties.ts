/**
 * Report DB Page (SPA) — /spa/admins/pma
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_REPORT_DB_XPATH = "//li[@title='Report DB']//a[@href='/spa/admins/pma']";
export const SIDEBAR_REPORT_DB_ICON_XPATH = "//li[@title='Report DB']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_REPORT_DB_TEXT_XPATH = "//li[@title='Report DB']//p[normalize-space()='Report DB']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/admins/pma and capturing html/report-db.html

// ── Element Map (Gherkin-facing) ──
export const REPORT_DB_ELEMENTS: Record<string, string> = {
  'sidebar report db': SIDEBAR_REPORT_DB_XPATH,
  'sidebar report db icon': SIDEBAR_REPORT_DB_ICON_XPATH,
  'sidebar report db text': SIDEBAR_REPORT_DB_TEXT_XPATH,
};
