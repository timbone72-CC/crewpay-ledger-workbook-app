# Codex Apps Script Phase 2 Audit Prompt — CrewPay Ledger

You are working in this repo:

~/projects/crewpay-ledger

Current trusted milestone:
- Workbook Level 1 built and manually tested in Google Sheets.
- Apps Script Phase 1 helpers built.
- Apps Script Phase 1 live Google Sheets test passed.
- Workbook remains the Level 1 source of truth.
- Existing app remains optional admin companion only.

Read first:
- ARCHITECTURE.md
- WORKBOOK_SPEC.md
- APPS_SCRIPT_PLAN.md
- apps_script/Code.gs
- apps_script/README.md
- BUILD_ACCEPTANCE_APPS_SCRIPT_PHASE1.md
- CHECKPOINT.md

## Audit Goal

Audit readiness for Phase 2 Apps Script export helpers before building them.

Phase 2 candidate helpers:
- Export Worker Proof PDF
- Export Worker Proof CSV

## Audit Mode

Do not edit files.
Do not create files.
Do not build Phase 2 yet.
Do not add Gmail send.
Do not add Google Calendar sync.
Do not add Drive automation unless you clearly mark it as required for PDF export and explain the permission/setup impact.
Do not add backend, database, app bridge, worker accounts, chat, worker-to-worker messaging, payroll tax logic, HR compliance logic, paid APIs, or enterprise permissions.

## Product Rules

- Workbook is the source of truth.
- Apps Script is a helper layer only.
- Workbook must still work manually without Apps Script.
- Worker Proof must be worker-specific.
- Exports must not include other workers.
- Proof Exports log should record export actions.
- Inactive workers keep historical proof.
- Schedule is not proof.
- Admin Notices are not chat or proof.

## Audit Focus

Check:
1. Whether Worker Proof has enough structure for PDF export.
2. Whether Worker Proof has enough structure for CSV export.
3. Whether Proof Exports log has enough fields.
4. Whether Phase 1 functions already provide reusable helpers.
5. Whether PDF export requires DriveApp or UrlFetchApp.
6. Whether CSV export can be done safely without extra services.
7. What permissions Phase 2 would introduce.
8. Whether Phase 2 risks exposing all workers.
9. Whether Phase 2 risks making Apps Script required.
10. Whether any workbook changes are needed before Phase 2.

## Required Output

Return:

## Stopper Findings

Only issues that must be fixed before Phase 2.

For each:
- Finding
- Why it matters
- Minimal non-bloat fix

## Gap Findings

Non-stopper gaps.

For each:
- Finding
- Risk
- Minimal non-bloat fix

## PDF Export Readiness

Answer:
- Ready / Needs workbook change / Should wait

Include:
- Required services, if any
- Permission impact
- Safest implementation approach

## CSV Export Readiness

Answer:
- Ready / Needs workbook change / Should wait

Include:
- Required services, if any
- Permission impact
- Safest implementation approach

## Bloat Risks

List risks and how to avoid them.

## Recommendation

Choose one:
- Build CSV export only
- Build PDF export only
- Build PDF and CSV export
- Fix workbook gaps first
- Stop here

## Suggested Phase 2 Scope

If build is recommended, list the exact functions to build and exact functions not to build.
