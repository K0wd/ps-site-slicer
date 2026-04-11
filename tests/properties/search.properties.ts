/**
 * Search Page (SPA) — /spa/requests/searchtab
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_SEARCH_XPATH = "//li[@title='Search']//a[@href='/spa/requests/searchtab']";
export const SIDEBAR_SEARCH_ICON_XPATH = "//li[@title='Search']//i[contains(@class,'material-icons') and text()='search']";
export const SIDEBAR_SEARCH_TEXT_XPATH = "//li[@title='Search']//p[normalize-space()='Search']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/requests/searchtab and capturing html/search.html

// ── Element Map (Gherkin-facing) ──
export const SEARCH_ELEMENTS: Record<string, string> = {
  'sidebar search': SIDEBAR_SEARCH_XPATH,
  'sidebar search icon': SIDEBAR_SEARCH_ICON_XPATH,
  'sidebar search text': SIDEBAR_SEARCH_TEXT_XPATH,
};
