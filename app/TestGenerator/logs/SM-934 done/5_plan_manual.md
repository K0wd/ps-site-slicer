

```
{code:diff}
Results on TEST

Scenario 1 – Company Name Link Navigates to Vendor Profile Page
+ Company names in AG Grid display as underlined blue hyperlinks with pointer cursor on hover
+ Click first vendor Company Name navigates to /spa/clview/users/vendoredit/{vendor_id} as a full page load, not a modal
+ Vendor Profile page (Vendor Account Management) loads with correct vendor data matching the name clicked
+ Browser back button returns to Vendor Admin grid and grid reloads with vendor list
+ Click a different vendor Company Name navigates to that vendors profile with correct data
+ URL contains the correct vendor ID for the second vendor clicked

Scenario 2 – Pencil Icon vs Company Name Distinct Interactions
+ Pencil icon is visible adjacent to the Company Name text in the grid cell
+ Click pencil icon opens an edit modal dialog overlaying the grid without navigating away
+ Modal displays the correct vendors editable information
+ Closing the modal returns to the grid unchanged
+ Click the Company Name text for the same vendor navigates to Vendor Profile page as a full page load
+ Both interactions work consistently across different vendor rows

Scenario 3 – Modal Display Across Sidebar States and Viewport Sizes
+ With sidebar expanded, pencil icon modal appears fully visible and not covered by the sidebar
+ With sidebar collapsed to mini state, pencil icon modal displays correctly and is fully accessible
+ With sidebar hidden completely, grid expands and pencil icon modal displays correctly
+ At approximately 50% browser width (split-screen ~900px), grid adjusts to narrower viewport
+ At reduced viewport, pencil icon modal is fully visible and scrollable with no content cut off

Scenario 4 – Link Styling Consistency with Other Modules
+ Company Name text displays in blue (#1976d2) with persistent underline matching Quoting Module link style
+ Hover over Company Name shows pointer cursor with visible hover effect
+ All Company Name cells display consistent hyperlink styling when scrolling through multiple rows
+ After applying filter or sort, Company Name links retain styling and remain clickable
+ After navigating to a profile and returning, links are still styled correctly

Scenario 5 – Browser Back Button After Profile Navigation
+ Click Company Name to navigate to profile, then browser back button returns to grid without errors
+ Browser forward button returns to the vendor profile page
+ No stale routing or URL doubling occurs when navigating between grid and profile pages

Scenario 6 – Rapid Double-Click on Company Name
+ Double-click on Company Name navigates to vendor profile once with no duplicate navigation or errors
+ Rapidly clicking different Company Names in succession results in clean final navigation with no broken state

Scenario 7 – Grid Interaction After Scrolling
+ Rows rendered via AG Grid virtual scrolling display Company Name hyperlinks and pencil icons
+ Click Company Name in a scrolled-to area navigates to the correct vendors profile page
+ Click pencil icon in a scrolled-to area opens edit modal for the correct vendor
{code}
```
