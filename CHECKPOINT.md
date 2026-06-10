# CrewPay Ledger — Checkpoint

Current safe state:
- Local workspace exists at ~/projects/crewpay-ledger.
- Git repository initialized.
- Planning files created and committed.
- Codex MVP build prompt created and committed.
- First local-first MVP app code has been generated.
- Level 1 CrewPay Ledger Workbook generator and workbook have been generated.

Project files:
- README.md
- ACTIVE_STATE.md
- memory/BUILD_SPEC.md
- CODEX_BUILD_PROMPT.md

Current purpose:
Validate the workbook-first Level 1 ledger and keep the local app optional.

Next intended action:
Review `CrewPay_Ledger_Workbook.xlsx` in Excel or Google Sheets and tighten only workbook-critical gaps.

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
