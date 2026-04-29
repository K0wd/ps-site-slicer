# Creating a Ticket in Jira for SM (Powerslice Company Rules)

Authoritative spec for drafting Jira tickets in the Site Manager (SM) project. All drafts produced by TestCreator must follow these field conventions.

Required fields are marked with an asterisk `*`.

## Field Specification

- **Space\***: Drop Down — Choose the Customer Project for the ticket.
- **Work type\***: Drop Down — Choose whether the ticket is:
  - **Task** — A small, distinct piece of work.
  - **Story** — Functionality or a feature expressed as a user goal.
  - **Bug** — A problem or error.
  - **Epic** — A big user story that needs to be broken down. Created by Jira Software — do not edit or delete. (Use this as a "parent ticket" when working on a large project with multiple tickets.)
- **Status**: Defaults to `Backlog`.
- **Summary\***: Give summary of the ticket. **Always put the module name first in the Summary.**
  - Example: `Vendor Admin – Then add summary.`
- **Priority**: Defaults to `Medium`. Leave it that way unless instructed differently.
- **Assignee**: Leave blank.
- **Size**: Leave blank. (For Admin.)
- **Due Date**: Leave blank.
- **Components\***: Choose a component that best describes what you are working on.
- **Fix Versions**: Leave blank.
- **Description\***: Type up a summary of what you want done. Give as much detail as you can. Once saved, Jira will generate an AI Description using the Power Slice Jira Format.
- **Original Estimate**: Leave blank.
- **Attachment**: Leave blank.
- **Labels**: Use these labels if they apply:
  - `defect_internal` — Found internally by someone on our team.
  - `defect_production` — Found on live by the customer.
  - `change_request` — Enhancement request from the customer.
  - `Suggestion-QA` — Suggested change from QA User.
- **Primary Developer\***: You will be told who to assign this to.
- **Secondary Developer**: Leave blank.
- **Primary QA Tester\***: Add yourself (QA user drafting the ticket) as the tester.
- **QA Return Count**: Leave blank.
- **Resolution**: Leave blank.
- **Estimate Multiplier**: Leave blank.
- **Estimate Comment**: Leave blank.
- **Order**: Leave blank.
- Click **Create**.
- Then go to the ticket and **add a comment** stating where the request came from. Upload a screenshot or PDF email for quick reference.
  - Example: *"Request came from (Customer Name) in the attached email."*
  - Upload the email request.

## Summary Format Quick Reference

```
<Module Name> – <concise summary>
```

- `Vendor Admin – Save button disabled when address field is empty`
- `Certificates – Public link redirects to Oops page after logout`

## Label Decision Tree

| Origin of the request | Label |
|---|---|
| Found internally (team member) | `defect_internal` |
| Found by customer on live | `defect_production` |
| Customer enhancement ask | `change_request` |
| QA user suggestion | `Suggestion-QA` |
| None of the above | *(leave blank)* |
