/**
 * Timesheets Page (SPA) — /spa/timesheets/review
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_TIMESHEETS_XPATH = "//li[@title='Timesheets']//a[@href='/spa/timesheets/review']";
export const SIDEBAR_TIMESHEETS_ICON_XPATH = "//li[@title='Timesheets']//i[contains(@class,'material-icons') and text()='history']";
export const SIDEBAR_TIMESHEETS_TEXT_XPATH = "//li[@title='Timesheets']//p[normalize-space()='Timesheets']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/timesheets/review and capturing html/timesheets.html

// ── Element Map (Gherkin-facing) ──
export const TIMESHEETS_ELEMENTS: Record<string, string> = {
  'sidebar timesheets': SIDEBAR_TIMESHEETS_XPATH,
  'sidebar timesheets icon': SIDEBAR_TIMESHEETS_ICON_XPATH,
  'sidebar timesheets text': SIDEBAR_TIMESHEETS_TEXT_XPATH,
};
