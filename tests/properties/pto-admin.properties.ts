/**
 * PTO Admin Page (SPA) — /spa/timesheets/benefitsadmin
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_PTO_ADMIN_XPATH = "//li[@title='PTO Admin']//a[@href='/spa/timesheets/benefitsadmin']";
export const SIDEBAR_PTO_ADMIN_ICON_XPATH = "//li[@title='PTO Admin']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_PTO_ADMIN_TEXT_XPATH = "//li[@title='PTO Admin']//p[normalize-space()='PTO Admin']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/timesheets/benefitsadmin and capturing html/pto-admin.html

// ── Element Map (Gherkin-facing) ──
export const PTO_ADMIN_ELEMENTS: Record<string, string> = {
  'sidebar pto admin': SIDEBAR_PTO_ADMIN_XPATH,
  'sidebar pto admin icon': SIDEBAR_PTO_ADMIN_ICON_XPATH,
  'sidebar pto admin text': SIDEBAR_PTO_ADMIN_TEXT_XPATH,
};
