/**
 * Import Costs Page (SPA) — /spa/requests/importcosts
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_IMPORT_COSTS_XPATH = "//li[@title='Import Costs']//a[@href='/spa/requests/importcosts']";
export const SIDEBAR_IMPORT_COSTS_ICON_XPATH = "//li[@title='Import Costs']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_IMPORT_COSTS_TEXT_XPATH = "//li[@title='Import Costs']//p[normalize-space()='Import Costs']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/requests/importcosts and capturing html/import-costs.html

// ── Element Map (Gherkin-facing) ──
export const IMPORT_COSTS_ELEMENTS: Record<string, string> = {
  'sidebar import costs': SIDEBAR_IMPORT_COSTS_XPATH,
  'sidebar import costs icon': SIDEBAR_IMPORT_COSTS_ICON_XPATH,
  'sidebar import costs text': SIDEBAR_IMPORT_COSTS_TEXT_XPATH,
};
