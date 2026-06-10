# CrewPay Ledger

CrewPay Ledger is a timesheet, pay-proof, and access-control system for crews, workers, and admins.

Core goals:
- Make timesheets easy to give to workers and admins.
- Preserve worker proof of hours and pay even if access changes later.
- Keep worker information private.
- Give admins control over who can access and use the system.
- Start simple with a Level 1 build.
- Preserve a clean migration path to Level 2 where the app/database becomes the source of truth and Google Sheets becomes export/report only.

Current build direction:
- Level 1: workbook-first, simple, free/low-cost, Google Sheets-friendly source of truth.
- Level 2: app/database-backed source of truth with better access control and privacy boundaries.

## Level 1 Workbook

The Level 1 source of truth is the CrewPay Ledger Workbook. The local app in this repo is optional
and is not required to use the workbook.

Rebuild the workbook:

```bash
python3 build_crewpay_ledger_workbook.py
```

Output:

```text
CrewPay_Ledger_Workbook.xlsx
```

## MVP Build

This repo now includes a small local-first MVP built with plain HTML, CSS, and JavaScript.

### Run locally

Open `index.html` in a browser, or serve the folder with any static file server:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

### Run acceptance tests

```bash
node tests/acceptance.test.js
```

### What the MVP demonstrates

- sample workers, jobs, time entries, and pay periods
- active/inactive worker access status
- inactive workers blocked from new time entries
- historical inactive-worker records preserved for proof
- pay-period totals for hours, gross pay, reimbursements, deductions, and net pay
- Open / Finalized / Paid pay-period states
- worker-only printable proof view
- worker-only CSV proof export
- generated proof timestamp and export history record

### Intentional MVP boundaries

This MVP does not include login/authentication, a real database, cloud storage, email delivery,
GPS/location tracking, payroll tax logic, HR compliance logic, messaging, notifications, Google
Sheets API, Apps Script, or a full payroll system.
