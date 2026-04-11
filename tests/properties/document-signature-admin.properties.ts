/**
 * Document Signature Admin Page (SPA) — /spa/prepare-sign-doc
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_DOCUMENT_SIGNATURE_ADMIN_XPATH = "//li[@title='Document Signature Admin']//a[@href='/spa/prepare-sign-doc']";
export const SIDEBAR_DOCUMENT_SIGNATURE_ADMIN_ICON_XPATH = "//li[@title='Document Signature Admin']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_DOCUMENT_SIGNATURE_ADMIN_TEXT_XPATH = "//li[@title='Document Signature Admin']//p[normalize-space()='Document Signature Admin']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/prepare-sign-doc and capturing html/document-signature-admin.html

// ── Element Map (Gherkin-facing) ──
export const DOCUMENT_SIGNATURE_ADMIN_ELEMENTS: Record<string, string> = {
  'sidebar document signature admin': SIDEBAR_DOCUMENT_SIGNATURE_ADMIN_XPATH,
  'sidebar document signature admin icon': SIDEBAR_DOCUMENT_SIGNATURE_ADMIN_ICON_XPATH,
  'sidebar document signature admin text': SIDEBAR_DOCUMENT_SIGNATURE_ADMIN_TEXT_XPATH,
};
