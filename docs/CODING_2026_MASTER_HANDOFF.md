# Josh coding 2026 — master continuity handoff

Last reconciled: 18 September 2026 (Australia/Sydney)

## Purpose

This is the portfolio-level continuity document for Josh's 2026 software-development work. It exists so a fresh Claude Code, Codex, Antigravity or other coding agent can understand the major projects, architecture, engineering rules, completed work, unresolved work and important historical context without replaying months of chat transcripts.

This document is context, not code truth. Before changing any repository, verify the live repository, branch, HEAD, CI, deployment and machine/API state.

## Authority order

When sources disagree, use this order:

1. live Git/GitHub/API/machine evidence;
2. independent verification evidence from AgentCheck / AgentWitness / LLMAccountability or equivalent;
3. active JoshMemory cloud facts and handoffs;
4. this master handoff and project documentation;
5. older chat transcripts or inferred history.

Never keep an old red/green CI status, deployment status, commit SHA or machine state merely because it appears here. Re-check it.

## Fresh-agent startup contract

For any Josh coding task in 2026:

1. Load/search JoshMemory for the project and `JoshCoding2026`.
2. Identify the canonical GitHub repository and current checkout.
3. Inspect live branch, HEAD, dirty state, Actions/checks and deployment before acting.
4. Compare live state with remembered context and surface discrepancies.
5. Continue from the first still-valid next action; do not repeat already-completed migrations or repairs.
6. Save a new handoff at a meaningful checkpoint or blocker.

## Portfolio scale and history coverage

The portfolio is broad and the exact repo count changes over time. A verified local inventory on 12 August 2026 covered 69 repositories under `C:\dev`. A later CRAP4All audit on 17 September covered 76 repositories, with 69 scored and 7 not applicable. Treat both as dated snapshots, not a permanent total.

The older local JoshMemory corpus was substantially populated before cloud continuity was introduced: 279/279 coding backfill items were imported, the local index held hundreds of sessions and more than ten thousand events, and a GitHub Evidence Ledger held hundreds of records across many repositories/namespaces. The 15 September move to the GitHub-backed cloud store did **not** automatically copy that full corpus, which is why this reconciliation exists.

Do not upload raw ChatGPT exports, health data, private conversation material, secrets or whole SQLite databases to the cloud store. Persist compact redacted project facts, handoffs and source references.

## Engineering model used across repositories

The durable model is:

**Principles -> Gates -> Ratchets -> Signals -> Outcomes**

Engineering principles are normative; metrics are diagnostic evidence. A metric never overrides correct behaviour, truthful tests, user requirements or maintainability.

Core quality signals used across the 2026 work:

- test pass rate / behavioural correctness first;
- mutation testing quality;
- CRAP score (complexity plus coverage), normally targeting/gating individual functions below 30 where the tool applies;
- cyclomatic complexity;
- branch/test coverage, while distinguishing genuinely measured 0% from unknown/unmatched coverage;
- static analysis/type checking/linting/security checks;
- duplication;
- code churn plus complexity hotspots;
- defect/regression rate;
- build/CI reliability;
- deployment smoke tests and meaningful rendered-content checks, not merely HTTP 200 or a green badge.

Anti-gaming rule: improve behaviour and maintainability, not merely the number. Keep thresholds/ratchets truthful and explain exceptions.

## Major 2026 project map

### JoshMemory

Canonical source: `joshualparris/JoshMemory`.

Purpose: evidence-aware project continuity for AI-assisted development. Supports Codex/ChatGPT historical indexing, GitHub evidence, durable facts, structured handoffs and accountability references.

Current architecture: the public JoshMemory repo contains implementation; shared pause/resume state uses the private `joshualparris/JoshDashboard4` repository under `joshmemory-cloud/v1`. Records are append-only JSON with supersession. Existing GitHub authentication is reused. AVANCE-WS7 is no longer required for memory uptime.

Important boundary: JoshMemory provides context/provenance, not current code truth or independent verification.

