Feature: Sidebar Navigation

  Background:
    Given I am logged in and on the dashboard

  Scenario Outline: Navigate to "<Page>" via sidebar
    When I click the "<Page>" sidebar menu item
    Then the "<Page>" page should load at "<Route>"
    And I save the htmlBody snapshot for "<Page>"

    Examples:
      | Page                     | Route                              |
      | Account Management       | /spa/users/vendorselfedit          |
      | Admin Alerts             | /spa/uac/admin_alerts              |
      | Asset Control Panel      | /spa/generators/cp                 |
      | Audit Inspector          | /spa/dbupdates/auditinspector      |
      | BI Admin                 | /spa/bi/dashboardlist              |
      | Capabilities Admin       | /spa/requests/capabilitiesadmin    |
      | Carrier Keys             | /spa/carriers/index                |
      | Client Admin             | /spa/clientmanagements/index       |
      | Close Outs               | /spa/sitephotos/index-new          |
      | Company Directory        | /spa/companydirectory/index        |
      | Company Files            | /spa/commons/index                 |
      | Cron Utility             | /spa/admins/cronutility            |
      | DB Query Screen          | /spa/dbupdates/query               |
      | Dashboard                | /spa/dashboard/index               |
      | Director Admin           | /spa/director-admin                |
      | Divisions Admin          | /spa/main/division-admin           |
      | Document Signature Admin | /spa/prepare-sign-doc              |
      | Drivers Admin            | /spa/Drivers/index                 |
      | Eversign                 | /spa/dashboard/onlinesigning       |
      | Forms Admin              | /spa/forms/index                   |
      | Hiring                   | /spa/hires/index                   |
      | IT Support               | /spa/ittickets/freshdesklogin      |
      | Import Costs             | /spa/requests/importcosts          |
      | Incidents Admin          | /spa/incidents/index-new           |
      | Job Titles               | /spa/requests/job-title-admin      |
      | Keys Admin               | /spa/admin/keys                    |
      | LOB Admin                | /spa/main/lob-admin                |
      | Locks Admin              | /spa/locks/index                   |
      | Logs                     | /spa/admins/logs                   |
      | Maintenance              | /spa/sites/pickmarket              |
      | Maintenance Admin        | /spa/requests/maintadmin           |
      | Market Admin             | /spa/requests/marketadmin          |
      | Material Category Admin  | /spa/drivers/admin                 |
      | Menu Editor              | /spa/main/admin                    |
      | Message Queue            | /spa/messages/index                |
      | Message Recipients       | /spa/recipients/index              |
      | Mobile Assets            | /spa/generators/index              |
      | Office Locations         | /spa/officelocations/index         |
      | PM Transfer              | /spa/pm_transfer                   |
      | PMO Admin                | /spa/dashboard/pmoadmin            |
      | PMO Dashboard            | /spa/dashboard/index/pmo           |
      | PMO SharePoint Dashboard | /spa/iframes/sharepoint1           |
      | PTO Admin                | /spa/timesheets/benefitsadmin      |
      | Performance              | /spa/admins/timelogview            |
      | Personal Assets          | /spa/passets/index                 |
      | Project Tracker          | /spa/clients                       |
      | Projects                 | /spa/projects/tracker              |
      | Projects Admin           | /spa/projects/admin                |
      | Purchasing               | /spa/pos/index-new                 |
      | Purchasing Admin         | /spa/pos/admin                     |
      | Quoting                  | /spa/boms/index-new                |
      | Report DB                | /spa/admins/pma                    |
      | Reports                  | /spa/reports/index                 |
      | Search                   | /spa/requests/searchtab            |
      | Site Alerts              | /spa/sitealerts/index              |
      | Site Upload Admin        | /spa/Sites/massupdate              |
      | Tax Group Admin          | /spa/main/taxes-admin              |
      | Temp Files               | /spa/downloads/temps               |
      | Texting                  | /spa/texting/index                 |
      | Time Zone Admin          | /spa/admins/states                 |
      | Timedata                 | /spa/timedatas/index               |
      | Timesheet Admin          | /spa/timesheets/admin              |
      | Timesheets               | /spa/timesheets/review             |
      | Training                 | /spa/training/index                |
      | Transfer Tickets         | /spa/requests/transfer             |
      | UAC System               | /spa/uac/index                     |
      | UI Config                | /spa/keys/uiconfig                 |
      | Update Users Import      | /spa/users/import                  |
      | Users Admin              | /spa/users/index                   |
      | Vendor Admin             | /spa/main/vendors-admin            |
      | Vendor Admin-Old         | /spa/users/vendorreview            |
      | WO Folder Setup          | /spa/directoryservices/permadmin   |
      | WO Tracker               | /spa/wots/index-new                |
      | WOT Export Queue         | /spa/wotexports/index              |

  Scenario Outline: Expand "<Parent>" parent menu
    When I click the "<Parent>" sidebar parent menu
    Then the "<Parent>" submenu should expand

    Examples:
      | Parent       |
      | Certificates |
      | Files        |
      | RTWP         |
