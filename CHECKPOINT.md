# CrewPay Ledger — Checkpoint

Current safe state:
- Local workspace exists at ~/projects/crewpay-ledger.
- Git repository initialized.
- Planning files created and committed.
- Codex MVP build prompt created and committed.
- First local-first MVP app code has been generated.
- Level 1 CrewPay Ledger Workbook generator and workbook have been generated.
- Level 1.5 Phase 1 Apps Script helper files have been generated.
- Level 1.5 Google service helpers have been generated for proof exports, selected admin notice send, and selected schedule Calendar sync.

Project files:
- README.md
- ACTIVE_STATE.md
- memory/BUILD_SPEC.md
- CODEX_BUILD_PROMPT.md

Current purpose:
Validate the workbook-first Level 1 ledger and keep the local app optional.

Next intended action:
Install `apps_script/Code.gs` in a copy of the Google Sheets workbook and manually test the Drive, Gmail, and Calendar helper permissions and behavior.

Critical reminder:
CrewPay Ledger must protect worker proof even when admin access is removed.
Inactive workers should lose future-use access, not historical proof.

Gap fix added:
- Worker-owned proof/export rule clarified.
- Inactive worker correction rule clarified.
- Pay-period finalization rule clarified.
- Proof timestamp/version rule clarified.
- Worker-only proof export privacy rule clarified.
- MVP app code added with dependency-free acceptance tests.
- Workbook-first source-of-truth build added with workbook audit and acceptance documentation.
- Workbook revision tightened Worker Proof selector guard, print setup, worker-specific totals, ID dropdown validation, inactive-worker row flagging, and helper-ready log formatting.
- Apps Script Phase 1 helper layer added for menu actions, proof refresh, proof/access/correction logging, and email-ready notice text only.
- Apps Script Google service helpers added for selected Worker Proof PDF/CSV Drive exports, selected Admin Notice Gmail send, and selected Schedule Calendar sync.

Apps Script Phase 1 live test:
- Google Sheets copy tested.
- apps_script/Code.gs installed.
- CrewPay Ledger menu appeared.
- Phase 1 helper behavior worked.
- At the Phase 1 test point, no Gmail send or Calendar sync was included.

Apps Script Google service helper status:
- CSV/PDF proof exports create worker/pay-period-specific Drive files and log Proof Exports rows.
- Gmail send uses selected Admin Notices rows only and sends from the admin account running the script.
- Calendar sync uses selected Schedule rows only and logs Calendar Sync Log rows.
- Calendar remains schedule reference only, not proof.

Google services Apps Script live test:
- Google Sheets copy tested.
- CSV export worked.
- PDF export worked.
- Drive file creation worked.
- Gmail send worked with controlled test recipient.
- Google Calendar sync worked.
- Related logs updated.
- Workbook remains the Level 1 source of truth.
