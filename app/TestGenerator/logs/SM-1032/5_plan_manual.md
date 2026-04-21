

```
{code:diff}
Results on TEST

Scenario 1 – Dropdown columns display visible selectors and contain correct options
+ Scroll to Onboarding Documents Requested column and confirm dropdown arrow is visible without clicking; options are blank, YES, NO
+ Scroll to Correct COI Received column and confirm dropdown arrow is visible; options are blank, YES, NO, NA
+ Scroll to MSA Status column and confirm dropdown arrow is visible; options are blank, Approved, Pending, NA
+ Scroll to PO Half Year Status column and confirm dropdown arrow is visible; options are blank, Active, Inactive
+ Spot-check W-9 Received (YES/NO), SBA Approved (YES/NO/NA), and Safety Status (Approved/Pending/NA) for correct option sets
+ Attempt to type a custom value into any dropdown column and confirm free-text entry is not permitted

Scenario 2 – Dropdown selection persists through save, refresh, and revert to blank
+ Select YES from W-9 Received dropdown and confirm cell displays YES with green flash
+ Select Approved from MSA Status dropdown and confirm cell displays Approved with green flash
+ Select Active from PO Half Year Status dropdown and confirm cell displays Active with green flash
+ Refresh the page and confirm all three values persist (YES, Approved, Active)
+ Change W-9 Received back to blank (empty option) and confirm cell reverts to blank with green flash
+ Change MSA Status back to blank and confirm cell reverts to blank with green flash
+ Refresh the page and confirm both reverted cells remain blank and Active still persists in PO Half Year Status

Scenario 3 – Free-form columns accept text input and persist values
+ Click Avetta Approved cell, type 12345, and confirm cell accepts numeric input and saves with green flash
+ Click Type cell, type Electrical Subcontractor, and confirm cell accepts free-form text and saves
+ Click Date Sent cell, type 2026-04-01, and confirm cell accepts the date string and saves
+ Click Certificate Expiration cell, type NA, and confirm cell accepts text and saves
+ Click Payment Terms cell, type Net 30, and confirm cell accepts text and saves
+ Click Type of Company cell, type LLC, and confirm cell accepts text and saves
+ Refresh the page and confirm all 6 free-form values persist exactly as entered

Scenario 4 – Legacy data displays as blank with no 0000-00-00 or 0 values
+ Scroll through the grid examining all 15 dropdown columns across multiple rows and confirm no cells display 0, 0000-00-00, or null
+ Examine Date Sent and Certificate Expiration columns and confirm empty cells show blank or light gray placeholder, not 0000-00-00
+ Check MSA Sent to GC, MSA Signed/AP Setup, Safety Orientation Date, and COI Expiration columns and confirm empty dates show placeholder
+ Find a vendor with a populated date and confirm it renders as mm/dd/yyyy format, not yyyy-mm-dd

Scenario 5 – Edit dialog reflects new input types for dropdown and free-form columns
+ Open the vendor edit dialog for a vendor and confirm it opens with vendor details
+ Locate dropdown column fields (W-9 Received, COI Endorsements, MSA Status) and confirm they render as select dropdowns, not checkboxes or toggles
+ Locate Date Sent and Certificate Expiration fields and confirm they render as text inputs, not date picker controls
+ Select NO from W-9 Received dropdown in the dialog, save, and confirm the grid reflects NO in the cell
+ Refresh the page and confirm the value NO persists in the grid

Scenario 6 – Rapid sequential dropdown changes on the same cell
+ Select YES from a YES/NO/NA dropdown and confirm green flash
+ Immediately change it to NO and confirm green flash and cell shows NO
+ Immediately change it to NA and confirm green flash and cell shows NA
+ Refresh the page and confirm the final value NA persists

Scenario 7 – Export includes correct dropdown and free-form values
+ Set a known value on a vendor (Approved for MSA Status, Net 45 for Payment Terms) and confirm values save
+ Trigger the grid export (Excel/CSV) and confirm export completes without error
+ Open the exported file, locate the vendor row, and confirm MSA Status shows Approved, Payment Terms shows Net 45, and empty cells are blank

Scenario 8 – New vendor defaults to blank for all dropdown and free-form columns
+ Click New Item to create a new vendor and confirm new vendor row or dialog appears
+ Fill in required fields only and save without touching any of the 21 dropdown or free-form columns
+ Locate the new vendor in the grid and confirm all 15 dropdown columns and all 6 free-form columns show blank
{code}
```
