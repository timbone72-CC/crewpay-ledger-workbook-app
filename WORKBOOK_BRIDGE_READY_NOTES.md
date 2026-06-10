# CrewPay Ledger Workbook Bridge Readiness Notes

## Tabs Added

The workbook now includes these bridge-support tabs near the end of the workbook, before `Dropdown Lists`:

- `App Config`
- `Pending Worker Intake`
- `Pending Pay Period Intake`
- `Pending Time Entries`
- `App Submission Log`
- `Bridge Schema`

Both workbook copies were updated:

- `CrewPay_Ledger_Workbook.xlsx`
- `release-package/CrewPay_Ledger_DEMO_PACKAGE/CrewPay_Ledger_Workbook.xlsx`

## Why Pending / Intake Tabs Exist

The safest no-backend bridge path is:

`Static app / PWA -> Apps Script Web App -> pending workbook tabs -> admin review -> final workbook tabs`

The pending/intake tabs give the companion app explicit write targets without letting the app write blindly into final ledger, formula, proof, dashboard, or report areas. This keeps app submissions reviewable and keeps corrections visible.

## Workbook Remains Source Of Truth

CrewPay Ledger remains workbook-first. The workbook must still function manually without the companion app or Apps Script bridge. The app can support intake, but the workbook remains the final authority for ledger records, worker proof, pay-period totals, access history, corrections, notices, and audit logs.

## Future App Bridge Path

A future Apps Script Web App bridge can submit controlled records into:

- `Pending Worker Intake`
- `Pending Pay Period Intake`
- `Pending Time Entries`
- `App Submission Log`

The app should not write directly into `Worker Proof`, dashboards, formula-driven summaries, or report-only tabs.

## Preserved Original Script

The preserved original final helper script was not changed:

- `apps_script/CrewPay_Ledger_ORIGINAL_FINAL.gs`
- `release-package/CrewPay_Ledger_DEMO_PACKAGE/CrewPay_Ledger_ORIGINAL_FINAL.gs`

Future bridge work should remain separate from the preserved original final script.

## Next Build Step

Build the Apps Script Web App bridge and app endpoint wiring:

1. Add endpoint configuration in the static app.
2. Add Apps Script `doGet` / `doPost` action routing.
3. Implement `healthCheck` and `getWorkbookSchema` first.
4. Implement controlled writes to pending/intake tabs.
5. Add submission logging and duplicate/idempotency checks.
6. Add acceptance tests proving the app writes only to approved intake/log tabs.
