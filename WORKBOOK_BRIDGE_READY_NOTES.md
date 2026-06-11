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

CrewPay Ledger remains workbook-first. The workbook must still function manually without the companion app or Apps Script bridge. The CrewPay Admin App can support controlled admin intake through Apps Script, but the workbook remains the final authority for ledger records, worker proof, pay-period totals, access history, corrections, notices, and audit logs.

## Future App Bridge Path

The new isolated Apps Script bridge `apps_script/CrewPay_Ledger_BRIDGE.gs` can submit controlled admin records into:

- `Pending Worker Intake`
- `Pending Pay Period Intake`
- `Pending Time Entries`
- `App Submission Log`

The app should not write directly into `Worker Proof`, dashboards, formula-driven summaries, or report-only tabs.

## Preserved Original Script

The preserved original final helper script was not changed:

- `apps_script/CrewPay_Ledger_ORIGINAL_FINAL.gs`
- `release-package/CrewPay_Ledger_DEMO_PACKAGE/CrewPay_Ledger_ORIGINAL_FINAL.gs`

The bridge script remains separate from the preserved original final script.

## Bridge Foundation Added

The admin app bridge foundation now includes:

1. `apps_script/CrewPay_Ledger_BRIDGE.gs` with `doGet` / `doPost` action routing plus `installCrewPayBridgeTabs` and `debugCrewPayBridgeWorkbook`.
2. Admin app bridge configuration stored locally in the browser.
3. `healthCheck`, `testWriteAccess`, `getPendingSummary`, `getWorkbookSchema`, `submitWorkerIntake`, `submitPayPeriod`, and `submitTimeEntry` action support.
4. App Submission Log telemetry for bridge writes and setup/validation failures where practical.
5. No direct final-tab, proof-tab, dashboard, or formula-area writes.

## Next Build Step

Paste the updated bridge script into Apps Script, run `installCrewPayBridgeTabs`, run `debugCrewPayBridgeWorkbook`, set `CP_BRIDGE_TOKEN`, update/redeploy the Web App deployment, paste the Web App URL into the CrewPay Admin App, and run the manual checks in `BRIDGE_SETUP.md`.
