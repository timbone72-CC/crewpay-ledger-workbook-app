# Build Acceptance - Apps Script Google Services

Build:
CrewPay Ledger Level 1.5 Google Apps Script service helpers.

Files:
- `apps_script/Code.gs`
- `apps_script/README.md`
- `APPS_SCRIPT_PLAN.md`
- `CHECKPOINT.md`

Audit result:
PASS

## Built

- `exportWorkerProofCsv` helper.
- `exportWorkerProofPdf` helper.
- `sendSelectedAdminNotice` helper.
- `syncSelectedScheduleToCalendar` helper.
- Updated `CrewPay Ledger` custom menu.
- Shared proof export logging helper.
- Worker-specific CSV builder and copy dialog.
- Drive file creation for worker/pay-period proof CSV and PDF files.
- Gmail send for selected Admin Notices rows.
- Calendar create/update for selected Schedule rows.
- Calendar Sync Log append behavior.

## Verified Boundaries

- Workbook remains the source of truth.
- Apps Script remains optional helper layer.
- Worker Proof exports validate selected Worker ID and Pay Period ID.
- Worker Proof exports are worker/pay-period specific.
- Proof Exports receives PDF and CSV log rows.
- Admin Notices remain one-way admin notices only.
- Gmail sends from the admin account running the script.
- `All Active Workers` recipients exclude inactive workers.
- Schedule sync uses selected Schedule rows only.
- Calendar is planning/reference only and does not create Time Entries.
- Calendar Sync Log records sync attempts.

## Google Services Used

- `SpreadsheetApp`
- `DriveApp`
- `GmailApp`
- `CalendarApp`
- `UrlFetchApp`
- `HtmlService`
- `ScriptApp`
- `Session`
- `Utilities`

## Intentionally Not Built

- Backend server.
- Paid APIs.
- Real database.
- Worker accounts.
- Enterprise permissions.
- Payroll tax logic.
- HR compliance logic.
- Chat.
- Worker-to-worker messaging.
- Admin Companion app bridge.
- Worker Field Timesheet app bridge.
- External paid integrations.

## Validation

- Apps Script helper functions exist.
- Menu includes the approved Google service helper items.
- Syntax check passed by copying `Code.gs` to a temporary `.js` file and running `node --check`.
- Static grep found no `Jdbc` usage.
- Static grep found no backend, app bridge, worker account, chat, or paid API implementation.
- Existing app acceptance tests pass.
- Existing workbook generator still runs and workbook audit passes.

## Live Google Sheets Test Needed

Status:
NOT RUN IN THIS BUILD

Required manual checks in a Google Sheets copy:
- Authorize Drive/Gmail/Calendar/UrlFetch permissions.
- Export selected Worker Proof CSV.
- Export selected Worker Proof PDF.
- Confirm Proof Exports rows are written.
- Send one selected Admin Notice to a controlled test recipient.
- Sync one selected Schedule row to Calendar.
- Confirm Calendar Sync Log row is written.
- Confirm workbook remains usable without relying on Apps Script.
