```
{code:diff}
Results on TEST

Scenario 1 – Single and Multi-Column Sorting
+ Click Company Name header once and confirm grid sorts A-Z with ascending arrow indicator
+ Click Company Name header a second time and confirm grid sorts Z-A with descending arrow indicator
+ Click Company Name header a third time and confirm sort clears and grid returns to default order
+ Click State column header once and confirm grid sorts by State ascending
+ Hold Ctrl and click Company Name header and confirm secondary sort with numbered indicators (State = 1, Company Name = 2)
+ Hold Ctrl and click Status header and confirm third-level sort with indicators 1, 2, 3 and correct nested ordering
+ Click Clear All Filters and confirm all sort indicators removed and grid returns to default order

Scenario 2 – Column Filtering — Text Contains, Set Values, Apply/Reset
+ Click filter icon on Company Name and confirm dropdown opens with text input defaulting to Contains and Apply/Reset buttons visible
+ Type partial vendor name without clicking Apply and confirm grid does NOT filter yet
+ Click Apply and confirm grid filters to show only matching vendors with updated row count
+ Click Reset and confirm filter clears and full dataset is restored
+ Open filter on a Set-type column (e.g. State) and confirm checkbox list of distinct database-populated values appears
+ Select one value (e.g. Texas) and click Apply and confirm grid shows only matching vendors
+ Click Clear All Filters in toolbar and confirm all filters removed and no filter highlights remain on any column header

Scenario 3 – Combined Multi-Column Filters with AND Logic (KNOWN DEFECT — re-test required)
+ Open Status filter, select Active, click Apply and confirm grid shows only active vendors
+ Open State filter, select California, click Apply and confirm grid further reduces to active California vendors only
+ Confirm every displayed row matches both Status = Active AND State = California (AND logic)
+ Click Company Name header to sort ascending and confirm filtered results sort A-Z with no non-matching rows appearing
+ Scroll through results and verify every row shows Active status AND California state AND A-Z name order
+ Click Clear All Filters and confirm all filters and sort removed and full dataset restored

Scenario 4 – Filter and Sort Persistence Across Refresh and Clear
+ Apply State filter (e.g. Texas) and sort Company Name ascending and confirm grid shows Texas vendors A-Z
+ Press F5 to refresh the page and confirm State filter and Company Name sort are still applied after reload
+ Close the browser tab entirely, reopen Vendor Admin page and confirm filter and sort state restored from localStorage
+ Click Clear All Filters and confirm all filters and sorts removed and full dataset shown
+ Press F5 to refresh again and confirm grid loads with no filters or sorts applied (cleared state was persisted)

Scenario 5 – Column Menu, Rearranging, Pinning, and Visibility
+ Observe column headers without hovering and confirm hamburger menu icon is statically visible on at least three columns
+ Click hamburger menu on Company Name and confirm column menu opens with three tabs: Filter, General, Columns
+ Click Columns tab, uncheck a column (e.g. State) and confirm it hides, re-check it and confirm it reappears with no data misalignment
+ Click General tab and pin Company Name to the left and confirm it stays fixed during horizontal scrolling
+ Unpin the column via General tab and confirm it returns to normal scrollable position
+ Drag State column header to a new position and confirm visual drop indicator during drag, correct repositioning on drop, and row data alignment

Scenario 6 – Filter Returning No Results
+ Open Company Name text filter, type a non-matching string (e.g. ZZZZNONEXISTENT999), click Apply and confirm zero rows with empty state message and no console errors
+ Click Reset or Clear All Filters and confirm full dataset is restored

Scenario 7 – Special Characters in Filter Input
+ Open Company Name text filter, type & ' " < > and click Apply and confirm no JavaScript errors, no broken UI, and grid shows matching results or empty state
+ Open Company Name text filter, type <script>alert('xss')</script> and click Apply and confirm input treated as literal text with no script execution

Scenario 8 – Filter on Every Column Availability
+ Click filter icon on each column in the grid and confirm filter dropdown opens with appropriate type (text defaults to Contains, set columns show checkbox list)
+ Verify Apply and Reset buttons are present and functional on every column filter panel
+ Apply one text filter and one set filter simultaneously and confirm both reduce the dataset correctly
+ Click Clear All Filters and confirm both filters removed
{code}
```
