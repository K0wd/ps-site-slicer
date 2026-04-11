/**
 * Keys Admin Page (SPA) — /spa/admin/keys
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_KEYS_ADMIN_XPATH = "//li[@title='Keys Admin']//a[@href='/spa/admin/keys']";
export const SIDEBAR_KEYS_ADMIN_ICON_XPATH = "//li[@title='Keys Admin']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_KEYS_ADMIN_TEXT_XPATH = "//li[@title='Keys Admin']//p[normalize-space()='Keys Admin']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/admin/keys and capturing html/keys-admin.html

// ── Element Map (Gherkin-facing) ──
export const KEYS_ADMIN_ELEMENTS: Record<string, string> = {
  'sidebar keys admin': SIDEBAR_KEYS_ADMIN_XPATH,
  'sidebar keys admin icon': SIDEBAR_KEYS_ADMIN_ICON_XPATH,
  'sidebar keys admin text': SIDEBAR_KEYS_ADMIN_TEXT_XPATH,
};
