/**
 * Timesheet Admin Page (SPA) — /spa/timesheets/admin
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_TIMESHEET_ADMIN_XPATH = "//li[@title='Timesheet Admin']//a[@href='/spa/timesheets/admin']";
export const SIDEBAR_TIMESHEET_ADMIN_ICON_XPATH = "//li[@title='Timesheet Admin']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_TIMESHEET_ADMIN_TEXT_XPATH = "//li[@title='Timesheet Admin']//p[normalize-space()='Timesheet Admin']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/timesheets/admin and capturing html/timesheet-admin.html

// ── Element Map (Gherkin-facing) ──
export const TIMESHEET_ADMIN_ELEMENTS: Record<string, string> = {
  'sidebar timesheet admin': SIDEBAR_TIMESHEET_ADMIN_XPATH,
  'sidebar timesheet admin icon': SIDEBAR_TIMESHEET_ADMIN_ICON_XPATH,
  'sidebar timesheet admin text': SIDEBAR_TIMESHEET_ADMIN_TEXT_XPATH,
};
