/**
 * Vendor Admin-Old Page (SPA) — /spa/users/vendorreview
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_VENDOR_ADMIN_OLD_XPATH = "//li[@title='Vendor Admin-Old']//a[@href='/spa/users/vendorreview']";
export const SIDEBAR_VENDOR_ADMIN_OLD_ICON_XPATH = "//li[@title='Vendor Admin-Old']//i[contains(@class,'material-icons') and text()='business']";
export const SIDEBAR_VENDOR_ADMIN_OLD_TEXT_XPATH = "//li[@title='Vendor Admin-Old']//p[normalize-space()='Vendor Admin-Old']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/users/vendorreview and capturing html/vendor-admin-old.html

// ── Element Map (Gherkin-facing) ──
export const VENDOR_ADMIN_OLD_ELEMENTS: Record<string, string> = {
  'sidebar vendor admin-old': SIDEBAR_VENDOR_ADMIN_OLD_XPATH,
  'sidebar vendor admin-old icon': SIDEBAR_VENDOR_ADMIN_OLD_ICON_XPATH,
  'sidebar vendor admin-old text': SIDEBAR_VENDOR_ADMIN_OLD_TEXT_XPATH,
};
