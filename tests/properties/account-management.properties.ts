/**
 * Account Management Page (SPA) — /spa/users/vendorselfedit
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_ACCOUNT_MANAGEMENT_XPATH = "//li[@title='Account Management']//a[@href='/spa/users/vendorselfedit']";
export const SIDEBAR_ACCOUNT_MANAGEMENT_ICON_XPATH = "//li[@title='Account Management']//i[contains(@class,'material-icons') and text()='table_chart']";
export const SIDEBAR_ACCOUNT_MANAGEMENT_TEXT_XPATH = "//li[@title='Account Management']//p[normalize-space()='Account Management']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/users/vendorselfedit and capturing html/account-management.html

// ── Element Map (Gherkin-facing) ──
export const ACCOUNT_MANAGEMENT_ELEMENTS: Record<string, string> = {
  'sidebar account management': SIDEBAR_ACCOUNT_MANAGEMENT_XPATH,
  'sidebar account management icon': SIDEBAR_ACCOUNT_MANAGEMENT_ICON_XPATH,
  'sidebar account management text': SIDEBAR_ACCOUNT_MANAGEMENT_TEXT_XPATH,
};
