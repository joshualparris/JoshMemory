# Open-source agent-memory ideas adopted by JoshMemory

This document records design ideas reviewed on 18 September 2026 and how JoshMemory should adopt them without copying implementation code.

## Sources reviewed

- Threesided-Studios/Agent-Memory — cross-agent memory, session capture, provenance, shared coordination.
- vartiainen1/agent-memory — explicit trust levels, human promotion, immutable supersession, provenance-first governance.
- rosehgal/handoff — automatic session journals, append-only history, compact resumable handoffs, secret redaction.
- gastownhall/beads — atomic claims, leases, heartbeats, reclaiming abandoned work, clear ownership.

## Adopted principles

### 1. Current-work leases

JoshMemory should let an agent claim a project/work item for a bounded TTL, heartbeat it while active, release it deliberately, and let another agent reclaim it after expiry. This prevents two fresh agents from unknowingly doing the same work.

A lease is coordination only. It does not make the holder's claims authoritative and never outranks live Git or external verification.

### 2. Trust separate from factual status

`CURRENT`, `OBSERVED`, `HISTORICAL`, etc. describe the relationship of a fact to time/evidence. They should not also mean "a human approved this".

JoshMemory therefore adds a separate trust overlay with four levels:

- `UNTRUSTED` — agent/imported proposal; useful context, not endorsed.
- `VERIFIED` — checked against a cited source/evidence.
- `APPROVED` — explicitly accepted by an operator/reviewer.
- `SYSTEM` — deterministic system-produced state.

Agents may propose trust changes but the normal agent-facing path does not silently self-promote memory.

### 3. Append-only work journal

Important session events can be recorded as append-only entries. The journal is history, not a transcript dump. Store concise redacted events such as commits, tests, build/deploy results, blockers and major decisions.

The latest handoff remains the compact resume surface; the journal is the durable trail behind it.

### 4. Resume brief

A fresh agent should not have to assemble five APIs by hand. JoshMemory should be able to return one compact resume brief containing:

- latest handoff;
- live-state discrepancy warning;
- active lease/current owner;
- recent work journal entries;
- trusted/approved memory where relevant;
- explicit next action.

### 5. Preserve JoshMemory's authority model

None of the imported ideas changes this ordering:

1. live Git/API/machine evidence;
2. independent verification evidence;
3. trusted JoshMemory records;
4. ordinary handoffs/facts/history;
5. older transcripts/inference.

Memory improves continuity. It does not manufacture truth.

## Deliberately not adopted

- A large vector/graph stack merely because other memory products have one. JoshMemory already has FTS/history and should add retrieval complexity only when evidence shows it is needed.
- A new database service when SQLite + the existing append-only private GitHub store is sufficient.
- Agent self-certification as "verified".
- Permanent claims with no expiry/recovery path.
- Copying third-party implementation code where the same behaviour can be implemented simply and independently.
