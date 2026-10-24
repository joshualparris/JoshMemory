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

## Deployment failover: do not stop at the first hosting provider

When a user asks to **finish, publish, deploy, or verify** an app, a Vercel quota/error is not completion or an instruction to stop. Record the failure and systematically check already-approved alternatives appropriate for the project: **Cloudflare Pages/Workers, Render, GitHub Pages, Railway and other connected hosts**. Select an available, non-destructive path and carry out a full tested release in the same work session where possible. Never present merely pushed code, a build that did not publish, an unverified URL, or a stale build as a deployed fix.

Always check canonical source ownership, privacy/integrity tests, actual build pipeline capacity, deployment status, the live release SHA and browser/mobile acceptance. Prefer an existing QA preview or an isolated subpath so browser-origin localStorage and user saves remain intact; never silently change production domains or overwrite approved mirrored fingerprints, retired handover pages or another agent's deployment. Do not spend money, change billing limits or request credentials without approval. If a host is quota-blocked, progress to the next feasible host rather than retrying it; only stop once each safe available route has a documented blocker. Make this status visible in the relevant repo's `WORK_CHECKPOINT.md`.

Repository Town-specific host roles, backed-up saves, existing static host identifiers and live failover evidence are in [repository-town/docs/HOSTING.md](repository-town/docs/HOSTING.md).
