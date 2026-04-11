/**
 * Maintenance Admin Page (SPA) — /spa/requests/maintadmin
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_MAINTENANCE_ADMIN_XPATH = "//li[@title='Maintenance Admin']//a[@href='/spa/requests/maintadmin']";
export const SIDEBAR_MAINTENANCE_ADMIN_ICON_XPATH = "//li[@title='Maintenance Admin']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_MAINTENANCE_ADMIN_TEXT_XPATH = "//li[@title='Maintenance Admin']//p[normalize-space()='Maintenance Admin']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/requests/maintadmin and capturing html/maintenance-admin.html

// ── Element Map (Gherkin-facing) ──
export const MAINTENANCE_ADMIN_ELEMENTS: Record<string, string> = {
  'sidebar maintenance admin': SIDEBAR_MAINTENANCE_ADMIN_XPATH,
  'sidebar maintenance admin icon': SIDEBAR_MAINTENANCE_ADMIN_ICON_XPATH,
  'sidebar maintenance admin text': SIDEBAR_MAINTENANCE_ADMIN_TEXT_XPATH,
};
