# Sidebar Navigation Surfing Report

**Date:** 2026-04-12
**Source:** `html/home.html` (captured 2026-04-08)
**Properties files generated:** 76 individual files in `tests/properties/`

## Summary

| Metric | Count |
|--------|-------|
| Total sidebar items | 78 |
| Navigable pages (have href) | 74 |
| Parent menus (expandable, no href) | 3 |
| Category headers (no link) | 1 |
| Properties files created | 76 (1 per page, skipped existing `dashboard`, `Admin` header) |
| Surfing script created | `scripts/surf-sidebar.ts` |
| Generator script | `scripts/generate-sidebar-properties.ts` |

## Successfully Processed — Navigable Sidebar Pages (74)

All XPaths use stable `@title` + `@href` anchors per project rules.

| # | Page | Route | Icon | XPath Constant |
|---|------|-------|------|----------------|
| 1 | Dashboard | `/spa/dashboard/index` | dashboard | `SIDEBAR_DASHBOARD_XPATH` |
| 2 | Account Management | `/spa/users/vendorselfedit` | table_chart | `SIDEBAR_ACCOUNT_MANAGEMENT_XPATH` |
| 3 | Admin Alerts | `/spa/uac/admin_alerts` | lock | `SIDEBAR_ADMIN_ALERTS_XPATH` |
| 4 | Asset Control Panel | `/spa/generators/cp` | lock | `SIDEBAR_ASSET_CONTROL_PANEL_XPATH` |
| 5 | Audit Inspector | `/spa/dbupdates/auditinspector` | table_chart | `SIDEBAR_AUDIT_INSPECTOR_XPATH` |
| 6 | BI Admin | `/spa/bi/dashboardlist` | lock | `SIDEBAR_BI_ADMIN_XPATH` |
| 7 | Capabilities Admin | `/spa/requests/capabilitiesadmin` | lock | `SIDEBAR_CAPABILITIES_ADMIN_XPATH` |
| 8 | Carrier Keys | `/spa/carriers/index` | lock | `SIDEBAR_CARRIER_KEYS_XPATH` |
| 9 | Client Admin | `/spa/clientmanagements/index` | lock | `SIDEBAR_CLIENT_ADMIN_XPATH` |
| 10 | Close Outs | `/spa/sitephotos/index-new` | linked_camera | `SIDEBAR_CLOSE_OUTS_XPATH` |
| 11 | Company Directory | `/spa/companydirectory/index` | account_balance | `SIDEBAR_COMPANY_DIRECTORY_XPATH` |
| 12 | Company Files | `/spa/commons/index` | folder_shared | `SIDEBAR_COMPANY_FILES_XPATH` |
| 13 | Cron Utility | `/spa/admins/cronutility` | lock | `SIDEBAR_CRON_UTILITY_XPATH` |
| 14 | DB Query Screen | `/spa/dbupdates/query` | lock | `SIDEBAR_DB_QUERY_SCREEN_XPATH` |
| 15 | Director Admin | `/spa/director-admin` | lock | `SIDEBAR_DIRECTOR_ADMIN_XPATH` |
| 16 | Divisions Admin | `/spa/main/division-admin` | lock | `SIDEBAR_DIVISIONS_ADMIN_XPATH` |
| 17 | Document Signature Admin | `/spa/prepare-sign-doc` | lock | `SIDEBAR_DOCUMENT_SIGNATURE_ADMIN_XPATH` |
| 18 | Drivers Admin | `/spa/Drivers/index` | lock | `SIDEBAR_DRIVERS_ADMIN_XPATH` |
| 19 | Eversign | `/spa/dashboard/onlinesigning` | fiber_new | `SIDEBAR_EVERSIGN_XPATH` |
| 20 | Forms Admin | `/spa/forms/index` | lock | `SIDEBAR_FORMS_ADMIN_XPATH` |
| 21 | Hiring | `/spa/hires/index` | fiber_new | `SIDEBAR_HIRING_XPATH` |
| 22 | IT Support | `/spa/ittickets/freshdesklogin` | help | `SIDEBAR_IT_SUPPORT_XPATH` |
| 23 | Import Costs | `/spa/requests/importcosts` | lock | `SIDEBAR_IMPORT_COSTS_XPATH` |
| 24 | Incidents Admin | `/spa/incidents/index-new` | lock | `SIDEBAR_INCIDENTS_ADMIN_XPATH` |
| 25 | Job Titles | `/spa/requests/job-title-admin` | account_balance | `SIDEBAR_JOB_TITLES_XPATH` |
| 26 | Keys Admin | `/spa/admin/keys` | lock | `SIDEBAR_KEYS_ADMIN_XPATH` |
| 27 | LOB Admin | `/spa/main/lob-admin` | lock | `SIDEBAR_LOB_ADMIN_XPATH` |
| 28 | Locks Admin | `/spa/locks/index` | lock | `SIDEBAR_LOCKS_ADMIN_XPATH` |
| 29 | Logs | `/spa/admins/logs` | lock | `SIDEBAR_LOGS_XPATH` |
| 30 | Maintenance | `/spa/sites/pickmarket` | settings_input_antenna | `SIDEBAR_MAINTENANCE_XPATH` |
| 31 | Maintenance Admin | `/spa/requests/maintadmin` | lock | `SIDEBAR_MAINTENANCE_ADMIN_XPATH` |
| 32 | Market Admin | `/spa/requests/marketadmin` | lock | `SIDEBAR_MARKET_ADMIN_XPATH` |
| 33 | Material Category Admin | `/spa/drivers/admin` | lock | `SIDEBAR_MATERIAL_CATEGORY_ADMIN_XPATH` |
| 34 | Menu Editor | `/spa/main/admin` | fiber_new | `SIDEBAR_MENU_EDITOR_XPATH` |
| 35 | Message Queue | `/spa/messages/index` | lock | `SIDEBAR_MESSAGE_QUEUE_XPATH` |
| 36 | Message Recipients | `/spa/recipients/index` | lock | `SIDEBAR_MESSAGE_RECIPIENTS_XPATH` |
| 37 | Mobile Assets | `/spa/generators/index` | commute | `SIDEBAR_MOBILE_ASSETS_XPATH` |
| 38 | Office Locations | `/spa/officelocations/index` | location_city | `SIDEBAR_OFFICE_LOCATIONS_XPATH` |
| 39 | PM Transfer | `/spa/pm_transfer` | lock | `SIDEBAR_PM_TRANSFER_XPATH` |
| 40 | PMO Admin | `/spa/dashboard/pmoadmin` | dashboard | `SIDEBAR_PMO_ADMIN_XPATH` |
| 41 | PMO Dashboard | `/spa/dashboard/index/pmo` | table_chart | `SIDEBAR_PMO_DASHBOARD_XPATH` |
| 42 | PMO SharePoint Dashboard | `/spa/iframes/sharepoint1` | table_chart | `SIDEBAR_PMO_SHAREPOINT_DASHBOARD_XPATH` |
| 43 | PTO Admin | `/spa/timesheets/benefitsadmin` | lock | `SIDEBAR_PTO_ADMIN_XPATH` |
| 44 | Performance | `/spa/admins/timelogview` | lock | `SIDEBAR_PERFORMANCE_XPATH` |
| 45 | Personal Assets | `/spa/passets/index` | phonelink | `SIDEBAR_PERSONAL_ASSETS_XPATH` |
| 46 | Project Tracker | `/spa/clients` | format_list_numbered | `SIDEBAR_PROJECT_TRACKER_XPATH` |
| 47 | Projects | `/spa/projects/tracker` | format_list_numbered | `SIDEBAR_PROJECTS_XPATH` |
| 48 | Projects Admin | `/spa/projects/admin` | lock | `SIDEBAR_PROJECTS_ADMIN_XPATH` |
| 49 | Purchasing | `/spa/pos/index-new` | monetization_on | `SIDEBAR_PURCHASING_XPATH` |
| 50 | Purchasing Admin | `/spa/pos/admin` | lock | `SIDEBAR_PURCHASING_ADMIN_XPATH` |
| 51 | Quoting | `/spa/boms/index-new` | money | `SIDEBAR_QUOTING_XPATH` |
| 52 | Report DB | `/spa/admins/pma` | lock | `SIDEBAR_REPORT_DB_XPATH` |
| 53 | Reports | `/spa/reports/index` | multiline_chart | `SIDEBAR_REPORTS_XPATH` |
| 54 | Search | `/spa/requests/searchtab` | search | `SIDEBAR_SEARCH_XPATH` |
| 55 | Site Alerts | `/spa/sitealerts/index` | alarm | `SIDEBAR_SITE_ALERTS_XPATH` |
| 56 | Site Upload Admin | `/spa/Sites/massupdate` | lock | `SIDEBAR_SITE_UPLOAD_ADMIN_XPATH` |
| 57 | Tax Group Admin | `/spa/main/taxes-admin` | lock | `SIDEBAR_TAX_GROUP_ADMIN_XPATH` |
| 58 | Temp Files | `/spa/downloads/temps` | lock | `SIDEBAR_TEMP_FILES_XPATH` |
| 59 | Texting | `/spa/texting/index` | message | `SIDEBAR_TEXTING_XPATH` |
| 60 | Time Zone Admin | `/spa/admins/states` | lock | `SIDEBAR_TIME_ZONE_ADMIN_XPATH` |
| 61 | Timedata | `/spa/timedatas/index` | table_chart | `SIDEBAR_TIMEDATA_XPATH` |
| 62 | Timesheet Admin | `/spa/timesheets/admin` | lock | `SIDEBAR_TIMESHEET_ADMIN_XPATH` |
| 63 | Timesheets | `/spa/timesheets/review` | history | `SIDEBAR_TIMESHEETS_XPATH` |
| 64 | Training | `/spa/training/index` | thumb_up | `SIDEBAR_TRAINING_XPATH` |
| 65 | Transfer Tickets | `/spa/requests/transfer` | lock | `SIDEBAR_TRANSFER_TICKETS_XPATH` |
| 66 | UAC System | `/spa/uac/index` | lock | `SIDEBAR_UAC_SYSTEM_XPATH` |
| 67 | UI Config | `/spa/keys/uiconfig` | multiline_chart | `SIDEBAR_UI_CONFIG_XPATH` |
| 68 | Update Users Import | `/spa/users/import` | lock | `SIDEBAR_UPDATE_USERS_IMPORT_XPATH` |
| 69 | Users Admin | `/spa/users/index` | lock | `SIDEBAR_USERS_ADMIN_XPATH` |
| 70 | Vendor Admin | `/spa/main/vendors-admin` | lock | `SIDEBAR_VENDOR_ADMIN_XPATH` |
| 71 | Vendor Admin-Old | `/spa/users/vendorreview` | business | `SIDEBAR_VENDOR_ADMIN_OLD_XPATH` |
| 72 | WO Folder Setup | `/spa/directoryservices/permadmin` | lock | `SIDEBAR_WO_FOLDER_SETUP_XPATH` |
| 73 | WO Tracker | `/spa/wots/index-new` | table_chart | `SIDEBAR_WO_TRACKER_XPATH` |
| 74 | WOT Export Queue | `/spa/wotexports/index` | lock | `SIDEBAR_WOT_EXPORT_QUEUE_XPATH` |

