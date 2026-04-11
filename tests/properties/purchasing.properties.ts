/**
 * Purchasing Page (SPA) — /spa/pos/index-new
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_PURCHASING_XPATH = "//li[@title='Purchasing']//a[@href='/spa/pos/index-new']";
export const SIDEBAR_PURCHASING_ICON_XPATH = "//li[@title='Purchasing']//i[contains(@class,'material-icons') and text()='monetization_on']";
export const SIDEBAR_PURCHASING_TEXT_XPATH = "//li[@title='Purchasing']//p[normalize-space()='Purchasing']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/pos/index-new and capturing html/purchasing.html

// ── Element Map (Gherkin-facing) ──
export const PURCHASING_ELEMENTS: Record<string, string> = {
  'sidebar purchasing': SIDEBAR_PURCHASING_XPATH,
  'sidebar purchasing icon': SIDEBAR_PURCHASING_ICON_XPATH,
  'sidebar purchasing text': SIDEBAR_PURCHASING_TEXT_XPATH,
};