Remaining architectural work includes a real two-machine save/resume proof, leases/current-work coordination, stronger canonical-repo identity, cloud indexing/caching and deliberate migration of useful old local history.

### ForgeGrid / DadLAN execution architecture

ForgeGrid is the distributed execution/orchestration layer, not the memory store. AVANCE-WS7 is/was the coordinator in the DadLAN design; workers execute isolated jobs and return evidence.

By 17 September the restored fleet had six confirmed ForgeGrid workers online and successful smoke jobs, while 11/12 Action1 endpoints were connected. A dated integration baseline mentioned `integration/next @ 4b7bed8`; always verify current HEAD before using it.

Long-running design rule: **model thinks -> coordinator decides -> ForgeGrid executes -> workers return evidence**. Local models do not receive unrestricted administrator authority.

Important historical ForgeGrid constraints/fixes included TLS identity, restricted workspaces, hardware-aware scheduling, Windows JSON escaping, provider-capability detection, rollback-race concerns, artifact-size enforcement, durable reporting/queueing and heartbeat/retry coupling.

### DadLAN / DadlanControlCentre

Canonical dashboard/control-plane project: `joshualparris/DadlanControlCentre`.

DadLAN evolved to a 12-machine target: Fedora control plane plus JParrisDesktop and Laptop01-10. The system integrates rather than replaces Action1, MeshCentral, SMB, ForgeGrid, Jenkins/LAN gaming tooling and LANCommander.

Dashboard/control-plane rules: server-side adapters, normalised observations, failure isolation, no exposed secrets, no arbitrary destructive actions, and truthfully distinguish mock-tested from live-tested integrations.

A Fedora SMB usability workaround used `bindfs --no-allow-other` over `/mnt/dadlan` at `~/DadLAN`.

On 17 September, CRAP4All-driven refactoring reduced DadlanControlCentre's relevant CRAP hotspot from about 42 to about 20, added MeshCentral regression coverage and a permanent CRAP<30 CI gate.

### Local Qwen/Ollama production inference worker

JParrisDesktop is the main local-model worker. Known hardware baseline: Windows 11, i5-9400, 16 GB RAM, GTX 1660 6 GB.

Production chain verified in September:

`Fedora/AVANCE client -> 10.245.173.58:11435 gateway -> Ollama 127.0.0.1:11434 -> qwen3.5:4b`

The gateway is intentionally advisory/read-only: schema validated, fail-closed, no direct worker execution. Production files included `service.py`, `schema_validator.py`, `config.json`, `service_control.ps1`, `test_suite.py`, `pilot_tasks.py` and documentation. A 17/17 test run and advisory pilots were previously recorded; warm model speed was roughly 40-47 tok/s on the GTX 1660. Verify current values live.

A local ChatGPT-style web UI on port 8080 and persistent local chat history were also developed. Controlled web lookup/mobile improvements were future work.

### Action1 / endpoint administration

Action1 is a bootstrap/recovery/admin side channel, not the normal code-execution plane and not code truth.

DadLAN v0.3 work required documented Action1 APIs only: no private PSAction1 authentication, arbitrary command execution or arbitrary PowerShell. The design used predefined read-only diagnostics and protected Laptop #01 from experimental changes. OAuth2 tokens should remain volatile and never be persisted into repositories/memory.

### AgentCheck / AgentWitness / LLMAccountability / JoshSupervisor / AgentCouncil

These projects form the verification/accountability/supervision side of the ecosystem.

- AgentCheck / AgentWitness: independent evidence and verification.
- LLMAccountability: accountability/policy evidence; JoshMemory references it rather than self-certifying claims.
- JoshSupervisor: durable mission/checkpoint supervision and resume behaviour.
- AgentCouncil: reasoning/review coordination where used.

A recurring completion model is **CLAIMED != SATISFIED** until evidence supports it. Direct live evidence outranks an agent's own assertion.

### CRAP4All

Current GitHub repository at reconciliation time: `joshualparris/last-light`, product/project name **crap4all**. Josh wanted the repository itself renamed to `crap4all`; verify whether that rename has occurred before using either URL.

