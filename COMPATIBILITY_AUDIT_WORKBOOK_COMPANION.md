# Compatibility Audit - Workbook Companion

Audit target:
- Repo: `timbone72-CC/crewpay-ledger-workbook-app`
- Branch: `main`
- Current commit inspected: `735626e Polish CrewPay workbook public demo UI`
- Task type: compatibility audit only

Scope:
- No bridge implementation was added.
- No app rebuild was performed.
- No package files were renamed or overwritten.
- `apps_script/CrewPay_Ledger_ORIGINAL_FINAL.gs` was preserved untouched.

## 1. Executive Summary

Current alignment rating: **partially aligned**.

The workbook is strongly aligned with the target architecture as the source of truth. The current app is not yet aligned as a full no-backend workbook companion because it is still a local-first browser demo that stores sample data in `localStorage`.

Can the app currently feed the workbook? **No.**

No code path currently sends app data to the workbook. `app.js` has no `fetch()`, endpoint config, Apps Script URL placeholder, request payload builder, JSON response handler, retry behavior, or server response handling. The app can only mutate local browser state.

Biggest blocker:
- Missing Apps Script Web App bridge: no `doGet(e)`, no `doPost(e)`, no action routing, no JSON request parsing, no `ContentService` responses, and no endpoint contract.

Biggest workbook compatibility risk:
- A naive bridge could write into calculated/proof/report tabs or formula columns instead of writing controlled input fields only. The bridge must avoid calculated fields such as Time Entries `Worker Name`, `Job Name`, `Hours`, `Gross Pay`, `Net Pay`, Pay Period totals, Dashboard, and Worker Proof formulas.

Recommended next build step:
- Build a minimal Apps Script Web App bridge and static-app endpoint client for `healthCheck`, `getWorkbookSchema`, `submitTimeEntry`, `submitWorkerIntake`, and `submitPayPeriod`, using header-based writes into approved workbook tabs and returning structured JSON. Keep the app static and keep workbook records authoritative.

## 2. Current Repo Inventory

App files found:
- `index.html`
- `app.js`
- `styles.css`
- `src/ledger-core.js`

Workbook files found:
- `CrewPay_Ledger_Workbook.xlsx`
- `release-package/CrewPay_Ledger_DEMO_PACKAGE/CrewPay_Ledger_Workbook.xlsx`

Script files found:
- `apps_script/Code.gs`
- `apps_script/CrewPay_Ledger_ORIGINAL_FINAL.gs`
- `release-package/CrewPay_Ledger_DEMO_PACKAGE/CrewPay_Ledger_DEMO_COPY.gs`
- `release-package/CrewPay_Ledger_DEMO_PACKAGE/CrewPay_Ledger_ORIGINAL_FINAL.gs`

Tests found:
- `tests/acceptance.test.js`

Package/release files found:
- `release-package/CrewPay_Ledger_DEMO_PACKAGE/CrewPay_Ledger_Workbook.xlsx`
- `release-package/CrewPay_Ledger_DEMO_PACKAGE/CrewPay_Ledger_DEMO_COPY.gs`
- `release-package/CrewPay_Ledger_DEMO_PACKAGE/CrewPay_Ledger_ORIGINAL_FINAL.gs`

Package/build config files:
- No `package.json` found.
- No Vite/Webpack/Netlify/Vercel/Firebase/Wrangler config found.
- No `appsscript.json` manifest found.

Script preservation finding:
- `apps_script/CrewPay_Ledger_ORIGINAL_FINAL.gs` and `release-package/CrewPay_Ledger_DEMO_PACKAGE/CrewPay_Ledger_ORIGINAL_FINAL.gs` are byte-identical preserved Phase 1 helper scripts.
- `apps_script/Code.gs` and `release-package/CrewPay_Ledger_DEMO_PACKAGE/CrewPay_Ledger_DEMO_COPY.gs` are byte-identical expanded demo/service helper scripts.

## 3. Workbook Inventory

