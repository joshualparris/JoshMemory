# Portfolio system task triage — uniquely numbered child tasks

**Created:** 25 October 2026. **Authoritative queue:** [Portfolio triage route](PORTFOLIO_TRIAGE_2026-10-24.md), [233-repository register](PORTFOLIO_TRIAGE_REGISTRY_2026-10-24.csv), [durable checkpoint](PORTFOLIO_TRIAGE_CHECKPOINT.md).

## Exact identifiers

Every repository already has a unique parent review, **TR-001–TR-233**, and a permanent Repository Town designation **RT-...**. The [central step-by-step task register](PORTFOLIO_TRIAGE_TASK_STEPS_2026-10-25.csv) adds **eight noncolliding child IDs per parent**: TR-001.01–TR-001.08, TR-002.01–TR-002.08, … TR-233.01–TR-233.08.

**Coverage: 233 parent review IDs, 1,864 child step IDs.** TR-001 and TR-002 were marked `TRIAGED_DOCS` before this rubric was created. Their 16 child IDs are **`LEGACY_PARENT_TRIAGED_NOT_STEP_VERIFIED`**: they are reference-only, not proof that individual steps were tested and not a change to their existing parent completion. The remaining **1,848 child steps are OPEN** for TR-003–TR-233.

## Standard chronological procedure

| ID suffix | Task | Evidence necessary for completion |
|---|---|---|
| **.01** | Verify repository and claim | Check canonical repo, branch, current SHA, open PRs, existing AGENTS/checkpoints, active leases and permissions. Claim the work or record blocked reason. |
| **.02** | Audit every task source | Collect TODO files, issue and PR backlogs, review findings, CI/release blockers and deployment evidence. Link the original authoritative sources. |
| **.03** | Assign missing task IDs without collisions | Keep all existing numbering and status unchanged; number only unfinished unnumbered work; distinguish duplicate/mirrored tasks. |
| **.04** | Order tasks by urgency and dependencies | Record P0/P1/P2, impact, risk, owner, blockers and cross-repo prerequisites; verify urgent risk using live evidence. |
| **.05** | Specify the next executable coding task | Select one concrete unclaimed task with source path, tests, completion criteria, and fallback if blocked. |
| **.06** | Publish agent-ready handoff | Add/update TASK_TRIAGE.md, AGENTS.md, WORK_CHECKPOINT.md (or existing equivalents) and links from the README without overriding stronger coordination. |
| **.07** | Verify source and commit evidence | Fetch changes back; check task IDs, links, default branch, exact commit SHA, checkpoint and status. Don't equate triage with running or deploying app code. |
| **.08** | Close review and advance portfolio checkpoint | Update public-safe step register and parent repo registry, restricted mapping where required, evidence links and next repo; release claim. |

Each step has a **unique concrete ID when paired with its parent**; for instance the ParrisVoiceBank review is **TR-003** and its first subtask is **TR-003.01**. Do not give an unnumbered ad hoc instruction higher authority than these identifiers.

## Immediate work queue — TR-003 / RT-U032

- [ ] **TR-003.01** — Verify repository and claim
- [ ] **TR-003.02** — Audit every task source
- [ ] **TR-003.03** — Assign missing task IDs without collisions
- [ ] **TR-003.04** — Order tasks by urgency and dependencies
- [ ] **TR-003.05** — Specify the next executable coding task
- [ ] **TR-003.06** — Publish agent-ready handoff
- [ ] **TR-003.07** — Verify source and commit evidence
- [ ] **TR-003.08** — Close review and advance portfolio checkpoint

**Start with TR-003.01** on the actual connected repository, subject to live claims and branch state. Before touching tasks, read the existing `AGENTS.md`, `WORK_CHECKPOINT.md`, `AUDIO_INTEGRATION_MASTER_TODO.md` and other numbered backlog sources. This is a **triage-documentation task**; it does not authorise voice generation, paid usage, unrelated implementation or unverified CI/deployment claims.

**Next after TR-003.08 is verified:** TR-004.01 through TR-004.08, followed by TR-005.01 through TR-005.08, then the rest of the established 233-repository queue. If blocked, record the exact blocker and choose the next independent, unclaimed work; do not change existing identifiers.

## Status and bookkeeping rules

- `OPEN`: unfinished step.
- `IN_PROGRESS`: claimed in a durable checkpoint with timestamp, agent, branch and SHA.
- `BLOCKED`: evidence of the blocker and concrete next action; remains unfinished.
- `VERIFIED_COMPLETE`: committed/checkable evidence proves the precise step.
- `LEGACY_PARENT_TRIAGED_NOT_STEP_VERIFIED`: review already completed before individual step tracking was introduced; do not fabricate detailed evidence.
- Keep repository-level triage completion separate from individual coding, release, audio and playtest tasks.
- Preserve every existing `RT-...`, `TR-...`, `TASK-...`, `SVA-...`, `AU...`, `RTD-...` and numbered audio identifier. Never renumber a live task because priorities change; publish a new dated queue when necessary.
- The public CSV masks private repo names. Resolve those with authorised access to the separate restricted **Parris-Tech-Services/OS** inventory, and never leak private repository names into public task records.
- When new repos are discovered, use fresh unused permanent `RT-U###` identities and the next free parent `TR-###` plus eight numbered child tasks. Do not reuse any existing ID.

**Scope:** These are explicitly eight steps for **each portfolio repository triage**, not the coding backlog of the app itself. Coding task identifiers remain in each project checklist.
