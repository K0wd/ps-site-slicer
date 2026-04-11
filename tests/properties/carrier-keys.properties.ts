/**
 * Carrier Keys Page (SPA) — /spa/carriers/index
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_CARRIER_KEYS_XPATH = "//li[@title='Carrier Keys']//a[@href='/spa/carriers/index']";
export const SIDEBAR_CARRIER_KEYS_ICON_XPATH = "//li[@title='Carrier Keys']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_CARRIER_KEYS_TEXT_XPATH = "//li[@title='Carrier Keys']//p[normalize-space()='Carrier Keys']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/carriers/index and capturing html/carrier-keys.html

// ── Element Map (Gherkin-facing) ──
export const CARRIER_KEYS_ELEMENTS: Record<string, string> = {
  'sidebar carrier keys': SIDEBAR_CARRIER_KEYS_XPATH,
  'sidebar carrier keys icon': SIDEBAR_CARRIER_KEYS_ICON_XPATH,
  'sidebar carrier keys text': SIDEBAR_CARRIER_KEYS_TEXT_XPATH,
};
