/**
 * Locks Admin Page (SPA) — /spa/locks/index
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_LOCKS_ADMIN_XPATH = "//li[@title='Locks Admin']//a[@href='/spa/locks/index']";
export const SIDEBAR_LOCKS_ADMIN_ICON_XPATH = "//li[@title='Locks Admin']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_LOCKS_ADMIN_TEXT_XPATH = "//li[@title='Locks Admin']//p[normalize-space()='Locks Admin']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/locks/index and capturing html/locks-admin.html

// ── Element Map (Gherkin-facing) ──
export const LOCKS_ADMIN_ELEMENTS: Record<string, string> = {
  'sidebar locks admin': SIDEBAR_LOCKS_ADMIN_XPATH,
  'sidebar locks admin icon': SIDEBAR_LOCKS_ADMIN_ICON_XPATH,
  'sidebar locks admin text': SIDEBAR_LOCKS_ADMIN_TEXT_XPATH,
};
