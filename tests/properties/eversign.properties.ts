/**
 * Eversign Page (SPA) — /spa/dashboard/onlinesigning
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_EVERSIGN_XPATH = "//li[@title='Eversign']//a[@href='/spa/dashboard/onlinesigning']";
export const SIDEBAR_EVERSIGN_ICON_XPATH = "//li[@title='Eversign']//i[contains(@class,'material-icons') and text()='fiber_new']";
export const SIDEBAR_EVERSIGN_TEXT_XPATH = "//li[@title='Eversign']//p[normalize-space()='Eversign']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/dashboard/onlinesigning and capturing html/eversign.html

// ── Element Map (Gherkin-facing) ──
export const EVERSIGN_ELEMENTS: Record<string, string> = {
  'sidebar eversign': SIDEBAR_EVERSIGN_XPATH,
  'sidebar eversign icon': SIDEBAR_EVERSIGN_ICON_XPATH,
  'sidebar eversign text': SIDEBAR_EVERSIGN_TEXT_XPATH,
};
