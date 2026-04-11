/**
 * RTWP Page (SPA) — Parent Menu (expandable)
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * Expandable parent menu — no direct URL. Click to reveal submenu children.
 * TODO: Surf live app to capture submenu items and page elements.
 */

// ── Sidebar Navigation ──
export const SIDEBAR_RTWP_XPATH = "//li[@title='RTWP']//a[contains(@style,'cursor: pointer')]";
export const SIDEBAR_RTWP_ICON_XPATH = "//li[@title='RTWP']//i[contains(@class,'material-icons') and text()='table_chart']";
export const SIDEBAR_RTWP_TEXT_XPATH = "//li[@title='RTWP']//p[normalize-space()='RTWP']";

// TODO: Add submenu children XPaths after expanding in live app
// export const RTWP_CHILD_<NAME>_XPATH = "//li[@title='RTWP']//ul//li//a[...]";

// ── Element Map (Gherkin-facing) ──
export const RTWP_ELEMENTS: Record<string, string> = {
  'sidebar rtwp': SIDEBAR_RTWP_XPATH,
  'sidebar rtwp icon': SIDEBAR_RTWP_ICON_XPATH,
  'sidebar rtwp text': SIDEBAR_RTWP_TEXT_XPATH,
};
