/**
 * Quoting Page (SPA) — /spa/boms/index-new
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_QUOTING_XPATH = "//li[@title='Quoting']//a[@href='/spa/boms/index-new']";
export const SIDEBAR_QUOTING_ICON_XPATH = "//li[@title='Quoting']//i[contains(@class,'material-icons') and text()='money']";
export const SIDEBAR_QUOTING_TEXT_XPATH = "//li[@title='Quoting']//p[normalize-space()='Quoting']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/boms/index-new and capturing html/quoting.html

// ── Element Map (Gherkin-facing) ──
export const QUOTING_ELEMENTS: Record<string, string> = {
  'sidebar quoting': SIDEBAR_QUOTING_XPATH,
  'sidebar quoting icon': SIDEBAR_QUOTING_ICON_XPATH,
  'sidebar quoting text': SIDEBAR_QUOTING_TEXT_XPATH,
};
