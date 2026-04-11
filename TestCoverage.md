# Test Coverage (122 scenarios)

## Login (3 scenarios)
- Display the username page
- Submit username and see password page
- Login with valid credentials (full flow + Safe Day's Alert modal)

## Dashboard (25 scenarios)
- Display top bar elements (search, refresh, add widget)
- Display user profile controls (my profile, logout)
- Display sidebar navigation (80+ menu items)
- Filter sidebar menu
- Display version info
- **20 widget tests** — each adds a widget, verifies it appears, then removes it:
  - Site Manager Performance, Known Employee Locations, Announcements, Favorites, Alerts, Clocked In, Materials Over Budget, Subcontractors Over Budget, Equipment Over Budget, Profitability By Department, Past Due Tickets, Timesheet/WO discrepancies, Scheduled Tickets, Vendor Announcements, Manager Announcements, Weather Widget, TEST HTML, Add Client Shares, View Client Shares, Vendor PO List

## Forgot Password (3 scenarios)
- Display page branding
- Display reset form elements
- Display navigation links

## Nav Bar (13 scenarios)
- **7 display checks** — verify each navbar element is visible on the dashboard:
  - Sidebar toggle button, navbar brand link, refresh icon, dashboard icon, notifications icon + badge, contact support icon, search input + search button
- **6 interaction tests** — validate navbar functionality:
  - Toggle sidebar collapse and expand
  - Navigate to dashboard via navbar brand
  - Click navbar refresh icon
  - Open notifications panel
  - Open contact support panel
  - Search from navbar

## Sidebar Navigation (78 scenarios)
- **75 page navigation tests** (Scenario Outline) — each clicks a sidebar menu item, verifies the page loads at the expected route, verifies the nav bar persists (toggle, search, notifications), and saves an htmlBody snapshot:
  - Account Management, Admin Alerts, Asset Control Panel, Audit Inspector, BI Admin, Capabilities Admin, Carrier Keys, Cascade Templates, Client Admin, Close Outs, Company Directory, Company Files, Cron Utility, Dashboard, DB Query Screen, Director Admin, Divisions Admin, Document Signature Admin, Drivers Admin, Eversign, Forms Admin, Hiring, IT Support, Import Costs, Incidents Admin, Job Titles, Keys Admin, LOB Admin, Locks Admin, Logs, Maintenance, Maintenance Admin, Market Admin, Material Category Admin, Menu Editor, Message Queue, Message Recipients, Mobile Assets, Office Locations, PM Transfer, PMO Admin, PMO Dashboard, PMO SharePoint Dashboard, PTO Admin, Performance, Personal Assets, Project Tracker, Projects, Projects Admin, Purchasing, Purchasing Admin, Quoting, Report DB, Reports, Search, Site Alerts, Site Upload Admin, Tax Group Admin, Temp Files, Texting, Time Zone Admin, Timedata, Timesheet Admin, Timesheets, Training, Transfer Tickets, UAC System, UI Config, Update Users Import, Users Admin, Vendor Admin, Vendor Admin-Old, WO Folder Setup, WO Tracker, WOT Export Queue
- **3 parent menu expansion tests** — each clicks a parent menu and verifies the submenu expands:
  - Certificates, Files, RTWP
