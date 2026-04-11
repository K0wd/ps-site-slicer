/**
 * Menu Editor Page (SPA) — /spa/main/admin
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_MENU_EDITOR_XPATH = "//li[@title='Menu Editor']//a[@href='/spa/main/admin']";
export const SIDEBAR_MENU_EDITOR_ICON_XPATH = "//li[@title='Menu Editor']//i[contains(@class,'material-icons') and text()='fiber_new']";
export const SIDEBAR_MENU_EDITOR_TEXT_XPATH = "//li[@title='Menu Editor']//p[normalize-space()='Menu Editor']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/main/admin and capturing html/menu-editor.html

// ── Element Map (Gherkin-facing) ──
export const MENU_EDITOR_ELEMENTS: Record<string, string> = {
  'sidebar menu editor': SIDEBAR_MENU_EDITOR_XPATH,
  'sidebar menu editor icon': SIDEBAR_MENU_EDITOR_ICON_XPATH,
  'sidebar menu editor text': SIDEBAR_MENU_EDITOR_TEXT_XPATH,
};
