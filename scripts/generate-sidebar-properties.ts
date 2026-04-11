/**
 * Generate individual properties files for each sidebar navigation page.
 * Run: npx tsx scripts/generate-sidebar-properties.ts
 */
import * as fs from 'fs';
import * as path from 'path';

interface SidebarItem {
  title: string;
  href: string;
  icon: string;
  type: 'link' | 'parent' | 'header';
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { title: 'Dashboard', href: '/spa/dashboard/index', icon: 'dashboard', type: 'link' },
  { title: 'Admin', href: '', icon: '', type: 'header' },
  { title: 'Account Management', href: '/spa/users/vendorselfedit', icon: 'table_chart', type: 'link' },
  { title: 'Admin Alerts', href: '/spa/uac/admin_alerts', icon: 'lock', type: 'link' },
  { title: 'Asset Control Panel', href: '/spa/generators/cp', icon: 'lock', type: 'link' },
  { title: 'Audit Inspector', href: '/spa/dbupdates/auditinspector', icon: 'table_chart', type: 'link' },
  { title: 'BI Admin', href: '/spa/bi/dashboardlist', icon: 'lock', type: 'link' },
  { title: 'Capabilities Admin', href: '/spa/requests/capabilitiesadmin', icon: 'lock', type: 'link' },
  { title: 'Carrier Keys', href: '/spa/carriers/index', icon: 'lock', type: 'link' },
  { title: 'Certificates', href: '', icon: 'monetization_on', type: 'parent' },
  { title: 'Client Admin', href: '/spa/clientmanagements/index', icon: 'lock', type: 'link' },
  { title: 'Close Outs', href: '/spa/sitephotos/index-new', icon: 'linked_camera', type: 'link' },
  { title: 'Company Directory', href: '/spa/companydirectory/index', icon: 'account_balance', type: 'link' },
  { title: 'Company Files', href: '/spa/commons/index', icon: 'folder_shared', type: 'link' },
  { title: 'Cron Utility', href: '/spa/admins/cronutility', icon: 'lock', type: 'link' },
  { title: 'DB Query Screen', href: '/spa/dbupdates/query', icon: 'lock', type: 'link' },
  { title: 'Director Admin', href: '/spa/director-admin', icon: 'lock', type: 'link' },
  { title: 'Divisions Admin', href: '/spa/main/division-admin', icon: 'lock', type: 'link' },
  { title: 'Document Signature Admin', href: '/spa/prepare-sign-doc', icon: 'lock', type: 'link' },
  { title: 'Drivers Admin', href: '/spa/Drivers/index', icon: 'lock', type: 'link' },
  { title: 'Eversign', href: '/spa/dashboard/onlinesigning', icon: 'fiber_new', type: 'link' },
  { title: 'Files', href: '', icon: 'folder_open', type: 'parent' },
  { title: 'Forms Admin', href: '/spa/forms/index', icon: 'lock', type: 'link' },
  { title: 'Hiring', href: '/spa/hires/index', icon: 'fiber_new', type: 'link' },
  { title: 'IT Support', href: '/spa/ittickets/freshdesklogin', icon: 'help', type: 'link' },
  { title: 'Import Costs', href: '/spa/requests/importcosts', icon: 'lock', type: 'link' },
  { title: 'Incidents Admin', href: '/spa/incidents/index-new', icon: 'lock', type: 'link' },
  { title: 'Job Titles', href: '/spa/requests/job-title-admin', icon: 'account_balance', type: 'link' },
  { title: 'Keys Admin', href: '/spa/admin/keys', icon: 'lock', type: 'link' },
  { title: 'LOB Admin', href: '/spa/main/lob-admin', icon: 'lock', type: 'link' },
  { title: 'Locks Admin', href: '/spa/locks/index', icon: 'lock', type: 'link' },
  { title: 'Logs', href: '/spa/admins/logs', icon: 'lock', type: 'link' },
  { title: 'Maintenance', href: '/spa/sites/pickmarket', icon: 'settings_input_antenna', type: 'link' },
  { title: 'Maintenance Admin', href: '/spa/requests/maintadmin', icon: 'lock', type: 'link' },
  { title: 'Market Admin', href: '/spa/requests/marketadmin', icon: 'lock', type: 'link' },
  { title: 'Material Category Admin', href: '/spa/drivers/admin', icon: 'lock', type: 'link' },
  { title: 'Menu Editor', href: '/spa/main/admin', icon: 'fiber_new', type: 'link' },
  { title: 'Message Queue', href: '/spa/messages/index', icon: 'lock', type: 'link' },
  { title: 'Message Recipients', href: '/spa/recipients/index', icon: 'lock', type: 'link' },
  { title: 'Mobile Assets', href: '/spa/generators/index', icon: 'commute', type: 'link' },
  { title: 'Office Locations', href: '/spa/officelocations/index', icon: 'location_city', type: 'link' },
  { title: 'PM Transfer', href: '/spa/pm_transfer', icon: 'lock', type: 'link' },
  { title: 'PMO Admin', href: '/spa/dashboard/pmoadmin', icon: 'dashboard', type: 'link' },
  { title: 'PMO Dashboard', href: '/spa/dashboard/index/pmo', icon: 'table_chart', type: 'link' },
  { title: 'PMO SharePoint Dashboard', href: '/spa/iframes/sharepoint1', icon: 'table_chart', type: 'link' },
  { title: 'PTO Admin', href: '/spa/timesheets/benefitsadmin', icon: 'lock', type: 'link' },
  { title: 'Performance', href: '/spa/admins/timelogview', icon: 'lock', type: 'link' },
  { title: 'Personal Assets', href: '/spa/passets/index', icon: 'phonelink', type: 'link' },
  { title: 'Project Tracker', href: '/spa/clients', icon: 'format_list_numbered', type: 'link' },
  { title: 'Projects', href: '/spa/projects/tracker', icon: 'format_list_numbered', type: 'link' },
  { title: 'Projects Admin', href: '/spa/projects/admin', icon: 'lock', type: 'link' },
  { title: 'Purchasing', href: '/spa/pos/index-new', icon: 'monetization_on', type: 'link' },
  { title: 'Purchasing Admin', href: '/spa/pos/admin', icon: 'lock', type: 'link' },
  { title: 'Quoting', href: '/spa/boms/index-new', icon: 'money', type: 'link' },
  { title: 'RTWP', href: '', icon: 'table_chart', type: 'parent' },
  { title: 'Report DB', href: '/spa/admins/pma', icon: 'lock', type: 'link' },
  { title: 'Reports', href: '/spa/reports/index', icon: 'multiline_chart', type: 'link' },
  { title: 'Search', href: '/spa/requests/searchtab', icon: 'search', type: 'link' },
  { title: 'Site Alerts', href: '/spa/sitealerts/index', icon: 'alarm', type: 'link' },
  { title: 'Site Upload Admin', href: '/spa/Sites/massupdate', icon: 'lock', type: 'link' },
  { title: 'Tax Group Admin', href: '/spa/main/taxes-admin', icon: 'lock', type: 'link' },
  { title: 'Temp Files', href: '/spa/downloads/temps', icon: 'lock', type: 'link' },
  { title: 'Texting', href: '/spa/texting/index', icon: 'message', type: 'link' },
  { title: 'Time Zone Admin', href: '/spa/admins/states', icon: 'lock', type: 'link' },
  { title: 'Timedata', href: '/spa/timedatas/index', icon: 'table_chart', type: 'link' },
  { title: 'Timesheet Admin', href: '/spa/timesheets/admin', icon: 'lock', type: 'link' },
  { title: 'Timesheets', href: '/spa/timesheets/review', icon: 'history', type: 'link' },
  { title: 'Training', href: '/spa/training/index', icon: 'thumb_up', type: 'link' },
  { title: 'Transfer Tickets', href: '/spa/requests/transfer', icon: 'lock', type: 'link' },
  { title: 'UAC System', href: '/spa/uac/index', icon: 'lock', type: 'link' },
  { title: 'UI Config', href: '/spa/keys/uiconfig', icon: 'multiline_chart', type: 'link' },
  { title: 'Update Users Import', href: '/spa/users/import', icon: 'lock', type: 'link' },
  { title: 'Users Admin', href: '/spa/users/index', icon: 'lock', type: 'link' },
  { title: 'Vendor Admin', href: '/spa/main/vendors-admin', icon: 'lock', type: 'link' },
  { title: 'Vendor Admin-Old', href: '/spa/users/vendorreview', icon: 'business', type: 'link' },
  { title: 'WO Folder Setup', href: '/spa/directoryservices/permadmin', icon: 'lock', type: 'link' },
  { title: 'WO Tracker', href: '/spa/wots/index-new', icon: 'table_chart', type: 'link' },
  { title: 'WOT Export Queue', href: '/spa/wotexports/index', icon: 'lock', type: 'link' },
];

function toSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function toConstPrefix(title: string): string {
  return title.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/(^_|_$)/g, '');
}

const propsDir = path.resolve('tests/properties');
let created = 0;
let skipped = 0;

for (const item of SIDEBAR_ITEMS) {
  if (item.type === 'header') {
    skipped++;
    continue;
  }

  const slug = toSlug(item.title);
  const prefix = toConstPrefix(item.title);
  const filename = `${slug}.properties.ts`;
  const filepath = path.join(propsDir, filename);

  // Skip if file already exists (don't overwrite curated files)
  if (fs.existsSync(filepath)) {
    console.log(`[SKIP] ${filename} — already exists`);
    skipped++;
    continue;
  }

  let content: string;

  if (item.type === 'parent') {
    content = `/**
 * ${item.title} Page (SPA) — Parent Menu (expandable)
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * Expandable parent menu — no direct URL. Click to reveal submenu children.
 * TODO: Surf live app to capture submenu items and page elements.
 */

// ── Sidebar Navigation ──
export const SIDEBAR_${prefix}_XPATH = "//li[@title='${item.title}']//a[contains(@style,'cursor: pointer')]";
export const SIDEBAR_${prefix}_ICON_XPATH = "//li[@title='${item.title}']//i[contains(@class,'material-icons') and text()='${item.icon}']";
export const SIDEBAR_${prefix}_TEXT_XPATH = "//li[@title='${item.title}']//p[normalize-space()='${item.title}']";

// TODO: Add submenu children XPaths after expanding in live app
// export const ${prefix}_CHILD_<NAME>_XPATH = "//li[@title='${item.title}']//ul//li//a[...]";

// ── Element Map (Gherkin-facing) ──
export const ${prefix}_ELEMENTS: Record<string, string> = {
  'sidebar ${item.title.toLowerCase()}': SIDEBAR_${prefix}_XPATH,
  'sidebar ${item.title.toLowerCase()} icon': SIDEBAR_${prefix}_ICON_XPATH,
  'sidebar ${item.title.toLowerCase()} text': SIDEBAR_${prefix}_TEXT_XPATH,
};
`;
  } else {
    content = `/**
 * ${item.title} Page (SPA) — ${item.href}
 * Source: html/home.html sidebar snapshot
 * Captured: 2026-04-12
 *
 * TODO: Surf live app to capture page-specific elements (inputs, buttons, tables).
 */

// ── Sidebar Navigation ──
export const SIDEBAR_${prefix}_XPATH = "//li[@title='${item.title}']//a[@href='${item.href}']";
export const SIDEBAR_${prefix}_ICON_XPATH = "//li[@title='${item.title}']//i[contains(@class,'material-icons') and text()='${item.icon}']";
export const SIDEBAR_${prefix}_TEXT_XPATH = "//li[@title='${item.title}']//p[normalize-space()='${item.title}']";

// ── Page Elements ──
// TODO: Populate after surfing ${item.href} and capturing html/${slug}.html

// ── Element Map (Gherkin-facing) ──
export const ${prefix}_ELEMENTS: Record<string, string> = {
  'sidebar ${item.title.toLowerCase()}': SIDEBAR_${prefix}_XPATH,
  'sidebar ${item.title.toLowerCase()} icon': SIDEBAR_${prefix}_ICON_XPATH,
  'sidebar ${item.title.toLowerCase()} text': SIDEBAR_${prefix}_TEXT_XPATH,
};
`;
  }

  fs.writeFileSync(filepath, content, 'utf-8');
  created++;
  console.log(`[CREATED] ${filename}`);
}

console.log(`\nDone. Created: ${created}, Skipped: ${skipped}`);
