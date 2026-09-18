# JoshMemory cloud continuity — decision and implementation history

Last updated: 15 September 2026

This document is the durable architecture record for the conversations and implementation work that led to JoshMemory's cross-machine continuity design. It intentionally captures decisions, constraints, evidence and unresolved work rather than copying private chat transcripts verbatim.

## Objective

The goal is simple: a fresh Claude Code, Codex, Antigravity or other coding-agent session should be able to resume a project from a useful bookmark on any development computer without depending on one particular PC being powered on.

A useful checkpoint records the objective, repository identity, branch/HEAD when known, completed work, blockers, exact next action and anything that should not be repeated. JoshMemory is continuity/history, not code truth. Live Git, APIs and machine observations always outrank a stored handoff when they disagree.

## Architecture boundaries

The long-running fleet design converged on these responsibilities:

- **GitHub** — durable code truth and canonical repository/commit identity.
- **JoshMemory** — shared project continuity, historical context, redacted durable facts and references to verification evidence.
- **ForgeGrid** — fleet execution/orchestration and worker evidence transport.
- **AVANCE-WS7 / DadLAN control plane** — optional coordinator for local fleet work; useful for execution, but no longer required for JoshMemory availability.
- **Action1** — bootstrap/recovery/administrative side channel for Windows endpoints, not the normal execution plane and not a source of code truth.
- **AgentCheck / AgentWitness** — independent verification/evidence producers. JoshMemory may reference their evidence; it must not manufacture a VERIFIED result merely by storing a claim.
- **LLMAccountability** — accountability/verification-policy layer. JoshMemory stores references to results rather than replacing that system.
- **AgentCouncil** — reasoning/review coordination where present; it does not replace independent evidence.

The recurring rule is: **memory helps an agent know where to look; live evidence tells it what is true now.**

## Timeline

### August 2026 — local evidence index and portability

JoshMemory began as a local/offline evidence and project-memory index using SQLite. It indexed Codex session JSONL, ChatGPT exports, GitHub evidence, durable project facts and other provenance-rich material.

A large local database was treated as data, not source code. A Fedora transfer/backup of the SQLite file was integrity-checked successfully at roughly 378 MB rather than committed to GitHub. This established two lasting constraints:

1. do not commit the live memory database to a source repository; and
2. do not place a writable SQLite database on SMB/NFS simply to make it multi-machine.

The Windows/ThinkPad work also exposed that project discovery could not remain Fedora-specific. The auditor was made cross-platform so `C:\dev` and `~/dev` clones could both be recognised and live Git state could be reconciled with historical records.

### Late August / early September — verification and evidence separation

The broader agent stack made it clear that an agent saying “done” is not enough. AgentCheck, AgentWitness, LLMAccountability and AgentCouncil were discussed as independent or complementary evidence/review layers.

JoshMemory's role was deliberately kept narrower: organise context and provenance, retain references to external verification, and never upgrade an assertion into truth just because it appears in memory.

The same period reinforced a general precedence model:

1. live repository/API/machine evidence;
2. independently generated verification evidence;
3. durable JoshMemory facts and handoffs;
4. older transcripts or inferred context.

Unknown information should remain unknown rather than being filled in from an old handoff.

### 9 September 2026 — one shared service for the fleet

The target became one authoritative, network-accessible JoshMemory continuity layer for roughly ten laptops and two desktops, usable by Claude Code, Codex, Antigravity and eventually Copilot workflows.

Important design requirements from that work were:

- identify a project primarily by canonical Git remote/repository, not by a machine-specific checkout path;
- retrieve a compact startup checkpoint rather than replaying an entire transcript;
- verify live Git before acting on a checkpoint;
- keep append-only history/supersession rather than overwriting evidence in place;
- redact secrets before persistence;
- avoid shared-file SQLite;
- support cross-machine proof, not just same-machine unit tests;
- eventually add leases/current-work coordination so two agents do not unknowingly resume the same task.

A central HTTP/MCP service on AVANCE-WS7 was the first practical topology considered because AVANCE-WS7 already coordinated local fleet work.

### 12 September 2026 — control-plane separation

The DadLAN/ForgeGrid work further clarified that AVANCE-WS7 should coordinate policy/execution rather than become the single owner of all durable state. Local model experiments likewise followed the pattern “model thinks → coordinator decides → ForgeGrid executes → workers return evidence → model interprets,” with no direct administrator authority handed to a model.

This reinforced the same separation for memory: a coordinator may consume JoshMemory, but it should not be the only place JoshMemory exists.

### 15 September 2026 — structured handoffs and HTTP centralisation

JoshMemory gained first-class structured handoffs/bookmarks, central HTTP routing and automatic Claude lifecycle integration. The implementation included:

- `save_handoff`, `get_project_context` and `list_handoffs`;
- durable project facts and accountability references through the same shared layer;
- cross-machine canonical-repository matching so `~/dev/App` and `C:\dev\App` can refer to the same project;
- checkout path as a ranking preference rather than a cross-machine identity barrier;
- strict same-worktree matching only when deciding which prior handoff a new handoff supersedes;
- explicit detection of discrepancies between a handoff's recorded branch/HEAD and live Git;
- no silent local fallback once a remote shared backend is explicitly selected;
- concurrency-safe local SQLite schema initialisation;
- Python 3.11/3.12/3.13 CI and container-build validation.

The first deployment target was AVANCE-WS7 over a trusted network. That implementation remained useful as an optional self-hosted mode, but it failed the stronger availability requirement: JoshMemory should still work when AVANCE is shut down.

