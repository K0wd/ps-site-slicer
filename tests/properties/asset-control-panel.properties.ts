/**
 * Asset Control Panel Page (SPA) — /spa/generators/cp
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_ASSET_CONTROL_PANEL_XPATH = "//li[@title='Asset Control Panel']//a[@href='/spa/generators/cp']";
export const SIDEBAR_ASSET_CONTROL_PANEL_ICON_XPATH = "//li[@title='Asset Control Panel']//i[contains(@class,'material-icons') and text()='lock']";
export const SIDEBAR_ASSET_CONTROL_PANEL_TEXT_XPATH = "//li[@title='Asset Control Panel']//p[normalize-space()='Asset Control Panel']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/generators/cp and capturing html/asset-control-panel.html

// ── Element Map (Gherkin-facing) ──
export const ASSET_CONTROL_PANEL_ELEMENTS: Record<string, string> = {
  'sidebar asset control panel': SIDEBAR_ASSET_CONTROL_PANEL_XPATH,
  'sidebar asset control panel icon': SIDEBAR_ASSET_CONTROL_PANEL_ICON_XPATH,
  'sidebar asset control panel text': SIDEBAR_ASSET_CONTROL_PANEL_TEXT_XPATH,
};