Workbook comparison:
- Root workbook path: `CrewPay_Ledger_Workbook.xlsx`
- Package workbook path: `release-package/CrewPay_Ledger_DEMO_PACKAGE/CrewPay_Ledger_Workbook.xlsx`
- Root workbook SHA-256: `bd566eee3bcd190c2077519f1f800c8b675507e0ec5e89b23b4530f4ecc1a3ef`
- Package workbook SHA-256: `bd566eee3bcd190c2077519f1f800c8b675507e0ec5e89b23b4530f4ecc1a3ef`
- Are they identical? **Yes, byte-identical.**
- Same sheet names? **Yes.**
- Same headers? **Yes.**
- Same formulas? **Yes by formula counts and sampled formulas.**
- Same data validations/dropdowns? **Yes by validation counts and sampled validation ranges.**
- Same sample rows? **Yes by sampled rows.**
- Treat as packaged demo workbook? Since files are identical, either path represents the same workbook.

### Workbook Structure

| Workbook | Sheet names |
|---|---|
| `CrewPay_Ledger_Workbook.xlsx` | Instructions, Dashboard, Workers, Jobs, Time Entries, Pay Periods, Worker Proof, Access Status Demo, Workflow Demo, Proof Exports, Access Log, Correction Log, Schedule, Admin Notices, Calendar Sync Log, Dropdown Lists |
| `release-package/CrewPay_Ledger_DEMO_PACKAGE/CrewPay_Ledger_Workbook.xlsx` | Same as root workbook |

### Tab Inventory

| Sheet | Apparent header row | Key columns / areas | Formula/calculated fields noticed | Dropdown/data validation noticed | Sample rows noticed | App write suitability |
|---|---:|---|---|---|---|---|
| Instructions | 4 | Public demo guide cards | None | None | Demo boundary text | Workbook-only public guide |
| Dashboard | 4 | Summary cards, status block | COUNTIF, COUNTIFS, SUMIFS, INDEX/MATCH formulas | None | Formula-driven metrics | Workbook-only calculated view |
| Workers | 1 | Worker ID, Worker Name, Worker Email, Role, Access Status, Created At, Inactive At, Notes | None | Access Status on `E2:E200` | W-1001, W-1002 active; W-1003 inactive | App may append worker intake rows; should not silently alter inactive history |
| Jobs | 1 | Job ID, Job Name, Client or Site, Status, Default Rate, Calendar Event ID, Notes | None | Job Status on `D2:D200` | J-2001/J-2002 active; J-2003 closed | App may append/admin-manage jobs if that workflow is intentional |
| Time Entries | 1 | Entry ID, Worker ID, Worker Name, Job ID, Job Name, Work Date, Start Time, End Time, Break Minutes, Hours, Rate, Gross Pay, Reimbursement, Deduction, Net Pay, Approval Status, Submitted At, Approved At, Correction Note, Notes | Worker Name, Job Name, Hours, Rate lookup, Gross Pay, Net Pay formulas across rows 2:200 | Approval Status on `P2:P200`; Worker ID on `B2:B200`; Job ID on `D2:D200` | T-3001 approved, T-3002 submitted, T-3003 inactive-worker historical, T-3004 paid, T-3005 finalized/correction | Best first app write target for time submission, but app should write only input columns and leave formula columns blank/formula-controlled |
| Pay Periods | 1 | Pay Period ID, Worker ID, Worker Name, Period Start, Period End, Status, Payment Status, Total Hours, Gross Pay, Reimbursement Total, Deduction Total, Net Pay, Finalized At, Paid At, Notes | Worker Name and all total/pay formulas across rows 2:100 | Pay Period Status on `F2:F100`; Payment Status on `G2:G100`; Worker ID on `B2:B100` | P-4001 paid, P-4002 open, P-4003 finalized/unpaid | App may create setup rows, but should not write totals |
| Worker Proof | 3 / table at 12 | Selector cells `B3` Worker ID, `B4` Pay Period ID; proof status; export batch; proof entries table; totals | Lookup, NOW, selector check, FILTER, SUMIFS totals | Payment Status `B8`; Worker selector `B3`; Pay Period selector `B4` | Selected W-1001 / P-4001 | Workbook-only calculated/proof view; app should not write proof rows directly |
| Access Status Demo | 4 | Visual explanatory cards/matrix | None | None | Explanatory active/inactive/read-only matrix | Workbook-only explanatory view |
| Workflow Demo | 4 | Visual workflow cards | None | None | Time-entry-to-proof flow | Workbook-only explanatory view |
| Proof Exports | 1 | Export ID, Worker ID, Worker Name, Pay Period ID, Export Type, Generated At, Generated By, Export Reference, Notes | None | Worker ID, Pay Period ID, Export Type | X-5001 print, X-5002 CSV | App/script may append export log rows |
| Access Log | 1 | Log ID, Worker ID, Worker Name, Previous Status, New Status, Changed At, Changed By, Reason | None | Worker ID; Access Status on previous/new columns | A-6001 active to inactive | App/script may append access changes; should also update Workers only through controlled action |
| Correction Log | 1 | Correction ID, Entry ID, Worker ID, Worker Name, Pay Period ID, Correction Date, Corrected By, Correction Reason, Original Value Summary, New Value Summary, Notes | None | Entry ID, Worker ID, Pay Period ID | C-7001 reimbursement correction | App/script may append corrections |
| Schedule | 1 | Schedule ID, Job ID, Job Name, Worker ID, Worker Name, Scheduled Date, Start Time, End Time, Schedule Status, Calendar Event ID, Notes | None | Job ID, Worker ID, Schedule Status | S-8001 scheduled, S-8002 planned | App/script may append schedule rows if schedule is intentionally supported |
| Admin Notices | 1 | Notice ID, Created At, Created By, Recipient Type, Worker ID, Worker Name, Subject, Message, Related Pay Period ID, Delivery Method, Notice Status, Sent At, Notes | None | Recipient Type, Worker ID, Pay Period ID, Delivery Method, Notice Status | N-9001 posted worker notice, N-9002 draft all-active notice | App/script may create notice rows; sending remains Apps Script helper territory |
| Calendar Sync Log | 1 | Calendar Log ID, Job ID, Job Name, Worker ID, Worker Name, Calendar Event ID, Event Date, Sync Status, Last Synced At, Notes | None | Job ID, Worker ID, Sync Status | G-10001 not synced | Script may append/update sync log; app should not treat Calendar as proof |
| Dropdown Lists | 1 | Access Status, Job Status, Approval Status, Pay Period Status, Payment Status, Export Type, Schedule Status, Recipient Type, Delivery Method, Notice Status, Sync Status | None | Source list tab | Active/Inactive, Draft/Submitted/Approved/etc. | Workbook config only; app should read or mirror these values, not write casually |

