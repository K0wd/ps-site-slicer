/**
 * Maintenance Admin Page (SPA) — /spa/requests/maintadmin
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 */

// ── Sidebar Navigation ──
export const SIDEBAR_MAINTENANCE_ADMIN_XPATH = "//li[@title='Maintenance Admin']//a[@href='/spa/requests/maintadmin']";
export const SIDEBAR_MAINTENANCE_ADMIN_ICON_XPATH = "//li[@title='Maintenance Admin']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_MAINTENANCE_ADMIN_TEXT_XPATH = "//li[@title='Maintenance Admin']//p[normalize-space()='Maintenance Admin']";

// ── Departments Page (legacy iframe) ──
// Primary: labeled input; fallback: any text input inside a department form
export const DEPT_NAME_INPUT_XPATH = "//input[@name='name' or @id='name' or contains(@id,'epartment') or contains(@name,'epartment') or contains(@placeholder,'epartment')]";
// Department list table rows (td cells containing department names)
export const DEPT_LIST_ROW_XPATH = "//table//tr[td]";
export const DEPT_LIST_CELL_XPATH = (name: string) => `//table//td[normalize-space(.)='${name}']`;

// ── Element Map (Gherkin-facing) ──
export const MAINTENANCE_ADMIN_ELEMENTS: Record<string, string> = {
  'sidebar maintenance admin': SIDEBAR_MAINTENANCE_ADMIN_XPATH,
  'sidebar maintenance admin icon': SIDEBAR_MAINTENANCE_ADMIN_ICON_XPATH,
  'sidebar maintenance admin text': SIDEBAR_MAINTENANCE_ADMIN_TEXT_XPATH,
};
