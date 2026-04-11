/**
 * Site Upload Admin Page (SPA) — /spa/Sites/massupdate
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_SITE_UPLOAD_ADMIN_XPATH = "//li[@title='Site Upload Admin']//a[@href='/spa/Sites/massupdate']";
export const SIDEBAR_SITE_UPLOAD_ADMIN_ICON_XPATH = "//li[@title='Site Upload Admin']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_SITE_UPLOAD_ADMIN_TEXT_XPATH = "//li[@title='Site Upload Admin']//p[normalize-space()='Site Upload Admin']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/Sites/massupdate and capturing html/site-upload-admin.html

// ── Element Map (Gherkin-facing) ──
export const SITE_UPLOAD_ADMIN_ELEMENTS: Record<string, string> = {
  'sidebar site upload admin': SIDEBAR_SITE_UPLOAD_ADMIN_XPATH,
  'sidebar site upload admin icon': SIDEBAR_SITE_UPLOAD_ADMIN_ICON_XPATH,
  'sidebar site upload admin text': SIDEBAR_SITE_UPLOAD_ADMIN_TEXT_XPATH,
};
