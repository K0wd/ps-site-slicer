/**
 * UAC System Page (SPA) — /spa/uac/index
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_UAC_SYSTEM_XPATH = "//li[@title='UAC System']//a[@href='/spa/uac/index']";
export const SIDEBAR_UAC_SYSTEM_ICON_XPATH = "//li[@title='UAC System']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_UAC_SYSTEM_TEXT_XPATH = "//li[@title='UAC System']//p[normalize-space()='UAC System']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/uac/index and capturing html/uac-system.html

// ── Element Map (Gherkin-facing) ──
export const UAC_SYSTEM_ELEMENTS: Record<string, string> = {
  'sidebar uac system': SIDEBAR_UAC_SYSTEM_XPATH,
  'sidebar uac system icon': SIDEBAR_UAC_SYSTEM_ICON_XPATH,
  'sidebar uac system text': SIDEBAR_UAC_SYSTEM_TEXT_XPATH,
};
