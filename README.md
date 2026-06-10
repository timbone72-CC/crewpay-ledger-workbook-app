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
- Level 1: simple, free/low-cost, likely Google Sheets-backed.
- Level 2: app/database-backed source of truth with better access control and privacy boundaries.
