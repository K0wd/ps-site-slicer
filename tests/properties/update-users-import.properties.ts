/**
 * Update Users Import Page (SPA) — /spa/users/import
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_UPDATE_USERS_IMPORT_XPATH = "//li[@title='Update Users Import']//a[@href='/spa/users/import']";
export const SIDEBAR_UPDATE_USERS_IMPORT_ICON_XPATH = "//li[@title='Update Users Import']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_UPDATE_USERS_IMPORT_TEXT_XPATH = "//li[@title='Update Users Import']//p[normalize-space()='Update Users Import']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/users/import and capturing html/update-users-import.html

// ── Element Map (Gherkin-facing) ──
export const UPDATE_USERS_IMPORT_ELEMENTS: Record<string, string> = {
  'sidebar update users import': SIDEBAR_UPDATE_USERS_IMPORT_XPATH,
  'sidebar update users import icon': SIDEBAR_UPDATE_USERS_IMPORT_ICON_XPATH,
  'sidebar update users import text': SIDEBAR_UPDATE_USERS_IMPORT_TEXT_XPATH,
};
