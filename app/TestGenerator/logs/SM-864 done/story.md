# Chomp Story — 16 Apr 2026, 09:09 AM

> Automated QA journey for **[SM-864](https://powerslicesoftware.atlassian.net/browse/SM-864)**

---


## Step 1 — Verify Jira Auth
**Time:** 09:09:58 AM

- Email: kbandeleon@gmail.com
- Base URL: https://powerslicesoftware.atlassian.net

> **PASS** — Jira auth verified


<details>
<summary>Auth response</summary>

```
# Jira Auth — Step 1
**Date:** 2026-04-16 09:09:55
```
Authentication successful!
  Display name: Kim Bandeleon
  Email: kbandeleon@gmail.com
```
```

</details>


## Step 2 — Find Ticket
**Time:** 09:09:58 AM

- Filter: **me**
- Found **10** eligible ticket(s)
- Selected ticket: **[SM-864](https://powerslicesoftware.atlassian.net/browse/SM-864)**
- Summary: "summary": "Vendor Admin- Make AG Grid with Filters and Sorting"

> **PASS** — [SM-864](https://powerslicesoftware.atlassian.net/browse/SM-864) identified


<details>
<summary>Search result</summary>

```
{
  "returned": 10,
  "issues": [
    {
      "expand": "renderedFields,names,schema,operations,editmeta,changelog,versionedRepresentations",
      "id": "11934",
      "self": "https://powerslicesoftware.atlassian.net/rest/api/3/issue/11934",
      "key": "SM-864",
      "fields": {
        "summary": "Vendor Admin- Make AG Grid with Filters and Sorting",
        "reporter": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/user?accountId=712020%3A5bcbe064-5225-4b1d-9b13-bb9899f103d3",
          "accountId": "712020:5bcbe064-5225-4b1d-9b13-bb9899f103d3",
          "avatarUrls": {
            "48x48": "https://secure.gravatar.com/avatar/e804177b75d71af3d8cb0ceea596cc5c?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKH-0.png",
            "24x24": "https://secure.gravatar.com/avatar/e804177b75d71af3d8cb0ceea596cc5c?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKH-0.png",
            "16x16": "https://secure.gravatar.com/avatar/e804177b75d71af3d8cb0ceea596cc5c?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKH-0.png",
            "32x32": "https://secure.gravatar.com/avatar/e804177b75d71af3d8cb0ceea596cc5c?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKH-0.png"
          },
          "displayName": "Kim Heinz",
          "active": true,
          "timeZone": "America/New_York",
          "accountType": "atlassian"
        },
        "assignee": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/user?accountId=712020%3Aef17094f-7b60-4856-b69e-136a7bdbff64",
          "accountId": "712020:ef17094f-7b60-4856-b69e-136a7bdbff64",
          "emailAddress": "kbandeleon@gmail.com",
          "avatarUrls": {
            "48x48": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/48",
            "24x24": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/24",
            "16x16": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/16",
            "32x32": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/32"
          },
          "displayName": "Kim Bandeleon",
          "active": true,
          "timeZone": "Singapore",
          "accountType": "atlassian"
        },
        "priority": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/priority/2",
          "iconUrl": "https://powerslicesoftware.atlassian.net/images/icons/priorities/high_new.svg",
          "name": "High",
          "id": "2"
        },
        "status": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/status/10015",
          "description": "",
          "iconUrl": "https://powerslicesoftware.atlassian.net/images/icons/statuses/generic.png",
          "name": "On Stage",
          "id": "10015",
          "statusCategory": {
            "self": "https://powerslicesoftware.atlassian.net/rest/api/3/statuscategory/4",
            "id": 4,
            "key": "indeterminate",
            "colorName": "yellow",
            "name": "In Progress"
          }
        }
      }
    },
    {
      "expand": "renderedFields,names,schema,operations,editmeta,changelog,versionedRepresentations",
      "id": "13023",
      "self": "https://powerslicesoftware.atlassian.net/rest/api/3/issue/13023",
      "key": "SM-934",
      "fields": {
        "summary": "Vendor Admin- Navigate to Vendor Profile from Company Name Click",
        "reporter": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/user?accountId=712020%3A5bcbe064-5225-4b1d-9b13-bb9899f103d3",
          "accountId": "712020:5bcbe064-5225-4b1d-9b13-bb9899f103d3",
          "avatarUrls": {
            "48x48": "https://secure.gravatar.com/avatar/e804177b75d71af3d8cb0ceea596cc5c?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKH-0.png",
            "24x24": "https://secure.gravatar.com/avatar/e804177b75d71af3d8cb0ceea596cc5c?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKH-0.png",
            "16x16": "https://secure.gravatar.com/avatar/e804177b75d71af3d8cb0ceea596cc5c?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKH-0.png",
            "32x32": "https://secure.gravatar.com/avatar/e804177b75d71af3d8cb0ceea596cc5c?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKH-0.png"
          },
          "displayName": "Kim Heinz",
          "active": true,
          "timeZone": "America/New_York",
          "accountType": "atlassian"
        },
        "assignee": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/user?accountId=712020%3Aef17094f-7b60-4856-b69e-136a7bdbff64",
          "accountId": "712020:ef17094f-7b60-4856-b69e-136a7bdbff64",
          "emailAddress": "kbandeleon@gmail.com",
          "avatarUrls": {
            "48x48": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/48",
            "24x24": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/24",
            "16x16": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/16",
            "32x32": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/32"
          },
          "displayName": "Kim Bandeleon",
          "active": true,
          "timeZone": "Singapore",
          "accountType": "atlassian"
        },
        "priority": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/priority/2",
          "iconUrl": "https://powerslicesoftware.atlassian.net/images/icons/priorities/high_new.svg",
          "name": "High",
          "id": "2"
        },
        "status": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/status/10015",
          "description": "",
          "iconUrl": "https://powerslicesoftware.atlassian.net/images/icons/statuses/generic.png",
          "name": "On Stage",
          "id": "10015",
          "statusCategory": {
            "self": "https://powerslicesoftware.atlassian.net/rest/api/3/statuscategory/4",
            "id": 4,
            "key": "indeterminate",
            "colorName": "yellow",
            "name": "In Progress"
          }
        }
      }
    },
    {
      "expand": "renderedFields,names,schema,operations,editmeta,changelog,versionedRepresentations",
      "id": "17994",
      "self": "https://powerslicesoftware.atlassian.net/rest/api/3/issue/17994",
      "key": "SM-1030",
      "fields": {
        "summary": "Vendor Admin - Add Save View button with Select View drop down",
        "reporter": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/user?accountId=712020%3A5bcbe064-5225-4b1d-9b13-bb9899f103d3",
          "accountId": "712020:5bcbe064-5225-4b1d-9b13-bb9899f103d3",
          "avatarUrls": {
            "48x48": "https://secure.gravatar.com/avatar/e804177b75d71af3d8cb0ceea596cc5c?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKH-0.png",
            "24x24": "https://secure.gravatar.com/avatar/e804177b75d71af3d8cb0ceea596cc5c?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKH-0.png",
            "16x16": "https://secure.gravatar.com/avatar/e804177b75d71af3d8cb0ceea596cc5c?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKH-0.png",
            "32x32": "https://secure.gravatar.com/avatar/e804177b75d71af3d8cb0ceea596cc5c?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKH-0.png"
          },
          "displayName": "Kim Heinz",
          "active": true,
          "timeZone": "America/New_York",
          "accountType": "atlassian"
        },
        "assignee": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/user?accountId=712020%3Aef17094f-7b60-4856-b69e-136a7bdbff64",
          "accountId": "712020:ef17094f-7b60-4856-b69e-136a7bdbff64",
          "emailAddress": "kbandeleon@gmail.com",
          "avatarUrls": {
            "48x48": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/48",
            "24x24": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/24",
            "16x16": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/16",
            "32x32": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/32"
          },
          "displayName": "Kim Bandeleon",
          "active": true,
          "timeZone": "Singapore",
          "accountType": "atlassian"
        },
        "priority": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/priority/2",
          "iconUrl": "https://powerslicesoftware.atlassian.net/images/icons/priorities/high_new.svg",
          "name": "High",
          "id": "2"
        },
        "status": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/status/10015",
          "description": "",
          "iconUrl": "https://powerslicesoftware.atlassian.net/images/icons/statuses/generic.png",
          "name": "On Stage",
          "id": "10015",
          "statusCategory": {
            "self": "https://powerslicesoftware.atlassian.net/rest/api/3/statuscategory/4",
            "id": 4,
            "key": "indeterminate",
            "colorName": "yellow",
            "name": "In Progress"
          }
        }
      }
    },
    {
      "expand": "renderedFields,names,schema,operations,editmeta,changelog,versionedRepresentations",
      "id": "18063",
      "self": "https://powerslicesoftware.atlassian.net/rest/api/3/issue/18063",
      "key": "SM-1032",
      "fields": {
        "summary": "Vendor Admin - Add drop downs within the grid to the requested columns",
        "reporter": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/user?accountId=712020%3A5bcbe064-5225-4b1d-9b13-bb9899f103d3",
          "accountId": "712020:5bcbe064-5225-4b1d-9b13-bb9899f103d3",
          "avatarUrls": {
            "48x48": "https://secure.gravatar.com/avatar/e804177b75d71af3d8cb0ceea596cc5c?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKH-0.png",
            "24x24": "https://secure.gravatar.com/avatar/e804177b75d71af3d8cb0ceea596cc5c?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKH-0.png",
            "16x16": "https://secure.gravatar.com/avatar/e804177b75d71af3d8cb0ceea596cc5c?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKH-0.png",
            "32x32": "https://secure.gravatar.com/avatar/e804177b75d71af3d8cb0ceea596cc5c?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKH-0.png"
          },
          "displayName": "Kim Heinz",
          "active": true,
          "timeZone": "America/New_York",
          "accountType": "atlassian"
        },
        "assignee": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/user?accountId=712020%3Aef17094f-7b60-4856-b69e-136a7bdbff64",
          "accountId": "712020:ef17094f-7b60-4856-b69e-136a7bdbff64",
          "emailAddress": "kbandeleon@gmail.com",
          "avatarUrls": {
            "48x48": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/48",
            "24x24": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/24",
            "16x16": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/16",
            "32x32": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/32"
          },
          "displayName": "Kim Bandeleon",
          "active": true,
          "timeZone": "Singapore",
          "accountType": "atlassian"
        },
        "priority": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/priority/2",
          "iconUrl": "https://powerslicesoftware.atlassian.net/images/icons/priorities/high_new.svg",
          "name": "High",
          "id": "2"
        },
        "status": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/status/10015",
          "description": "",
          "iconUrl": "https://powerslicesoftware.atlassian.net/images/icons/statuses/generic.png",
          "name": "On Stage",
          "id": "10015",
          "statusCategory": {
            "self": "https://powerslicesoftware.atlassian.net/rest/api/3/statuscategory/4",
            "id": 4,
            "key": "indeterminate",
            "colorName": "yellow",
            "name": "In Progress"
          }
        }
      }
    },
    {
      "expand": "renderedFields,names,schema,operations,editmeta,changelog,versionedRepresentations",
      "id": "20155",
      "self": "https://powerslicesoftware.atlassian.net/rest/api/3/issue/20155",
      "key": "SM-1053",
      "fields": {
        "summary": "Vendor Admin - New Vendor Form Update Address Field Location",
        "reporter": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/user?accountId=712020%3A5bcbe064-5225-4b1d-9b13-bb9899f103d3",
          "accountId": "712020:5bcbe064-5225-4b1d-9b13-bb9899f103d3",
          "avatarUrls": {
            "48x48": "https://secure.gravatar.com/avatar/e804177b75d71af3d8cb0ceea596cc5c?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKH-0.png",
            "24x24": "https://secure.gravatar.com/avatar/e804177b75d71af3d8cb0ceea596cc5c?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKH-0.png",
            "16x16": "https://secure.gravatar.com/avatar/e804177b75d71af3d8cb0ceea596cc5c?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKH-0.png",
            "32x32": "https://secure.gravatar.com/avatar/e804177b75d71af3d8cb0ceea596cc5c?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKH-0.png"
          },
          "displayName": "Kim Heinz",
          "active": true,
          "timeZone": "America/New_York",
          "accountType": "atlassian"
        },
        "assignee": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/user?accountId=712020%3Aef17094f-7b60-4856-b69e-136a7bdbff64",
          "accountId": "712020:ef17094f-7b60-4856-b69e-136a7bdbff64",
          "emailAddress": "kbandeleon@gmail.com",
          "avatarUrls": {
            "48x48": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/48",
            "24x24": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/24",
            "16x16": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/16",
            "32x32": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/32"
          },
          "displayName": "Kim Bandeleon",
          "active": true,
          "timeZone": "Singapore",
          "accountType": "atlassian"
        },
        "priority": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/priority/2",
          "iconUrl": "https://powerslicesoftware.atlassian.net/images/icons/priorities/high_new.svg",
          "name": "High",
          "id": "2"
        },
        "status": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/status/10015",
          "description": "",
          "iconUrl": "https://powerslicesoftware.atlassian.net/images/icons/statuses/generic.png",
          "name": "On Stage",
          "id": "10015",
          "statusCategory": {
            "self": "https://powerslicesoftware.atlassian.net/rest/api/3/statuscategory/4",
            "id": 4,
            "key": "indeterminate",
            "colorName": "yellow",
            "name": "In Progress"
          }
        }
      }
    },
    {
      "expand": "renderedFields,names,schema,operations,editmeta,changelog,versionedRepresentations",
      "id": "20600",
      "self": "https://powerslicesoftware.atlassian.net/rest/api/3/issue/20600",
      "key": "SM-1064",
      "fields": {
        "summary": "Vendor Admin - Add Section for \"Upload/Replace Company Logo\"",
        "reporter": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/user?accountId=712020%3A5bcbe064-5225-4b1d-9b13-bb9899f103d3",
          "accountId": "712020:5bcbe064-5225-4b1d-9b13-bb9899f103d3",
          "avatarUrls": {
            "48x48": "https://secure.gravatar.com/avatar/e804177b75d71af3d8cb0ceea596cc5c?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKH-0.png",
            "24x24": "https://secure.gravatar.com/avatar/e804177b75d71af3d8cb0ceea596cc5c?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKH-0.png",
            "16x16": "https://secure.gravatar.com/avatar/e804177b75d71af3d8cb0ceea596cc5c?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKH-0.png",
            "32x32": "https://secure.gravatar.com/avatar/e804177b75d71af3d8cb0ceea596cc5c?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKH-0.png"
          },
          "displayName": "Kim Heinz",
          "active": true,
          "timeZone": "America/New_York",
          "accountType": "atlassian"
        },
        "assignee": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/user?accountId=712020%3Aef17094f-7b60-4856-b69e-136a7bdbff64",
          "accountId": "712020:ef17094f-7b60-4856-b69e-136a7bdbff64",
          "emailAddress": "kbandeleon@gmail.com",
          "avatarUrls": {
            "48x48": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/48",
            "24x24": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/24",
            "16x16": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/16",
            "32x32": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/32"
          },
          "displayName": "Kim Bandeleon",
          "active": true,
          "timeZone": "Singapore",
          "accountType": "atlassian"
        },
        "priority": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/priority/2",
          "iconUrl": "https://powerslicesoftware.atlassian.net/images/icons/priorities/high_new.svg",
          "name": "High",
          "id": "2"
        },
        "status": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/status/10015",
          "description": "",
          "iconUrl": "https://powerslicesoftware.atlassian.net/images/icons/statuses/generic.png",
          "name": "On Stage",
          "id": "10015",
          "statusCategory": {
            "self": "https://powerslicesoftware.atlassian.net/rest/api/3/statuscategory/4",
            "id": 4,
            "key": "indeterminate",
            "colorName": "yellow",
            "name": "In Progress"
          }
        }
      }
    },
    {
      "expand": "renderedFields,names,schema,operations,editmeta,changelog,versionedRepresentations",
      "id": "13032",
      "self": "https://powerslicesoftware.atlassian.net/rest/api/3/issue/13032",
      "key": "SM-939",
      "fields": {
        "summary": "AG Grid Modules- Standardize AG Grid Button Layout Across Modules",
        "reporter": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/user?accountId=712020%3A5bcbe064-5225-4b1d-9b13-bb9899f103d3",
          "accountId": "712020:5bcbe064-5225-4b1d-9b13-bb9899f103d3",
          "avatarUrls": {
            "48x48": "https://secure.gravatar.com/avatar/e804177b75d71af3d8cb0ceea596cc5c?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKH-0.png",
            "24x24": "https://secure.gravatar.com/avatar/e804177b75d71af3d8cb0ceea596cc5c?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKH-0.png",
            "16x16": "https://secure.gravatar.com/avatar/e804177b75d71af3d8cb0ceea596cc5c?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKH-0.png",
            "32x32": "https://secure.gravatar.com/avatar/e804177b75d71af3d8cb0ceea596cc5c?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKH-0.png"
          },
          "displayName": "Kim Heinz",
          "active": true,
          "timeZone": "America/New_York",
          "accountType": "atlassian"
        },
        "assignee": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/user?accountId=712020%3Aef17094f-7b60-4856-b69e-136a7bdbff64",
          "accountId": "712020:ef17094f-7b60-4856-b69e-136a7bdbff64",
          "emailAddress": "kbandeleon@gmail.com",
          "avatarUrls": {
            "48x48": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/48",
            "24x24": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/24",
            "16x16": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/16",
            "32x32": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/32"
          },
          "displayName": "Kim Bandeleon",
          "active": true,
          "timeZone": "Singapore",
          "accountType": "atlassian"
        },
        "priority": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/priority/2",
          "iconUrl": "https://powerslicesoftware.atlassian.net/images/icons/priorities/high_new.svg",
          "name": "High",
          "id": "2"
        },
        "status": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/status/10103",
          "description": "",
          "iconUrl": "https://powerslicesoftware.atlassian.net/images/icons/statuses/generic.png",
          "name": "Testing",
          "id": "10103",
          "statusCategory": {
            "self": "https://powerslicesoftware.atlassian.net/rest/api/3/statuscategory/4",
            "id": 4,
            "key": "indeterminate",
            "colorName": "yellow",
            "name": "In Progress"
          }
        }
      }
    },
    {
      "expand": "renderedFields,names,schema,operations,editmeta,changelog,versionedRepresentations",
      "id": "21834",
      "self": "https://powerslicesoftware.atlassian.net/rest/api/3/issue/21834",
      "key": "SM-1077",
      "fields": {
        "summary": "PWA - Clock Simple Module",
        "reporter": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/user?accountId=557058%3Abdfab7dd-5cb5-4b04-a54a-c758c7678401",
          "accountId": "557058:bdfab7dd-5cb5-4b04-a54a-c758c7678401",
          "avatarUrls": {
            "48x48": "https://secure.gravatar.com/avatar/bfa5030119edd0d1322061826d688752?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FDP-2.png",
            "24x24": "https://secure.gravatar.com/avatar/bfa5030119edd0d1322061826d688752?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FDP-2.png",
            "16x16": "https://secure.gravatar.com/avatar/bfa5030119edd0d1322061826d688752?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FDP-2.png",
            "32x32": "https://secure.gravatar.com/avatar/bfa5030119edd0d1322061826d688752?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FDP-2.png"
          },
          "displayName": "Darl Anthony Pepito",
          "active": true,
          "timeZone": "America/New_York",
          "accountType": "atlassian"
        },
        "assignee": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/user?accountId=712020%3Aef17094f-7b60-4856-b69e-136a7bdbff64",
          "accountId": "712020:ef17094f-7b60-4856-b69e-136a7bdbff64",
          "emailAddress": "kbandeleon@gmail.com",
          "avatarUrls": {
            "48x48": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/48",
            "24x24": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/24",
            "16x16": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/16",
            "32x32": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/32"
          },
          "displayName": "Kim Bandeleon",
          "active": true,
          "timeZone": "Singapore",
          "accountType": "atlassian"
        },
        "priority": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/priority/2",
          "iconUrl": "https://powerslicesoftware.atlassian.net/images/icons/priorities/high_new.svg",
          "name": "High",
          "id": "2"
        },
        "status": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/status/10103",
          "description": "",
          "iconUrl": "https://powerslicesoftware.atlassian.net/images/icons/statuses/generic.png",
          "name": "Testing",
          "id": "10103",
          "statusCategory": {
            "self": "https://powerslicesoftware.atlassian.net/rest/api/3/statuscategory/4",
            "id": 4,
            "key": "indeterminate",
            "colorName": "yellow",
            "name": "In Progress"
          }
        }
      }
    },
    {
      "expand": "renderedFields,names,schema,operations,editmeta,changelog,versionedRepresentations",
      "id": "21976",
      "self": "https://powerslicesoftware.atlassian.net/rest/api/3/issue/21976",
      "key": "SM-1085",
      "fields": {
        "summary": "PWA - Expense Module",
        "reporter": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/user?accountId=557058%3Abdfab7dd-5cb5-4b04-a54a-c758c7678401",
          "accountId": "557058:bdfab7dd-5cb5-4b04-a54a-c758c7678401",
          "avatarUrls": {
            "48x48": "https://secure.gravatar.com/avatar/bfa5030119edd0d1322061826d688752?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FDP-2.png",
            "24x24": "https://secure.gravatar.com/avatar/bfa5030119edd0d1322061826d688752?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FDP-2.png",
            "16x16": "https://secure.gravatar.com/avatar/bfa5030119edd0d1322061826d688752?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FDP-2.png",
            "32x32": "https://secure.gravatar.com/avatar/bfa5030119edd0d1322061826d688752?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FDP-2.png"
          },
          "displayName": "Darl Anthony Pepito",
          "active": true,
          "timeZone": "America/New_York",
          "accountType": "atlassian"
        },
        "assignee": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/user?accountId=712020%3Aef17094f-7b60-4856-b69e-136a7bdbff64",
          "accountId": "712020:ef17094f-7b60-4856-b69e-136a7bdbff64",
          "emailAddress": "kbandeleon@gmail.com",
          "avatarUrls": {
            "48x48": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/48",
            "24x24": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/24",
            "16x16": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/16",
            "32x32": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/32"
          },
          "displayName": "Kim Bandeleon",
          "active": true,
          "timeZone": "Singapore",
          "accountType": "atlassian"
        },
        "priority": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/priority/2",
          "iconUrl": "https://powerslicesoftware.atlassian.net/images/icons/priorities/high_new.svg",
          "name": "High",
          "id": "2"
        },
        "status": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/status/10103",
          "description": "",
          "iconUrl": "https://powerslicesoftware.atlassian.net/images/icons/statuses/generic.png",
          "name": "Testing",
          "id": "10103",
          "statusCategory": {
            "self": "https://powerslicesoftware.atlassian.net/rest/api/3/statuscategory/4",
            "id": 4,
            "key": "indeterminate",
            "colorName": "yellow",
            "name": "In Progress"
          }
        }
      }
    },
    {
      "expand": "renderedFields,names,schema,operations,editmeta,changelog,versionedRepresentations",
      "id": "22472",
      "self": "https://powerslicesoftware.atlassian.net/rest/api/3/issue/22472",
      "key": "SM-1103",
      "fields": {
        "summary": "Project Tracker - Cascade Template Management Screen",
        "reporter": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/user?accountId=712020%3A5bcbe064-5225-4b1d-9b13-bb9899f103d3",
          "accountId": "712020:5bcbe064-5225-4b1d-9b13-bb9899f103d3",
          "avatarUrls": {
            "48x48": "https://secure.gravatar.com/avatar/e804177b75d71af3d8cb0ceea596cc5c?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKH-0.png",
            "24x24": "https://secure.gravatar.com/avatar/e804177b75d71af3d8cb0ceea596cc5c?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKH-0.png",
            "16x16": "https://secure.gravatar.com/avatar/e804177b75d71af3d8cb0ceea596cc5c?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKH-0.png",
            "32x32": "https://secure.gravatar.com/avatar/e804177b75d71af3d8cb0ceea596cc5c?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FKH-0.png"
          },
          "displayName": "Kim Heinz",
          "active": true,
          "timeZone": "America/New_York",
          "accountType": "atlassian"
        },
        "assignee": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/user?accountId=712020%3Aef17094f-7b60-4856-b69e-136a7bdbff64",
          "accountId": "712020:ef17094f-7b60-4856-b69e-136a7bdbff64",
          "emailAddress": "kbandeleon@gmail.com",
          "avatarUrls": {
            "48x48": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/48",
            "24x24": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/24",
            "16x16": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/16",
            "32x32": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/712020:ef17094f-7b60-4856-b69e-136a7bdbff64/87a4105e-a0b7-4fe1-94ba-d716c7766a21/32"
          },
          "displayName": "Kim Bandeleon",
          "active": true,
          "timeZone": "Singapore",
          "accountType": "atlassian"
        },
        "priority": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/priority/1",
          "iconUrl": "https://powerslicesoftware.atlassian.net/images/icons/priorities/highest_new.svg",
          "name": "Highest",
          "id": "1"
        },
        "status": {
          "self": "https://powerslicesoftware.atlassian.net/rest/api/3/status/10023",
          "description": "Issue has been tested by the QA team and is ready to be pushed onto stage.",
          "iconUrl": "https://powerslicesoftware.atlassian.net/images/icons/statuses/generic.png",
          "name": "QA Verified",
          "id": "10023",
          "statusCategory": {
            "self": "https://powerslicesoftware.atlassian.net/rest/api/3/statuscategory/4",
            "id": 4,
            "key": "indeterminate",
            "colorName": "yellow",
            "name": "In Progress"
          }
        }
      }
    }
  ]
}
```

</details>


## Step 3 — Review Ticket
**Time:** 09:09:59 AM

- Ticket: **[SM-864](https://powerslicesoftware.atlassian.net/browse/SM-864)**
- Issue: **18621** bytes
- Comments: **5**
- Attachments: **6**

> **PASS** — [SM-864](https://powerslicesoftware.atlassian.net/browse/SM-864) reviewed


## Step 4 — Review Code
**Time:** 09:10:03 AM

- Ticket: **[SM-864](https://powerslicesoftware.atlassian.net/browse/SM-864)**
- Found **0** commit(s)

<details>
<summary>Commits</summary>

```

```

</details>


> **PASS** — Code review complete for [SM-864](https://powerslicesoftware.atlassian.net/browse/SM-864)


## Step 5 — Draft Test Plan
**Time:** 09:10:06 AM

- Ticket: **[SM-864](https://powerslicesoftware.atlassian.net/browse/SM-864)**
- Context gathered from previous step outputs
- Test plan: `/Users/kim/projects/github.com/fulcrum/powerslice/ps-site-slicer/bite/logs/SM-864/5_plan.md` (8 scenarios, 9445 bytes)
- Manual checklist: `/Users/kim/projects/github.com/fulcrum/powerslice/ps-site-slicer/bite/logs/SM-864/5_plan_manual.md` (4811 bytes)

> **PASS** — Test plans drafted for [SM-864](https://powerslicesoftware.atlassian.net/browse/SM-864)

