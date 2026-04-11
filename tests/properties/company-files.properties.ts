/**
 * Company Files Page (SPA) — /spa/commons/index
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_COMPANY_FILES_XPATH = "//li[@title='Company Files']//a[@href='/spa/commons/index']";
export const SIDEBAR_COMPANY_FILES_ICON_XPATH = "//li[@title='Company Files']//i[contains(@class,'material-icons') and text()='folder_shared']";
export const SIDEBAR_COMPANY_FILES_TEXT_XPATH = "//li[@title='Company Files']//p[normalize-space()='Company Files']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/commons/index and capturing html/company-files.html

// ── Element Map (Gherkin-facing) ──
export const COMPANY_FILES_ELEMENTS: Record<string, string> = {
  'sidebar company files': SIDEBAR_COMPANY_FILES_XPATH,
  'sidebar company files icon': SIDEBAR_COMPANY_FILES_ICON_XPATH,
  'sidebar company files text': SIDEBAR_COMPANY_FILES_TEXT_XPATH,
};