Sheets intended for app/script writes:
- `Workers` for controlled worker intake
- `Jobs` if job creation is included
- `Time Entries` for controlled time-entry submission
- `Pay Periods` for pay-period setup only, not totals
- `Proof Exports` for export logging
- `Correction Log`
- `Access Log`
- `Admin Notices`
- `Schedule` if supported
- `Calendar Sync Log` by script sync helper only

Sheets that should remain workbook-only/calculated/proof/report views:
- `Instructions`
- `Dashboard`
- `Worker Proof`
- `Access Status Demo`
- `Workflow Demo`
- `Dropdown Lists`

## 4. Current Architecture Found

What the app currently does:
- `index.html` loads `src/ledger-core.js` and `app.js` as a static browser app.
- `app.js` renders dashboard, workers, jobs, time entries, pay periods, worker proof, and access model views.
- The app supports local add worker, add job, add time entry, approve time entry, finalize/mark paid pay periods, toggle worker active/inactive, generate worker proof, print proof, and export local CSV proof.

What state/data it uses:
- Hardcoded `sampleData` in `app.js`.
- Browser `localStorage` key: `crewpay-ledger-mvp-v1`.
- No workbook read path.
- No workbook write path.

Whether it has endpoint submission:
- No. There are no `fetch()`, `XMLHttpRequest`, Apps Script endpoint URL, webhook URL, payload builders, response handlers, or endpoint error states.

