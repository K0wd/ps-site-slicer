/**
 * PWA — Clock Simple module (SM-1077)
 * Base PWA: https://testserver.betacom.com/testpwa
 */

// ── Navigation ──
export const PWA_CLOCK_SIMPLE_NAV_XPATH =
  "//a[contains(@href,'clock-simple') or normalize-space()='Clock Simple' or normalize-space()='Clock']";

// ── Page presence indicator ──
export const PWA_CLOCK_SIMPLE_HEADING_XPATH =
  "//*[self::h1 or self::h2 or contains(@class,'page-title')][contains(normalize-space(),'Clock')]";

// ── Clock entry form ──
export const PWA_CLOCK_WO_INPUT_XPATH =
  "//input[@placeholder[contains(.,'Work Order') or contains(.,'WO')] or @name[contains(.,'work_order') or contains(.,'wo')] or ancestor::*[contains(@class,'work-order') or contains(@class,'wo')]]";

export const PWA_CLOCK_SUBMIT_BUTTON_XPATH =
  "//button[@type='submit' or contains(normalize-space(),'Submit') or contains(normalize-space(),'Clock In') or contains(normalize-space(),'Save')]";

export const PWA_CLOCK_SUCCESS_INDICATOR_XPATH =
  "//*[contains(normalize-space(),'submitted') or contains(normalize-space(),'success') or contains(normalize-space(),'clocked in') or contains(@class,'success') or contains(@class,'toast')]";

// ── Timesheet module (PWA) ──
export const PWA_TIMESHEET_NAV_XPATH =
  "//a[contains(@href,'timesheet') or normalize-space()='Timesheet' or normalize-space()='Timesheets']";

export const PWA_TIMESHEET_HEADING_XPATH =
  "//*[self::h1 or self::h2 or contains(@class,'page-title')][contains(normalize-space(),'Timesheet')]";

// ── Timesheet New Period form (PWA) ──
export const PWA_TIMESHEET_SAVE_PERIOD_BUTTON_XPATH =
  "//button[contains(normalize-space(),'Save') or contains(normalize-space(),'Add') or contains(normalize-space(),'Submit')][ancestor::*[contains(@class,'new-period') or contains(@class,'newPeriod') or contains(@class,'period-form')]] | //button[@type='submit'][ancestor::form[contains(@class,'new-period') or contains(@class,'period')]]";

export const PWA_TIMESHEET_NEW_PERIOD_DATE_XPATH =
  "//input[@type='date' or @placeholder[contains(.,'Date') or contains(.,'date')] or ancestor::*[contains(@class,'new-period') or contains(@class,'newPeriod')]][@type='date' or @inputmode='numeric']";

export const PWA_TIMESHEET_NEW_PERIOD_HOURS_XPATH =
  "//input[@type='number' or @placeholder[contains(.,'Hours') or contains(.,'hours') or contains(.,'hour')] or @name[contains(.,'hours') or contains(.,'hour')] or ancestor::*[contains(@class,'new-period') or contains(@class,'newPeriod')]][@type='number' or contains(@class,'hours')]";

// ── Clock date picker (PWA) ──
export const PWA_CLOCK_DATE_PICKER_XPATH =
  "//input[@type='date' or contains(@class,'date-picker') or contains(@class,'datepicker') or @placeholder[contains(.,'Date') or contains(.,'date')]][ancestor::*[contains(@class,'clock') or contains(@class,'Clock')] or not(ancestor::*[contains(@class,'timesheet') or contains(@class,'Timesheet')])]";

// ── Out-of-week date cell (custom calendar picker) ──
export const PWA_CLOCK_DATE_OUTSIDE_WEEK_CELL_XPATH =
  "//*[@role='gridcell' or contains(@class,'day') or contains(@class,'date-cell')][contains(@class,'disabled') or contains(@class,'outside') or @aria-disabled='true'][ancestor::*[contains(@class,'calendar') or contains(@class,'picker') or contains(@class,'datepicker')]]";

// ── Work Orders module (PWA) ──
export const PWA_WO_NAV_XPATH =
  "//a[contains(@href,'work-order') or contains(normalize-space(),'Work Orders') or contains(normalize-space(),'Work Order')]";

export const PWA_WO_SEARCH_INPUT_XPATH =
  "//input[@type='search' or @placeholder[contains(.,'Search') or contains(.,'search')] or @name[contains(.,'search') or contains(.,'query')]]";

export const PWA_WO_EMPTY_RESULTS_XPATH =
  "//*[contains(normalize-space(),'No results') or contains(normalize-space(),'no results') or contains(normalize-space(),'No work orders') or contains(normalize-space(),'not found') or contains(@class,'empty') or contains(@class,'no-data')]";
