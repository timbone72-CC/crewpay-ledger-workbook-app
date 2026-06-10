# CrewPay Ledger — Architecture Direction

## Core Direction

CrewPay Ledger Level 1 is a Google Sheets workbook-first system.

The workbook is the source of truth for Level 1.

The local app currently in this repo is a bonus admin companion prototype. The rest of the system must not rely on the app to work.

## Level 1 Source of Truth

The Level 1 source of truth should be the CrewPay Ledger Workbook.

The workbook should hold:
- Workers
- Jobs
- Time Entries
- Pay Periods
- Worker Proof
- Proof Exports
- Access Status
- Correction Notes
- Access Log
- Calendar Sync Log, if calendar sync is added later

## Current App Role

The current local app should be treated as:

CrewPay Ledger Admin Companion

Its role:
- Help an admin review records away from the computer.
- Demonstrate access/proof logic.
- Provide a prototype for later app/database migration.
- Stay optional.

Its role is not:
- The main source of truth.
- The required system interface.
- The worker-facing field app.
- A full payroll system.
- A replacement for the workbook.

## Future Worker App Role

A future worker-facing app may be added later.

That app would be:

CrewPay Field Timesheet

Its role would be:
- Let a worker enter time in the field.
- Show only that worker's own records.
- Let the worker export or print their own proof.
- Send entries into the workbook-backed ledger.

Do not build this until the workbook structure is defined.

## Google Calendar Role

Google Calendar may be added later as a schedule mirror.

Calendar should show schedules, job dates, reminders, or pay-period dates.

Calendar should not be the source of truth for proof.

## Sync Rule

The workbook is the ledger.

Apps are convenience tools.

Google Calendar is a schedule view.

Proof comes from the ledger.