Purpose: universal CLI for CRAP analysis across languages by combining cyclomatic complexity with per-function coverage. It supports multi-language Lizard complexity input, LCOV/Cobertura/JaCoCo coverage, terminal/JSON/HTML output and CI threshold gating.

Major September work:

- self-CRAP reduced from roughly 306 to 17.13 through real behavioural tests/refactoring;
- 14+ behavioural tests were added during the initial improvement; later test counts increased;
- permanent CRAP<30 self-gate;
- generated/minified build output exclusions fixed so `dist`, build, `.next`, node_modules and bundles do not inflate results;
- explicit distinction between unknown/unmatched coverage and measured 0%;
- `QUALITY_MODEL.md` and code-quality audit documentation added;
- mutation testing added with a truthful ratchet (recorded around 71.1% with a 71.0 blocking baseline and 80% target at one point);
- wider gates/signals include coverage, CRAP, CC, mutation, Ruff, mypy, Bandit/dependency security, duplication and churn.

Durable principle: **engineering principles trump metrics**. CRAP4All should expose diagnostic evidence and enforce agreed gates without encouraging metric gaming.

A 17 September portfolio audit covered 76 repos. Some huge scores were traced to generated bundles rather than source quality and were corrected by better exclusions. Treat historical rankings as dated diagnostics, not permanent quality judgments.

### Beautiful Code / portfolio quality rollout

A large September effort applied a shared engineering-quality model across many repositories. Work included tests, lint/type/static analysis, complexity/coverage/CRAP review, mutation where practical, duplication/churn review, CI repair and repo-specific audit docs.

When continuing this work, inspect what each repository already has before adding duplicate tooling. Preserve useful repo-specific conventions. Do not replace correctness with a dashboard score.

### JoshHub

JoshHub became both a portfolio hub and a deployment/QA status surface. It has been used to track cross-app rollouts and distinguish source fixes from genuinely working production deployments.

Important lesson from 2026: a deployment badge or HTTP 200 is insufficient. Verify meaningful content renders, compiled assets load, intended controls appear, mobile layouts remain usable and the production URL serves the expected build.

### Podcast dock / cross-app audio rollout

JoshHub was initially used as the source-of-truth launcher/catalogue for a shared podcast dock. At one stage the rollout covered roughly 16 repos and 9 topic banks x 25 Spotify episodes.

Durable user requirements:

- podcast player defaults **OFF** in settings;
- X closes the dock;
- settings can reopen it;
- the UI must respect safe areas/immersive routes and not cover app content;
- direct Spotify links/player controls must remain usable on mobile;
- loading/failure states must not freeze the host app.

Critical architectural correction: the shared JoshHub/jsDelivr launcher caused `Loading podcasts` freezes in some apps. The working JoshHorses pattern was self-contained/local episode data plus direct Spotify embeds. Multiple apps, including DCSPrep, UpskillApp, FaithHub, Sword Coast, WorkApp and HugCoach, were moved toward independent local players.

UpskillApp exposed a separate deployment lesson: GitHub Pages had been serving Vite source instead of a compiled production build, and competing Pages publishers could overwrite the correct output. Production verification must inspect rendered content/assets, not merely workflow success.

### HealthLens / JoshHealth

Health work included large-export ingestion, SQLite-backed processing, persistence/authentication, Android SyncWorker work and AI-assisted analysis/deduplication. HealthLens specifically moved Groq calls server-side, added 429 retry/backoff/fallback handling and synthetic fixtures.

Privacy constraint: never expose private health exports or personal health data in public repositories, public JoshMemory docs or fixtures.

As of the live Git check on 18 September 2026, the latest HealthLens CI run inspected during reconciliation was green. Re-check before acting.

### DCSPD / DCS Prep / DCS applications

DCS/Avance professional-development and school-support apps have received build fixes, deployment work, podcast-player integration and security/quality improvements.

A September security mission included a DCSPD PR contaminated by unrelated dependency/environment changes; the correct pattern was to preserve useful work and create a workflow-only replacement rather than silently mixing concerns.

