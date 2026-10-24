# Repository Town — RTD implementation PR

> Select this template for changes implementing one or more tasks in the [RTD-001–093 roadmap](../../repository-town/docs/SKYRIM_NPC_DIALOGUE_IMPLEMENTATION_TODO.md). **Include `RTD-NNN` in the PR title**, and complete every section. The acceptance contract is versioned [v1.0.0](../../repository-town/docs/RTD_008_ACCEPTANCE_CRITERIA_V1.md). The workflow checks IDs and traceability, not whether gameplay/audio truly passed.

## Stable task and acceptance identifiers

RTD task IDs: RTD-009

Acceptance case IDs: RTAC-003

## Scope and conflicts

<!-- Name canonical source paths, and any existing overlapping branches/PRs. Do not copy an outdated open PR wholesale. Confirm ownership claimed on COORDINATION before implementation. -->

Scope/exclusions: Describe exact modified modules, current owner, avoided PR overlap, and what is deliberately not implemented.

## Evidence on exact tested commit

<!-- For each case, record PASS / FAIL / NOT RUN explicitly. Link real logs, CI artifacts, node tests, browser videos and exact tested Git commit. A PR template is not an automatic test pass. -->

Evidence: Name exact commands, results, tested commit SHA, and links to test logs. Differentiate local browser WebAudio from actual hosted production.

## Checkpoint and handover

Checkpoint: repository-town/WORK_CHECKPOINT.md

<!-- Link claim in COORDINATION.md; checkpoint must include baseline, branch, all milestones, CI and unfinished work. -->

Incomplete or blocked: Name skipped and failing tests, unavailable recordings, open RTD tasks, production verification, and the precise next step.

## Acceptance safeguards

- [ ] I checked latest `main`, `AGENTS.md`, `COORDINATION.md` and all overlapping open PRs.
- [ ] My owner claim and M1 start checkpoint were committed **before** implementation.
- [ ] Every named `RTD-NNN` maps to at least one `RTAC-NNN` case in the versioned contract.
- [ ] For actual recorded speech, actor identity, clip hash/transcript, exact caption and appropriate gameplay state are evidenced separately.
- [ ] Any effects/rewards are tied to authoritative committed game state; negative tests protect against fake success or replay duplication.
- [ ] Privacy and build/relevant game regressions are run for the **tested SHA** and failures are not hidden.
- [ ] I have **not** marked staging/production, handset or backup checks complete based only on local tests or HTTP 200.
- [ ] I updated numbered tasks and checkpoint **only** for genuinely verified work.
