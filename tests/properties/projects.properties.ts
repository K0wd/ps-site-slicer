/**
 * Projects Page (SPA) — /spa/projects/tracker
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_PROJECTS_XPATH = "//li[@title='Projects']//a[@href='/spa/projects/tracker']";
export const SIDEBAR_PROJECTS_ICON_XPATH = "//li[@title='Projects']//i[contains(@class,'material-icons') and text()='format_list_numbered']";
export const SIDEBAR_PROJECTS_TEXT_XPATH = "//li[@title='Projects']//p[normalize-space()='Projects']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/projects/tracker and capturing html/projects.html

// ── Element Map (Gherkin-facing) ──
export const PROJECTS_ELEMENTS: Record<string, string> = {
  'sidebar projects': SIDEBAR_PROJECTS_XPATH,
  'sidebar projects icon': SIDEBAR_PROJECTS_ICON_XPATH,
  'sidebar projects text': SIDEBAR_PROJECTS_TEXT_XPATH,
};
