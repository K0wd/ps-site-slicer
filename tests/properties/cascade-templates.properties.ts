/**
 * Cascade Templates Page (SPA) — /spa/main/cascade-template-admin
 * Source: html/cascade-templates.html snapshot
 * Captured: 2026-04-12, updated: 2026-04-15
 */

// ── Sidebar Navigation ──
export const SIDEBAR_CASCADE_TEMPLATES_XPATH = "//li[@title='Cascade Templates']//a[@href='/spa/main/cascade-template-admin']";
export const SIDEBAR_CASCADE_TEMPLATES_ICON_XPATH = "//li[@title='Cascade Templates']//i[contains(@class,'material-icons') and text()='account_tree']";
export const SIDEBAR_CASCADE_TEMPLATES_TEXT_XPATH = "//li[@title='Cascade Templates']//p[normalize-space()='Cascade Templates']";

// ── Page Title ──
export const PAGE_TITLE_XPATH = "//a[contains(@class,'navbar-brand') and contains(@href,'cascade-template-admin')]";

// ── Template Table ──
export const TEMPLATE_TABLE_XPATH = "//mat-table";
export const TEMPLATE_ROW_XPATH = "//mat-row";
export const TEMPLATE_NAME_CELL_XPATH = "//mat-cell[contains(@class,'mat-column-name')]";
export const TEMPLATE_ACTIONS_CELL_XPATH = "//mat-cell[contains(@class,'mat-column-data-action')]";

// ── Three-dot Menu Button (more_vert icon in Actions column — no button wrapper) ──
export const THREE_DOT_MENU_BUTTON_XPATH = "//mat-row//mat-icon[normalize-space()='more_vert']";

// ── Context Menu Items (rendered in CDK overlay) ──
export const CONTEXT_MENU_ITEM_XPATH = (label: string) =>
  `//div[contains(@class,'cdk-overlay')]//button[contains(@class,'mat-menu-item') and normalize-space()='${label}']`;
export const CONTEXT_MENU_PANEL_XPATH = "//div[contains(@class,'mat-menu-panel')]";

// ── Gold Star Icon (default template indicator) ──
export const GOLD_STAR_ICON_XPATH = "//mat-row//mat-icon[normalize-space()='star']";
export const GOLD_STAR_IN_ROW_XPATH = "//mat-row[.//mat-icon[normalize-space()='star']]";

// ── Add New / Search ──
export const ADD_NEW_BUTTON_XPATH = "//button[.//span[contains(normalize-space(),'Add New')]]";
export const SEARCH_TEMPLATES_INPUT_XPATH = "//input[@placeholder='Search templates']";

// ── Create Template Dialog ──
export const DIALOG_NAME_INPUT_XPATH = "//mat-dialog-container//input";
export const DIALOG_SUBMIT_BUTTON_XPATH = "//mat-dialog-container//mat-dialog-actions//button[1]";
export const DIALOG_CONTAINER_XPATH = "//mat-dialog-container";

// ── Validation Error ──
export const DUPLICATE_NAME_ERROR_XPATH = "//mat-snack-bar-container | //mat-error | //mat-dialog-container//*[contains(@class,'error') or contains(@class,'alert')]";

// ── Refresh ──
export const REFRESH_ICON_XPATH = "//mat-icon[contains(@class,'arrow-btn') and normalize-space()='refresh']";

// ── Element Map (Gherkin-facing) ──
export const CASCADE_TEMPLATES_ELEMENTS: Record<string, string> = {
  'sidebar cascade templates': SIDEBAR_CASCADE_TEMPLATES_XPATH,
  'sidebar cascade templates icon': SIDEBAR_CASCADE_TEMPLATES_ICON_XPATH,
  'sidebar cascade templates text': SIDEBAR_CASCADE_TEMPLATES_TEXT_XPATH,
  'page title': PAGE_TITLE_XPATH,
  'template table': TEMPLATE_TABLE_XPATH,
  'template row': TEMPLATE_ROW_XPATH,
  'add new button': ADD_NEW_BUTTON_XPATH,
  'search templates input': SEARCH_TEMPLATES_INPUT_XPATH,
  'refresh icon': REFRESH_ICON_XPATH,
};
