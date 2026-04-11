/**
 * Temp Files Page (SPA) — /spa/downloads/temps
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_TEMP_FILES_XPATH = "//li[@title='Temp Files']//a[@href='/spa/downloads/temps']";
export const SIDEBAR_TEMP_FILES_ICON_XPATH = "//li[@title='Temp Files']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_TEMP_FILES_TEXT_XPATH = "//li[@title='Temp Files']//p[normalize-space()='Temp Files']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/downloads/temps and capturing html/temp-files.html

// ── Element Map (Gherkin-facing) ──
export const TEMP_FILES_ELEMENTS: Record<string, string> = {
  'sidebar temp files': SIDEBAR_TEMP_FILES_XPATH,
  'sidebar temp files icon': SIDEBAR_TEMP_FILES_ICON_XPATH,
  'sidebar temp files text': SIDEBAR_TEMP_FILES_TEXT_XPATH,
};
