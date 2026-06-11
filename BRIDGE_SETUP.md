# CrewPay Admin App Workbook Bridge Setup

## Role And Boundary

CrewPay is the admin app for the CrewPay Ledger workbook. The workbook is the source of truth and final record authority. The static app has no separate backend, database, worker accounts, worker login, payroll execution, tax logic, HR system, or banking workflow.

Bridge flow:

`CrewPay Admin App -> Google Apps Script Web App -> workbook pending/intake tabs -> App Submission Log -> workbook review/promotion`

Records submitted from the app land in pending tabs first. Review and promotion to final workbook tabs remains workbook-controlled for now.

Future FieldOps-style/user-facing tools may submit into the same pending intake structure later. They are not part of this repo.

## Bridge Script

Use this script file for the Web App bridge:

`apps_script/CrewPay_Ledger_BRIDGE.gs`

Do not replace or overwrite the preserved original final helper script:

`apps_script/CrewPay_Ledger_ORIGINAL_FINAL.gs`

The bridge writes only to:

- `App Submission Log`
- `Pending Worker Intake`
- `Pending Pay Period Intake`
- `Pending Time Entries`

The bridge does not write to `Worker Proof`, dashboard/report tabs, formula areas, or final ledger tabs.

## Deploy In Google Apps Script

1. Open the CrewPay Ledger workbook in Google Sheets.
2. Go to `Extensions > Apps Script`.
3. Add a new script file for the bridge, or replace the default editor content with `apps_script/CrewPay_Ledger_BRIDGE.gs`.
4. In Apps Script, open `Project Settings > Script Properties`.
5. Add property:
   - Name: `CP_BRIDGE_TOKEN`
   - Value: a private/demo token you choose
6. Click `Deploy > New deployment`.
7. Select `Web app`.
8. Execute as: the admin account that owns or can edit the workbook.
9. Who has access: choose the narrowest option that works for your demo/testing setup.
10. Copy the Web App URL.
11. Open the CrewPay Admin App and paste the Web App URL into `Workbook Bridge`.
12. Paste the same token into the optional token field.
13. Run `Test Workbook Bridge`, then `Test Write Access`.

## Token Caveat

`CP_BRIDGE_TOKEN` is a basic private/demo gate. A token typed into a browser is not full authentication. Do not treat this as production security, worker identity, payroll authorization, or account access control.

## Action Envelope

All POST actions use this envelope:

```json
{
  "token": "STRING_VALUE",
  "action": "submitTimeEntry",
  "clientId": "crewpay-admin-app",
  "payload": {}
}
```

Success response:

```json
{
  "status": "success",
  "data": {
    "action": "submitTimeEntry",
    "message": "Time entry submitted to Pending Time Entries.",
    "submissionId": "PT-20260610090000-1234",
    "targetTab": "Pending Time Entries"
  }
}
```

Error response:

```json
{
  "status": "error",
  "message": "Clear error string"
}
```

## Supported Actions

| Action | Requires Token | Writes Workbook? | Target |
| --- | --- | --- | --- |
| `healthCheck` | No | POST may log only | `App Submission Log` for POST telemetry |
| `testWriteAccess` | Yes | Yes | `App Submission Log` |
| `getPendingSummary` | Yes | No | Counts pending rows only |
| `getWorkbookSchema` | Yes | No | Reads `Bridge Schema` |
| `submitWorkerIntake` | Yes | Yes | `Pending Worker Intake` and `App Submission Log` |
| `submitPayPeriod` | Yes | Yes | `Pending Pay Period Intake` and `App Submission Log` |
| `submitTimeEntry` | Yes | Yes | `Pending Time Entries` and `App Submission Log` |

## Sample Payloads

### healthCheck

```json
{
  "action": "healthCheck",
  "clientId": "crewpay-admin-app",
  "payload": {}
}
```

### testWriteAccess

```json
{
  "token": "YOUR_DEMO_TOKEN",
  "action": "testWriteAccess",
  "clientId": "crewpay-admin-app",
  "payload": {
    "source": "admin-ui"
  }
}
```

### submitWorkerIntake

```json
{
  "token": "YOUR_DEMO_TOKEN",
  "action": "submitWorkerIntake",
  "clientId": "crewpay-admin-app",
  "payload": {
    "workerId": "W-010",
    "workerName": "Sample Admin Worker",
    "accessStatus": "Active",
    "roleTrade": "Crew",
    "contact": "sample.worker@example.local",
    "notes": "Submitted from CrewPay Admin App"
  }
}
```

