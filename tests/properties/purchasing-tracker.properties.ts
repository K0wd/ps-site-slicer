/**
 * Purchasing Tracker Page (SPA - Angular 9 + ag-Grid) — /spa/pos/index-new
 * Source: html/purchasing-tracker.html
 * Captured: 2026-04-13
 *
 * ag-Grid table (ag-theme-balham) with filterable columns.
 * Columns: ID, Request Date, Request By Date, WO#, Requested Total, Division,
 * Type, Description, Status, Approval, Approver(s), Assigned To, Dept, Priority,
 * Vendor, PO#, Needs My Approval.
 *
 * col-id mapping from HTML snapshot:
 *   fsm_po=ID, fcreatedstart=Request Date, fneededbystart=Request By Date,
 *   fwo=WO#, frequested=Requested Total, fdivision=Division, ftype=Type,
 *   fdescription=Description, fstatus=Status, fapproval=Approval,
 *   fapprovers=Approver(s), fassigned=Assigned To, fdept=Dept,
 *   fpriority=Priority, fvendor=Vendor, fpo=PO#, fneedsmyapproval=Needs My Approval
 */

// ── Sidebar Navigation ──
export const SIDEBAR_PURCHASING_XPATH = "//a[@title='Purchasing Tracker' or (contains(@href,'/spa/pos/index-new'))]"; // TODO: verify from htmlBody

// ── ag-Grid Root ──
export const AG_GRID_ROOT_XPATH = "//div[contains(@class,'ag-root-wrapper')]";
export const AG_GRID_BODY_XPATH = "//div[contains(@class,'ag-center-cols-container')]";

// ── ag-Grid Rows ──
export const TABLE_ROW_XPATH = "//div[contains(@class,'ag-center-cols-container')]//div[@role='row']";
export const ROW_COUNT_DISPLAY_XPATH = "//*[contains(@class,'row-count') or contains(@class,'ag-paging-row-summary-panel') or contains(text(),' of ')]"; // TODO: verify from htmlBody

// ── Export Button ──
export const EXPORT_BUTTON_XPATH = "//span[contains(@class,'btn-text') and contains(text(),'Export')]/ancestor::button";

// ── Export Dialog (appears during export) ──
export const EXPORT_DIALOG_OVERLAY_XPATH = "//div[contains(@class,'export-dialog-overlay')]"; // TODO: verify from htmlBody
export const EXPORT_DIALOG_TITLE_XPATH = "//div[contains(@class,'export-dialog-title')]"; // TODO: verify from htmlBody
export const EXPORT_PROGRESS_BAR_XPATH = "//div[contains(@class,'export-dialog-content')]//mat-progress-bar"; // TODO: verify from htmlBody

// ── ag-Grid Column col-id Map ──
export const COL_IDS: Record<string, string> = {
  'ID': 'fsm_po',
  'Request Date': 'fcreatedstart',
  'Request By Date': 'fneededbystart',
  'WO#': 'fwo',
  'WO': 'fwo',
  'Requested Total': 'frequested',
  'Division': 'fdivision',
  'Type': 'ftype',
  'Description': 'fdescription',
  'Status': 'fstatus',
  'Approval': 'fapproval', // TODO: verify col-id from htmlBody (offscreen in snapshot)
  'Approver': 'fapprovers', // TODO: verify col-id from htmlBody (offscreen in snapshot)
  'Approver(s)': 'fapprovers', // TODO: verify col-id from htmlBody (offscreen in snapshot)
  'Assigned To': 'fassigned', // TODO: verify col-id from htmlBody (offscreen in snapshot)
  'Dept': 'fdept', // TODO: verify col-id from htmlBody (offscreen in snapshot)
  'Priority': 'fpriority', // TODO: verify col-id from htmlBody (offscreen in snapshot)
  'Vendor': 'fvendor', // TODO: verify col-id from htmlBody (offscreen in snapshot)
  'PO#': 'fpo', // TODO: verify col-id from htmlBody (offscreen in snapshot)
  'Needs My Approval': 'fneedsmyapproval', // TODO: verify col-id from htmlBody (offscreen in snapshot)
};

// ── ag-Grid Column Header by col-id ──
export const COLUMN_HEADER_XPATH_FN = (colId: string) =>
  `//div[@col-id='${colId}' and @role='columnheader']`;

// ── ag-Grid Filter Menu Button (hamburger icon in header) ──
export const FILTER_MENU_BUTTON_XPATH_FN = (colId: string) =>
  `//div[@col-id='${colId}' and @role='columnheader']//span[contains(@class,'ag-header-cell-menu-button')]`;

// ── ag-Grid Filter Active Icon (visible when filter is applied) ──
export const FILTER_ACTIVE_ICON_XPATH_FN = (colId: string) =>
  `//div[@col-id='${colId}' and @role='columnheader']//span[contains(@class,'ag-filter-icon') and not(contains(@class,'ag-hidden'))]`;

// ── ag-Grid Header Cell Text ──
export const HEADER_TEXT_XPATH_FN = (colId: string) =>
  `//div[@col-id='${colId}' and @role='columnheader']//span[contains(@class,'ag-header-cell-text')]`;