## Pages With Problems

### Parent Menus (expandable, no direct URL — need submenu investigation)

| # | Page | Icon | Issue |
|---|------|------|-------|
| 1 | **Admin** | — | Category header only, no `<a>` tag, no href. Acts as a visual section divider. |
| 2 | **Certificates** | monetization_on | Expandable parent menu (`cursor: pointer`, no `href`). Submenus not captured — need to click to expand and capture children. |
| 3 | **Files** | folder_open | Expandable parent menu (`cursor: pointer`, no `href`). Submenus not captured — need to click to expand and capture children. |
| 4 | **RTWP** | table_chart | Expandable parent menu (`cursor: pointer`, no `href`). Submenus not captured — need to click to expand and capture children. |

### DNS/Network Issue

The test server (`testserver.betacom.com`) was **not reachable** from this machine (`ERR_NAME_NOT_RESOLVED`), so the live surfing script (`scripts/surf-sidebar.ts`) could not execute. All XPaths were generated from the existing `html/home.html` snapshot instead.

### Per-Page Element Surfing Not Completed

The properties file covers **sidebar navigation XPaths only**. Individual page element inventories (inputs, buttons, tables on each page) require:
1. Network access to the test server
2. Running `scripts/surf-sidebar.ts` which will visit each page, capture HTML, and generate per-page stub properties

