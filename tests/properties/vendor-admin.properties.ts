/**
 * Vendor Admin Page (SPA) — /spa/main/vendors-admin
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_VENDOR_ADMIN_XPATH = "//li[@title='Vendor Admin']//a[@href='/spa/main/vendors-admin']";
export const SIDEBAR_VENDOR_ADMIN_ICON_XPATH = "//li[@title='Vendor Admin']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_VENDOR_ADMIN_TEXT_XPATH = "//li[@title='Vendor Admin']//p[normalize-space()='Vendor Admin']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/main/vendors-admin and capturing html/vendor-admin.html

// ── Element Map (Gherkin-facing) ──
export const VENDOR_ADMIN_ELEMENTS: Record<string, string> = {
  'sidebar vendor admin': SIDEBAR_VENDOR_ADMIN_XPATH,
  'sidebar vendor admin icon': SIDEBAR_VENDOR_ADMIN_ICON_XPATH,
  'sidebar vendor admin text': SIDEBAR_VENDOR_ADMIN_TEXT_XPATH,
};
