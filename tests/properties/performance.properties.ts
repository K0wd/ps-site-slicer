/**
 * Performance Page (SPA) — /spa/admins/timelogview
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_PERFORMANCE_XPATH = "//li[@title='Performance']//a[@href='/spa/admins/timelogview']";
export const SIDEBAR_PERFORMANCE_ICON_XPATH = "//li[@title='Performance']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_PERFORMANCE_TEXT_XPATH = "//li[@title='Performance']//p[normalize-space()='Performance']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/admins/timelogview and capturing html/performance.html

// ── Element Map (Gherkin-facing) ──
export const PERFORMANCE_ELEMENTS: Record<string, string> = {
  'sidebar performance': SIDEBAR_PERFORMANCE_XPATH,
  'sidebar performance icon': SIDEBAR_PERFORMANCE_ICON_XPATH,
  'sidebar performance text': SIDEBAR_PERFORMANCE_TEXT_XPATH,
};
