/**
 * WOT Export Queue Page (SPA) — /spa/wotexports/index
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_WOT_EXPORT_QUEUE_XPATH = "//li[@title='WOT Export Queue']//a[@href='/spa/wotexports/index']";
export const SIDEBAR_WOT_EXPORT_QUEUE_ICON_XPATH = "//li[@title='WOT Export Queue']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_WOT_EXPORT_QUEUE_TEXT_XPATH = "//li[@title='WOT Export Queue']//p[normalize-space()='WOT Export Queue']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/wotexports/index and capturing html/wot-export-queue.html

// ── Element Map (Gherkin-facing) ──
export const WOT_EXPORT_QUEUE_ELEMENTS: Record<string, string> = {
  'sidebar wot export queue': SIDEBAR_WOT_EXPORT_QUEUE_XPATH,
  'sidebar wot export queue icon': SIDEBAR_WOT_EXPORT_QUEUE_ICON_XPATH,
  'sidebar wot export queue text': SIDEBAR_WOT_EXPORT_QUEUE_TEXT_XPATH,
};
