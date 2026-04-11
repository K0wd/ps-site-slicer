/**
 * Capabilities Admin Page (SPA) — /spa/requests/capabilitiesadmin
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_CAPABILITIES_ADMIN_XPATH = "//li[@title='Capabilities Admin']//a[@href='/spa/requests/capabilitiesadmin']";
export const SIDEBAR_CAPABILITIES_ADMIN_ICON_XPATH = "//li[@title='Capabilities Admin']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_CAPABILITIES_ADMIN_TEXT_XPATH = "//li[@title='Capabilities Admin']//p[normalize-space()='Capabilities Admin']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/requests/capabilitiesadmin and capturing html/capabilities-admin.html

// ── Element Map (Gherkin-facing) ──
export const CAPABILITIES_ADMIN_ELEMENTS: Record<string, string> = {
  'sidebar capabilities admin': SIDEBAR_CAPABILITIES_ADMIN_XPATH,
  'sidebar capabilities admin icon': SIDEBAR_CAPABILITIES_ADMIN_ICON_XPATH,
  'sidebar capabilities admin text': SIDEBAR_CAPABILITIES_ADMIN_TEXT_XPATH,
};
