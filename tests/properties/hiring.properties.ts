/**
 * Hiring Page (SPA) — /spa/hires/index
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_HIRING_XPATH = "//li[@title='Hiring']//a[@href='/spa/hires/index']";
export const SIDEBAR_HIRING_ICON_XPATH = "//li[@title='Hiring']//i[contains(@class,'material-icons') and text()='fiber_new']";
export const SIDEBAR_HIRING_TEXT_XPATH = "//li[@title='Hiring']//p[normalize-space()='Hiring']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/hires/index and capturing html/hiring.html

// ── Element Map (Gherkin-facing) ──
export const HIRING_ELEMENTS: Record<string, string> = {
  'sidebar hiring': SIDEBAR_HIRING_XPATH,
  'sidebar hiring icon': SIDEBAR_HIRING_ICON_XPATH,
  'sidebar hiring text': SIDEBAR_HIRING_TEXT_XPATH,
};
