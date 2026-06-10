# CrewPay Ledger — Level 1.5 Apps Script Plan

## Purpose

Level 1.5 adds free Google Apps Script helpers to the workbook while keeping the workbook as the source of truth.

The workbook must still work manually if Apps Script is removed or disabled.

## Boundary

Allowed:
- Google Apps Script inside the workbook
- Custom workbook menu
- Helper actions that read/write workbook tabs
- Proof generation/export helpers
- Email-ready notice helpers
- Optional Gmail send from the admin account later
- Optional Google Calendar event creation/update later
- Logging helper actions

Not allowed:
- Backend server
- Paid APIs
- Real database
- Worker accounts
- Enterprise permissions
- Payroll tax logic
- HR compliance logic
- Chat
- Worker-to-worker messaging
- Required dependency on the optional admin companion app

## Recommended Build Order

### Phase 1 — Safe Workbook Helpers

Build first:
1. Custom menu
2. Generate Worker Proof
3. Log Proof Export
4. Log Access Change
5. Log Correction
6. Create Email-Ready Notice

Reason:
These improve the workbook without needing Gmail, Calendar, backend, or paid services.

### Phase 2 — File Export Helpers

Build after Phase 1 works:
1. Export Worker Proof as PDF
2. Export Worker Proof as CSV

Reason:
These are useful but should come after proof selection and logs are reliable.

### Phase 3 — Optional Google Helpers

Build only after manual workbook and Phase 1/2 helpers are stable:
1. Optional Gmail send from admin account
2. Optional Google Calendar event creation/update

Reason:
These touch account permissions and can increase setup complexity.

## Proposed Custom Menu

Menu name:
CrewPay Ledger

Menu items:
- Generate Worker Proof
- Log Proof Export
- Export Worker Proof PDF
- Export Worker Proof CSV
- Create Email-Ready Notice
- Log Access Change
- Log Correction
- Sync Selected Schedule to Calendar
- About CrewPay Ledger

## Minimum Apps Script Acceptance

Before considering Level 1.5 complete:
- Custom menu appears in Google Sheets.
- Worker Proof helper respects selected worker only.
- Proof export logging writes to Proof Exports.
- Access changes can be logged.
- Corrections can be logged.
- Email-ready notice helper creates/copies text without sending.
- Workbook still works if Apps Script is removed.
- No backend or paid services are required.

## Deferred

Do not build these until explicitly approved:
- Gmail send helper
- Google Calendar sync helper
- Worker Field Timesheet app bridge
- Admin Companion app bridge
