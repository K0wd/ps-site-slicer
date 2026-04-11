/**
 * Job Titles Page (SPA) — /spa/requests/job-title-admin
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_JOB_TITLES_XPATH = "//li[@title='Job Titles']//a[@href='/spa/requests/job-title-admin']";
export const SIDEBAR_JOB_TITLES_ICON_XPATH = "//li[@title='Job Titles']//i[contains(@class,'material-icons') and text()='account_balance']";
export const SIDEBAR_JOB_TITLES_TEXT_XPATH = "//li[@title='Job Titles']//p[normalize-space()='Job Titles']";

// ── Page Elements ──
// TODO: Populate after surfing /spa/requests/job-title-admin and capturing html/job-titles.html

// ── Element Map (Gherkin-facing) ──
export const JOB_TITLES_ELEMENTS: Record<string, string> = {
  'sidebar job titles': SIDEBAR_JOB_TITLES_XPATH,
  'sidebar job titles icon': SIDEBAR_JOB_TITLES_ICON_XPATH,
  'sidebar job titles text': SIDEBAR_JOB_TITLES_TEXT_XPATH,
};
