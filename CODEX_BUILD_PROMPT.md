# Codex Build Prompt — CrewPay Ledger

You are building inside this local repo:

~/projects/crewpay-ledger

Read these files first:
- README.md
- ACTIVE_STATE.md
- memory/BUILD_SPEC.md

## Goal

Build the first working MVP of CrewPay Ledger.

CrewPay Ledger is a timesheet, pay-proof, and access-control system for crews, workers, and admins.

The MVP must prove the core workflow:

Admin manages workers, jobs, time entries, pay periods, worker access status, and worker proof exports.

## Critical Product Rule

Do not build this as a simple shared spreadsheet clone.

The central product risk is this:

If the admin owns the data and removes access, the worker may lose proof of work and pay.

The MVP must show a worker-proof model where:
- Admins can deactivate future access.
- Past worker proof remains exportable/reviewable.
- Worker records are separated from other workers.
- Pay-period proof can be generated per worker.
- The data model can migrate later to an app/database source of truth.

## Build Type

Create a simple local-first web app unless the existing repo files clearly point to a better approach.

Prefer:
- Plain HTML/CSS/JS or Vite React
- Local storage for MVP data
- Clean sample data
- Export/print proof flow
- No paid services
- No backend yet
- No authentication yet, but model roles and access status clearly

## Required Screens or Sections

Build these MVP sections:

1. Dashboard
   - Basic summary cards
   - Active workers
   - Pending approvals
   - Current pay period totals

2. Workers
   - Worker list
   - Add/edit worker
   - Access status: Active / Inactive
   - Inactive workers should remain visible in history

3. Jobs
   - Job or work-site list
   - Add/edit job
   - Job status

4. Time Entries
   - Add time entry
   - Select worker
   - Select job
   - Date
   - Start/end time or hours
   - Rate
   - Notes
   - Approval status

5. Pay Periods
   - Group entries by worker and date range
   - Show total hours
   - Show gross pay
   - Show payment status
   - Mark paid/unpaid

6. Worker Proof
   - Select worker
   - Select pay period/date range
   - Show only that worker’s records
   - Generate printable proof view
   - Export CSV if practical
   - Make clear that this proof survives access removal

7. Access Control Model
   - Show active/inactive status
   - Inactive status should block new entries for that worker
   - Inactive status must not hide or delete historical proof

## Required Data Objects

Use a data shape that can migrate later.

Include at minimum:
- workers
- jobs
- timeEntries
- payPeriods or computed pay-period summaries
- proofExports or export history if practical

## Acceptance Criteria

After build:
- App runs locally.
- Sample data loads.
- Worker can be made inactive.
- Inactive worker cannot be used for new time entries.
- Inactive worker’s past records remain visible in proof/history.
- Worker proof view shows only one worker’s records.
- Pay period totals calculate correctly.
- CSV or print proof exists.
- README includes run instructions.
- No real private data is included.
- Repo has a clean final status after commit.

## Important Constraints

- Keep MVP small and working.
- Do not add complex auth.
- Do not add paid APIs.
- Do not overbuild dashboards.
- Do not remove the planning files.
- Do not ignore the Level 1 to Level 2 migration path.
- Keep code readable for future edits.

## Final Output Requested From Codex

When done, provide:
- Files changed
- How to run
- What was built
- What was intentionally not built
- Acceptance test results
- Any risks or gaps
