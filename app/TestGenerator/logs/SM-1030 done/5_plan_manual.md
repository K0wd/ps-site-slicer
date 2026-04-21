

```
{code:diff}
Results on TEST

Scenario 1 – Default State and Toolbar Layout on First Load
+ Navigate to Vendor Admin page and confirm AG Grid renders with vendor data
+ Select View dropdown is visible on the left side of the toolbar, pre-selected to Default
+ Buttons visible on the right in order: Add Vendor, Clear Filter, Save View, Export
+ Delete View button is NOT visible when Default view is selected
+ AG Grid columns are in original defined order with no filters, no sort, no pinned columns
+ Click Select View dropdown and confirm only Default is listed

Scenario 2 – Create a Custom View with Full Grid Customization
+ Click Company Name column header to sort ascending and confirm sort indicator appears
+ Drag the Status column to a different position and confirm it moves
+ Right-click a column header and pin Vendor ID to the left
+ Resize Company Name column by dragging its header border and confirm width changes
+ Apply a filter on the Status column to show only Approved vendors
+ Click Save View button and confirm a dialog opens prompting for a view name
+ Enter Approved Vendors as the view name and confirm dialog closes
+ Select View dropdown now shows Approved Vendors as the active selection
+ Click Select View dropdown and confirm both Default and Approved Vendors are listed
+ Delete View button is now visible since a non-Default view is selected

Scenario 3 – Switch Between Views and Verify Grid State Restoration
+ With Approved Vendors selected, confirm grid reflects all customizations from Scenario 2
+ Select Default from the dropdown and confirm grid resets to original layout with no filters, sort, or pinning
+ Delete View button is hidden when Default view is selected
+ Select Approved Vendors and confirm grid restores sort, column order, pinning, widths, and filter
+ Delete View button is visible again when Approved Vendors is selected

Scenario 4 – Page Refresh Persistence and Delete View Lifecycle
+ With Approved Vendors selected, refresh the page and confirm dropdown still shows Approved Vendors with full grid state restored
+ Click Delete View button and confirm a confirmation dialog appears
+ Confirm the deletion and verify Approved Vendors is removed, dropdown resets to Default, grid resets to default layout
+ Click Select View dropdown and confirm only Default is listed
+ Refresh the page and confirm Default view remains selected and deleted view does not reappear

Scenario 5 – Clear Filter Resets to Default View
+ Create and save a custom view Filtered View with a filter on Status and a sort on Company Name
+ Click the Clear Filter button and confirm all filters and sorts are cleared
+ Select View dropdown resets to Default after Clear Filter is clicked
+ Select Filtered View from the dropdown and confirm saved filters and sort are restored

Scenario 6 – Special Characters in View Name
+ Save a view with the name Flag & Status and confirm it saves successfully
+ Click Select View dropdown and confirm it displays Flag & Status without encoding artifacts
+ Select the Flag & Status view and confirm grid restores correctly
+ Delete the Flag & Status view and confirm it is removed cleanly from the dropdown

Scenario 7 – View Name Boundary Conditions
+ Attempt to save a view with an empty name or whitespace only and confirm save is prevented or error is shown
+ Save a view with a name of exactly 30 characters and confirm it saves and displays in full
+ Attempt to save a view with a name of 31 or more characters and confirm input is truncated or error is shown

Scenario 8 – Duplicate View Name
+ With a custom view named My View already existing, customize the grid differently
+ Click Save View and enter My View as the name
+ Confirm the system either prevents the duplicate with an error or updates the existing view without creating two entries
{code}
```
