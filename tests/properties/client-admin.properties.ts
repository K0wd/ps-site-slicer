/**
 * Client Admin Page (SPA) — /spa/clientmanagements/index
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_CLIENT_ADMIN_XPATH = "//li[@title='Client Admin']//a[@href='/spa/clientmanagements/index']";
export const SIDEBAR_CLIENT_ADMIN_ICON_XPATH = "//li[@title='Client Admin']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_CLIENT_ADMIN_TEXT_XPATH = "//li[@title='Client Admin']//p[normalize-space()='Client Admin']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/clientmanagements/index and capturing html/client-admin.html

// ── Element Map (Gherkin-facing) ──
export const CLIENT_ADMIN_ELEMENTS: Record<string, string> = {
  'sidebar client admin': SIDEBAR_CLIENT_ADMIN_XPATH,
  'sidebar client admin icon': SIDEBAR_CLIENT_ADMIN_ICON_XPATH,
  'sidebar client admin text': SIDEBAR_CLIENT_ADMIN_TEXT_XPATH,
};