At reconciliation time, DCSPD had write access through the current GitHub integration. Its newest CI was queued while a separate dependency-audit repair workflow on the same new HEAD had failed. This is a highly time-sensitive snapshot; verify current Actions before touching it.

### AppFactory / deployment tooling

AppFactory has repeatedly surfaced deployment/repository-automation lessons. Historical states included CI/Vercel failures. Verify current live status rather than assuming those remain unresolved.

The broader rule from AppFactory and the portfolio sweeps is that repo automation must preserve existing work, avoid destructive dependency churn, and distinguish source success from real deployment success.

### ParrisBudgetApp

A 2026 repair removed a destructive Prisma workflow. Preserve data-safe migration/deployment behaviour; never reintroduce destructive schema steps merely to make CI green.

### FedoraCrashDoctor

FedoraCrashDoctor is part of the resilience/diagnostic tooling. Stage 2 was previously recorded closed around commit `07628c7`; treat that SHA as historical evidence only and verify live Git.

### ChatGPTBrowser

Work included FTS5 plus semantic retrieval/ranking (including reciprocal-rank-fusion style combining). Historical notes also mention assertion/test changes that required later audit. Preserve privacy of imported chat data.

### RagTime

Work included security plugins/curriculum and repository-integrity cleanup. A prior accidental outer Git root was identified as something to audit/avoid.

### AvancePD / professional-development tooling

AvancePD work focused on guardrails, learning workflows and AI/privacy considerations. Related DCS/Avance repos also participated in broader CI, security-action-pinning and deployment work.

### KaseyaFieldOps / AgentBridge

KaseyaFieldOps work included security-identity quick-reference layers and metadata for SaaS Protection, INKY, DarkWeb ID and BullPhish ID, plus planned/implemented backup-family and scenario-lab branches. A pre-existing TypeScript confidence-enum mismatch (`highly` vs `highly_confident`) caused one deployment failure and was repaired.

AgentBridge had a ThinkPad identity/authentication 401 investigation where the constraint was to inspect Fedora-side identity/process state rather than regenerating tokens or changing the ThinkPad first.

### Eleven-Realms

`joshualparris/Eleven-Realms` was created as an 11-machine ForgeGrid game experiment. Initial scaffold used TypeScript/Vite/Canvas/Vitest, modular contracts, `FORGEGRID.md`, 11 missions, cross-review manifest and CI. Initial tests/typecheck/build passed; workers were not yet dispatched at that checkpoint.

### Whispering Wilds / WhirringWilderness

Whispering Wilds/WhirringWilderness work includes game UI/TUI/E2E history and GitHub Pages deployment.

Current repository from the September CI sweep: `joshuaparrisdadlan-stack/WhirringWilderness`. The connected GitHub integration had pull but **not push** access during the 18 September reconciliation. Its old Pages workflow was red and the repository reported Pages disabled; workflow patch/re-run attempts were rejected with 403. Do not claim this is fixed until account/repo permissions and Pages are rechecked.

### NebulaDice-Browser

At reconciliation time, `joshualparris/NebulaDice-Browser` had write access and its latest GitHub Pages workflow inspected was green after a Pages deployment repair. Earlier red status in portfolio tables is stale.

### WorkApp

At reconciliation time, `joshualparris/WorkApp` had write access and the inspected GitHub Pages deployment was green. Earlier red status is stale.

### CanonRPG

At reconciliation time, `joshuaparris-max/CanonRPG` had push access through the current integration and the inspected build/Pages workflow was green after a repair for Pages-unavailable behaviour. Earlier red status is stale.

### openclaw

`joshualparris/openclaw` is a fork that participated in the 2026 quality/CI work. At reconciliation time the current inspected HEAD had successful workflow checks (with some intentionally skipped jobs) and no known current red CI from the old table. Verify live status before modifying such a large upstream-derived codebase.

### Arena / carl

The current GitHub integration could read but not push to `joshuaparris-max/Arena` and `joshuaparris-max/carl` at reconciliation time.

