# CrewPay Ledger Apps Script - Phase 1

These helpers are optional Level 1.5 workbook helpers for the CrewPay Ledger workbook.

The workbook remains the Level 1 source of truth. If this script is removed or disabled, the workbook should still work manually.

## What Phase 1 Includes

- Custom `CrewPay Ledger` workbook menu
- Generate Worker Proof helper
- Log Proof Export helper
- Log Access Change helper
- Log Correction helper
- Create Email-Ready Notice helper
- About CrewPay Ledger helper

## What Phase 1 Does Not Include

- Gmail sending
- Google Calendar sync
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

## Manual Install

1. Open `CrewPay_Ledger_Workbook.xlsx` in Google Sheets.
2. Choose `Extensions > Apps Script`.
3. Create or open `Code.gs`.
4. Paste the contents of `apps_script/Code.gs`.
5. Save the Apps Script project.
6. Reload the Google Sheet.
7. Use the `CrewPay Ledger` menu.

## Helper Notes

### Generate Worker Proof

Reads the selected Worker ID and Pay Period ID from `Worker Proof`.

It checks that the pay period belongs to the selected worker before refreshing the generated timestamp. It does not generate proof for all workers.

### Log Proof Export

Appends a worker-specific row to `Proof Exports` for the selected Worker Proof context.

### Log Access Change

Appends a row to `Access Log` and updates the worker access status on `Workers`.

Inactive status blocks future-use workflows but does not delete or hide historical records.

### Log Correction

Appends a visible correction record to `Correction Log`.

Use this before or alongside manual edits so proof changes are not silent.

### Create Email-Ready Notice

Uses the selected row on `Admin Notices` to create copyable email-ready text and updates the notice row to `Email Ready` / `Posted`.

This helper does not send email.