### 15 September 2026 — cloud requirement

The requirement was then made explicit: shared continuity must be reachable from anywhere and must not rely on the AVANCE PC, a home PC or any other workstation remaining online.

A Railway service with a persistent volume was prepared as one valid cloud topology. It preserved the existing authenticated HTTP service and local SQLite semantics. However, using a new Railway account/connection would require an interactive authorisation step, conflicting with the requirement that the rollout should not require the user to create/connect another service manually.

### 15 September 2026 — zero-touch GitHub-backed cloud store

The final zero-extra-account topology uses infrastructure that already exists in the development workflow:

```text
Claude / Codex / Antigravity / JoshMemory MCP
             on any computer
                    |
                    | existing GitHub authentication
                    v
          private GitHub repository
          JoshDashboard4 / main
          joshmemory-cloud/v1/
                    |
          append-only JSON records
```

The public `joshualparris/JoshMemory` repository contains the implementation. Durable shared handoffs, project facts and accountability references are stored in the existing **private** `joshualparris/JoshDashboard4` repository. The private repository was reserved and labelled as the JoshMemory Cloud Store so memory records are not published merely because the JoshMemory source code is public.

The client automatically looks for an already-available GitHub credential in this order:

1. `JOSHMEMORY_GITHUB_TOKEN`;
2. `GH_TOKEN`;
3. `GITHUB_TOKEN`;
4. `gh auth token`;
5. the configured Git credential helper for `github.com`, with terminal prompting disabled.

No discovered credential is written into JoshMemory or committed to either repository.

If `JOSHMEMORY_REMOTE_URL` is explicitly configured, the existing authenticated HTTP central service remains higher priority. If no HTTP service is configured but existing GitHub authentication is usable, the private GitHub store is selected automatically. If neither exists, JoshMemory remains capable of local/offline SQLite operation.

Cloud records are one UUID-named JSON file per append. Supersession is represented by record references and active state is derived when reading. This avoids treating one mutable SQLite file as a cross-machine merge object and substantially reduces multi-writer conflicts.

The backing branch is read through GitHub's Git Trees/Contents APIs. The public source repository never contains the private memory payloads.

## What is and is not synchronised

### Shared through the cloud store

- structured session handoffs/bookmarks;
- durable project facts;
- accountability references;
- provenance fields associated with those records;
- supersession/history for those record types.

### Still local or separately authoritative

- raw Codex session JSONL;
- full ChatGPT exports/transcripts;
- local machine observations;
- the complete historical SQLite/search corpus unless deliberately migrated;
- repository code and current branch/HEAD, which remain Git/GitHub concerns;
- verification artefacts owned by AgentCheck, AgentWitness or LLMAccountability.

The zero-touch cloud work therefore solves **pause/resume continuity**, not wholesale automatic upload of every private transcript or old local database.

## Security and privacy rules

- The memory backing repository must remain private.
- Never commit GitHub credentials, bearer tokens, API keys, passwords or cookies.
- Existing JoshMemory redaction stays in front of shared persistence.
- Do not expose a writable SQLite database over SMB/NFS.
- Do not make a stored handoff authoritative over live Git.
- Do not label a claim VERIFIED without the required external/source reference.
- Do not use JoshMemory as a mechanism for bypassing account authentication or other service controls.

## Agent startup/resume contract

A fresh coding agent should:

1. identify the canonical Git repository and current checkout;
2. load the latest relevant JoshMemory handoff/context;
3. inspect live branch, HEAD, dirty state and other necessary machine/API evidence;
4. surface any discrepancy instead of silently trusting memory;
5. continue from the first still-valid next action;
6. save a new handoff when a meaningful checkpoint, blocker or session end occurs.

A handoff should preferentially include:

- objective;
- completed work;
- blocker, if any;
- exact next action;
- branch and HEAD when useful;
- tests/evidence already obtained;
- explicit “do not redo” guidance where repetition would be harmful or wasteful.

## Relationship to ForgeGrid and the fleet

ForgeGrid remains the normal mechanism for distributed execution. Action1 remains a recovery/bootstrap path. AVANCE-WS7 may still coordinate fleet work and consume JoshMemory, but none of those systems is required to keep the shared continuity records online.

This is deliberate: a dead worker, sleeping coordinator, office outage or powered-off laptop should not erase the bookmark another machine needs to continue the project.

## Remaining roadmap

The highest-value follow-ups are:

- prove the GitHub backend from multiple real development machines after they pull the current JoshMemory code;
- add an explicit lease/current-work record so concurrent agents can see who is actively working a task;
- make canonical repository identity primary even when local project folder/display names differ;
- add compact indexes/caching if the append-only GitHub record count becomes large enough for repeated full-tree reads to matter;
- provide a deliberate migration/import command for useful historical facts/handoffs from old per-machine SQLite databases;
- continue improving Antigravity and Copilot integration while describing actual capabilities accurately;
- keep README/deployment documentation aligned with the implementation;
- periodically verify the private backing repository, CI and live status page rather than assuming they remain healthy.

## Current authority statement

As of 15 September 2026, the intended default for shared pause/resume state is the private GitHub-backed append-only store. AVANCE-hosted HTTP and Railway/container deployment remain optional deployment modes, not availability requirements.

Live code truth remains each canonical GitHub repository and the live checkout being acted on. JoshMemory is durable context to verify, not a substitute for observation.
