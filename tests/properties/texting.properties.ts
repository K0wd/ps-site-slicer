/**
 * Texting Page (SPA) — /spa/texting/index
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_TEXTING_XPATH = "//li[@title='Texting']//a[@href='/spa/texting/index']";
export const SIDEBAR_TEXTING_ICON_XPATH = "//li[@title='Texting']//i[contains(@class,'material-icons') and text()='message']";
export const SIDEBAR_TEXTING_TEXT_XPATH = "//li[@title='Texting']//p[normalize-space()='Texting']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/texting/index and capturing html/texting.html

// ── Element Map (Gherkin-facing) ──
export const TEXTING_ELEMENTS: Record<string, string> = {
  'sidebar texting': SIDEBAR_TEXTING_XPATH,
  'sidebar texting icon': SIDEBAR_TEXTING_ICON_XPATH,
  'sidebar texting text': SIDEBAR_TEXTING_TEXT_XPATH,
};