// ── ag-Grid Filter Popup (appears after clicking menu) ──
export const AG_FILTER_POPUP_XPATH = "//div[contains(@class,'ag-popup')]//div[contains(@class,'ag-filter')]";
export const AG_MENU_XPATH = "//div[contains(@class,'ag-popup')]//div[contains(@class,'ag-menu')]";

// ── ag-Grid Text Filter Input ──
export const AG_TEXT_FILTER_INPUT_XPATH = "//div[contains(@class,'ag-popup')]//input[contains(@class,'ag-filter-filter') or @ref='eValue-index0-1']";

// ── ag-Grid Set Filter (dropdown with checkboxes) ──
export const AG_SET_FILTER_LIST_XPATH = "//div[contains(@class,'ag-popup')]//div[contains(@class,'ag-set-filter-list')]";
export const AG_SET_FILTER_ITEM_XPATH_FN = (value: string) =>
  `//div[contains(@class,'ag-popup')]//div[contains(@class,'ag-set-filter-item')]//span[contains(text(),'${value}')]`;
export const AG_SET_FILTER_CHECKBOX_XPATH_FN = (value: string) =>
  `//div[contains(@class,'ag-popup')]//div[contains(@class,'ag-set-filter-item')][.//span[contains(text(),'${value}')]]//div[contains(@class,'ag-checkbox')]`;
export const AG_SET_FILTER_SELECT_ALL_XPATH = "//div[contains(@class,'ag-popup')]//div[contains(@class,'ag-set-filter-select-all')]//div[contains(@class,'ag-checkbox')]";

// ── ag-Grid Date Filter ──
export const AG_DATE_FILTER_CONDITION_XPATH = "//div[contains(@class,'ag-popup')]//select[contains(@class,'ag-filter-select')]";
export const AG_DATE_FILTER_INPUT_XPATH = "//div[contains(@class,'ag-popup')]//input[@type='text' or @type='date' or contains(@class,'ag-date')]";
export const AG_DATE_FILTER_CONDITION_OPTIONS_XPATH = "//div[contains(@class,'ag-popup')]//select[contains(@class,'ag-filter-select')]//option";

// ── ag-Grid Number Filter ──
export const AG_NUMBER_FILTER_INPUT_XPATH = "//div[contains(@class,'ag-popup')]//input[contains(@class,'ag-filter-filter')]";
export const AG_NUMBER_FILTER_CONDITION_XPATH = "//div[contains(@class,'ag-popup')]//select[contains(@class,'ag-filter-select')]";

// ── Filter Clear / Close ──
export const AG_FILTER_APPLY_XPATH = "//div[contains(@class,'ag-popup')]//button[contains(@class,'ag-standard-button') and contains(text(),'Apply')]";

// ── Blank Filter Option (in set filters) ──
export const AG_BLANK_OPTION_XPATH = "//div[contains(@class,'ag-popup')]//div[contains(@class,'ag-set-filter-item')][.//span[contains(text(),'Blank') or contains(text(),'(Blanks)')]]";

// ── ag-Grid "No Rows" overlay ──
export const AG_NO_ROWS_OVERLAY_XPATH = "//div[contains(@class,'ag-overlay-no-rows-wrapper')]"; // TODO: verify from htmlBody

// ── Cell Value by col-id (for assertion on filtered rows) ──
export const CELL_VALUE_XPATH_FN = (colId: string, rowIndex: number) =>
  `//div[contains(@class,'ag-center-cols-container')]//div[@role='row'][@row-index='${rowIndex}']//div[@col-id='${colId}']`;

// ── All Cell Values for a col-id (all visible rows) ──
export const ALL_CELLS_FOR_COL_XPATH_FN = (colId: string) =>
  `//div[contains(@class,'ag-center-cols-container')]//div[@role='row']//div[@col-id='${colId}']`;

// ── Approval Dropdown Options ──
export const APPROVAL_OPTIONS = ['Approved', 'Pending Approval', 'Override', 'Rejected', 'Blank'];

// ── Element Map (Gherkin-facing) ──
export const PURCHASING_TRACKER_ELEMENTS: Record<string, string> = {
  'ag-grid root': AG_GRID_ROOT_XPATH,
  'ag-grid body': AG_GRID_BODY_XPATH,
  'table row': TABLE_ROW_XPATH,
  'row count': ROW_COUNT_DISPLAY_XPATH,
  'export button': EXPORT_BUTTON_XPATH,
  'export dialog': EXPORT_DIALOG_OVERLAY_XPATH,
  'filter popup': AG_FILTER_POPUP_XPATH,
  'text filter input': AG_TEXT_FILTER_INPUT_XPATH,
  'set filter list': AG_SET_FILTER_LIST_XPATH,
  'date filter condition': AG_DATE_FILTER_CONDITION_XPATH,
  'date filter input': AG_DATE_FILTER_INPUT_XPATH,
  'blank option': AG_BLANK_OPTION_XPATH,
  'no rows overlay': AG_NO_ROWS_OVERLAY_XPATH,
};
