/**
 * Mobile Assets Page (SPA) — /spa/generators/index
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_MOBILE_ASSETS_XPATH = "//li[@title='Mobile Assets']//a[@href='/spa/generators/index']";
export const SIDEBAR_MOBILE_ASSETS_ICON_XPATH = "//li[@title='Mobile Assets']//i[contains(@class,'material-icons') and text()='commute']";
export const SIDEBAR_MOBILE_ASSETS_TEXT_XPATH = "//li[@title='Mobile Assets']//p[normalize-space()='Mobile Assets']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/generators/index and capturing html/mobile-assets.html

// ── Element Map (Gherkin-facing) ──
export const MOBILE_ASSETS_ELEMENTS: Record<string, string> = {
  'sidebar mobile assets': SIDEBAR_MOBILE_ASSETS_XPATH,
  'sidebar mobile assets icon': SIDEBAR_MOBILE_ASSETS_ICON_XPATH,
  'sidebar mobile assets text': SIDEBAR_MOBILE_ASSETS_TEXT_XPATH,
};
