/**
 * WO Tracker Page (SPA) — /spa/wots/index-new
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_WO_TRACKER_XPATH = "//li[@title='WO Tracker']//a[@href='/spa/wots/index-new']";
export const SIDEBAR_WO_TRACKER_ICON_XPATH = "//li[@title='WO Tracker']//i[contains(@class,'material-icons') and text()='table_chart']";
export const SIDEBAR_WO_TRACKER_TEXT_XPATH = "//li[@title='WO Tracker']//p[normalize-space()='WO Tracker']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/wots/index-new and capturing html/wo-tracker.html

// ── Element Map (Gherkin-facing) ──
export const WO_TRACKER_ELEMENTS: Record<string, string> = {
  'sidebar wo tracker': SIDEBAR_WO_TRACKER_XPATH,
  'sidebar wo tracker icon': SIDEBAR_WO_TRACKER_ICON_XPATH,
  'sidebar wo tracker text': SIDEBAR_WO_TRACKER_TEXT_XPATH,
};
