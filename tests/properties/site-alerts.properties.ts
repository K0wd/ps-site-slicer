/**
 * Site Alerts Page (SPA) — /spa/sitealerts/index
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_SITE_ALERTS_XPATH = "//li[@title='Site Alerts']//a[@href='/spa/sitealerts/index']";
export const SIDEBAR_SITE_ALERTS_ICON_XPATH = "//li[@title='Site Alerts']//i[contains(@class,'material-icons') and text()='alarm']";
export const SIDEBAR_SITE_ALERTS_TEXT_XPATH = "//li[@title='Site Alerts']//p[normalize-space()='Site Alerts']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/sitealerts/index and capturing html/site-alerts.html

// ── Element Map (Gherkin-facing) ──
export const SITE_ALERTS_ELEMENTS: Record<string, string> = {
  'sidebar site alerts': SIDEBAR_SITE_ALERTS_XPATH,
  'sidebar site alerts icon': SIDEBAR_SITE_ALERTS_ICON_XPATH,
  'sidebar site alerts text': SIDEBAR_SITE_ALERTS_TEXT_XPATH,
};
