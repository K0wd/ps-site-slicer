/**
 * PMO SharePoint Dashboard Page (SPA) — /spa/iframes/sharepoint1
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_PMO_SHAREPOINT_DASHBOARD_XPATH = "//li[@title='PMO SharePoint Dashboard']//a[@href='/spa/iframes/sharepoint1']";
export const SIDEBAR_PMO_SHAREPOINT_DASHBOARD_ICON_XPATH = "//li[@title='PMO SharePoint Dashboard']//i[contains(@class,'material-icons') and text()='table_chart']";
export const SIDEBAR_PMO_SHAREPOINT_DASHBOARD_TEXT_XPATH = "//li[@title='PMO SharePoint Dashboard']//p[normalize-space()='PMO SharePoint Dashboard']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/iframes/sharepoint1 and capturing html/pmo-sharepoint-dashboard.html

// ── Element Map (Gherkin-facing) ──
export const PMO_SHAREPOINT_DASHBOARD_ELEMENTS: Record<string, string> = {
  'sidebar pmo sharepoint dashboard': SIDEBAR_PMO_SHAREPOINT_DASHBOARD_XPATH,
  'sidebar pmo sharepoint dashboard icon': SIDEBAR_PMO_SHAREPOINT_DASHBOARD_ICON_XPATH,
  'sidebar pmo sharepoint dashboard text': SIDEBAR_PMO_SHAREPOINT_DASHBOARD_TEXT_XPATH,
};
