/**
 * Tax Group Admin Page (SPA) — /spa/main/taxes-admin
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_TAX_GROUP_ADMIN_XPATH = "//li[@title='Tax Group Admin']//a[@href='/spa/main/taxes-admin']";
export const SIDEBAR_TAX_GROUP_ADMIN_ICON_XPATH = "//li[@title='Tax Group Admin']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_TAX_GROUP_ADMIN_TEXT_XPATH = "//li[@title='Tax Group Admin']//p[normalize-space()='Tax Group Admin']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/main/taxes-admin and capturing html/tax-group-admin.html

// ── Element Map (Gherkin-facing) ──
export const TAX_GROUP_ADMIN_ELEMENTS: Record<string, string> = {
  'sidebar tax group admin': SIDEBAR_TAX_GROUP_ADMIN_XPATH,
  'sidebar tax group admin icon': SIDEBAR_TAX_GROUP_ADMIN_ICON_XPATH,
  'sidebar tax group admin text': SIDEBAR_TAX_GROUP_ADMIN_TEXT_XPATH,
};