What Apps Script currently does:
- `apps_script/CrewPay_Ledger_ORIGINAL_FINAL.gs`: preserved Phase 1 workbook-helper-only script. It has custom menu helpers for Worker Proof, Proof Exports, Access Log, Correction Log, and Email Ready Notice. It has no bridge.
- `apps_script/Code.gs`: expanded demo/service helper script. It adds CSV/PDF Drive proof exports, Gmail send for selected Admin Notices, and Calendar sync for selected Schedule rows. It has no bridge.
- Neither script has `doGet(e)`, `doPost(e)`, action routing, JSON request parsing, or `ContentService` JSON responses.

What workbook package contains:
- `release-package/CrewPay_Ledger_DEMO_PACKAGE/CrewPay_Ledger_Workbook.xlsx`: byte-identical to root workbook.
- `release-package/CrewPay_Ledger_DEMO_PACKAGE/CrewPay_Ledger_DEMO_COPY.gs`: byte-identical to `apps_script/Code.gs`.
- `release-package/CrewPay_Ledger_DEMO_PACKAGE/CrewPay_Ledger_ORIGINAL_FINAL.gs`: byte-identical to preserved original final script.

## 5. Target Architecture

Target:

Static app / PWA
→ Google Apps Script Web App endpoint
→ CrewPay Ledger workbook tabs
→ workbook remains source of truth

Interpretation:
- The app can submit controlled records to the workbook.
- The app must not become a database or payroll system.
- The app should not require a hosted backend server.
- The workbook must remain fully usable without the app.
- Apps Script is the only bridge layer.
- Local browser state should be limited to draft/helper state and cached config, not final source-of-truth records.

## 6. Compatibility Matrix

| Area | Current state | Target state | Gap | Severity |
|---|---|---|---|---|
| App-to-workbook write path | None; localStorage only | Static app posts JSON to Apps Script Web App | Need endpoint config, client, payloads, responses | Blocker |
| Apps Script bridge | Workbook menu helpers only | `doPost`/`doGet` action router with JSON responses | No web app handlers or action contract | Blocker |
| Workbook schema alignment | Workbook has clear tabs/headers/dropdowns | App reads or mirrors schema before submission | App uses snake_case local objects, workbook uses title-case headers | High |
| Time entry submission | App can add local entries | App submits controlled row to `Time Entries` | Must map fields and avoid formula columns | High |
| Worker intake | App can add local workers | App submits `Workers` row or intake action | ID generation and duplicate checks missing in bridge | High |
| Pay-period setup | App can locally finalize/mark paid existing periods | App creates setup rows only; workbook calculates totals | App does not collect period creation fields separately | Medium |
| Proof generation/support | App can generate local proof from local data | App should select workbook Worker Proof context or request proof support from Apps Script | No workbook proof read/selector update endpoint | Medium |
| Proof export logs | App pushes local `proofExports` only | Apps Script appends `Proof Exports` row | Bridge action missing; field names mismatch | Medium |
| Correction logs | App writes local correction notes on entries | App submits visible `Correction Log` rows | No correction form/action in app | High |
| Access logs | App toggles local worker status | App submits access change and logs `Access Log` | No access action endpoint; current local toggle is not authoritative | High |
| Admin notices | App has no notice UI | App creates workbook `Admin Notices` rows or uses script helper | Missing app UI and bridge action | Medium |
| Schedule/calendar | App has no schedule UI | Optional schedule row submission and Calendar sync helper | Missing app UI/bridge; current script sync is selected-row only | Low/Medium |
| Security/no-backend | No network endpoint | Public Apps Script endpoint with practical gate/validation | Need abuse mitigation without accounts/backend | High |
| User language | README still says local-first MVP and Level 2 app/database source later | Workbook companion language | Needs wording update before bridge build | Medium |

## 7. Workbook Tab / App Field Mapping

