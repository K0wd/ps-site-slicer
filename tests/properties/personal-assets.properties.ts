/**
 * Personal Assets Page (SPA) — /spa/passets/index
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_PERSONAL_ASSETS_XPATH = "//li[@title='Personal Assets']//a[@href='/spa/passets/index']";
export const SIDEBAR_PERSONAL_ASSETS_ICON_XPATH = "//li[@title='Personal Assets']//i[contains(@class,'material-icons') and text()='phonelink']";
export const SIDEBAR_PERSONAL_ASSETS_TEXT_XPATH = "//li[@title='Personal Assets']//p[normalize-space()='Personal Assets']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/passets/index and capturing html/personal-assets.html

// ── Element Map (Gherkin-facing) ──
export const PERSONAL_ASSETS_ELEMENTS: Record<string, string> = {
  'sidebar personal assets': SIDEBAR_PERSONAL_ASSETS_XPATH,
  'sidebar personal assets icon': SIDEBAR_PERSONAL_ASSETS_ICON_XPATH,
  'sidebar personal assets text': SIDEBAR_PERSONAL_ASSETS_TEXT_XPATH,
};
