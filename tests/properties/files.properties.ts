/**
 * Files Page (SPA) — Parent Menu (expandable)
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * Expandable parent menu — no direct URL. Click to reveal submenu children.
 * TODO: Surf live app to capture submenu items and page elements.
 */

// ── Sidebar Navigation ──
export const SIDEBAR_FILES_XPATH = "//li[@title='Files']//a[contains(@style,'cursor: pointer')]";
export const SIDEBAR_FILES_ICON_XPATH = "//li[@title='Files']//i[contains(@class,'material-icons') and text()='folder_open']";
export const SIDEBAR_FILES_TEXT_XPATH = "//li[@title='Files']//p[normalize-space()='Files']";

// TODO: Add submenu children XPaths after expanding in live app
// export const FILES_CHILD_<NAME>_XPATH = "//li[@title='Files']//ul//li//a[...]";

// ── Element Map (Gherkin-facing) ──
export const FILES_ELEMENTS: Record<string, string> = {
  'sidebar files': SIDEBAR_FILES_XPATH,
  'sidebar files icon': SIDEBAR_FILES_ICON_XPATH,
  'sidebar files text': SIDEBAR_FILES_TEXT_XPATH,
};
