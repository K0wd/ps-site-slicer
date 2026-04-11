/**
 * Material Category Admin Page (SPA) — /spa/drivers/admin
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_MATERIAL_CATEGORY_ADMIN_XPATH = "//li[@title='Material Category Admin']//a[@href='/spa/drivers/admin']";
export const SIDEBAR_MATERIAL_CATEGORY_ADMIN_ICON_XPATH = "//li[@title='Material Category Admin']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_MATERIAL_CATEGORY_ADMIN_TEXT_XPATH = "//li[@title='Material Category Admin']//p[normalize-space()='Material Category Admin']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/drivers/admin and capturing html/material-category-admin.html

// ── Element Map (Gherkin-facing) ──
export const MATERIAL_CATEGORY_ADMIN_ELEMENTS: Record<string, string> = {
  'sidebar material category admin': SIDEBAR_MATERIAL_CATEGORY_ADMIN_XPATH,
  'sidebar material category admin icon': SIDEBAR_MATERIAL_CATEGORY_ADMIN_ICON_XPATH,
  'sidebar material category admin text': SIDEBAR_MATERIAL_CATEGORY_ADMIN_TEXT_XPATH,
};
