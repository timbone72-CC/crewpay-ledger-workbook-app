# CrewPay Ledger — Build Spec

## Product Summary

CrewPay Ledger is a timesheet, pay-proof, and access-control system for crews, workers, and admins.

The product must help workers keep lasting proof of hours, pay, approvals, and payment history while giving admins controlled access to manage crews, jobs, timesheets, and reports.

## Core Users

### Admin
The admin manages:
- Crew members
- Jobs or work sites
- Timesheets
- Pay periods
- Approval status
- Export/report access
- Worker access status

### Worker
The worker needs:
- Easy timesheet entry or review
- Proof of submitted time
- Proof of approved time
- Proof of pay owed
- Proof of pay received
- A way to keep records even if access is removed later

## Main Problem

A shared Google Sheet alone is not enough.

If an admin owns the sheet and removes a worker’s access, the worker may lose proof of work and pay history. CrewPay Ledger must avoid making worker proof depend only on continued admin-controlled access.

## Level 1 Architecture

Level 1 should be simple, free, and buildable quickly.

Allowed:
- Static app or simple local-first app
- Google Sheets as source of truth
- CSV export
- PDF/print proof
- Manual admin setup

Required:
- Clear privacy boundary between workers
- Worker-facing proof/export flow
- Admin-controlled access status
- Audit-friendly records
- Data shape that can migrate to Level 2 later

Level 1 must not pretend Google Sheets sharing is enough access control.

## Level 2 Architecture

Level 2 is the future upgrade path.

Expected direction:
- App/database becomes source of truth
- Google Sheets becomes export/report only
- Login/authentication
- Role-based access
- Worker-owned record history
- Stronger audit logs
- Better privacy controls
- Admin dashboard

## Non-Negotiable Rules

- Worker proof must survive firing, quitting, or access removal.
- Admins can control active use, but should not erase worker pay proof.
- Worker data must not be visible to other workers.
- Timesheet records must be exportable.
- Pay records must be reviewable by pay period.
- Migration path must be protected from the first build.
- Avoid locking the whole product into a spreadsheet-only design.

## MVP Scope

The first working version should focus on:

1. Admin creates or manages workers.
2. Admin creates jobs or work categories.
3. Worker or admin records time entries.
4. Time entries roll into pay periods.
5. Pay period shows hours, rate, gross pay, reimbursements, deductions if needed, and payment status.
6. Worker can receive/export proof of their own records.
7. Admin can mark worker access active/inactive.
8. Inactive access stops future use but does not destroy past proof.

## Suggested Data Objects

### Worker
- worker_id
- worker_name
- worker_email
- role
- access_status
- created_at
- inactive_at

### Job
- job_id
- job_name
- client_or_site
- status
- created_at

### Time Entry
- entry_id
- worker_id
- job_id
- work_date
- start_time
- end_time
- break_minutes
- hours
- rate
- notes
- submitted_at
- approval_status
- approved_at

### Pay Period
- pay_period_id
- period_start
- period_end
- worker_id
- total_hours
- gross_pay
- reimbursement_total
- deduction_total
- net_pay
- payment_status
- paid_at

### Proof Export
- export_id
- worker_id
- pay_period_id
- export_type
- created_at
- export_hash_or_reference

## Privacy Boundary

Workers should only see their own:
- Time entries
- Pay periods
- Pay proof
- Export history

Admins may see crew-wide records.

## Open Decisions

- Exact Level 1 implementation: workbook-first, app-first, or hybrid.
- Whether Google Apps Script is included in Level 1.
- Whether worker proof is delivered by PDF, CSV, email, or worker-owned copy.
- Whether this starts as a demo portfolio app, a usable internal tool, or a sellable template.
