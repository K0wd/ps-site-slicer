/**
 * Message Queue Page (SPA) — /spa/messages/index
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_MESSAGE_QUEUE_XPATH = "//li[@title='Message Queue']//a[@href='/spa/messages/index']";
export const SIDEBAR_MESSAGE_QUEUE_ICON_XPATH = "//li[@title='Message Queue']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_MESSAGE_QUEUE_TEXT_XPATH = "//li[@title='Message Queue']//p[normalize-space()='Message Queue']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/messages/index and capturing html/message-queue.html

// ── Element Map (Gherkin-facing) ──
export const MESSAGE_QUEUE_ELEMENTS: Record<string, string> = {
  'sidebar message queue': SIDEBAR_MESSAGE_QUEUE_XPATH,
  'sidebar message queue icon': SIDEBAR_MESSAGE_QUEUE_ICON_XPATH,
  'sidebar message queue text': SIDEBAR_MESSAGE_QUEUE_TEXT_XPATH,
};
