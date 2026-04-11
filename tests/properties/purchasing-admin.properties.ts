/**
 * Purchasing Admin Page (SPA) — /spa/pos/admin
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_PURCHASING_ADMIN_XPATH = "//li[@title='Purchasing Admin']//a[@href='/spa/pos/admin']";
export const SIDEBAR_PURCHASING_ADMIN_ICON_XPATH = "//li[@title='Purchasing Admin']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_PURCHASING_ADMIN_TEXT_XPATH = "//li[@title='Purchasing Admin']//p[normalize-space()='Purchasing Admin']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/pos/admin and capturing html/purchasing-admin.html

// ── Element Map (Gherkin-facing) ──
export const PURCHASING_ADMIN_ELEMENTS: Record<string, string> = {
  'sidebar purchasing admin': SIDEBAR_PURCHASING_ADMIN_XPATH,
  'sidebar purchasing admin icon': SIDEBAR_PURCHASING_ADMIN_ICON_XPATH,
  'sidebar purchasing admin text': SIDEBAR_PURCHASING_ADMIN_TEXT_XPATH,
};
