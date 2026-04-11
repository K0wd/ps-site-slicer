/**
 * Surf all sidebar navigation pages, capture HTML snapshots,
 * and generate stub properties files for each page.
 *
 * Usage: npx playwright test scripts/surf-sidebar.ts --project=edge
 *   or:  npx ts-node scripts/surf-sidebar.ts  (uses Playwright launch directly)
 */
import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.BASE_URL || 'https://testserver.betacom.com';
const USERNAME = process.env.TEST_USERNAME!;
const PASSWORD = process.env.TEST_PASSWORD!;

interface SidebarItem {
  title: string;
  href: string;
  icon: string;
  type: 'link' | 'parent';
}

// All sidebar items extracted from home.html snapshot
const SIDEBAR_ITEMS: SidebarItem[] = [
  { title: 'Dashboard', href: '/spa/dashboard/index', icon: 'dashboard', type: 'link' },
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

function toConstName(title: string): string {
  return title.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/(^_|_$)/g, '');
}

interface PageResult {
  title: string;
  slug: string;
  href: string;
  status: 'success' | 'error' | 'skipped';
  error?: string;
  elementCount?: number;
  htmlFile?: string;
  propertiesFile?: string;
}

async function main() {
  const htmlDir = path.resolve('html');
  const propsDir = path.resolve('tests/properties');
  const results: PageResult[] = [];

  if (!fs.existsSync(htmlDir)) fs.mkdirSync(htmlDir, { recursive: true });
  if (!fs.existsSync(propsDir)) fs.mkdirSync(propsDir, { recursive: true });

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: false,
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  // Login — two-step: username → password → safety modal
  console.log('Logging in...');
  await page.goto(`${BASE_URL}/spa/auth/login`);
  await page.waitForLoadState('networkidle');

  // Step 1: Username
  await page.fill('input[name="username"]', USERNAME);
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // Step 2: Password
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);

  // Dismiss Safe Day's Alert modal if present
  try {
    const okButton = page.locator("//button[contains(@class, 'mat-raised-button') and text()='OK']");
    await okButton.click({ timeout: 10000 });
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');
  } catch {
    console.log('No safety modal appeared, continuing...');
  }

  // Verify we're on dashboard
  await page.waitForURL(/\/spa\/dashboard/, { timeout: 15000 });
  console.log('Login successful.');

  for (const item of SIDEBAR_ITEMS) {
    const slug = toSlug(item.title);
    const result: PageResult = {
      title: item.title,
      slug,
      href: item.href,
      status: 'skipped',
    };

    if (item.type === 'parent') {
      result.status = 'skipped';
      result.error = 'Parent menu (expandable, no direct page)';
      results.push(result);
      console.log(`[SKIP] ${item.title} — parent menu`);
      continue;
    }

    try {
      console.log(`[SURF] ${item.title} → ${item.href}`);

      // Navigate via sidebar click
      const sidebarLink = page.locator(`//li[@title='${item.title}']//a[@href='${item.href}']`);
      await sidebarLink.scrollIntoViewIfNeeded({ timeout: 5000 });

      try {
        await sidebarLink.click({ timeout: 5000 });
      } catch {
        await sidebarLink.dispatchEvent('click');
      }

      // Wait for navigation
      try {
        await page.waitForURL(`**${item.href}**`, { timeout: 15000 });
      } catch {
        // Some pages redirect, just wait for load
      }
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

      // Wait a moment for SPA to render
      await page.waitForTimeout(2000);

      // Capture HTML body
      const htmlContent = await page.content();
      const htmlFile = path.join(htmlDir, `${slug}.html`);
      fs.writeFileSync(htmlFile, htmlContent, 'utf-8');
      result.htmlFile = `html/${slug}.html`;

      // Extract actionable elements from main content area
      const elements = await page.evaluate(() => {
        const selectors = [
          'input', 'button', 'select', 'textarea', 'a[href]',
          '[role="button"]', '[role="tab"]', '[role="menuitem"]',
          'table', 'mat-icon[title]', '[data-automation-id]',
          '.mat-menu-trigger', '.mat-tab-label',
        ];

        const allElements: Array<{
          tag: string;
          text: string;
          type?: string;
          name?: string;
          placeholder?: string;
          title?: string;
          href?: string;
          role?: string;
          ariaLabel?: string;
          dataAutomationId?: string;
          classes: string;
        }> = [];

        for (const sel of selectors) {
          document.querySelectorAll(sel).forEach(el => {
            // Skip sidebar and hidden elements
            const sidebar = el.closest('.sidebar');
            if (sidebar) return;
            const rect = (el as HTMLElement).getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) return;

            allElements.push({
              tag: el.tagName.toLowerCase(),
              text: (el.textContent || '').trim().substring(0, 80),
              type: el.getAttribute('type') || undefined,
              name: el.getAttribute('name') || undefined,
              placeholder: el.getAttribute('placeholder') || undefined,
              title: el.getAttribute('title') || undefined,
              href: el.getAttribute('href') || undefined,
              role: el.getAttribute('role') || undefined,
              ariaLabel: el.getAttribute('aria-label') || undefined,
              dataAutomationId: el.getAttribute('data-automation-id') || undefined,
              classes: el.className?.toString().substring(0, 100) || '',
            });
          });
        }

        // Deduplicate by a simple key
        const seen = new Set<string>();
        return allElements.filter(e => {
          const key = `${e.tag}|${e.name}|${e.text}|${e.href}|${e.title}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      });

      result.elementCount = elements.length;

      // Generate stub properties file
      const constName = toConstName(item.title);
      const lines: string[] = [
        `/**`,
        ` * ${item.title} Page (SPA) — ${item.href}`,
        ` * Source: html/${slug}.html`,
        ` * Captured: ${new Date().toISOString().split('T')[0]}`,
        ` *`,
        ` * Auto-generated stub. Review and curate before use.`,
        ` */`,
        ``,
      ];

      const mapEntries: string[] = [];
      let idx = 0;

      for (const el of elements) {
        idx++;
        let xpath = '';
        let exportName = '';
        let gherkinName = '';

        // Build best XPath based on available attributes
        if (el.dataAutomationId) {
          xpath = `//*[@data-automation-id='${el.dataAutomationId}']`;
          exportName = `${constName}_${el.dataAutomationId.toUpperCase().replace(/[^A-Z0-9]+/g, '_')}_XPATH`;
          gherkinName = el.dataAutomationId.replace(/[-_]/g, ' ').toLowerCase();
        } else if (el.name) {
          xpath = `//${el.tag}[@name='${el.name}']`;
          exportName = `${constName}_${el.name.toUpperCase().replace(/[^A-Z0-9]+/g, '_')}_XPATH`;
          gherkinName = el.name.replace(/[-_]/g, ' ').toLowerCase();
        } else if (el.title) {
          xpath = `//${el.tag}[@title='${el.title}']`;
          exportName = `${constName}_${el.title.toUpperCase().replace(/[^A-Z0-9]+/g, '_')}_XPATH`;
          gherkinName = el.title.toLowerCase();
        } else if (el.placeholder) {
          xpath = `//${el.tag}[@placeholder='${el.placeholder}']`;
          exportName = `${constName}_${el.placeholder.toUpperCase().replace(/[^A-Z0-9]+/g, '_')}_XPATH`;
          gherkinName = el.placeholder.toLowerCase();
        } else if (el.ariaLabel) {
          xpath = `//${el.tag}[@aria-label='${el.ariaLabel}']`;
          exportName = `${constName}_${el.ariaLabel.toUpperCase().replace(/[^A-Z0-9]+/g, '_')}_XPATH`;
          gherkinName = el.ariaLabel.toLowerCase();
        } else if (el.role && el.text) {
          const shortText = el.text.substring(0, 40);
          xpath = `//${el.tag}[@role='${el.role}' and contains(normalize-space(),'${shortText}')]`;
          exportName = `${constName}_GEN_${idx}_XPATH`;
          gherkinName = `${el.role} ${shortText}`.toLowerCase();
        } else if (el.text && el.text.length > 0 && el.text.length <= 40) {
          xpath = `//${el.tag}[normalize-space()='${el.text}']`;
          exportName = `${constName}_GEN_${idx}_XPATH`;
          gherkinName = el.text.toLowerCase();
        } else {
          // Skip elements we can't build a stable XPath for
          continue;
        }

        // Clean export name
        exportName = exportName.replace(/_{2,}/g, '_');

        lines.push(`export const ${exportName} = "${xpath.replace(/"/g, "'")}";`);
        mapEntries.push(`  '${gherkinName}': ${exportName},`);
      }

      // Add element map
      lines.push('');
      lines.push(`// Element Map (Gherkin-facing)`);
      lines.push(`export const ${constName}_ELEMENTS: Record<string, string> = {`);
      lines.push(...mapEntries);
      lines.push(`};`);
      lines.push('');

      const propsFile = path.join(propsDir, `${slug}.properties.ts`);
      fs.writeFileSync(propsFile, lines.join('\n'), 'utf-8');
      result.propertiesFile = `tests/properties/${slug}.properties.ts`;
      result.status = 'success';

      console.log(`  [OK] ${elements.length} elements → ${result.propertiesFile}`);
    } catch (err: any) {
      result.status = 'error';
      result.error = err.message?.substring(0, 200) || String(err);
      console.log(`  [ERR] ${item.title}: ${result.error}`);

      // Navigate back to dashboard on error
      try {
        await page.goto(`${BASE_URL}/spa/dashboard/index`, { timeout: 15000 });
        await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      } catch {
        // If we can't even get back, we'll try on next iteration
      }
    }

    results.push(result);
  }

  await browser.close();

  // Generate report
  const successPages = results.filter(r => r.status === 'success');
  const errorPages = results.filter(r => r.status === 'error');
  const skippedPages = results.filter(r => r.status === 'skipped');

  const report = [
    `# Sidebar Navigation Surfing Report`,
    ``,
    `**Date:** ${new Date().toISOString().split('T')[0]}`,
    `**Total sidebar items:** ${results.length}`,
    `**Processed successfully:** ${successPages.length}`,
    `**Errors:** ${errorPages.length}`,
    `**Skipped (parent menus):** ${skippedPages.length}`,
    ``,
    `## Successfully Processed Pages`,
    ``,
    `| # | Page | Route | Elements | Properties File |`,
    `|---|------|-------|----------|-----------------|`,
    ...successPages.map((r, i) =>
      `| ${i + 1} | ${r.title} | \`${r.href}\` | ${r.elementCount} | \`${r.propertiesFile}\` |`
    ),
    ``,
    `## Pages With Errors`,
    ``,
    ...(errorPages.length === 0 ? ['None.'] : [
      `| # | Page | Route | Error |`,
      `|---|------|-------|-------|`,
      ...errorPages.map((r, i) =>
        `| ${i + 1} | ${r.title} | \`${r.href}\` | ${r.error} |`
      ),
    ]),
    ``,
    `## Skipped Pages (Parent Menus / No Direct URL)`,
    ``,
    ...(skippedPages.length === 0 ? ['None.'] : [
      `| # | Page | Reason |`,
      `|---|------|--------|`,
      ...skippedPages.map((r, i) =>
        `| ${i + 1} | ${r.title} | ${r.error} |`
      ),
    ]),
    ``,
    `## Notes`,
    ``,
    `- Generated properties files are **stubs** — review and curate XPaths before use in tests.`,
    `- Replace \`_GEN_N\` export names with descriptive names matching project conventions.`,
    `- Remove duplicate or unstable selectors; keep max 2-3 fallback XPaths per element.`,
    `- HTML snapshots saved in \`html/\` for XPath investigation.`,
    ``,
  ].join('\n');

  fs.writeFileSync('sidebar-surfing-report.md', report, 'utf-8');
  console.log('\nReport written to sidebar-surfing-report.md');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
