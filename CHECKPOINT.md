# CrewPay Ledger — Checkpoint

Current safe state:
- Local workspace exists at ~/projects/crewpay-ledger.
- Git repository initialized.
- Planning files created and committed.
- Codex MVP build prompt created and committed.
- No app code has been generated yet.

Project files:
- README.md
- ACTIVE_STATE.md
- memory/BUILD_SPEC.md
- CODEX_BUILD_PROMPT.md

Current purpose:
Prepare CrewPay Ledger for a first MVP build.

Next intended action:
Give CODEX_BUILD_PROMPT.md to Codex and have it build the first local MVP.

Critical reminder:
CrewPay Ledger must protect worker proof even when admin access is removed.
Inactive workers should lose future-use access, not historical proof.

Gap fix added:
- Worker-owned proof/export rule clarified.
- Inactive worker correction rule clarified.
- Pay-period finalization rule clarified.
- Proof timestamp/version rule clarified.
- Worker-only proof export privacy rule clarified.
- No app code added.
