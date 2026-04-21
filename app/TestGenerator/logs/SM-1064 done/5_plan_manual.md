

```
{code:diff}
Results on TEST

Scenario 1 – Upload and Replace Logo in Edit Mode
+ Navigate to Vendor Admin and click an existing vendor to open the Edit dialog
+ Locate and expand the Upload/Replace Company Logo expansion panel
+ Click Upload Logo and select a valid PNG file — preview and file name appear
+ Click Upload Now — success snackbar displays and preview updates to uploaded logo
+ Close the Edit dialog then reopen the same vendor — uploaded logo persists in the logo section
+ Expand the logo section and click Replace Logo, select a different PNG file — new preview replaces old
+ Click Upload Now — success snackbar displays and logo preview shows replacement image
+ Close and reopen the vendor again — replacement logo persists and original logo is gone

Scenario 2 – Upload Logo During New Vendor Creation
+ From the Vendor Admin grid click Add New Vendor — New Vendor form opens
+ Fill in all required fields with valid test data — fields accept input without errors
+ Expand the Upload/Replace Company Logo section — section is present with upload option and no existing logo
+ Click Upload Logo and select a valid PNG file — preview displays with hint that logo uploads on save
+ Click SAVE — vendor created successfully and logo upload triggers automatically with success feedback
+ Search for and reopen the newly created vendor in Edit mode — logo section displays the uploaded logo

Scenario 3 – Cross-Admin Data Consistency
+ In the new Vendor Admin SPA open a vendor and upload a recognizable PNG logo
+ Navigate to the old Vendor Admin CakePHP and open the same vendor — logo from new admin is visible
+ In the old Vendor Admin replace the logo with a different PNG file
+ Return to the new Vendor Admin SPA and reopen the same vendor — logo from old admin is displayed

Scenario 4 – Non-PNG File Rejection
+ Open an existing vendor in Edit mode and expand the logo section
+ Attempt to upload a JPG file — file is rejected with Only PNG files are allowed error
+ Attempt to upload a GIF file — same rejection and error message
+ Confirm no logo change occurred — existing logo or placeholder remains unchanged

Scenario 5 – Vendor Without Logo Placeholder Display
+ Open a vendor that has never had a logo uploaded
+ Expand the Upload/Replace Company Logo section — placeholder image shown, not a broken image icon or empty space
+ Upload button is labeled Upload Logo, not Replace
{code}
