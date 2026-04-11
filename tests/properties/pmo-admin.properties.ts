/**
 * PMO Admin Page (SPA) — /spa/dashboard/pmoadmin
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_PMO_ADMIN_XPATH = "//li[@title='PMO Admin']//a[@href='/spa/dashboard/pmoadmin']";
export const SIDEBAR_PMO_ADMIN_ICON_XPATH = "//li[@title='PMO Admin']//i[contains(@class,'material-icons') and text()='dashboard']";
export const SIDEBAR_PMO_ADMIN_TEXT_XPATH = "//li[@title='PMO Admin']//p[normalize-space()='PMO Admin']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/dashboard/pmoadmin and capturing html/pmo-admin.html

// ── Element Map (Gherkin-facing) ──
export const PMO_ADMIN_ELEMENTS: Record<string, string> = {
  'sidebar pmo admin': SIDEBAR_PMO_ADMIN_XPATH,
  'sidebar pmo admin icon': SIDEBAR_PMO_ADMIN_ICON_XPATH,
  'sidebar pmo admin text': SIDEBAR_PMO_ADMIN_TEXT_XPATH,
};
