/**
 * DB Query Screen Page (SPA) — /spa/dbupdates/query
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_DB_QUERY_SCREEN_XPATH = "//li[@title='DB Query Screen']//a[@href='/spa/dbupdates/query']";
export const SIDEBAR_DB_QUERY_SCREEN_ICON_XPATH = "//li[@title='DB Query Screen']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_DB_QUERY_SCREEN_TEXT_XPATH = "//li[@title='DB Query Screen']//p[normalize-space()='DB Query Screen']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/dbupdates/query and capturing html/db-query-screen.html

// ── Element Map (Gherkin-facing) ──
export const DB_QUERY_SCREEN_ELEMENTS: Record<string, string> = {
  'sidebar db query screen': SIDEBAR_DB_QUERY_SCREEN_XPATH,
  'sidebar db query screen icon': SIDEBAR_DB_QUERY_SCREEN_ICON_XPATH,
  'sidebar db query screen text': SIDEBAR_DB_QUERY_SCREEN_TEXT_XPATH,
};