A known carl CI issue from 17 September was YAML interpreting unquoted `3.10` as numeric `3.1`; the intended matrix form is quoted Python versions such as `'3.10'`, `'3.11'`, `'3.12'`. Because write access was denied, do not assume that repair landed.

### Other 2026 repos/streams known from the historical corpus

The broader coding history also includes or references projects such as DCS, DCSPrep, UpskillApp, JoshHorses, FaithHub, Sword Coast, HugCoach/hugCoach, cornerstone-lifeboat, JoshBooks, JoshFireAwareness, IncreaseHRV, ResearchAtlas, ResearchGems, BucklandBlocks, JoshDashboard2/3/4, LifeHub, JoshPlatform, FieldNotes, Waypoint, AIDungeonMaster/GroqChat and additional games/dashboards/tools.

This list is intentionally a project map rather than a claim that every repo is currently active. Use the historical JoshMemory search/evidence index plus live GitHub discovery to retrieve repository-specific detail.

## Security-remediation stream

A September ForgeGrid security mission used JoshMemory/JoshSupervisor for durable handoffs and a canonical SecurityAudit register/parser. Early remediation included action pinning and AIDungeonMaster fixes, while many findings remained. The rule was to work advisory-by-advisory, avoid unrelated dependency upgrades, and preserve contaminated-but-useful commits rather than discarding work.

When reviewing Next.js/security findings, distinguish concrete exploit surface from generic advisory presence; do not mass-upgrade blindly.

## Deployment and CI lessons that should not be relearned

- A green GitHub Action is not proof the user-facing app works.
- An HTTP 200 is not proof a Vite/React app was compiled correctly.
- GitHub Pages may be disabled even when a deploy workflow exists.
- Multiple Pages publishers can overwrite one another.
- Generated/minified bundles must not contaminate source-quality metrics.
- Lockfiles and dependency-repair workflows can fail independently of application correctness; inspect the exact failing job/log.
- Preserve existing work before cleanup, especially when a branch/PR is contaminated by unrelated changes.
- Verify write permission before promising a direct repair.
- Do not treat old portfolio status tables as current truth.

## Repo/write-access snapshot from 18 September 2026

This is a dated connector snapshot only:

- push/admin available: `joshualparris/DCSPD`, `joshualparris/HealthLens`, `joshualparris/NebulaDice-Browser`, `joshualparris/openclaw`, `joshualparris/WorkApp`;
- push available: `joshuaparris-max/CanonRPG`;
- read/no-push through this connection: `joshuaparris-max/Arena`, `joshuaparris-max/carl`, `joshuaparrisdadlan-stack/WhirringWilderness`.

Permissions can change. Always query them live before writing.

## Do-not-redo guidance

Unless live evidence says the work regressed or was reverted, do not blindly repeat these completed themes:

- rebuilding JoshMemory around an always-on AVANCE/PC dependency;
- exposing a local model directly as an unrestricted fleet administrator;
- replacing Action1/MeshCentral/SMB/ForgeGrid when integrating DadLAN tooling;
- treating unknown coverage as 0% in CRAP4All;
- counting generated bundles as normal source complexity;
- using a shared remote podcast launcher as the only playback path when local self-contained players are required for reliability;
- trusting deployment badges without rendered-content verification;
- reintroducing destructive database workflows simply to satisfy CI;
- using memory assertions as verification evidence.

## Highest-value outstanding continuity work

1. Keep this master handoff and cloud facts updated as new work lands.
2. Migrate/selectively summarise more high-value facts from the old local JoshMemory corpus rather than uploading raw transcripts.
3. Add project-specific active handoffs for the most frequently edited repositories.
4. Prove JoshMemory cloud save/resume from two real development machines.
5. Add lease/current-work coordination to avoid two agents unknowingly resuming the same task.
6. Continue live CI/deployment reconciliation so stale red/green tables are explicitly superseded.

## Final rule for a new agent

Use this document to know **what happened and where to look**. Use live GitHub, deployment URLs, CI logs and machine evidence to decide **what is true now**.


