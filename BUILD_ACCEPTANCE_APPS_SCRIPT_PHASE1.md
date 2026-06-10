# Build Acceptance - Apps Script Phase 1

Build:
CrewPay Ledger Level 1.5 Phase 1 Apps Script helpers.

Files:
- `apps_script/Code.gs`
- `apps_script/README.md`

Audit result:
PASS

## Built

- Custom `CrewPay Ledger` menu.
- `generateWorkerProof` helper.
- `logProofExport` helper.
- `logAccessChange` helper.
- `logCorrection` helper.
- `createEmailReadyNotice` helper.
- `aboutCrewPayLedger` helper.
- Shared helper functions for sheets, headers, row lookup, append rows, IDs, prompts, and friendly errors.

## Verified Boundaries

- Workbook remains the source of truth.
- Apps Script is optional and the workbook remains manually usable.
- Script references approved workbook tabs only.
- Worker Proof reads the selected worker and selected pay period.
- Worker/pay-period mismatch warns and does not log proof for the wrong worker.
- Proof export logging is worker-specific.
- Access changes are logged and do not delete worker records.
- Corrections are logged visibly.
- Email-ready notice helper creates copyable text and does not send email.

## Intentionally Not Built

- Gmail send.
- Google Calendar sync.
- PDF export.
- CSV export.
- Admin Companion app bridge.
- Worker Field Timesheet app bridge.
- Backend server.
- Paid APIs.
- Real database.
- Worker accounts.
- Enterprise permissions.
- Payroll tax logic.
- HR compliance logic.
- Chat.
- Worker-to-worker messaging.

## Validation

- `apps_script/Code.gs` exists.
- `apps_script/README.md` exists.
- Custom menu function exists.
- Phase 1 helper functions exist.
- Syntax check passed by copying `Code.gs` to a temporary `.js` file and running `node --check`.
- Static grep found no `GmailApp`, `MailApp`, `CalendarApp`, `DriveApp`, `UrlFetchApp`, or `Jdbc` usage.
- Existing workbook generator still runs.
- Existing app acceptance tests still pass.

## Live Google Sheets Test

Status:
PASS

Confirmed manually in a Google Sheets copy:
- Apps Script installed from apps_script/Code.gs.
- Sheet reloaded successfully.
- CrewPay Ledger menu appeared.
- Phase 1 helper behavior worked in Google Sheets.
- No Gmail send helper was tested or required.
- No Google Calendar sync helper was tested or required.
- Workbook remained usable as the Level 1 source of truth.
