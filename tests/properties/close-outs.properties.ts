/**
 * Close Outs Page (SPA) — /spa/sitephotos/index-new
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_CLOSE_OUTS_XPATH = "//li[@title='Close Outs']//a[@href='/spa/sitephotos/index-new']";
export const SIDEBAR_CLOSE_OUTS_ICON_XPATH = "//li[@title='Close Outs']//i[contains(@class,'material-icons') and text()='linked_camera']";
export const SIDEBAR_CLOSE_OUTS_TEXT_XPATH = "//li[@title='Close Outs']//p[normalize-space()='Close Outs']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/sitephotos/index-new and capturing html/close-outs.html

// ── Element Map (Gherkin-facing) ──
export const CLOSE_OUTS_ELEMENTS: Record<string, string> = {
  'sidebar close outs': SIDEBAR_CLOSE_OUTS_XPATH,
  'sidebar close outs icon': SIDEBAR_CLOSE_OUTS_ICON_XPATH,
  'sidebar close outs text': SIDEBAR_CLOSE_OUTS_TEXT_XPATH,
};