### submitPayPeriod

```json
{
  "token": "YOUR_DEMO_TOKEN",
  "action": "submitPayPeriod",
  "clientId": "crewpay-admin-app",
  "payload": {
    "payPeriodId": "PP-010",
    "workerId": "W-010",
    "workerName": "Sample Admin Worker",
    "periodStart": "2026-06-08",
    "periodEnd": "2026-06-14",
    "payDate": "2026-06-21",
    "notes": "Submitted from CrewPay Admin App"
  }
}
```

### submitTimeEntry

```json
{
  "token": "YOUR_DEMO_TOKEN",
  "action": "submitTimeEntry",
  "clientId": "crewpay-admin-app",
  "payload": {
    "entryId": "E-010",
    "workerId": "W-010",
    "workerName": "Sample Admin Worker",
    "payPeriodId": "PP-010",
    "workDate": "2026-06-10",
    "jobWorkType": "Sample Work",
    "hoursWorked": 8,
    "rate": 25,
    "notes": "Submitted from CrewPay Admin App"
  }
}
```

## Field Mapping

| Bridge action | Prompt/client field | Actual workbook tab | Actual workbook header | Required? | Notes |
| --- | --- | --- | --- | --- | --- |
| `submitWorkerIntake` | generated by bridge | `Pending Worker Intake` | `Intake ID` | Yes | Unique ID generated by Apps Script. |
| `submitWorkerIntake` | generated by bridge | `Pending Worker Intake` | `Submitted At` | Yes | Current script timestamp. |
| `submitWorkerIntake` | `clientId` | `Pending Worker Intake` | `Submission Source` | Yes | Defaults to `crewpay-admin-app`. |
| `submitWorkerIntake` | generated by bridge | `Pending Worker Intake` | `Submission Status` | Yes | Starts as `Pending`. |
| `submitWorkerIntake` | `workerId` | `Pending Worker Intake` | `Worker ID` | No | Optional pending worker identifier. |
| `submitWorkerIntake` | `workerName` | `Pending Worker Intake` | `Worker Name` | Yes | Trimmed and formula-safe. |
| `submitWorkerIntake` | `accessStatus` | `Pending Worker Intake` | `Access Status` | Yes | Must be `Active` or `Inactive`. |
| `submitWorkerIntake` | `roleTrade` | `Pending Worker Intake` | `Role / Trade` | Yes | Admin-entered role/trade. |
| `submitWorkerIntake` | `contact` | `Pending Worker Intake` | `Contact` | Yes | Email/contact text; not used as login. |
| `submitWorkerIntake` | `notes` | `Pending Worker Intake` | `Notes` | No | Trimmed and formula-safe. |
| `submitPayPeriod` | generated by bridge | `Pending Pay Period Intake` | `Intake ID` | Yes | Unique ID generated by Apps Script. |
| `submitPayPeriod` | generated by bridge | `Pending Pay Period Intake` | `Submitted At` | Yes | Current script timestamp. |
| `submitPayPeriod` | `clientId` | `Pending Pay Period Intake` | `Submission Source` | Yes | Defaults to `crewpay-admin-app`. |
| `submitPayPeriod` | generated by bridge | `Pending Pay Period Intake` | `Submission Status` | Yes | Starts as `Pending`. |
| `submitPayPeriod` | `payPeriodId` | `Pending Pay Period Intake` | `Pay Period ID` | Yes | Admin-provided pending period ID. |
| `submitPayPeriod` | `workerId` | `Pending Pay Period Intake` | `Worker ID` | Yes | Required for review. |
| `submitPayPeriod` | `workerName` | `Pending Pay Period Intake` | `Worker Name` | No | Optional display context. |
| `submitPayPeriod` | `periodStart` | `Pending Pay Period Intake` | `Period Start` | Yes | Strict `YYYY-MM-DD`. |
| `submitPayPeriod` | `periodEnd` | `Pending Pay Period Intake` | `Period End` | Yes | Strict `YYYY-MM-DD`; must be after/start same as start. |
| `submitPayPeriod` | `payDate` | `Pending Pay Period Intake` | `Pay Date` | No | Strict `YYYY-MM-DD` if provided. |
| `submitPayPeriod` | `notes` | `Pending Pay Period Intake` | `Notes` | No | Trimmed and formula-safe. |
| `submitTimeEntry` | generated by bridge | `Pending Time Entries` | `Intake ID` | Yes | Unique ID generated by Apps Script. |
| `submitTimeEntry` | generated by bridge | `Pending Time Entries` | `Submitted At` | Yes | Current script timestamp. |
| `submitTimeEntry` | `clientId` | `Pending Time Entries` | `Submission Source` | Yes | Defaults to `crewpay-admin-app`. |
| `submitTimeEntry` | generated by bridge | `Pending Time Entries` | `Submission Status` | Yes | Starts as `Pending`. |
| `submitTimeEntry` | `entryId` | `Pending Time Entries` | `Entry ID` | No | Optional pending entry ID. |
| `submitTimeEntry` | `workerId` | `Pending Time Entries` | `Worker ID` | Yes | Required for review. |
| `submitTimeEntry` | `workerName` | `Pending Time Entries` | `Worker Name` | No | Optional display context. |
| `submitTimeEntry` | `payPeriodId` | `Pending Time Entries` | `Pay Period ID` | Yes | Required for review. |
| `submitTimeEntry` | `workDate` | `Pending Time Entries` | `Work Date` | Yes | Strict `YYYY-MM-DD`. |
| `submitTimeEntry` | `jobWorkType` | `Pending Time Entries` | `Job / Work Type` | Yes | Trimmed and formula-safe. |
| `submitTimeEntry` | `hoursWorked` | `Pending Time Entries` | `Hours` | Yes | Numeric decimal only, > 0 and <= 24. |
| `submitTimeEntry` | `rate` | `Pending Time Entries` | `Rate` | Yes | Numeric decimal only; no currency strings. |
| `submitTimeEntry` | calculated by bridge | `Pending Time Entries` | `Amount` | Yes | `hoursWorked * rate`. |
| `submitTimeEntry` | `notes` | `Pending Time Entries` | `Notes` | No | Trimmed and formula-safe. |
| all write actions | generated by bridge | `App Submission Log` | `Log ID` | Yes | Unique ID generated by Apps Script. |
| all write actions | generated by bridge | `App Submission Log` | `Submitted At` | Yes | Current script timestamp. |
| all write actions | action name | `App Submission Log` | `Action` | Yes | Bridge action received. |
| all write actions | `clientId` | `App Submission Log` | `Submission Source` | Yes | Defaults to `crewpay-admin-app`. |
| all write actions | generated by bridge | `App Submission Log` | `Status` | Yes | `Success`, `OK`, `Error`, or `Unauthorized`. |
| all write actions | generated by bridge | `App Submission Log` | `Related Intake ID` | No | Set when an intake row is created. |
| all write actions | payload context | `App Submission Log` | `Related Worker ID` | No | Set where relevant. |
| all write actions | payload context | `App Submission Log` | `Related Pay Period ID` | No | Set where relevant. |
| all write actions | generated by bridge | `App Submission Log` | `Message` | Yes | Short result message. |
| all write actions | generated by bridge | `App Submission Log` | `Raw Payload Summary` | Yes | Redacted summary; token is never logged. |
| all write actions | generated by bridge | `App Submission Log` | `Handled By Script Version` | Yes | Bridge script version. |

