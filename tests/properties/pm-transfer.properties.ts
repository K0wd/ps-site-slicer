/**
 * PM Transfer Page (SPA) — /spa/pm_transfer
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_PM_TRANSFER_XPATH = "//li[@title='PM Transfer']//a[@href='/spa/pm_transfer']";
export const SIDEBAR_PM_TRANSFER_ICON_XPATH = "//li[@title='PM Transfer']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_PM_TRANSFER_TEXT_XPATH = "//li[@title='PM Transfer']//p[normalize-space()='PM Transfer']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/pm_transfer and capturing html/pm-transfer.html

// ── Element Map (Gherkin-facing) ──
export const PM_TRANSFER_ELEMENTS: Record<string, string> = {
  'sidebar pm transfer': SIDEBAR_PM_TRANSFER_XPATH,
  'sidebar pm transfer icon': SIDEBAR_PM_TRANSFER_ICON_XPATH,
  'sidebar pm transfer text': SIDEBAR_PM_TRANSFER_TEXT_XPATH,
};
