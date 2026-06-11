# CrewPay Ledger Apps Script Helpers

These helpers are optional Level 1.5 workbook helpers for the CrewPay Ledger workbook.

The workbook remains the Level 1 source of truth. If this script is removed or disabled, the workbook should still work manually.

## What These Helpers Include

- Custom `CrewPay Ledger` workbook menu
- Generate Worker Proof helper
- Log Proof Export helper
- Export Worker Proof CSV helper
- Export Worker Proof PDF helper
- Send Selected Admin Notice helper
- Sync Selected Schedule to Calendar helper
- Log Access Change helper
- Log Correction helper
- Create Email-Ready Notice helper
- About CrewPay Ledger helper

## Google Services Used

- `SpreadsheetApp` for reading and writing workbook tabs
- `DriveApp` for saved proof PDF/CSV files
- `UrlFetchApp` for the Google Sheets PDF export endpoint
- `GmailApp` for sending selected admin notices from the admin account running the script
- `CalendarApp` for syncing selected Schedule rows to the admin's default Google Calendar

## What These Helpers Do Not Include

- backend server
- paid APIs
- real database
- worker accounts
- enterprise permissions
- payroll tax logic
- HR compliance logic
- chat
- worker-to-worker messaging
- optional admin companion app bridge
- worker field timesheet app bridge


## Admin App Bridge Script

The no-backend admin app bridge is intentionally isolated in:

`apps_script/CrewPay_Ledger_BRIDGE.gs`

That file contains the Web App endpoint for admin app submissions to pending workbook intake tabs. It is separate from the workbook-helper script in `apps_script/Code.gs` and separate from the preserved original final helper script. See `BRIDGE_SETUP.md` for deployment and token setup.

## Manual Install

1. Open `CrewPay_Ledger_Workbook.xlsx` in Google Sheets.
2. Choose `Extensions > Apps Script`.
3. Create or open `Code.gs`.
4. Paste the contents of `apps_script/Code.gs`.
5. Save the Apps Script project.
6. Reload the Google Sheet.
7. Use the `CrewPay Ledger` menu.

Google will ask for permissions the first time service helpers run. Review them before approving. The workbook still works manually if you do not authorize or use the script.

## Helper Notes

### Generate Worker Proof

Reads the selected Worker ID and Pay Period ID from `Worker Proof`.

It checks that the pay period belongs to the selected worker before refreshing the generated timestamp. It does not generate proof for all workers.

### Log Proof Export

Appends a worker-specific row to `Proof Exports` for the selected Worker Proof context.

### Export Worker Proof CSV

Validates the selected Worker ID and Pay Period ID on `Worker Proof`, creates a worker/pay-period-specific CSV file in Drive, shows copyable CSV text, and logs the export in `Proof Exports`.

It does not export all workers.

### Export Worker Proof PDF

Validates the selected Worker ID and Pay Period ID on `Worker Proof`, exports the `Worker Proof` print area to a PDF file in Drive, and logs the export in `Proof Exports`.

It does not export all workers.

### Send Selected Admin Notice

Sends only the selected row on `Admin Notices`.

Recipient Type behavior:
- `Worker` sends to the selected worker's email from `Workers`.
- `All Active Workers` sends only to workers marked `Active`.

The helper marks the notice as `Gmail Sent` / `Sent` and sets `Sent At`. Notices remain one-way admin notices only.

### Sync Selected Schedule to Calendar

Syncs only the selected row on `Schedule` to the admin's default Google Calendar, writes the Calendar Event ID back to `Schedule`, and appends `Calendar Sync Log`.

Calendar is planning/reference only. It is not proof and does not create Time Entries.

### Log Access Change

Appends a row to `Access Log` and updates the worker access status on `Workers`.

Inactive status blocks future-use workflows but does not delete or hide historical records.

### Log Correction

Appends a visible correction record to `Correction Log`.

Use this before or alongside manual edits so proof changes are not silent.

### Create Email-Ready Notice

Uses the selected row on `Admin Notices` to create copyable email-ready text and updates the notice row to `Email Ready` / `Posted`.

This helper does not send email.
