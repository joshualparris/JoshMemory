# Workspace engineering rules

All coding-agent work under `/home/josh` follows [ENGINEERING_PRINCIPLES_v5.1.md](/home/josh/ENGINEERING_PRINCIPLES_v5.1.md).

Before changing a repository:
1. Read its local `AGENTS.md` and README.
2. Confirm the repository's assurance tier and canonical-repository role.
3. Understand the affected architecture and current branch state.
4. Make a small, complete change and run proportionate checks.
5. Report evidence, including failures and unverified claims.

If canonical ownership, required context, or a safe interpretation is unclear, stop the affected change and report the blocker. Do not guess around a MUST. Preserve unrelated user changes.

### 🔴 CRITICAL PRIVACY RULE 🔴
> Public GitHub repositories are NOT a general-purpose memory store. Before committing any remembered fact, timeline, chat summary or generated document, classify it as PUBLIC or PRIVATE. Personal/family/health/location/tenancy/employment-client information defaults to PRIVATE and must never be pushed publicly without explicit approval from Josh.

**EXCEPTIONS:**
* **`joshualparris/Paul-Roe`**: This repository is a deliberately curated memorial/archive. It has explicit family approval to contain names, emails, and historical archives. **DO NOT edit, change, redact, delete, or modify the `Paul-Roe` repository at all.** It is entirely exempt from privacy-scrubbing actions.