| Workflow | Workbook tab | Workbook columns found | App fields found | Missing/mismatched fields | Calculated/protected fields app should not write | Notes |
|---|---|---|---|---|---|---|
| A. Worker intake / worker lookup | Workers | Worker ID, Worker Name, Worker Email, Role, Access Status, Created At, Inactive At, Notes | `worker_name`, `worker_email`, `role`; local generated `worker_id`; `access_status`; `created_at`; `inactive_at` | App does not collect Notes; app IDs use `W-0004` style while workbook sample uses `W-1001`; no duplicate email/name check | None calculated | Bridge should generate IDs workbook-side and return created row |
| B. Pay period setup | Pay Periods | Pay Period ID, Worker ID, Worker Name, Period Start, Period End, Status, Payment Status, Total Hours, Gross Pay, Reimbursement Total, Deduction Total, Net Pay, Finalized At, Paid At, Notes | Existing local `payPeriods`; UI supports finalize and paid only | No form for new pay period; app uses snake_case; no finalized_at; reimbursement/deduction exist in local data but not setup UI | Worker Name, Total Hours, Gross Pay, Reimbursement Total if formula-driven, Deduction Total if formula-driven, Net Pay | App should create/update only setup/status fields through controlled actions |
| C. Time entry submission | Time Entries | Entry ID, Worker ID, Worker Name, Job ID, Job Name, Work Date, Start Time, End Time, Break Minutes, Hours, Rate, Gross Pay, Reimbursement, Deduction, Net Pay, Approval Status, Submitted At, Approved At, Correction Note, Notes | `worker_id`, `job_id`, `work_date`, `start_time`, `end_time`, `break_minutes`, `rate`, `notes`; local generated `entry_id`; local `approval_status=Submitted`; local `submitted_at` | App does not collect reimbursement/deduction; no workbook duplicate guard; no server-side active-worker validation yet | Worker Name, Job Name, Hours, Gross Pay, Net Pay; likely Rate if workbook default rate lookup should control it | Best first real bridge workflow. Script should verify worker active and job active before append |
| D. Worker proof generation/support | Worker Proof | Selector cells `B3`, `B4`; proof status; proof table; totals | `worker_id`, `pay_period_id`; local `lastProof` | App proof uses local data, not workbook records; no endpoint to select proof or read workbook proof | Entire proof table and totals | Bridge should not write proof rows; optionally update selectors and return workbook proof summary |
| E. Proof export logs | Proof Exports | Export ID, Worker ID, Worker Name, Pay Period ID, Export Type, Generated At, Generated By, Export Reference, Notes | local `proofExports`: `export_id`, `worker_id`, `pay_period_id`, `export_type`, `created_at`, `export_hash_or_reference` | Missing Worker Name, Generated By, Notes; header names mismatch | None calculated | Existing Apps Script helper appends log rows, but no web endpoint |
| F. Correction logs | Correction Log | Correction ID, Entry ID, Worker ID, Worker Name, Pay Period ID, Correction Date, Corrected By, Correction Reason, Original Value Summary, New Value Summary, Notes | `correction_note` only on time entry when editing finalized/paid period | No correction log UI or payload; no original/new summary fields | None calculated | Important for proof integrity; should be separate action |
| G. Access logs | Access Log | Log ID, Worker ID, Worker Name, Previous Status, New Status, Changed At, Changed By, Reason | local `toggleWorker(workerId)` only | No reason field; no log row; no workbook-side status update | None calculated | Bridge should append Access Log and update Workers in one controlled action |
| H. Admin notices | Admin Notices | Notice ID, Created At, Created By, Recipient Type, Worker ID, Worker Name, Subject, Message, Related Pay Period ID, Delivery Method, Notice Status, Sent At, Notes | None | Entire workflow missing from app | None calculated | Existing Apps Script can create email-ready/send selected rows, but app cannot create notice rows |
| I. Schedule/calendar sync | Schedule; Calendar Sync Log | Schedule ID, Job ID, Job Name, Worker ID, Worker Name, Scheduled Date, Start Time, End Time, Schedule Status, Calendar Event ID, Notes; Calendar Log ID, Job ID, Job Name, Worker ID, Worker Name, Calendar Event ID, Event Date, Sync Status, Last Synced At, Notes | None | Schedule UI/action missing; bridge missing; Calendar helper is selected-row menu only | Calendar Sync Log should be script-controlled | Support only if intentionally included in companion scope |

