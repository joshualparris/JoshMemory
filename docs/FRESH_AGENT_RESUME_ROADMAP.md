# JoshMemory fresh-agent resume roadmap

Last updated: 18 September 2026 (Australia/Sydney)

## Goal

A completely fresh coding agent should be able to open any Josh project, make **one obvious resume call**, understand what the project is, what happened previously, what is true right now, what must not be repeated, and what the next safe action is.

The target experience is:

```text
Fresh agent opens repo
        ↓
JoshMemory identifies project automatically
        ↓
resume_work()
        ↓
compact verified resume packet
        ↓
agent continues from the correct next action
```

JoshMemory remains continuity/provenance rather than code truth. Live Git/GitHub/API/machine evidence always outranks memory.

## Priority 0 — make resume a single operation

### 1. Add `resume_work`

Create a first-class MCP/CLI operation that replaces the need for a fresh agent to manually combine `get_project_context`, project facts, project history, GitHub evidence, portfolio context and live checks.

The operation should work with no arguments when called from inside a Git checkout, while still allowing explicit project/repository/path overrides.

A resume packet should contain:

- detected project name and aliases;
- canonical repository;
- project purpose;
- live branch, HEAD and dirty state;
- current write/push capability where available;
- latest relevant CI/check status;
- known deployment target and current deployment observation where available;
- latest active handoff;
- completed work;
- in-progress work;
- blockers;
- decisions that should be preserved;
- bugs already found/fixed;
- tests/builds already run;
- exact next action;
- first-class `do_not_redo` guidance;
- relevant portfolio/global engineering context;
- stale or conflicting memory explicitly called out as discrepancies.

Acceptance criteria:

- from a clean clone of a known project, a fresh agent can call `resume_work` without knowing the JoshMemory project name;
- output clearly separates live observations from remembered/historical context;
- stale HEAD/CI/deployment/write-access information cannot silently masquerade as current truth;
- the packet stays compact enough to use as startup context rather than becoming a transcript dump.

## Priority 0 — canonical project identity

### 2. Add a machine-readable project registry

Create a canonical registry, for example `projects.json` or equivalent structured storage.

Each project record should support:

- canonical project ID/name;
- GitHub owner/repository;
- previous repository names;
- project aliases and common chat names;
- common checkout folder names;
- related projects;
- project type;
- preferred JoshMemory namespace;
- known deployment URLs/providers;
- important documentation entry points;
- whether the project belongs to DadLAN, DCS, quality tooling, health tooling, games, etc.;
- optional sensitivity/privacy classification so private data is never surfaced into the wrong context.

Examples that should resolve correctly:

- `joshualparris/last-light` -> CRAP4All / crap4all;
- Whispering Wilds -> WhirringWilderness where applicable;
- folder-name differences between Windows and Fedora clones;
- renamed or forked repositories;
- related DCS / DCSPrep / DCSPD names without conflating distinct repos.

Acceptance criteria:

- canonical Git remote is the strongest identity key;
- aliases never create duplicate project histories;
- renamed repositories remain linked to prior history;
- ambiguous aliases are reported rather than guessed.

## Priority 0 — stop duplicate agents

### 3. Add current-work leases

Add a shared current-work/lease record so concurrent agents can see active work before starting.

A lease should include:

- project/canonical repo;
- machine;
- agent/session ID;
- objective/task summary;
- branch and starting HEAD;
- acquired time;
- last heartbeat/refresh;
- expiry;
- optional files/areas being edited.

Behaviour:

- `resume_work` reports active leases prominently;
- agents can acquire/refresh/release a lease;
- abandoned sessions expire safely;
- leases inform coordination but do not lock out emergency/manual work;
- conflicting leases are surfaced rather than silently overwritten.

Acceptance criteria:

- two fresh agents opening the same repo can tell that another session is already working on it;
- stale leases expire;
- completed sessions release automatically where possible.

## Priority 1 — make the resume packet trustworthy

### 4. Separate `LIVE`, `CURRENT MEMORY`, `HISTORICAL`, and `DISCREPANCY`

Every resume packet should classify evidence instead of mixing it into one narrative.

Suggested shape:

```text
LIVE
- main @ abc123
- clean worktree
- CI failing: test job
- push permission: yes

CURRENT MEMORY
- previous objective: repair parser
- next action: add malformed-input test

HISTORICAL
- previous Pages outage on 12 Sep

DISCREPANCIES
- prior handoff expected HEAD def456; repository has advanced 4 commits
```

Acceptance criteria:

- an agent can tell at a glance which statements were just observed;
- historical red/green CI states never appear as current without a new observation;
- contradictions are preserved and explained instead of being silently reconciled.

### 5. Add live GitHub/deployment checks to resume

Extend resume beyond local Git state when integrations are available.

Check where practical:

- Actions/check runs for current HEAD;
- Pages status and relevant deployment workflow;
- Vercel deployment when the project registry identifies Vercel;
- current repository permissions/write access;
- open PR associated with current branch;
- deployment URL health plus meaningful-content checks where safe/available.

Do not treat HTTP 200 or workflow success alone as proof that an app is functioning.

Acceptance criteria:

- WhirringWilderness-type cases immediately report `CI red / Pages disabled / no push access`;
- stale portfolio status tables are automatically superseded by live observations;
- unavailable integrations are reported as unknown rather than inferred.

### 6. Automatically include relevant portfolio context

The caller should not need to know that `JoshCoding2026` exists.

`resume_work` should automatically retrieve:

- global engineering principles;
- verification/security boundaries;
- relevant domain context such as DadLAN, PodcastRollout or Beautiful Code;
- project-specific durable facts;
- only the context that materially applies to the target project.

