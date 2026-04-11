/**
 * Drivers Admin Page (SPA) — /spa/Drivers/index
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_DRIVERS_ADMIN_XPATH = "//li[@title='Drivers Admin']//a[@href='/spa/Drivers/index']";
export const SIDEBAR_DRIVERS_ADMIN_ICON_XPATH = "//li[@title='Drivers Admin']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_DRIVERS_ADMIN_TEXT_XPATH = "//li[@title='Drivers Admin']//p[normalize-space()='Drivers Admin']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/Drivers/index and capturing html/drivers-admin.html

// ── Element Map (Gherkin-facing) ──
export const DRIVERS_ADMIN_ELEMENTS: Record<string, string> = {
  'sidebar drivers admin': SIDEBAR_DRIVERS_ADMIN_XPATH,
  'sidebar drivers admin icon': SIDEBAR_DRIVERS_ADMIN_ICON_XPATH,
  'sidebar drivers admin text': SIDEBAR_DRIVERS_ADMIN_TEXT_XPATH,
};
