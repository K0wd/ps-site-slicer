/**
 * PMO Dashboard Page (SPA) — /spa/dashboard/index/pmo
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_PMO_DASHBOARD_XPATH = "//li[@title='PMO Dashboard']//a[@href='/spa/dashboard/index/pmo']";
export const SIDEBAR_PMO_DASHBOARD_ICON_XPATH = "//li[@title='PMO Dashboard']//i[contains(@class,'material-icons') and text()='table_chart']";
export const SIDEBAR_PMO_DASHBOARD_TEXT_XPATH = "//li[@title='PMO Dashboard']//p[normalize-space()='PMO Dashboard']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/dashboard/index/pmo and capturing html/pmo-dashboard.html

// ── Element Map (Gherkin-facing) ──
export const PMO_DASHBOARD_ELEMENTS: Record<string, string> = {
  'sidebar pmo dashboard': SIDEBAR_PMO_DASHBOARD_XPATH,
  'sidebar pmo dashboard icon': SIDEBAR_PMO_DASHBOARD_ICON_XPATH,
  'sidebar pmo dashboard text': SIDEBAR_PMO_DASHBOARD_TEXT_XPATH,
};
