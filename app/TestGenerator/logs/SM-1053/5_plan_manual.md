

```
{code:diff}
Results on TEST

Scenario 1 – Add New Vendor — Field Location, Label, Required Validation, and Save
+ Click New Item and confirm the Vendor form dialog opens
+ Expand the Address section and confirm an Address textarea field is present before City/State/Zip
+ Confirm the field label reads Address and not Safety Address
+ Leave Address empty, fill all other required fields, and confirm the Save button is disabled
+ Expand the Contacts section and confirm no Address or Safety Address field exists
+ Enter a valid address, click Save, and confirm the vendor is created and appears in the grid
+ Reopen the new vendor via pencil icon and confirm the Address field displays the value just entered

Scenario 2 – Edit Existing Vendor — Field Location, Label, Data Persistence, and Update
+ Click the pencil icon on a vendor with a populated address and confirm the Edit dialog opens with pre-populated data
+ Expand the Address section and confirm the Address textarea is present and pre-populated with existing data
+ Confirm the field label reads Address and not Safety Address
+ Expand the Contacts section and confirm no Address or Safety Address field exists
+ Modify the Address field value, click Save, and confirm save succeeds and dialog closes
+ Reopen the same vendor via pencil icon and confirm the updated address value is displayed

Scenario 3 – Required Field Enforcement — Empty Address Blocks Submission
+ Open Add New Vendor, fill all required fields except Address, and confirm Save button is disabled
+ Click into the Address field then click out and confirm Address is required validation error appears
+ Enter a valid address and confirm Save button becomes enabled and the validation error clears
+ Open an existing vendor via pencil icon and confirm the Edit dialog opens with a populated Address
+ Clear the Address field entirely and confirm Save button becomes disabled and validation error appears
+ Re-enter an address, click Save, and confirm save succeeds

Scenario 4 – Whitespace-Only Address Input
+ Enter only spaces in the Address field, fill all other required fields, and confirm Save is disabled or a validation error appears

Scenario 5 – Grid Column Regression — Vendor Admin Data Grid Unaffected
+ Confirm the vendor grid loads without errors and all expected columns render
+ Confirm address-related data in the grid shows correct values with no label changes or data corruption
+ Use grid filters and sorting and confirm functionality is unaffected
{code}
```
