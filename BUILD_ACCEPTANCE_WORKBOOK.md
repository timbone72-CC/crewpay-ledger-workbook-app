# Build Acceptance - CrewPay Ledger Workbook

Workbook:
`CrewPay_Ledger_Workbook.xlsx`

Generator:
`build_crewpay_ledger_workbook.py`

Build target:
CrewPay Ledger Level 1 workbook-first source of truth.

Audit result:
PASS

Verified:
- `python3 build_crewpay_ledger_workbook.py` runs successfully.
- `CrewPay_Ledger_Workbook.xlsx` is created.
- Workbook has exactly 16 tabs.
- Tab order matches the approved order:
  1. Instructions
  2. Dashboard
  3. Workers
  4. Jobs
  5. Time Entries
  6. Pay Periods
  7. Worker Proof
  8. Access Status Demo
  9. Workflow Demo
  10. Proof Exports
  11. Access Log
  12. Correction Log
  13. Schedule
  14. Admin Notices
  15. Calendar Sync Log
  16. Dropdown Lists
- Public-demo presentation tabs are visually styled and explanatory only.
- Required headers exist on all data and log tabs.
- Dropdown Lists tab exists and contains approved values.
- Data validation is applied where practical.
- Sample data includes active and inactive worker scenarios.
- Worker Proof is structured around one selected worker and one selected pay period.
- Worker Proof is styled as a print-ready proof/report page.
- Worker Proof includes a selector check that warns when the selected pay period belongs to another worker.
- Worker Proof totals are calculated from the selected worker and selected pay-period date range.
- Worker Proof has a defined print area and landscape fit-to-page setup.
- Time Entries formulas calculate worker/job names, hours, gross pay, and net pay where practical.
- Time Entries visually flags inactive-worker rows so future-use mistakes are visible.
- Pay Period formulas summarize worker/date-range totals where practical.
- ID-based dropdown validation is applied on key workbook-native references such as Worker ID, Job ID, Pay Period ID, and Entry ID where practical.
- Schedule exists as planning/reference only and does not act as proof.
- Admin Notices exists as one-way notices only and does not act as chat or proof.
- Proof Exports, Access Log, Correction Log, Schedule, Admin Notices, and Calendar Sync Log are structured for later helper scripts while remaining manually usable.
- Dashboard and Instructions use public-demo card layouts.
- Data and log tabs use styled tables with frozen headers, filters, alternating row fills, and status formatting.
- No app dependency is required by the workbook.
- No backend, real database, paid API, worker account, payroll tax logic, HR compliance logic, enterprise permissions, Apps Script, or Google API integration was added.

Notes:
- The workbook is generated with Python and `openpyxl`.
- The local app remains optional and was not modified for this workbook build.
- Apps Script helpers may be added later, but the workbook works manually as the Level 1 ledger.
