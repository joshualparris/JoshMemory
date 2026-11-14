# Workspace engineering rules

## DeepSeek / Repository Town efficiency

When DeepSeek (Lenovo or ProBook harness) works on Repository Town, **first read** [the token-efficiency guide](repository-town/docs/DEEPSEEK_TOKEN_EFFICIENCY.md) and the applicable [Repository Town agent rules](repository-town/AGENTS.md). Do not repeatedly ingest the huge coordination/checkpoint logs; search relevant entries by task ID/feature. This is an efficiency supplement, never a waiver of existing privacy, cross-agent ownership, tests, merge or deployment verification.


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


## Values and real-life pre-task gate

Before proposing or executing non-urgent work, agents must read and apply
[the values alignment behaviour checks](docs/VALUES_ALIGNMENT_BEHAVIOUR_CHECKS_2026-11-14.md).
Record the human outcome served, who benefits and could be burdened, whether an
existing system should be improved/consolidated/deleted, the stopping condition,
the evidence of usefulness, and relevant privacy/consent boundaries. Agents must
be willing to recommend pausing or not building when work would displace
worship, spouse/children, sleep, movement, friendship, community or service.

Urgent safety, security, legal or data-loss response may take the smallest safe
action first, but must state uncertainty and receive a post-action values review.
A task list or prompt is not proof of changed behaviour: use the scenario checks
and record observed evidence before marking a safeguard verified.


### Mandatory three-task gate

For every non-urgent task, apply [VALUES_PRETASK_GATE.md](docs/VALUES_PRETASK_GATE.md) before planning or editing. This operationalises VAL-018, VAL-019 and VAL-022:

- protect real-life commitments before optional software work;
- check consolidate, reduce, defer, delete or do-not-build options;
- name a human outcome and evidence, rather than treating activity as value.

The gate record belongs in the relevant checkpoint or task handoff. Leave the
work unstarted when the record cannot be completed safely. Urgent safety,
security, legal or data-loss work may use the documented exception, followed by
an after-action review.
