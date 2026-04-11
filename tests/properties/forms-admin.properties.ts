/**
 * Forms Admin Page (SPA) — /spa/forms/index
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_FORMS_ADMIN_XPATH = "//li[@title='Forms Admin']//a[@href='/spa/forms/index']";
export const SIDEBAR_FORMS_ADMIN_ICON_XPATH = "//li[@title='Forms Admin']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_FORMS_ADMIN_TEXT_XPATH = "//li[@title='Forms Admin']//p[normalize-space()='Forms Admin']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/forms/index and capturing html/forms-admin.html

// ── Element Map (Gherkin-facing) ──
export const FORMS_ADMIN_ELEMENTS: Record<string, string> = {
  'sidebar forms admin': SIDEBAR_FORMS_ADMIN_XPATH,
  'sidebar forms admin icon': SIDEBAR_FORMS_ADMIN_ICON_XPATH,
  'sidebar forms admin text': SIDEBAR_FORMS_ADMIN_TEXT_XPATH,
};
