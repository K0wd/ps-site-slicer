/**
 * Certificates Page (SPA) — Parent Menu (expandable)
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * Expandable parent menu — no direct URL. Click to reveal submenu children.
 * TODO: Surf live app to capture submenu items and page elements.
 */

// ── Sidebar Navigation ──
export const SIDEBAR_CERTIFICATES_XPATH = "//li[@title='Certificates']//a[contains(@style,'cursor: pointer')]";
export const SIDEBAR_CERTIFICATES_ICON_XPATH = "//li[@title='Certificates']//i[contains(@class,'material-icons') and text()='monetization_on']";
export const SIDEBAR_CERTIFICATES_TEXT_XPATH = "//li[@title='Certificates']//p[normalize-space()='Certificates']";

// TODO: Add submenu children XPaths after expanding in live app
// export const CERTIFICATES_CHILD_<NAME>_XPATH = "//li[@title='Certificates']//ul//li//a[...]";

// ── Element Map (Gherkin-facing) ──
export const CERTIFICATES_ELEMENTS: Record<string, string> = {
  'sidebar certificates': SIDEBAR_CERTIFICATES_XPATH,
  'sidebar certificates icon': SIDEBAR_CERTIFICATES_ICON_XPATH,
  'sidebar certificates text': SIDEBAR_CERTIFICATES_TEXT_XPATH,
};
