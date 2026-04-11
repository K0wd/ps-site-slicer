/**
 * Projects Admin Page (SPA) — /spa/projects/admin
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_PROJECTS_ADMIN_XPATH = "//li[@title='Projects Admin']//a[@href='/spa/projects/admin']";
export const SIDEBAR_PROJECTS_ADMIN_ICON_XPATH = "//li[@title='Projects Admin']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_PROJECTS_ADMIN_TEXT_XPATH = "//li[@title='Projects Admin']//p[normalize-space()='Projects Admin']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/projects/admin and capturing html/projects-admin.html

// ── Element Map (Gherkin-facing) ──
export const PROJECTS_ADMIN_ELEMENTS: Record<string, string> = {
  'sidebar projects admin': SIDEBAR_PROJECTS_ADMIN_XPATH,
  'sidebar projects admin icon': SIDEBAR_PROJECTS_ADMIN_ICON_XPATH,
  'sidebar projects admin text': SIDEBAR_PROJECTS_ADMIN_TEXT_XPATH,
};
