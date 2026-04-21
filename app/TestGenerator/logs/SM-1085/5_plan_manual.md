

```
{code:diff}
Results on TEST

Scenario 1 – Navigation, Search, and Expense List Display
+ Open sidebar menu and confirm Expenses link is visible
+ Tap Expenses and confirm navigation to /expense with date range picker and expense cards
+ Confirm default start date is 1 year ago and end date is today
+ Confirm each expense card shows date, amount, type, and approval status sorted newest first
+ Narrow the date range to last 30 days, tap Search, and confirm list updates to match the range
+ Tap the PWA header refresh icon and confirm expense list reloads without errors or directory listing
+ Hard refresh the browser on /expense and confirm the page loads normally with no Apache directory listing

Scenario 2 – Create Standard Expense with Form Dynamics
+ Tap the red + FAB and confirm New Expense form opens at /expense/edit
+ Confirm Expense Type dropdown is populated with server-loaded types
+ Select a type with a default amount and confirm the Amount field auto-populates and becomes read-only
+ Confirm Payment Type dropdown is populated with server-loaded payment types
+ Select a type/payment combo requiring a reason and confirm Reason dropdown appears with populated options
+ Toggle the Scheduled switch on WO# field and confirm it switches between text input and dropdown modes
+ In manual WO mode type a partial number and confirm autocomplete suggestions appear after debounce
+ Toggle the Reimbursable checkbox on and off multiple times and confirm it responds to every click
+ Attach an image file and confirm a preview thumbnail appears in the form
+ Fill all required fields and tap Save and confirm success toast, redirect to list, and new expense at top

Scenario 3 – View Expense Detail and Edit Existing Expense
+ Tap an expense card with an attachment and confirm detail page loads with all read-only fields
+ Confirm attachment link or thumbnail is visible on the detail page
+ Tap the attachment and confirm image modal opens displaying the receipt image clearly
+ Close the modal and confirm detail view is unchanged
+ Tap the back arrow and confirm return to expense list with scroll position preserved
+ Tap the same expense then tap the edit FAB and confirm edit form opens with all fields pre-populated
+ Confirm the existing attachment image is displayed inline in the edit form
+ Change the comment field, tap Save, and confirm the updated comment appears on re-opening the detail

Scenario 4 – Mileage Expense Creation and Calculation
+ Tap the red + FAB and confirm form loads with all dropdowns populated
+ Select Mileage expense type and confirm mileage calculator section appears with From, To, Miles fields
+ Tap into the From field and confirm office suggestions dropdown appears
+ Select an office from suggestions and confirm From field is populated
+ Enter a To destination and miles value and confirm Amount auto-calculates as miles x rate in real time
+ Fill remaining required fields, tap Save, and confirm success toast and new mileage expense in list
+ Tap the new mileage expense and confirm detail shows From, To, Miles fields with correct calculated amount

Scenario 5 – View Mileage vs Non-Mileage Detail Fields
+ Tap a mileage-type expense and confirm From, To, Miles fields are shown alongside standard fields
+ Tap back to return to the expense list
+ Tap a non-mileage expense and confirm From, To, Miles fields are NOT displayed

Scenario 6 – Form Validation Required Fields and Constraints
+ Tap Save on an empty form and confirm validation errors appear for all required fields with no API call
+ Attempt to select a future date and confirm the date picker restricts selection to today or earlier
+ Select a type/payment combo requiring a comment, leave comment empty, tap Save, and confirm validation error

Scenario 7 – Metadata Loading Failure Recovery
+ Clear browser sessionStorage via DevTools
+ Navigate to the new expense form via the + FAB and confirm all dropdowns load from API fallback without hanging

Scenario 8 – Empty Search Results
+ Set date range to a period with no expenses and tap Search
+ Confirm an empty state message is shown instead of a blank screen or error
{code}
