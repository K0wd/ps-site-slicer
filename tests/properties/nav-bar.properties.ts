/**
 * Nav Bar (SPA) — Top navigation bar on all authenticated pages
 * Source: html/home.html navbar snapshot
 * Captured: 2026-04-12
 *
 * The navbar sits inside <app-navbar-cmp> → <nav class="navbar">.
 * Contains sidebar toggle, dashboard link, refresh, notifications,
 * contact support, and search controls.
 */

// ── Sidebar Toggle ──
export const SIDEBAR_TOGGLE_BUTTON_XPATH = "//button[@id='minimizeSidebar']";
export const SIDEBAR_TOGGLE_EXPAND_ICON_XPATH = "//button[@id='minimizeSidebar']//i[contains(@class,'visible-on-sidebar-regular') and text()='more_vert']";
export const SIDEBAR_TOGGLE_COLLAPSE_ICON_XPATH = "//button[@id='minimizeSidebar']//i[contains(@class,'visible-on-sidebar-mini') and text()='view_list']";

// ── Dashboard Link ──
export const NAVBAR_BRAND_XPATH = "//a[contains(@class,'navbar-brand') and @href='/spa/dashboard/index']";

// ── Refresh ──
export const NAVBAR_REFRESH_ICON_XPATH = "//nav[contains(@class,'navbar')]//mat-icon[normalize-space()='refresh']";

// ── Navbar Right Items ──
export const NAVBAR_DASHBOARD_ICON_XPATH = "//ul[contains(@class,'navbar-nav')]//a[@href='/spa/']//i[text()='dashboard']";
export const NAVBAR_NOTIFICATIONS_ICON_XPATH = "//ul[contains(@class,'navbar-nav')]//i[text()='notifications']";
export const NAVBAR_NOTIFICATIONS_BADGE_XPATH = "//ul[contains(@class,'navbar-nav')]//span[contains(@class,'notification') and contains(@class,'alertsCount')]";
export const NAVBAR_CONTACT_SUPPORT_ICON_XPATH = "//ul[contains(@class,'navbar-nav')]//i[text()='contact_support']";

// ── Search ──
export const NAVBAR_SEARCH_INPUT_XPATH = "//nav[contains(@class,'navbar')]//input[@name='searchTerm' and @placeholder='Search']";
export const NAVBAR_SEARCH_BUTTON_XPATH = "//nav[contains(@class,'navbar')]//button[contains(@class,'btn')]//i[text()='search']/parent::button";

// ── Element Map (Gherkin-facing) ──
export const NAV_BAR_ELEMENTS: Record<string, string> = {
  'sidebar toggle button': SIDEBAR_TOGGLE_BUTTON_XPATH,
  'sidebar expand icon': SIDEBAR_TOGGLE_EXPAND_ICON_XPATH,
  'sidebar collapse icon': SIDEBAR_TOGGLE_COLLAPSE_ICON_XPATH,
  'navbar brand link': NAVBAR_BRAND_XPATH,
  'navbar refresh icon': NAVBAR_REFRESH_ICON_XPATH,
  'navbar dashboard icon': NAVBAR_DASHBOARD_ICON_XPATH,
  'navbar notifications icon': NAVBAR_NOTIFICATIONS_ICON_XPATH,
  'navbar notifications badge': NAVBAR_NOTIFICATIONS_BADGE_XPATH,
  'navbar contact support icon': NAVBAR_CONTACT_SUPPORT_ICON_XPATH,
  'navbar search input': NAVBAR_SEARCH_INPUT_XPATH,
  'navbar search button': NAVBAR_SEARCH_BUTTON_XPATH,
};
