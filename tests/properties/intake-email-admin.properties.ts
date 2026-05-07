/**
 * Intake Email Admin Page (SPA) — Admin UI Module for Incoming Email Processing
 * Source: SM-1118 — new admin module
 *
 * Sidebar title candidates ("Intake Email Admin", "Incoming Email Admin",
 * "Email Processing Admin") are tried in order; if none are present in the
 * sidebar the test falls back to a direct goto via TARGET_URL.
 */

// ── Target URL (direct fallback) ──
export const TARGET_URL = '/spa/main/intake-email-admin';

// ── Sidebar Navigation (ordered fallbacks) ──
export const SIDEBAR_TITLE_CANDIDATES = [
  'Email Rules Admin',
  'Email Rules',
  'Intake Email Admin',
  'Intake Emails Admin',
  'Incoming Email Admin',
  'Email Processing Admin',
  'Intake Emails',
] as const;

export const sidebarLinkByTitleXpath = (title: string) =>
  `//li[@title='${title}']//a[@href]`;

// ── Form: Add / New record ──
// Opens a blank create form; tries common labels so the test survives wording changes.
export const ADD_NEW_BUTTON_XPATH =
  "//button[normalize-space()='Add' or normalize-space()='Add New' or normalize-space()='New' or normalize-space()='Create' or @aria-label='Add' or @aria-label='New']";

// ── Required field inputs (any input/textarea/select inside a form-field flagged required) ──
// Matches Angular Material and generic HTML required markers.
export const REQUIRED_FIELD_INPUT_XPATH =
  "//*[self::input or self::textarea or self::select][@required or @aria-required='true' or ancestor::*[contains(@class,'required') or contains(@class,'mat-form-field-required-marker')]]";

// ── Save button (ordered fallbacks via or'd label/aria attributes) ──
export const SAVE_BUTTON_XPATH =
  "//button[normalize-space()='Save' or normalize-space()='Save Changes' or normalize-space()='Submit' or normalize-space()='Create' or @aria-label='Save' or @type='submit']";

// ── Page load health ──
export const PAGE_CONTAINER_XPATH =
  "//mat-sidenav-content | //div[contains(@class,'main-content') or @id='main-content']";

// ── Success indicators (used negatively to confirm no record was created) ──
// Snackbars / toasts that announce a successful save, plus generic success notices.
export const SUCCESS_NOTIFICATION_XPATH =
  "//mat-snack-bar-container[contains(translate(.,'SAVEDCRTUL','savedcrtul'),'saved') or contains(translate(.,'SAVEDCRTUL','savedcrtul'),'created') or contains(translate(.,'SAVEDCRTUL','savedcrtul'),'success')]" +
  " | //*[contains(@class,'snackbar') or contains(@class,'toast') or contains(@class,'alert-success')][contains(translate(.,'SAVEDCRTUL','savedcrtul'),'saved') or contains(translate(.,'SAVEDCRTUL','savedcrtul'),'created') or contains(translate(.,'SAVEDCRTUL','savedcrtul'),'success')]";
