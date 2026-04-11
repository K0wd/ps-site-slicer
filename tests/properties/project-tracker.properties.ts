/**
 * Project Tracker Page (SPA) — /spa/clients
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_PROJECT_TRACKER_XPATH = "//li[@title='Project Tracker']//a[@href='/spa/clients']";
export const SIDEBAR_PROJECT_TRACKER_ICON_XPATH = "//li[@title='Project Tracker']//i[contains(@class,'material-icons') and text()='format_list_numbered']";
export const SIDEBAR_PROJECT_TRACKER_TEXT_XPATH = "//li[@title='Project Tracker']//p[normalize-space()='Project Tracker']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/clients and capturing html/project-tracker.html

// ── Element Map (Gherkin-facing) ──
export const PROJECT_TRACKER_ELEMENTS: Record<string, string> = {
  'sidebar project tracker': SIDEBAR_PROJECT_TRACKER_XPATH,
  'sidebar project tracker icon': SIDEBAR_PROJECT_TRACKER_ICON_XPATH,
  'sidebar project tracker text': SIDEBAR_PROJECT_TRACKER_TEXT_XPATH,
};
