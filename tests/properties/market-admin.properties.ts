/**
 * Market Admin Page (SPA) — /spa/requests/marketadmin
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_MARKET_ADMIN_XPATH = "//li[@title='Market Admin']//a[@href='/spa/requests/marketadmin']";
export const SIDEBAR_MARKET_ADMIN_ICON_XPATH = "//li[@title='Market Admin']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_MARKET_ADMIN_TEXT_XPATH = "//li[@title='Market Admin']//p[normalize-space()='Market Admin']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/requests/marketadmin and capturing html/market-admin.html

// ── Element Map (Gherkin-facing) ──
export const MARKET_ADMIN_ELEMENTS: Record<string, string> = {
  'sidebar market admin': SIDEBAR_MARKET_ADMIN_XPATH,
  'sidebar market admin icon': SIDEBAR_MARKET_ADMIN_ICON_XPATH,
  'sidebar market admin text': SIDEBAR_MARKET_ADMIN_TEXT_XPATH,
};
