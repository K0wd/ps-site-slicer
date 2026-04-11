/**
 * Incidents Admin Page (SPA) — /spa/incidents/index-new
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_INCIDENTS_ADMIN_XPATH = "//li[@title='Incidents Admin']//a[@href='/spa/incidents/index-new']";
export const SIDEBAR_INCIDENTS_ADMIN_ICON_XPATH = "//li[@title='Incidents Admin']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_INCIDENTS_ADMIN_TEXT_XPATH = "//li[@title='Incidents Admin']//p[normalize-space()='Incidents Admin']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/incidents/index-new and capturing html/incidents-admin.html

// ── Element Map (Gherkin-facing) ──
export const INCIDENTS_ADMIN_ELEMENTS: Record<string, string> = {
  'sidebar incidents admin': SIDEBAR_INCIDENTS_ADMIN_XPATH,
  'sidebar incidents admin icon': SIDEBAR_INCIDENTS_ADMIN_ICON_XPATH,
  'sidebar incidents admin text': SIDEBAR_INCIDENTS_ADMIN_TEXT_XPATH,
};
