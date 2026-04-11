/**
 * IT Support Page (SPA) — /spa/ittickets/freshdesklogin
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_IT_SUPPORT_XPATH = "//li[@title='IT Support']//a[@href='/spa/ittickets/freshdesklogin']";
export const SIDEBAR_IT_SUPPORT_ICON_XPATH = "//li[@title='IT Support']//i[contains(@class,'material-icons') and text()='help']";
export const SIDEBAR_IT_SUPPORT_TEXT_XPATH = "//li[@title='IT Support']//p[normalize-space()='IT Support']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/ittickets/freshdesklogin and capturing html/it-support.html

// ── Element Map (Gherkin-facing) ──
export const IT_SUPPORT_ELEMENTS: Record<string, string> = {
  'sidebar it support': SIDEBAR_IT_SUPPORT_XPATH,
  'sidebar it support icon': SIDEBAR_IT_SUPPORT_ICON_XPATH,
  'sidebar it support text': SIDEBAR_IT_SUPPORT_TEXT_XPATH,
};
