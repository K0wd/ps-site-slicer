/**
 * Company Directory Page (SPA) — /spa/companydirectory/index
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_COMPANY_DIRECTORY_XPATH = "//li[@title='Company Directory']//a[@href='/spa/companydirectory/index']";
export const SIDEBAR_COMPANY_DIRECTORY_ICON_XPATH = "//li[@title='Company Directory']//i[contains(@class,'material-icons') and text()='account_balance']";
export const SIDEBAR_COMPANY_DIRECTORY_TEXT_XPATH = "//li[@title='Company Directory']//p[normalize-space()='Company Directory']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/companydirectory/index and capturing html/company-directory.html

// ── Element Map (Gherkin-facing) ──
export const COMPANY_DIRECTORY_ELEMENTS: Record<string, string> = {
  'sidebar company directory': SIDEBAR_COMPANY_DIRECTORY_XPATH,
  'sidebar company directory icon': SIDEBAR_COMPANY_DIRECTORY_ICON_XPATH,
  'sidebar company directory text': SIDEBAR_COMPANY_DIRECTORY_TEXT_XPATH,
};
