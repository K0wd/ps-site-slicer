/**
 * LOB Admin Page (SPA) — /spa/main/lob-admin
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_LOB_ADMIN_XPATH = "//li[@title='LOB Admin']//a[@href='/spa/main/lob-admin']";
export const SIDEBAR_LOB_ADMIN_ICON_XPATH = "//li[@title='LOB Admin']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_LOB_ADMIN_TEXT_XPATH = "//li[@title='LOB Admin']//p[normalize-space()='LOB Admin']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/main/lob-admin and capturing html/lob-admin.html

// ── Element Map (Gherkin-facing) ──
export const LOB_ADMIN_ELEMENTS: Record<string, string> = {
  'sidebar lob admin': SIDEBAR_LOB_ADMIN_XPATH,
  'sidebar lob admin icon': SIDEBAR_LOB_ADMIN_ICON_XPATH,
  'sidebar lob admin text': SIDEBAR_LOB_ADMIN_TEXT_XPATH,
};