## Deliverables

| File | Description |
|------|-------------|
| `tests/features/sidebar-navigation.feature` | 77 Gherkin scenarios (74 navigable + 3 parent menus) — clicks each menu, verifies page loads, saves htmlBody |
| `tests/steps/sidebar-navigation.steps.ts` | Step definitions — sidebar click, page load assertion, htmlBody snapshot save, parent menu expand |
| `tests/properties/<page>.properties.ts` (x76) | Individual properties file per sidebar page — sidebar nav XPaths + Gherkin element map + TODO placeholders for page elements |
| `scripts/generate-sidebar-properties.ts` | Generator script (re-runnable, skips existing files) |
| `scripts/surf-sidebar.ts` | Playwright script to surf all pages live and populate page-specific elements (run when server is accessible) |
| `sidebar-surfing-report.md` | This report |

## Next Steps

1. **Connect to VPN / ensure DNS resolves** `testserver.betacom.com` from this machine
2. **Run** `npx tsx scripts/surf-sidebar.ts` to surf all 74 pages and generate per-page properties stubs
3. **Expand parent menus** (Certificates, Files, RTWP) to discover and capture their submenu items
4. **Curate** generated stub properties: rename `_GEN_N` exports, remove duplicates, add fallback XPaths where DOM drift is known
