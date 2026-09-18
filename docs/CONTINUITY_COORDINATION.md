# Continuity coordination and memory governance

JoshMemory 0.3 adds a small coordination/governance layer inspired by useful patterns found in open-source coding-agent memory tools. The implementation is JoshMemory-native and preserves the existing authority rule: **live Git/API/machine evidence outranks memory**.

## What was added

### Bounded work leases

Agents can claim a named work item, heartbeat it, release it, and allow expired work to be reclaimed. The purpose is simple: a fresh agent should be able to see that another agent is already repairing `DCSPD:ci` instead of repeating the same work.

Leases are coordination metadata, not truth or authorization. Holding a lease does not make an agent's claims verified.

Local SQLite claims are serialized with `BEGIN IMMEDIATE`. The GitHub append-only cloud store cannot truthfully promise database row locking, so cloud acquisition is optimistic: append, re-read, and accept only the deterministically elected active lease.

Example:

```bash
joshmemory-continuity claim DCSPD --owner codex --work-key ci --ttl 900 \
joshmemory-continuity heartbeat DCSPD --owner codex --work-key ci \
joshmemory-continuity release DCSPD --owner codex --work-key ci
```

### Append-only work journal

The journal stores short, redacted engineering events rather than full transcripts. Supported event families include commits, tests, builds, deployments, blockers, decisions, bugs and file-level milestones.

```bash
joshmemory-continuity journal-add DCSPD TEST "Playwright smoke passed" \
  --details-json '{"run":"35277769767"}'

joshmemory-continuity journal DCSPD
```

This gives future agents a durable trail behind the compact handoff without turning JoshMemory into a transcript dump.

### Trust overlay

Fact status and trust are separate concepts.

A fact can be `CURRENT` yet still be untrusted. Trust levels are:

- `UNTRUSTED`: useful agent/import context, not endorsed;
- `VERIFIED`: checked against cited evidence;
- `APPROVED`: explicitly accepted by an operator/reviewer;
- `SYSTEM`: deterministic system-produced state.

The agent-facing continuity MCP server deliberately has **no trust-promotion tool**. Promotion is an operator CLI action. The code additionally rejects an `actor_kind=agent` attempt to set anything above `UNTRUSTED`.

```bash
joshmemory-continuity trust FACT_ID VERIFIED \
  --actor Josh --actor-kind human \
  --source-ref https://github.com/owner/repo/actions/runs/123
```

This is governance, not an authentication boundary: a shell-capable process can impersonate CLI arguments. Independent evidence and live state still provide the real authority.

### One-command resume brief

```bash
joshmemory-continuity resume DCSPD \
  --canonical-repo github.com/joshualparris/DCSPD \
  --agent codex --work-key ci
```

The brief combines the existing handoff/live-state reconciliation with the active lease and recent work journal. If another agent owns the work key, the result contains an explicit collision warning.

## MCP surface

Run:

```bash
joshmemory-continuity-mcp
```

Agent-facing tools are intentionally narrow:

- `resume_brief`
- `claim_work`
- `heartbeat_work`
- `release_work`
- `active_lease`
- `list_leases`
- `append_work_event`
- `recent_work_events`
- `memory_trust`
- `trusted_fact_search`

There is intentionally no `promote_trust` MCP tool.

## Storage

The new records use an append-only record model for both local and GitHub-backed operation:

- local: `continuity_records` in the existing SQLite database;
- GitHub cloud: record families beneath the existing private `joshmemory-cloud/v1/` root.

The optional legacy HTTP-central deployment does not yet expose the new coordination record families. JoshMemory fails explicitly instead of silently creating split-brain local coordination data. The default private-GitHub cloud mode and local mode are supported.

## Why the existing handoff API was not rewritten

JoshMemory already has structured handoffs, automatic Claude session-end fallback, Git snapshots, supersession, secret redaction and live-state discrepancy detection. Replacing that working API merely to put handoffs in a differently named directory would add migration complexity without improving user behaviour.

The new layer therefore builds around the existing handoff contract rather than duplicating it. If a dedicated physical handoff record family later provides a measurable benefit, it can be introduced behind the existing API.

## External design provenance

The concepts were informed by, but the implementation was not copied from:

- Threesided-Studios/Agent-Memory (Apache-2.0)
- vartiainen1/agent-memory (MIT)
- rosehgal/handoff (MIT)
- gastownhall/beads (MIT)

The useful ideas were adapted to JoshMemory's existing evidence hierarchy and YAGNI constraints.
