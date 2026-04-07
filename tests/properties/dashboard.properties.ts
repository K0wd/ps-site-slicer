/**
 * Home / Dashboard Page (SPA) — /spa/dashboard/index
 * Source: error-context.md page snapshot (Edge)
 * Captured: 2026-04-08
 *
 * Main dashboard after login. Contains sidebar navigation, top bar, and widget area.
 * Uses Playwright role-based locators for reliability across browsers.
 */

// ── Top Bar ──
export const SEARCH_INPUT_XPATH = "//input[@name='searchTerm' and @placeholder='Search']";
export const REFRESH_ICON_XPATH = "//img[contains(@src,'refresh') or @alt='refresh'] | //*[normalize-space()='refresh' and contains(@class,'mat-icon')]";
export const ADD_WIDGET_BUTTON_XPATH = "//button[normalize-space()='Add Widget']";

// ── User Profile ──
export const USER_PROFILE_XPATH = "//a[@title='My Profile' and @href='/spa/profile']";
export const LOGOUT_ICON_XPATH = "//mat-icon[@title='Log out']";

// ── Sidebar ──
export const SIDEBAR_FILTER_INPUT_XPATH = "//input[@placeholder='Filter Menu' or @id='sidebarFilter']";

// ── Version ──
export const VERSION_XPATH = "//*[contains(text(), 'SM VERSION')]";

// ── Sidebar Menu Items (by listitem accessible name → link with paragraph text) ──
export const menuItemXpath = (name: string) => `//ul//li//p[normalize-space()='${name}']`;

// ── Widget Menu ──
export const WIDGET_MENU_ITEM_XPATH = (name: string) =>
  `//button[contains(@class, 'mat-menu-item') and normalize-space()='${name}']`;
export const WIDGET_TITLE_XPATH = "//span[contains(@class, 'widget-title')]";
export const WIDGET_ICONS_CSS = '.widget-icons';
export const WIDGET_REMOVE_XPATH = "//button[normalize-space()='Remove']";

export const WIDGET_OPTIONS = [
  'Site Manager Performance',
  'Known Employee Locations',
  'Announcements',
  'Favorites',
  'Alerts',
  'Clocked In',
  'Materials Over Budget',
  'Subcontractors Over Budget',
  'Equipment Over Budget',
  'Profitability By Department',
  'Past Due Tickets',
  'Timesheet/WO discrepancies',
  'Scheduled Tickets',
  'Vendor Announcements',
  'Manager Announcements',
  'Weather Widget',
  'TEST HTML',
  'Add Client Shares',
  'View Client Shares',
  'Vendor PO List',
];

// ── Element Map (Gherkin-facing) ──
export const HOME_ELEMENTS: Record<string, string> = {
  'search input': SEARCH_INPUT_XPATH,
  'refresh button': REFRESH_ICON_XPATH,
  'add widget button': ADD_WIDGET_BUTTON_XPATH,
  'my profile': USER_PROFILE_XPATH,
  'logout': LOGOUT_ICON_XPATH,
  'sidebar filter': SIDEBAR_FILTER_INPUT_XPATH,
  'version': VERSION_XPATH,
};
