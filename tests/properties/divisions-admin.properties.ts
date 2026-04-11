/**
 * Divisions Admin Page (SPA) — /spa/main/division-admin
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_DIVISIONS_ADMIN_XPATH = "//li[@title='Divisions Admin']//a[@href='/spa/main/division-admin']";
export const SIDEBAR_DIVISIONS_ADMIN_ICON_XPATH = "//li[@title='Divisions Admin']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_DIVISIONS_ADMIN_TEXT_XPATH = "//li[@title='Divisions Admin']//p[normalize-space()='Divisions Admin']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/main/division-admin and capturing html/divisions-admin.html

// ── Element Map (Gherkin-facing) ──
export const DIVISIONS_ADMIN_ELEMENTS: Record<string, string> = {
  'sidebar divisions admin': SIDEBAR_DIVISIONS_ADMIN_XPATH,
  'sidebar divisions admin icon': SIDEBAR_DIVISIONS_ADMIN_ICON_XPATH,
  'sidebar divisions admin text': SIDEBAR_DIVISIONS_ADMIN_TEXT_XPATH,
};
