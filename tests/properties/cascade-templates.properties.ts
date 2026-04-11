/**
 * Cascade Templates Page (SPA) — /spa/main/cascade-template-admin
 * Source: live sidebar HTML snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_CASCADE_TEMPLATES_XPATH = "//li[@title='Cascade Templates']//a[@href='/spa/main/cascade-template-admin']";
export const SIDEBAR_CASCADE_TEMPLATES_ICON_XPATH = "//li[@title='Cascade Templates']//i[contains(@class,'material-icons') and text()='account_tree']";
export const SIDEBAR_CASCADE_TEMPLATES_TEXT_XPATH = "//li[@title='Cascade Templates']//p[normalize-space()='Cascade Templates']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/main/cascade-template-admin and capturing html/cascade-templates.html

// ── Element Map (Gherkin-facing) ──
export const CASCADE_TEMPLATES_ELEMENTS: Record<string, string> = {
  'sidebar cascade templates': SIDEBAR_CASCADE_TEMPLATES_XPATH,
  'sidebar cascade templates icon': SIDEBAR_CASCADE_TEMPLATES_ICON_XPATH,
  'sidebar cascade templates text': SIDEBAR_CASCADE_TEMPLATES_TEXT_XPATH,
};