Acceptance criteria:

- CRAP4All automatically gets the quality-model context;
- a DadLAN app automatically gets control-plane boundaries;
- a podcast-enabled app automatically gets player/deployment lessons;
- irrelevant portfolio history is omitted.

## Priority 1 — improve handoff quality

### 7. Strengthen automatic handoffs

Use Git/GitHub/machine evidence to populate handoffs automatically wherever possible.

Current handoff fields such as objective, completed, in-progress, blockers, next action, decisions, bugs, tests, builds, commits, machines, branch and HEAD should be filled from evidence rather than relying only on agent prose.

Requirements:

- session-end hooks save meaningful checkpoints automatically;
- `next_action` should be required unless the task explicitly records `complete/no next action`;
- current HEAD/branch/dirty state should be observed automatically;
- commits created during the session should be attached automatically;
- tests/builds should include result, not just command text where available;
- handoff generation must redact secrets and avoid raw private transcript dumps.

Acceptance criteria:

- killing and restarting an agent after a normal session still yields a useful resume packet;
- handoffs contain enough evidence to avoid replaying the session;
- unverifiable agent claims are labelled as claims rather than upgraded to verified facts.

### 8. Make `do_not_redo` first-class

Add `do_not_redo` to the structured handoff schema and resume packet.

Examples:

- do not reintroduce the shared remote podcast launcher where a local player replaced it;
- do not rebuild JoshMemory around AVANCE uptime;
- do not include generated bundles in CRAP scoring;
- do not repeat a migration already completed;
- do not reintroduce a destructive database workflow merely to turn CI green.

Acceptance criteria:

- the field is searchable and preserved across handoffs;
- a fresh agent sees it before proposing work;
- superseded guidance can be explicitly retired rather than accumulating forever.

## Priority 2 — make discovery unavoidable

### 9. Add tiny `RESUME.md` bootstrap files to major repos

For actively edited repositories, add a tiny standard bootstrap file rather than copying project history everywhere.

Suggested content:

```text
This project uses JoshMemory for AI development continuity.
At session start call `resume_work` (or `get_project_context` on older clients).
Live Git/CI/deployment evidence outranks remembered context.
Save a handoff when the session ends or a blocker is reached.
```

Where agent-specific instruction files exist, integrate this guidance there instead of adding redundant documents.

Acceptance criteria:

- Claude Code, Codex, Antigravity and similar agents discover JoshMemory without Josh explaining it;
- bootstrap files remain tiny and stable;
- historical detail stays centralized in JoshMemory rather than being duplicated across repositories.

## Priority 2 — test continuity like a product

### 10. Add a resume-quality test suite

Create automated tests that simulate a fresh agent with only a repository checkout plus JoshMemory.

The test agent must be able to answer correctly:

1. What is this project?
2. What repository/branch/HEAD am I actually on?
3. What was the last meaningful work?
4. What is the exact next action?
5. What must I not repeat?
6. What blockers remain?
7. What tests/builds were already run?
8. Is memory inconsistent with live Git?
9. Is someone else currently working on it?
10. Can this agent safely push?
11. What is the current CI/deployment state, or is it genuinely unknown?

Test scenarios should include:

- renamed repository;
- different checkout paths on Windows/Fedora;
- stale handoff HEAD;
- stale red CI that is now green;
- current CI failure;
- no write access;
- disabled GitHub Pages;
- active lease from another agent;
- expired lease;
- project with no previous handoff;
- sensitive/private project where irrelevant personal data must not surface.

Acceptance criteria:

- resume behaviour is deterministic enough to test;
- regression tests fail when agents would be sent down a known wrong path;
- test fixtures contain no real secrets/private personal data.

## Suggested implementation sequence

### Milestone A — one-call resume

Implement:

1. canonical project registry;
2. `resume_work`;
3. evidence classification (`LIVE` / `CURRENT MEMORY` / `HISTORICAL` / `DISCREPANCY`);
4. automatic `JoshCoding2026`/domain-context inclusion.

Definition of done: from a known repo checkout, one tool call returns enough trustworthy context to begin work.

### Milestone B — safe multi-agent resume

Implement:

1. current-work leases;
2. lease visibility inside `resume_work`;
3. automatic release/expiry;
4. stronger session-end handoff capture;
5. first-class `do_not_redo`.

Definition of done: two agents can safely coordinate on the same portfolio without unknowingly duplicating work.

### Milestone C — live operational awareness

Implement:

1. GitHub Actions/current-HEAD checks;
2. repository permission checks;
3. Pages/Vercel deployment checks where configured;
4. meaningful rendered-app verification hooks where available.

Definition of done: resume packets automatically supersede stale CI/deployment/access claims with current evidence.

### Milestone D — universal discoverability and regression testing

Implement:

1. `RESUME.md`/agent-instruction bootstrap rollout to major repos;
2. clean-agent resume test harness;
3. cross-platform Windows/Fedora test matrix;
4. two-real-machine cloud round-trip proof;
5. ongoing resume-quality regression suite.

Definition of done: a fresh agent can start on a major Josh repo without Josh manually explaining the project history.

## Success metric

The primary success metric is **not record count**.

JoshMemory succeeds when a fresh agent can safely continue useful work without asking Josh to repeat prior context and without repeating, undoing or contradicting already-completed work.

A practical benchmark:

> Give a fresh agent only the repository checkout and JoshMemory. If it can identify the project, establish current truth, state the prior work and next action, respect do-not-redo guidance, detect concurrent work and safely begin the task, resume continuity is working.
