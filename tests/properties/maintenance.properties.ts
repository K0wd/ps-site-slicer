/**
 * Maintenance Page (SPA) — /spa/sites/pickmarket
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_MAINTENANCE_XPATH = "//li[@title='Maintenance']//a[@href='/spa/sites/pickmarket']";
export const SIDEBAR_MAINTENANCE_ICON_XPATH = "//li[@title='Maintenance']//i[contains(@class,'material-icons') and text()='settings_input_antenna']";
export const SIDEBAR_MAINTENANCE_TEXT_XPATH = "//li[@title='Maintenance']//p[normalize-space()='Maintenance']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/sites/pickmarket and capturing html/maintenance.html

// ── Element Map (Gherkin-facing) ──
export const MAINTENANCE_ELEMENTS: Record<string, string> = {
  'sidebar maintenance': SIDEBAR_MAINTENANCE_XPATH,
  'sidebar maintenance icon': SIDEBAR_MAINTENANCE_ICON_XPATH,
  'sidebar maintenance text': SIDEBAR_MAINTENANCE_TEXT_XPATH,
};