## 8. Apps Script Bridge Audit

| Required bridge capability | Present? | File/function found | Gap | Recommendation |
|---|---|---|---|---|
| `doGet(e)` health/config handler | Missing | None | No web app read endpoint | Add `doGet(e)` for `healthCheck` and optional `getConfig` |
| `doPost(e)` write handler | Missing | None | No web app write endpoint | Add `doPost(e)` with action router |
| Action routing | Missing | None | No shared action names | Define explicit action constants |
| JSON request parsing | Missing | None | No parsing of `e.postData.contents` | Add safe JSON parser with structured error responses |
| `ContentService` JSON responses | Missing | None | No API response shape | Return `{ok, action, data, error}` |
| Spreadsheet header-based helpers | Present | `headerMap_`, `recordFromRow_`, `appendRecord_` in both script families | Helpers are menu-oriented but reusable | Reuse in bridge; keep header-based writes |
| Validation | Partial | `assertWorkerPayPeriodMatch_`, required prompts, sheet/header checks | No request-field validation or dropdown validation for posted data | Add per-action required field and dropdown checks |
| Duplicate checks | Missing | None | Reposts can duplicate rows | Add idempotency key or duplicate check per action |
| ID generation | Present / partial | `nextId_` in scripts; `nextId` in app | Prefixes differ and app local IDs not authoritative | Generate IDs in Apps Script only |
| Audit logging | Partial | `logProofExportRecord_`, Access Log, Correction Log, Calendar Sync Log helpers | No bridge-level request log or failed-submission log | Log critical writes to existing logs; avoid new tabs unless needed |
| Auth/token/shared secret gate | Missing | None | Public Apps Script endpoint would be abusable | Use practical no-backend gate: per-copy shared submit key plus strict validation/rate-light duplicate checks; do not put true secret in public app for public demo |
| Permission assumptions | Partial | Menu helpers assume active spreadsheet and owner-authorized services | Web app deployment permissions not documented | Document deploy as owner-only execution; workbook remains source |
| Error handling | Partial | `throwFriendly_` alerts for menu use | Alert-based errors unsuitable for web endpoint | Add JSON error handler and HTTP-ish status fields in body |
| CORS/content-type limitations | Missing | None | Apps Script Web Apps have browser/CORS constraints | Use simple `text/plain` JSON POST or form-urlencoded fallback if needed |
| Deployment instructions | Missing for bridge | Current README only covers menu helpers | No web app deploy instructions | Add bridge install/deploy notes in future implementation |

## 9. Endpoint Contract Gap

| Action | App support current state | Script support current state | Required payload fields | Required workbook tab | Response needed | Gap |
|---|---|---|---|---|---|---|
| `healthCheck` | Missing | Missing | none or app/version | none | `{ok:true, workbookName, version}` | Need both app client and `doGet/doPost` action |
| `getWorkbookSchema` / `getConfig` | Missing | Missing | none | Dropdown Lists, headers | dropdowns, allowed statuses, writable fields | Needed to avoid hardcoding workbook choices |
| `createWorker` / `submitWorkerIntake` | Local-only `addWorker` | Missing bridge; menu helpers can look up workers | worker_name, worker_email, role, optional notes, idempotency_key | Workers | created Worker ID and row summary | Need endpoint, validation, duplicate guard |
| `createPayPeriod` / `submitPayPeriod` | Local existing periods only; no create form | Missing | worker_id, period_start, period_end, status, payment_status, reimbursement/deduction if manual, notes | Pay Periods | created Pay Period ID and formula-controlled totals | Need UI and bridge; avoid writing totals |
| `submitTimeEntry` | Local-only `addEntry` | Missing | worker_id, job_id, work_date, start_time, end_time, break_minutes, rate or use default, notes, idempotency_key | Time Entries | created Entry ID, approval status Submitted | Need endpoint; validate active worker/job; avoid formula columns |
| `logProofExport` | Local proof export pushes `proofExports` | Menu helper exists, no bridge | worker_id, pay_period_id, export_type, export_reference, notes | Proof Exports | created Export ID | Need endpoint; validate worker/pay period match |
| `logCorrection` | Only local `correction_note` | Menu helper exists, no bridge | entry_id, worker_id, pay_period_id, correction_reason, original_value_summary, new_value_summary, notes | Correction Log | created Correction ID | Need UI and endpoint |
| `logAccessChange` | Local `toggleWorker`, no reason | Menu helper exists, no bridge | worker_id, new_status, reason, idempotency_key | Access Log and Workers | Log ID, updated status | Need endpoint; preserve history |
| `createAdminNotice` | Missing | Menu helper can create email-ready/send selected row, no bridge | recipient_type, worker_id optional, subject, message, related_pay_period_id optional, delivery_method, notice_status | Admin Notices | created Notice ID | Need UI and endpoint; send action should remain controlled |
| `syncSchedule` / `submitScheduleRow` | Missing | Menu helper syncs selected Schedule row, no bridge | job_id, worker_id, scheduled_date, start_time, end_time, schedule_status, notes | Schedule; Calendar Sync Log for sync | created Schedule ID; optional sync result | Only build if schedule/calendar is intentionally supported |

