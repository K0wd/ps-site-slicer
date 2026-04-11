/**
 * UI Config Page (SPA) — /spa/keys/uiconfig
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_UI_CONFIG_XPATH = "//li[@title='UI Config']//a[@href='/spa/keys/uiconfig']";
export const SIDEBAR_UI_CONFIG_ICON_XPATH = "//li[@title='UI Config']//i[contains(@class,'material-icons') and text()='multiline_chart']";
export const SIDEBAR_UI_CONFIG_TEXT_XPATH = "//li[@title='UI Config']//p[normalize-space()='UI Config']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/keys/uiconfig and capturing html/ui-config.html

// ── Element Map (Gherkin-facing) ──
export const UI_CONFIG_ELEMENTS: Record<string, string> = {
  'sidebar ui config': SIDEBAR_UI_CONFIG_XPATH,
  'sidebar ui config icon': SIDEBAR_UI_CONFIG_ICON_XPATH,
  'sidebar ui config text': SIDEBAR_UI_CONFIG_TEXT_XPATH,
};
