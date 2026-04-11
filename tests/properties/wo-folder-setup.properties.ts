/**
 * WO Folder Setup Page (SPA) — /spa/directoryservices/permadmin
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_WO_FOLDER_SETUP_XPATH = "//li[@title='WO Folder Setup']//a[@href='/spa/directoryservices/permadmin']";
export const SIDEBAR_WO_FOLDER_SETUP_ICON_XPATH = "//li[@title='WO Folder Setup']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_WO_FOLDER_SETUP_TEXT_XPATH = "//li[@title='WO Folder Setup']//p[normalize-space()='WO Folder Setup']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/directoryservices/permadmin and capturing html/wo-folder-setup.html

// ── Element Map (Gherkin-facing) ──
export const WO_FOLDER_SETUP_ELEMENTS: Record<string, string> = {
  'sidebar wo folder setup': SIDEBAR_WO_FOLDER_SETUP_XPATH,
  'sidebar wo folder setup icon': SIDEBAR_WO_FOLDER_SETUP_ICON_XPATH,
  'sidebar wo folder setup text': SIDEBAR_WO_FOLDER_SETUP_TEXT_XPATH,
};
