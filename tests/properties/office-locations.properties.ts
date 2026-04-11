/**
 * Office Locations Page (SPA) — /spa/officelocations/index
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_OFFICE_LOCATIONS_XPATH = "//li[@title='Office Locations']//a[@href='/spa/officelocations/index']";
export const SIDEBAR_OFFICE_LOCATIONS_ICON_XPATH = "//li[@title='Office Locations']//i[contains(@class,'material-icons') and text()='location_city']";
export const SIDEBAR_OFFICE_LOCATIONS_TEXT_XPATH = "//li[@title='Office Locations']//p[normalize-space()='Office Locations']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/officelocations/index and capturing html/office-locations.html

// ── Element Map (Gherkin-facing) ──
export const OFFICE_LOCATIONS_ELEMENTS: Record<string, string> = {
  'sidebar office locations': SIDEBAR_OFFICE_LOCATIONS_XPATH,
  'sidebar office locations icon': SIDEBAR_OFFICE_LOCATIONS_ICON_XPATH,
  'sidebar office locations text': SIDEBAR_OFFICE_LOCATIONS_TEXT_XPATH,
};
