# CrewPay Owner Control Workbook Acceptance

## Build Status

Verified: workbook build and audit passed locally.

## Output Files

- `build_crewpay_owner_control_workbook.py`
- `CrewPay_Owner_Control_Workbook.xlsx`
- `audit_crewpay_owner_control_workbook.py`
- `apps_script/CrewPay_Owner_Control.gs`
- `CREWPAY_OWNER_CONTROL_WORKBOOK_SPEC.md`
- `CREWPAY_OWNER_CONTROL_ACCEPTANCE.md`

## Approved Tab Order

1. Instructions
2. Owner Dashboard
3. Client Registry
4. Client Access Control
5. License Billing
6. Bridge Registry
7. Feature Flags
8. System Health
9. Calendar Visibility
10. Support Notes
11. Owner Audit Log
12. Dropdown Lists
13. Data Dictionary
14. Apps Script Setup

## Audit Checklist

- Workbook exists.
- Tabs are in the approved order.
- Required headers exist.
- Dashboard formulas exist.
- Data validations exist on controlled dropdown/count columns.
- No forbidden worker-level columns exist.
- No obvious private emails exist.
- No phone-number-like samples exist.
- No real URL-like values exist.
- No real token-like values exist.
- No worker payroll/time-entry/proof fields exist.
- Apps Script exists.
- Apps Script contains the required menu functions.
- Apps Script contains `Run Owner Control Self Check`.
- Apps Script does not use GmailApp, CalendarApp, DriveApp, UrlFetchApp, ContentService, doGet, or doPost.
- Apps Script fails safely if required owner-control tabs or headers are missing.
- Apps Script fails safely if pasted into the wrong workbook.
- Existing operational ledger files remain separate.

## Test Commands To Run

- `python3 build_crewpay_owner_control_workbook.py`
- `python3 audit_crewpay_owner_control_workbook.py`
- `node tests/acceptance.test.js`
- Apps Script syntax check by copying `apps_script/CrewPay_Owner_Control.gs` to `/tmp/*.js` and running `node --check`
- Targeted privacy grep checks
- `git status --short --branch`
- `git diff --stat`

## Manual Google Sheets Test Steps

1. Open the generated workbook in Google Sheets.
2. Paste `apps_script/CrewPay_Owner_Control.gs` into a workbook-bound Apps Script project.
3. Reload the workbook.
4. Confirm the `CrewPay Owner Control` menu appears.
5. Run `Run Owner Control Self Check`.
6. Run each menu action against sample demo rows only.
7. Confirm no worker data can be entered or exposed.
8. Confirm no external service calls are made.

## Known Limits

- This workbook is private control-plane data only.
- It does not connect to worker records.
- It does not send email.
- It does not create calendar events.
- It does not store real bridge tokens or real endpoint URLs.

## Final Acceptance Status

Accepted locally, pending manual Google Sheets verification.
