# CrewPay Ledger — Checkpoint

Current safe state:
- Local workspace exists at ~/projects/crewpay-ledger.
- Git repository initialized.
- Planning files created and committed.
- Codex MVP build prompt created and committed.
- First local-first MVP app code has been generated.

Project files:
- README.md
- ACTIVE_STATE.md
- memory/BUILD_SPEC.md
- CODEX_BUILD_PROMPT.md

Current purpose:
Validate and iterate on the first CrewPay Ledger MVP build.

Next intended action:
Run the local MVP, review the worker-proof flow, and tighten only MVP-critical gaps.

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
