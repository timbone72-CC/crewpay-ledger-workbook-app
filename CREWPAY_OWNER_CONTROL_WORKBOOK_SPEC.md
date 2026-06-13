# CrewPay Owner Control Workbook Spec

## Purpose

`CrewPay Owner Control Workbook` is Tim’s private business/admin control plane for managing client status, access control, billing status, bridge health, feature flags, calendar visibility, support notes, and an owner audit trail.

It is not the operational ledger workbook.
It is not a worker app.
It is not a payroll workbook.
It is not a proof workbook.

## Privacy Boundary

This workbook must never store worker private data.

Forbidden data includes:

- worker names
- worker emails
- worker phone numbers
- worker addresses
- worker SSNs
- worker notes
- worker time entries
- worker payroll detail
- proof photos
- private proof records
- calendar proof detail

Allowed content is limited to client/system-level control information:

- client status
- access status
- billing and license status
- allowed worker counts
- reported worker counts
- bridge alias/status information
- token status aliases
- feature flags
- system health
- calendar visibility rules
- support notes
- owner audit trail

Bridge endpoint and token values in public/demo copies must always be placeholders or aliases only.

## Workbook Tab Map

1. `Instructions`
2. `Owner Dashboard`
3. `Client Registry`
4. `Client Access Control`
5. `License Billing`
6. `Bridge Registry`
7. `Feature Flags`
8. `System Health`
9. `Calendar Visibility`
10. `Support Notes`
11. `Owner Audit Log`
12. `Dropdown Lists`
13. `Data Dictionary`
14. `Apps Script Setup`

## Field List

### Client Registry

- Client ID
- Client Display Name
- Client Legal Name
- Client Status
- Primary Contact Alias
- Contact Method
- Region
- Industry
- Onboarded Date
- Offboarded Date
- Client Ledger Location Alias
- Worker Data Owner
- Allowed Worker Count
- Current Worker Count Reported
- Data Privacy Level
- Notes

### Client Access Control

- Access Record ID
- Client ID
- Client Display Name
- Access Status
- Access Start Date
- Access End Date
- Access Reason
- Disabled New Submissions
- Disabled Bridge
- Disabled Calendar Sync
- Last Access Review
- Reviewed By Alias
- Notes

### License Billing

- License Record ID
- Client ID
- Plan Tier
- Billing Status
- Billing Period
- Renewal Date
- Allowed Worker Count
- Billing Worker Count
- Last Invoice Alias
- Payment Method Alias
- Grace Period Ends
- Billing Notes

### Bridge Registry

- Bridge Record ID
- Client ID
- Bridge Status
- Bridge Endpoint Alias
- Token Status
- Token Last Rotated
- Token Rotation Due
- Last Health Check
- Last Successful Submit
- Last Failed Submit
- Pending Intake Count
- Last Error Summary
- Notes

### Feature Flags

- Flag Record ID
- Client ID
- Feature Name
- Feature Status
- Effective Date
- Expiration Date
- Requires Billing Good Standing
- Requires Bridge Healthy
- Notes

### System Health

- Health Record ID
- Client ID
- Check Date
- Ledger Status
- Bridge Status
- Worker App Status
- Calendar Status
- Backup Status
- Last Backup Alias
- Issue Severity
- Issue Summary
- Owner Action Needed
- Resolved Date
- Notes

`Calendar Status` uses the same Disabled / Limited / Enabled control values as the other calendar visibility controls.

### Calendar Visibility

- Calendar Rule ID
- Client ID
- Calendar Visibility Status
- Allowed Calendar Use
- Worker Detail Exposure
- Schedule Detail Exposure
- Proof Source
- Sync Direction
- Last Calendar Sync
- Notes

### Support Notes

- Support Note ID
- Client ID
- Note Date
- Note Type
- Priority
- Status
- Summary
- Owner Next Action
- Follow-up Date
- Resolved Date
- Notes

### Owner Audit Log

- Audit ID
- Timestamp
- Actor Alias
- Area
- Client ID
- Action
- Previous Value
- New Value
- Reason
- Notes

## Owner / Control-Plane Limits

- This workbook manages status and configuration only.
- This workbook does not approve payroll.
- This workbook does not calculate payroll.
- This workbook does not store proof photos.
- This workbook does not store worker-level detail.
- This workbook does not connect directly to client worker records.
- This workbook does not act as the data plane.

## What This Workbook Does Not Do

- No worker records
- No worker contact data
- No time-entry detail
- No payroll approvals
- No payroll calculations
- No worker proof storage
- No proof-photo storage
- No Gmail send
- No Calendar event creation
- No bridge submission intake
- No real endpoint storage
- No real token storage

## Relationship to Other CrewPay Components

- `CrewPay Ledger Workbook` remains the operational ledger and source of truth for worker records.
- `CrewPay Worker Field App` is the worker-facing local app for intake and export.
- `CrewPay Owner Control Workbook` is Tim’s private control plane for client/system management.
- `CrewPay_Ledger_BRIDGE.gs` is the separate no-backend bridge for intake tabs in the ledger workbook.
- `CrewPay_Ledger_ORIGINAL_FINAL.gs` remains preserved historical helper code.
- `apps_script/Code.gs` remains the operational ledger helper script.
- `apps_script/CrewPay_Owner_Control.gs` must stay separate and includes a `Run Owner Control Self Check` menu item that validates the owner-control sheet structure before any write action.

## Existing Script Separation

Do not paste the following scripts into this owner workbook:

- `apps_script/Code.gs`
- `apps_script/CrewPay_Ledger_ORIGINAL_FINAL.gs`
- `apps_script/CrewPay_Ledger_BRIDGE.gs`

The owner-control script must be a separate file:

- `apps_script/CrewPay_Owner_Control.gs`

## Manual Google Sheets Setup

1. Open `CrewPay_Owner_Control_Workbook.xlsx` in Google Sheets.
2. Create an Apps Script project bound to this workbook.
3. Paste `apps_script/CrewPay_Owner_Control.gs` into a separate file named `CrewPay_Owner_Control.gs`.
4. Save the project.
5. Reload the workbook.
6. Run `Run Owner Control Self Check`.
7. Use the `CrewPay Owner Control` menu.

## Manual Google Sheets Test Checklist

- Confirm the owner workbook has the approved 14 tabs in the approved order.
- Confirm the dashboard formulas recalculate.
- Confirm dropdowns appear on controlled status fields.
- Confirm no worker private columns exist.
- Confirm sample data uses aliases only.
- Confirm `Run Owner Control Self Check` fails safely if the workbook is pasted into the wrong spreadsheet or if required headers are missing.
- Confirm the script menu appears.
- Confirm logging actions append to `Owner Audit Log`.
- Confirm the script does not access worker records, Gmail, Calendar, Drive, URLs, or tokens.
- Confirm the operational ledger workbook and bridge scripts remain separate.
