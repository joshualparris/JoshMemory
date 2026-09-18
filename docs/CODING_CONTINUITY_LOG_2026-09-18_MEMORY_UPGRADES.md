# Coding continuity — JoshMemory open-source memory upgrades

Recorded: 18 September 2026 (Australia/Sydney)

This is a durable handoff for future coding agents. Verify live Git/CI before acting, but do not repeat the research or implementation below as though it has not happened.

## Objective completed

Josh asked to find open-source coding-agent memory systems similar to JoshMemory and import their best ideas into JoshMemory.

Designs reviewed included:

- `Threesided-Studios/Agent-Memory` — cross-agent memory, session capture, provenance and coordination;
- `vartiainen1/agent-memory` — explicit trust/promotion and immutable provenance;
- `rosehgal/handoff` — concise resumable handoffs and append-only work history;
- `gastownhall/beads` — leases, heartbeats, ownership and abandoned-work recovery.

No third-party implementation code was copied. The useful concepts were independently implemented around JoshMemory's existing architecture. Design provenance and rejected ideas are recorded in `docs/OPEN_SOURCE_MEMORY_BORROWING_PLAN.md`.

## Existing JoshMemory features deliberately retained

Do not rebuild these merely because another memory project has them. JoshMemory already had:

- structured handoffs with supersession;
- automatic Claude SessionStart/Stop/SessionEnd continuity hooks;
- Git snapshots and live-state discrepancy detection;
- secret redaction;
- provenance and accountability references;
- private GitHub append-only cloud storage;
- the rule that live Git/API/machine evidence outranks remembered context.

The new work builds around those features instead of replacing them.

## New features merged

PR: `https://github.com/joshualparris/JoshMemory/pull/1`

Merged implementation commit:

`f215dc902d919eafa9cc62210c70126d31a3d0b3`

Main additions:

1. **Bounded work leases** — claim, heartbeat, release and reclaim work keys so multiple coding agents can see when work is already owned.
2. **Append-only work journal** — concise redacted events for commits, tests, builds, deployments, blockers, decisions and bugs instead of transcript dumps.
3. **Trust overlay separate from fact status** — `UNTRUSTED`, `VERIFIED`, `APPROVED`, `SYSTEM`. Agent-facing APIs do not expose trust promotion, and `VERIFIED` requires a source reference.
4. **One-call resume brief** — combines latest handoff, live-state discrepancies, current lease, recent work journal and the next action; warns when another agent owns the work key.
5. **Continuity CLI** — `joshmemory-continuity`.
6. **Agent-facing continuity MCP server** — `joshmemory-continuity-mcp` with resume, lease, journal and trusted-search tools, but intentionally no trust-promotion tool.
7. **Local/cloud storage behavior** — local SQLite claims use `BEGIN IMMEDIATE`; the private GitHub append-only store uses truthful optimistic append/re-read election rather than pretending to provide database row locking.
8. **Explicit HTTP limitation** — the legacy optional HTTP central backend has not yet been extended to the new lease/journal/trust record families. The code fails explicitly rather than silently creating split-brain state.

Primary implementation/documentation files:

- `joshmemory/continuity.py`
- `joshmemory/continuity_cli.py`
- `joshmemory/continuity_mcp.py`
- `tests/test_continuity.py`
- `tests/test_continuity_mcp.py`
- `docs/CONTINUITY_COORDINATION.md`
- `docs/OPEN_SOURCE_MEMORY_BORROWING_PLAN.md`
- `README.md`

Package version was raised to `0.3.0`.

## Evidence

PR head before merge: `b026d68e8c61f079c63988f6c6dd97c605d9b983`.

PR CI run `35279962665` succeeded. Evidence included:

- Python 3.11 test job: success;
- Python 3.12 test job: success;
- Python 3.13 test job: success;
- Docker/cloud-container build: success.

After squash merge, main commit `f215dc902d919eafa9cc62210c70126d31a3d0b3` triggered CI run `35280101273`; it also completed successfully.

The tests specifically cover duplicate claim blocking, release/reclaim behavior, owner-only heartbeat/release, expiry, secret redaction in journal events, prevention of agent self-promotion, evidence requirement for verified trust, trust/status separation, resume collision warnings and the safe MCP surface.

## Follow-up documentation

After the merge:

- README was updated to expose the new CLI/MCP workflows and accurately describe cloud/HTTP behavior.
- `docs/CODING_MEMORY_MIGRATION_BACKLOG.md` was updated so one-call resume, current-work leases, work journal and trust overlay are no longer falsely listed as queued.

These documentation commits come after `f215dc9`; therefore always inspect live `main` for the newest HEAD rather than treating the merge SHA as permanent HEAD.

## Do not redo

A fresh agent should **not**:

- repeat the external memory-tool comparison from scratch unless Josh asks for a refresh;
- reimplement leases, work journals or the trust overlay as a parallel system;
- replace the existing handoff subsystem merely to put handoffs under a differently named storage directory;
- add a vector database/graph stack simply because another memory tool has one;
- allow an agent to mark its own memory `VERIFIED` or `APPROVED`;
- claim GitHub-backed leases are strongly atomic database locks;
- silently fall back to local coordination state when an explicitly selected shared backend cannot serve it.

## Still open

The highest-value next steps are:

1. prove save/resume/lease behavior from two real development machines against the same canonical repository;
2. decide whether the continuity tools should also be folded into the original `joshmemory.server` MCP surface, or whether the companion server remains the cleaner boundary;
3. extend the optional HTTP central protocol to lease/journal/trust records if that deployment mode remains important;
4. implement a first-class canonical project/alias registry;
5. consider cloud-store indexes/caching only when record volume demonstrates the need.

The current implementation is intentionally smaller than the external projects: JoshMemory keeps the features that improve continuity and coordination while retaining its stronger rule that memory is context to verify, not a substitute for reality.
