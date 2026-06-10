# Codex Audit Prompt — CrewPay Ledger

You are auditing this repo only:

~/projects/crewpay-ledger

Read these files first:
- README.md
- ACTIVE_STATE.md
- memory/BUILD_SPEC.md
- CODEX_BUILD_PROMPT.md
- CHECKPOINT.md

## Audit Mode

Do not create files.
Do not edit files.
Do not install dependencies.
Do not scaffold an app.
Do not fix anything yet.

This is a findings-only audit.

## Product Context

CrewPay Ledger is a timesheet, pay-proof, and access-control system for crews, workers, and admins.

The core product risk is:

If an admin controls the data and removes access, the worker may lose proof of work, pay owed, pay approved, or pay received.

The MVP must protect worker proof without bloating into a full payroll, auth, HR, or enterprise permission system.

## Audit Goal

Find blockers, contradictions, unclear rules, missing acceptance criteria, and risky build instructions before the MVP is built.

Focus only on issues that could cause:
- Wrong MVP architecture
- Worker proof failure
- Privacy failure
- Access-control confusion
- Migration path damage
- Codex overbuilding
- Codex building the wrong thing
- Acceptance testing gaps

## Bloat Filter

Do not suggest these unless absolutely required to protect the MVP:

- Login/authentication
- Real database
- Cloud storage
- Email delivery
- E-signatures
- GPS/location tracking
- Payroll tax logic
- HR compliance logic
- Employee/contractor classification
- Messaging
- Notifications
- Multi-company support
- Paid APIs
- Google Sheets API integration
- Apps Script automation
- Advanced dashboards
- Mobile/PWA polish

If you mention one of these, mark it as "Do not build now" unless it is truly a blocker.

## Required Audit Output

Return findings in this format:

## Stopper Findings

List only issues that must be fixed before build.

For each:
- Finding
- Why it matters
- Minimal non-bloat fix

## Gap Findings

List issues that are not stoppers but should be clarified.

For each:
- Finding
- Risk
- Minimal non-bloat fix

## Bloat Risks

List places where the current prompt may accidentally cause overbuilding.

For each:
- Risk
- Prompt wording that creates the risk
- Minimal wording change

## Safe To Build?

Answer one:
- Yes
- Yes, after the stopper fixes
- No

## Recommended Next Action

Give only one next action.

Do not rewrite the whole prompt unless specifically asked.
