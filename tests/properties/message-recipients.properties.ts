/**
 * Message Recipients Page (SPA) — /spa/recipients/index
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_MESSAGE_RECIPIENTS_XPATH = "//li[@title='Message Recipients']//a[@href='/spa/recipients/index']";
export const SIDEBAR_MESSAGE_RECIPIENTS_ICON_XPATH = "//li[@title='Message Recipients']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_MESSAGE_RECIPIENTS_TEXT_XPATH = "//li[@title='Message Recipients']//p[normalize-space()='Message Recipients']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/recipients/index and capturing html/message-recipients.html

// ── Element Map (Gherkin-facing) ──
export const MESSAGE_RECIPIENTS_ELEMENTS: Record<string, string> = {
  'sidebar message recipients': SIDEBAR_MESSAGE_RECIPIENTS_XPATH,
  'sidebar message recipients icon': SIDEBAR_MESSAGE_RECIPIENTS_ICON_XPATH,
  'sidebar message recipients text': SIDEBAR_MESSAGE_RECIPIENTS_TEXT_XPATH,
};
