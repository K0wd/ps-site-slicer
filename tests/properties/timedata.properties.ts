/**
 * Timedata Page (SPA) — /spa/timedatas/index
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_TIMEDATA_XPATH = "//li[@title='Timedata']//a[@href='/spa/timedatas/index']";
export const SIDEBAR_TIMEDATA_ICON_XPATH = "//li[@title='Timedata']//i[contains(@class,'material-icons') and text()='table_chart']";
export const SIDEBAR_TIMEDATA_TEXT_XPATH = "//li[@title='Timedata']//p[normalize-space()='Timedata']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/timedatas/index and capturing html/timedata.html

// ── Element Map (Gherkin-facing) ──
export const TIMEDATA_ELEMENTS: Record<string, string> = {
  'sidebar timedata': SIDEBAR_TIMEDATA_XPATH,
  'sidebar timedata icon': SIDEBAR_TIMEDATA_ICON_XPATH,
  'sidebar timedata text': SIDEBAR_TIMEDATA_TEXT_XPATH,
};