## 18 Sep 2026 — Vercel failure cleanup

Live investigation found several distinct Vercel failure causes; do not treat them as one broken-code incident.

### JoshHub
- Canonical repo: `joshualparris/JoshHub`.
- Canonical Vercel project observed READY: `josh-hub` (`prj_4dF21nt8YrcxB3MLsJuZrlzxrUqD`).
- Duplicate Vercel project also exists: `josh-hub-96no` (`prj_ydbKTTjAKs8PqEf8XtFNnCHiq42g`).
- Old archival/import branches at commit family `b6c3a3c` had a corrupted `package-lock.json`: a privacy scrub had replaced literal `ms` substrings with `care2`, corrupting dependency names and integrity hashes (for example `string.prototype.trimstart` -> `string.prototype.tricare2tart` and `*-msvc` -> `*-care2vc`). The corresponding `package.json` was not corrupted.
- Repaired lockfiles on the six affected backup/import branches and verified `care2` / `tricare2tart` are absent afterwards:
  - `local-import-20260703-141717-JoshHub`
  - `local-import-20260703-141717-JoshHub-OneDrive`
  - `codex/local-backup-20260703-090048-joshhub`
  - `codex/local-backup-20260703-090048-joshhub-onedrive`
  - `rescue/pre-reset-20260610-JoshHub`
  - `rescue/pre-reset-20260610-JoshHub-OneDrive`
- Added `vercel.json` with `git.deploymentEnabled=false` on archival/stale branches that were producing blocked/queued previews, including the six above plus:
  - `audit/conformance-catalogue-assets-rebase-20260909`
  - `trae/joshhub-inventory-sync-qa`
  - `feat/improve-app-links`
  - `main-TAB378`
  - `backup-before-handback-JoshHub`
  - `sandbox/hugcoach`
  - `sync/hugcoach`
  - `agent/conformance-format`
  - `audit/conformance-18-final-20260909`
  - `agent/conformance-format-2`
  - `game-lab-dashboard-bot-b`
  - `antigravity-push`
- Main now has `vercel.json` that permits Git deployments only from `main` and attempts to ignore the duplicate project by its Vercel project ID. Commit recorded during this cleanup: `72b3279` (preceded by `dc1f4b2`).
- The existing canonical production deployment was READY during verification. Historical BLOCKED/QUEUED records remain visible in Vercel history; they are not evidence that current main is broken.
- Hobby-team blocked-deployment emails were caused by stale commit author identities (for example old local/work/GitHub accounts) on historical branches, not by current application code.

### CRAP4All
- Repo remains `joshualparris/last-light`, product name `crap4all`.
- It is a Python CLI, not a Vercel web application.
- Vercel had previously failed with "No python entrypoint found".
- `vercel.json` was changed to disable Git deployments entirely. Commit: `99a514d`.
- Future agents should not reintroduce a fake web entrypoint merely to make Vercel green.

### CanonRPG
- Repo: `joshuaparris-max/CanonRPG`.
- The repo already has a GitHub Pages deployment workflow for Canon Table Engine.
- Root `vercel.json` initially contained obsolete/invalid legacy settings; these were cleaned, then Vercel was explicitly disabled in favour of the GitHub Pages path. Final cleanup commit: `7aa024d`.
- Important remaining account-level blocker: the legacy Vercel project `canon-rpg-api-server` belongs to a different Vercel scope/team (`joshs-projects-a85abb0a`, team id observed as `team_4DEFMuI5CHFZ16yfKvB3Xo5z`) that the currently connected Vercel account is not authorised to manage. Vercel continues to emit a project-configuration failure before repo config is applied. Fix requires access to that Vercel scope and disconnecting/deleting the obsolete Git-linked project. Do not keep changing CanonRPG source code to chase that account-level error.

### Preventive rule
Never run broad personal-data string substitution across dependency lockfiles, hashes, generated assets, vendored code, binaries or package names. Privacy scrubbing should target human-authored/public-facing text and structured known fields, with lockfiles explicitly excluded.
