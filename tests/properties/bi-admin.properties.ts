/**
 * BI Admin Page (SPA) — /spa/bi/dashboardlist
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_BI_ADMIN_XPATH = "//li[@title='BI Admin']//a[@href='/spa/bi/dashboardlist']";
export const SIDEBAR_BI_ADMIN_ICON_XPATH = "//li[@title='BI Admin']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_BI_ADMIN_TEXT_XPATH = "//li[@title='BI Admin']//p[normalize-space()='BI Admin']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/bi/dashboardlist and capturing html/bi-admin.html

// ── Element Map (Gherkin-facing) ──
export const BI_ADMIN_ELEMENTS: Record<string, string> = {
  'sidebar bi admin': SIDEBAR_BI_ADMIN_XPATH,
  'sidebar bi admin icon': SIDEBAR_BI_ADMIN_ICON_XPATH,
  'sidebar bi admin text': SIDEBAR_BI_ADMIN_TEXT_XPATH,
};
