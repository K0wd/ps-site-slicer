/**
 * Admin Alerts Page (SPA) — /spa/uac/admin_alerts
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_ADMIN_ALERTS_XPATH = "//li[@title='Admin Alerts']//a[@href='/spa/uac/admin_alerts']";
export const SIDEBAR_ADMIN_ALERTS_ICON_XPATH = "//li[@title='Admin Alerts']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_ADMIN_ALERTS_TEXT_XPATH = "//li[@title='Admin Alerts']//p[normalize-space()='Admin Alerts']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/uac/admin_alerts and capturing html/admin-alerts.html

// ── Element Map (Gherkin-facing) ──
export const ADMIN_ALERTS_ELEMENTS: Record<string, string> = {
  'sidebar admin alerts': SIDEBAR_ADMIN_ALERTS_XPATH,
  'sidebar admin alerts icon': SIDEBAR_ADMIN_ALERTS_ICON_XPATH,
  'sidebar admin alerts text': SIDEBAR_ADMIN_ALERTS_TEXT_XPATH,
};
