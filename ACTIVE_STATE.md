# CrewPay Ledger — Active State

Project purpose:
Build a timesheet, pay-proof, and access-control system for crews, workers, and admins.

Primary problem:
Workers need lasting proof of hours worked, pay owed, and pay received.
Admins need control over access and usage.
The system must avoid trapping worker proof inside an admin-controlled sheet that can be revoked later.

Current project name:
CrewPay Ledger

Current architecture direction:
Level 1:
- Simple free/low-cost build.
- May use Google Sheets as the source of truth.
- Must be designed so future migration is possible.
- Must not ignore worker-owned proof/export needs.

Level 2:
- App/database becomes the source of truth.
- Google Sheets becomes export/report only.
- Stronger access control, privacy boundaries, and audit history.

Non-negotiable requirements:
- Worker proof must survive access removal, firing, quitting, or admin revocation.
- Admins need control over who can access and use the system.
- Worker private information should not be exposed to other workers.
- Migration from Level 1 to Level 2 must be planned from the start.
- Google Sheets sharing must not be treated as enough access control by itself.

Current status:
- Local workspace created at ~/projects/crewpay-ledger.
- README.md created.
- No app code has been generated yet.