## 10. Security / Privacy / Abuse Risks

| Risk | Current mitigation | Needed mitigation | Severity | Notes |
|---|---|---|---|---|
| Public endpoint abuse | No endpoint exists | Add strict action allowlist, required fields, dropdown validation, idempotency key, and optional per-copy submit key | High | Do not build full account system |
| Exposed secrets in browser | None currently | Do not place real secrets in public JS; if using a shared demo key, treat it as spam friction only | High | Static app cannot keep secrets |
| Identity assumptions | Current app has no identity | Store `Submitted By` / `Generated By` as declared source or deployment user; avoid claiming verified identity | Medium | No auth/accounts by design |
| Worker privacy | Local sample data only | Never return all workers/proof to unauthenticated public calls; limit responses to created records/config | High | Worker proof must remain worker-specific |
| Malicious row submission | No endpoint | Validate schema, allowed dropdown values, date/time formats, active worker/job, max lengths | High | Workbook data validation alone is not enough |
| Duplicate submissions | No endpoint | Use client-generated idempotency key plus workbook duplicate lookup | High | Apps Script retries/browser double-clicks can duplicate rows |
| No audit log for bridge calls | Existing logs for specific domains only | Log critical access/correction/export actions; consider lightweight request note in target rows | Medium | Avoid bloat unless abuse appears |
| Apps Script deployment permissions | Not applicable yet | Deploy as owner carefully; document who can call web app and what it can mutate | High | Owner-executed web apps can write workbook |
| Pending vs final tabs | App currently writes local final arrays | Prefer writing user submissions as `Submitted` or `Draft`, not approved/finalized/paid | High | Preserve admin review |
| User-facing warning gaps | App says local-first sample only | Add companion-mode notices: submitted to workbook, workbook remains source, no payroll/tax/HR | Medium | Prevent overclaiming |

## 11. User-Facing Language Findings

Correctly workbook-companion aligned:
- `ARCHITECTURE.md`: says workbook is Level 1 source of truth and apps are convenience tools.
- `WORKBOOK_SPEC.md`: says workbook must work manually if Apps Script is removed or disabled.
- Workbook `Instructions`: public-demo guide explains workbook source of truth and boundaries.

Too standalone:
- `README.md`: "Preserve a clean migration path to Level 2 where the app/database becomes the source of truth and Google Sheets becomes export/report only." This conflicts with the current target for a no-backend workbook companion.
- `src/ledger-core.js` and `app.js`: code structure is local app/domain model first, not workbook schema first. This is acceptable for the MVP but not yet the companion target.

Too weak/read-only:
- `README.md`: "The local app in this repo is optional and is not required to use the workbook." This is true, but incomplete for the target because the app is allowed to be a controlled workbook input/control companion.
- `README.md`: "This repo now includes a small local-first MVP..." still frames the app as local-only rather than a future workbook companion.
- `apps_script/Code.gs` About text: "No ... app bridge is included." True now, but should be updated after bridge implementation to "bridge supports controlled workbook submissions; workbook remains source of truth."

