/**
 * Director Admin Page (SPA) — /spa/director-admin
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_DIRECTOR_ADMIN_XPATH = "//li[@title='Director Admin']//a[@href='/spa/director-admin']";
export const SIDEBAR_DIRECTOR_ADMIN_ICON_XPATH = "//li[@title='Director Admin']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_DIRECTOR_ADMIN_TEXT_XPATH = "//li[@title='Director Admin']//p[normalize-space()='Director Admin']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/director-admin and capturing html/director-admin.html

// ── Element Map (Gherkin-facing) ──
export const DIRECTOR_ADMIN_ELEMENTS: Record<string, string> = {
  'sidebar director admin': SIDEBAR_DIRECTOR_ADMIN_XPATH,
  'sidebar director admin icon': SIDEBAR_DIRECTOR_ADMIN_ICON_XPATH,
  'sidebar director admin text': SIDEBAR_DIRECTOR_ADMIN_TEXT_XPATH,
};
