# Codex Workbook Build Prompt — CrewPay Ledger

Build the Level 1 CrewPay Ledger Workbook.

CrewPay Ledger Level 1 is workbook-first.

The Google Sheets workbook is the source of truth.

The existing local app is only an optional admin companion prototype. Do not make the workbook depend on the app.

Create:
- build_crewpay_ledger_workbook.py
- CrewPay_Ledger_Workbook.xlsx
- BUILD_ACCEPTANCE_WORKBOOK.md

Workbook tab order:
1. Instructions
2. Dashboard
3. Workers
4. Jobs
5. Time Entries
6. Pay Periods
7. Worker Proof
8. Proof Exports
9. Access Log
10. Correction Log
11. Schedule
12. Admin Notices
13. Calendar Sync Log
14. Dropdown Lists

Core rules:
- Workbook is the ledger/source of truth for Level 1.
- App is optional and must not be required.
- Workbook must work manually.
- Apps Script helpers may be added later as Level 1.5.
- Worker Proof must show one worker only.
- Inactive workers lose future-use access, not historical proof.
- Admin corrections must be visible, not silent.
- Schedule supports planning and future Google Calendar sync, but is not proof.
- Admin Notices are one-way admin notices only, not chat or proof.
- No backend.
- No real database.
- No paid APIs.
- No payroll tax logic.
- No HR compliance logic.
- No worker accounts.
- No enterprise permissions.

Acceptance:
- Generator runs successfully.
- Workbook has exactly 14 tabs in approved order.
- Required headers exist.
- Dropdown Lists exists and contains values.
- Data validation is applied where practical.
- Sample data includes active and inactive worker scenarios.
- Worker Proof is worker-specific.
- Pay Period formulas calculate totals where practical.
- Schedule tab exists but does not act as proof.
- Admin Notices tab exists but does not act as chat.
- No app dependency exists.
- Git status is clean after final commit.