## Validation Rules

- Strings are trimmed.
- User text beginning with `=`, `+`, `-`, or `@` is neutralized before writing.
- Dates must be strict `YYYY-MM-DD`.
- Hours must be numeric, greater than 0, and no more than 24.
- Rates must be numeric decimals, not currency strings or integer cents.
- Validation failures return JSON errors and log telemetry when possible after token verification.

## Manual Test Checklist

1. Deploy `apps_script/CrewPay_Ledger_BRIDGE.gs` as a Web App.
2. Set `CP_BRIDGE_TOKEN` in Script Properties.
3. Open the static CrewPay Admin App.
4. Go to `Workbook Bridge`.
5. Paste the Web App URL and token, then save locally.
6. Run `Test Workbook Bridge`.
7. Run `Test Write Access`; verify a row appears in `App Submission Log`.
8. Run `Load Pending Summary`; verify counts return without row detail.
9. Submit Worker Intake; verify a row appears in `Pending Worker Intake` and `App Submission Log`.
10. Submit Pay Period Intake; verify a row appears in `Pending Pay Period Intake` and `App Submission Log`.
11. Submit Time Entry; verify a row appears in `Pending Time Entries` and `App Submission Log`.
12. Confirm no rows are written directly to proof, dashboard, formula, or final ledger tabs.