Production-readiness caution:
- `index.html`: "Timesheets, pay-period totals, and worker proof..." is acceptable as a demo heading but should be paired with "sample / workbook companion / not production payroll" language when bridge is added.
- No file currently claims payroll tax, HR, banking, or production payroll readiness.

## 12. Full Companion Build Sequence

Step 1: config and endpoint health check
- Add `APPS_SCRIPT_WEB_APP_URL` config in the static app.
- Add `healthCheck` in Apps Script Web App.
- Add app connection status UI and clear offline/local-draft fallback.

Step 2: workbook schema/header contract
- Add `getWorkbookSchema` or `getConfig`.
- Return sheet headers, writable fields, dropdown values, and current schema version.
- Make app use returned dropdown/status values where practical.

Step 3: worker/pay-period/time-entry submissions
- Implement `submitWorkerIntake`, `submitPayPeriod`, and `submitTimeEntry`.
- Generate IDs in Apps Script.
- Validate active worker/job and allowed statuses.
- Write only workbook input columns; leave formulas/calculated fields alone.
- Add idempotency/duplicate checks.

Step 4: proof/export/correction/access/admin notice workflows
- Implement `logProofExport`, `logCorrection`, `logAccessChange`, and `createAdminNotice`.
- Keep proof generation tied to workbook Worker Proof selectors and workbook rows.
- Keep admin notice send separate from notice row creation.

Step 5: schedule/calendar workflow only if intentionally supported by current workbook/script
- Implement `submitScheduleRow`.
- Keep Calendar sync as optional selected schedule action.
- Do not create Time Entries from Calendar.

Step 6: no-backend deployment hardening
- Document Apps Script Web App deployment mode and permissions.
- Add practical no-backend abuse controls: action allowlist, per-copy submit key or origin note, max lengths, strict field validation, duplicate prevention.
- Keep local browser state as drafts/cache only.

Step 7: final acceptance tests
- Unit test field mapping and payload construction.
- Add Apps Script static checks for required bridge functions.
- Add workbook inspection tests for headers/dropdowns.
- Add manual Google Sheets bridge test checklist.
- Confirm workbook works without the app.

## 13. Recommended Next Codex Build Prompt

```text
You are working in ~/projects/crewpay-ledger on branch main.

Use COMPATIBILITY_AUDIT_WORKBOOK_COMPANION.md as the source of truth.

Build the first no-backend workbook companion bridge only.

Architecture:
Static app / PWA -> Google Apps Script Web App endpoint -> CrewPay Ledger workbook.
The workbook remains the source of truth and must work without the app.

Do not add a backend, database, worker accounts, auth system, payroll tax logic, HR compliance logic, chat, or app bridge outside Apps Script.
Do not overwrite or modify apps_script/CrewPay_Ledger_ORIGINAL_FINAL.gs.

Implement only:
1. Apps Script Web App bridge in a clearly separate file or clearly separate section:
   - doGet(e)
   - doPost(e)
   - action routing
   - JSON parsing
   - ContentService JSON responses
   - healthCheck
   - getWorkbookSchema/getConfig
   - submitWorkerIntake
   - submitPayPeriod
   - submitTimeEntry
2. Static app endpoint config and client:
   - endpoint URL placeholder/config
   - connection status
   - payload builders
   - success/error handling
   - local draft fallback only, not final local source of truth
3. Header-based workbook writes:
   - write only approved input columns
   - leave calculated/formula fields untouched
   - generate IDs in Apps Script
   - validate dropdown/status values from workbook schema
   - reject inactive workers for new time entries
   - prevent obvious duplicates with an idempotency key

Do not implement proof export, correction, access, admin notice, schedule, Gmail, Calendar, or Drive changes in this first bridge build unless required to keep existing helpers working.

Run:
- node tests/acceptance.test.js
- workbook inspection/header check
- Apps Script syntax/static checks
- git status --short
- git diff --stat

Commit after checks pass.

Final response must include files changed, bridge actions built, workbook tabs written, tests run, risks, git status, and latest commit.
```
