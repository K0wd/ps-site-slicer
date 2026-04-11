/**
 * Training Page (SPA) — /spa/training/index
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_TRAINING_XPATH = "//li[@title='Training']//a[@href='/spa/training/index']";
export const SIDEBAR_TRAINING_ICON_XPATH = "//li[@title='Training']//i[contains(@class,'material-icons') and text()='thumb_up']";
export const SIDEBAR_TRAINING_TEXT_XPATH = "//li[@title='Training']//p[normalize-space()='Training']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/training/index and capturing html/training.html

// ── Element Map (Gherkin-facing) ──
export const TRAINING_ELEMENTS: Record<string, string> = {
  'sidebar training': SIDEBAR_TRAINING_XPATH,
  'sidebar training icon': SIDEBAR_TRAINING_ICON_XPATH,
  'sidebar training text': SIDEBAR_TRAINING_TEXT_XPATH,
};
