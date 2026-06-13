# CrewPay Ledger

CrewPay Ledger is a workbook-first timesheet, pay-proof, and access-control system with an optional CrewPay Admin App companion.

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


## CrewPay Admin App Bridge

The static app can now be configured as a no-backend admin companion for the workbook. The bridge path is:

```text
CrewPay Admin App -> Apps Script Web App -> pending workbook intake tabs -> workbook review
```

Bridge setup instructions are in `BRIDGE_SETUP.md`. The bridge script is `apps_script/CrewPay_Ledger_BRIDGE.gs`; run `installCrewPayBridgeTabs` in Apps Script before testing bridge writes against a deployed workbook.

The app remains admin-side only. It does not add worker login, worker self-service, a backend server, a database, payroll execution, tax logic, HR compliance logic, or banking workflows.

## CrewPay Owner Control Workbook

Tim-only private control plane workbook for client access, billing, bridge health, feature flags, calendar visibility, support notes, and owner audit history.

Build it with:

```bash
python3 build_crewpay_owner_control_workbook.py
```

Output:

```text
CrewPay_Owner_Control_Workbook.xlsx
```

The owner workbook is separate from the operational ledger workbook and must not contain worker private records, worker proof, payroll detail, or real bridge tokens/endpoints.

The owner-control Apps Script includes a `Run Owner Control Self Check` menu item and fails safely if required owner-control tabs or headers are missing or if it appears pasted into the wrong workbook. Do not paste it into the operational CrewPay Ledger workbook; the ledger helper scripts and bridge script remain separate.

## Optional Apps Script Helpers

Phase 1 optional Google Apps Script helpers live in `apps_script/`.

These helpers add a custom workbook menu, worker proof refresh, proof export logging, access change
logging, correction logging, and email-ready notice text. They do not send Gmail, sync Google
Calendar, use paid APIs, add a backend, or replace the workbook as the source of truth.

Install instructions are in `apps_script/README.md`.

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
