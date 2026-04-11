/**
 * Reports Page (SPA) — /spa/reports/index
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_REPORTS_XPATH = "//li[@title='Reports']//a[@href='/spa/reports/index']";
export const SIDEBAR_REPORTS_ICON_XPATH = "//li[@title='Reports']//i[contains(@class,'material-icons') and text()='multiline_chart']";
export const SIDEBAR_REPORTS_TEXT_XPATH = "//li[@title='Reports']//p[normalize-space()='Reports']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/reports/index and capturing html/reports.html

// ── Element Map (Gherkin-facing) ──
export const REPORTS_ELEMENTS: Record<string, string> = {
  'sidebar reports': SIDEBAR_REPORTS_XPATH,
  'sidebar reports icon': SIDEBAR_REPORTS_ICON_XPATH,
  'sidebar reports text': SIDEBAR_REPORTS_TEXT_XPATH,
};
