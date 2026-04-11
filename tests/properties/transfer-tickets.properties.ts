/**
 * Transfer Tickets Page (SPA) — /spa/requests/transfer
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_TRANSFER_TICKETS_XPATH = "//li[@title='Transfer Tickets']//a[@href='/spa/requests/transfer']";
export const SIDEBAR_TRANSFER_TICKETS_ICON_XPATH = "//li[@title='Transfer Tickets']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_TRANSFER_TICKETS_TEXT_XPATH = "//li[@title='Transfer Tickets']//p[normalize-space()='Transfer Tickets']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/requests/transfer and capturing html/transfer-tickets.html

// ── Element Map (Gherkin-facing) ──
export const TRANSFER_TICKETS_ELEMENTS: Record<string, string> = {
  'sidebar transfer tickets': SIDEBAR_TRANSFER_TICKETS_XPATH,
  'sidebar transfer tickets icon': SIDEBAR_TRANSFER_TICKETS_ICON_XPATH,
  'sidebar transfer tickets text': SIDEBAR_TRANSFER_TICKETS_TEXT_XPATH,
};
