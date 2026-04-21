

```
{code:diff}
Results on TEST

Scenario 1 – End-to-End Timesheet Entry — Add Period, Save & Approve
+ Navigate to testpwa and log in as Bandeleonk / test1234 — redirected to Clock Simple screen with date picker defaulting to today
+ Click Add Period + — new period form appears under New Period(s) with Time In, Time Out, WO, Truck, Lunch Duration and additional fields visible
+ Set Time In to 08:00 and Time Out to 16:00 — total hours updates automatically to 8.00
+ Tap the WO selector button — full-screen modal opens with title, close button, search input, and selectable work order list
+ Type a WO number in modal search, select a result — modal closes and selected WO name displays in the period row
+ Select a Truck from dropdown and set Lunch Duration to 30 min — values accepted and displayed correctly
+ Fill in Tech Response, Comments, and toggle On-Call/Personal/Property Damage/Near Miss fields — all fields accept input without errors
+ Click Save & Approve Timesheet — confirmation dialog appears asking to confirm submission
+ Confirm the dialog — success message appears and page reloads
+ Saved period now appears under Current Period(s) with correct Time In/Out, WO, Truck, and Lunch Duration values — all fields are read-only

Scenario 2 – Date Selection and Current Periods Display
+ Date picker on Clock Simple screen defaults to today's date
+ Click/tap anywhere on the date input field — calendar popup opens immediately without needing to find a small icon
+ Select a past date within the current week that has existing timesheet data — Current Period(s) section loads and displays existing periods
+ Displayed period data shows Time In, Time Out, Work Order, Truck, and Lunch Duration correctly (lunch duration is not blank)
+ Attempt to edit any field in Current Period(s) — all fields are read-only and cannot be modified
+ Attempt to select a date from a previous week — date is not selectable
+ Attempt to select a future date — date is not selectable

Scenario 3 – Work Order Modal and Time Input Methods
+ Click Time In field and manually type 07:30 — time value accepts typed input and displays 07:30
+ Click the time picker icon on Time Out field — native time picker dropdown opens and icon is visible against the dark theme
+ Select 16:00 from the picker — Time Out displays 16:00 and total hours recalculates
+ Tap the WO selector button — full-screen modal opens with search input and work order list
+ Type 1 in the modal search field — results auto-filter to show all WOs containing 1 without pressing an arrow or extra button
+ Select a WO from results — modal closes and selected WO label displays with no duplicate N/A entries
+ Tap WO selector again — modal re-opens with previously selected WO indicated and search field is clear
+ Close the modal without selecting — previous WO selection is preserved

Scenario 4 – Validation Rules and Error Message Ordering
+ Click Save & Approve Timesheet without adding any periods — error message: You need to add a period at least
+ Add a new empty period then click Save & Approve Timesheet — error references time period first: Period 1: Please select a valid time period
+ Set valid Time In 08:00 and Time Out 16:00 but leave WO and Lunch empty, then Save — error references missing WO/Site before lunch
+ Select a valid WO but leave Lunch Duration unselected, then Save — error message: Period 1: Please select a lunch option
+ Select a Lunch Duration 30 min and click Save & Approve Timesheet — confirmation dialog appears (all validation passed)

Scenario 5 – Access Restrictions — Approved Timesheet
+ Log in as Bandeleonk and select a date with a manager-approved timesheet — approval notice is displayed below the action buttons
+ Add Period + button is disabled/grayed out and cannot be clicked
+ Save & Approve Timesheet button is disabled/grayed out and cannot be clicked

Scenario 6 – Access Restrictions — Salary User
+ Log out and log in as hawseyl (salary user) — redirected to Clock Simple screen
+ Add Period + button shows error or is disabled with message: SALARY user can not add any periods
+ Save & Approve Timesheet button shows error or is disabled with message: SALARY user can not submit any timesheet

Scenario 7 – Multiple Period Management
+ Click Add Period + three times — three separate period forms appear under New Period(s), each independently editable
+ Fill in valid data for Period 1 and Period 3, leave Period 2 incomplete — each period maintains its own field values independently
+ Delete Period 2 — Period 2 is removed and Periods 1 and 3 remain with their data intact
+ Click Save & Approve Timesheet — both remaining periods save successfully and appear under Current Period(s) after reload

Scenario 8 – Invalid Time Entry Combinations
+ Set Time In to 16:00 and Time Out to 08:00 — total hours shows negative or zero and validation prevents saving with an appropriate error
+ Set Time In and Time Out to the same value 08:00 — total hours shows 0 and validation prevents saving or warns about zero-hour period
+ Set Time In to 00:00 and Time Out to 23:59 — total hours calculates correctly and system either accepts or warns about unusually long shift
{code}
