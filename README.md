# JoshMemory

JoshMemory is an evidence-aware project continuity system for AI-assisted software development. It helps Claude Code, Codex, Antigravity and other coding workflows resume a project from durable, redacted context while keeping **live Git/API/machine evidence authoritative**.

The default shared-memory design no longer depends on AVANCE-WS7, a home PC or any other workstation remaining powered on. When an existing GitHub credential is available, JoshMemory automatically uses a private GitHub repository as the always-available backing store for handoffs, durable project facts and accountability references.

## Current architecture

```text
Claude / Codex / Antigravity / JoshMemory MCP
             on any development computer
                         |
                         | existing GitHub authentication
                         v
            private GitHub cloud store
        joshualparris/JoshDashboard4 / main
             joshmemory-cloud/v1/
                         |
             append-only JSON records

Canonical GitHub project + live checkout
             = current code truth
```

The public `joshualparris/JoshMemory` repository contains the software. Shared memory payloads live in the existing **private** `joshualparris/JoshDashboard4` repository and are not exposed through this public source repository.

## What JoshMemory stores

JoshMemory can work with:

- Codex rollout JSONL sessions;
- ChatGPT `conversations.json` exports;
- GitHub evidence JSONL imports;
- seed and app-link imports;
- durable project facts with provenance and supersession;
- accountability references to external verification systems;
- live local Git project state through a cross-platform auditor;
- structured session handoffs/bookmarks;
- shared handoffs/facts/accountability records through private GitHub storage;
- an optional authenticated central HTTP service for environments that prefer a conventional server.

Raw transcripts and imported evidence remain source material. JoshMemory stores searchable text, metadata, provenance, relationships and references back to those sources. It does not turn an assertion into truth merely because it was remembered.

## The authority rule

A stored handoff is historical context to verify, not current truth.

When sources disagree, prefer:

1. live repository/API/machine evidence;
2. independently generated verification evidence;
3. durable JoshMemory facts and handoffs;
4. older transcripts or inferred context.

For example, if a handoff records one HEAD commit but the checked-out repository now has another, the live repository wins and the discrepancy is reported.

## 2026 portfolio onboarding

For work anywhere in Josh's 2026 coding ecosystem, first read [`docs/CODING_2026_MASTER_HANDOFF.md`](docs/CODING_2026_MASTER_HANDOFF.md) and load/search the shared JoshMemory project **`JoshCoding2026`**. The master handoff reconciles the major 2026 projects, DadLAN/ForgeGrid/local-LLM architecture, engineering-quality model, CRAP4All work, podcast rollout, security/remediation work, CI/deployment lessons, current permission caveats and explicit do-not-redo guidance.

It is deliberately a continuity map rather than a substitute for observation: after reading it, verify the target repository's live Git/CI/deployment/machine state before changing anything.

## Requirements

- Python 3.11+
- GitHub authentication if you want the zero-touch shared cloud store

Install:

```bash
pip install -e .
```

This installs `joshmemory` and `joshmemory-central`. The CLI can also be run with:

```bash
python -m joshmemory.cli
```

## Zero-touch cloud shared memory

If the development computer already has GitHub access, JoshMemory looks for a usable credential in this order:

1. `JOSHMEMORY_GITHUB_TOKEN`
2. `GH_TOKEN`
3. `GITHUB_TOKEN`
4. `gh auth token`
5. the configured Git credential helper for `github.com`

It never stores the discovered credential in JoshMemory or commits it to GitHub.

Built-in backing-store defaults for this deployment are:

```text
repository: joshualparris/JoshDashboard4   # private
branch:     main
root:       joshmemory-cloud/v1
```

No AVANCE process, NAS share or always-on local service is required for that mode.

Optional overrides:

```bash
export JOSHMEMORY_GITHUB_STORE_REPO="owner/private-memory-repo"
export JOSHMEMORY_GITHUB_STORE_BRANCH="main"
export JOSHMEMORY_GITHUB_STORE_ROOT="joshmemory-cloud/v1"
```

To deliberately disable automatic GitHub storage and keep the shared operations local:

```bash
export JOSHMEMORY_GITHUB_STORE_AUTO=0
```

### What is shared

The GitHub cloud store centralises the state needed for development pause/resume:

- structured handoffs/bookmarks;
- durable project facts;
- accountability references;
- provenance and supersession for those records.

Writes are append-only UUID-named JSON records. Previous records remain available as history; active state is derived from supersession references.

### What is not silently uploaded

Cloud mode does **not** automatically upload:

- the complete historical SQLite database;
- raw Codex session files;
- complete ChatGPT exports;
- local machine observations;
- other repositories' source code.

This solves shared project continuity without turning the backing repository into an unfiltered transcript dump.

## Cross-machine handoffs

Canonical Git repository identity is the main cross-machine key. A handoff saved from:

```text
~/dev/MyApp
```

can be resumed from:

```text
C:\dev\MyApp
```

when both clones correspond to the same canonical repository. The local checkout path is a ranking preference rather than a global identity barrier.

A typical startup flow is:

1. identify the local project and canonical repository;
2. load the latest relevant handoff;
3. audit live branch/HEAD/dirty state;
4. surface discrepancies;
5. continue from the first still-valid next action;
6. save a new handoff at a meaningful checkpoint, blocker or session end.

## Default local paths

- Codex sessions: `~/.codex/sessions/**/*.jsonl`
- local SQLite index: `~/.local/share/joshmemory/memory.sqlite`
- projects: `JOSHMEMORY_PROJECTS_DIR` when set; otherwise `C:\dev` on Windows when available, or `~/dev`

The local SQLite index remains useful for historical/offline search. It is not the cross-machine merge object.

## Optional HTTP central service

JoshMemory still supports the authenticated HTTP service added for traditional central-server deployments.

If `JOSHMEMORY_REMOTE_URL` is configured, it takes precedence over automatic GitHub storage:

```bash
export JOSHMEMORY_REMOTE_URL="https://your-joshmemory-service"
export JOSHMEMORY_TOKEN="your-private-bearer-token"
```

Once an explicit HTTP remote is selected, failures are surfaced rather than silently falling back to a local database and creating split-brain shared memory.

The included Dockerfile and Fedora deployment helpers remain available. They are optional; AVANCE-WS7 is not required for cloud continuity.

See [`CLOUD_DEPLOYMENT.md`](CLOUD_DEPLOYMENT.md) for details.

## MCP server

Start the stdio MCP server with:

```bash
python -m joshmemory.server
```

Current tools include:

- `search_sessions`
- `get_session`
- `project_history`
- `recent_work`
- `github_evidence`
- `project_status`
- `historical_search`
- `earliest_activity`
- `historical_timeline`
- `project_fact_search`
- `accountability_search`
- `save_handoff`
- `get_project_context`
- `list_handoffs`

Existing Claude SessionStart/SessionEnd/Stop integration uses the same storage layer, so it benefits automatically from whichever backend is selected.

## CLI examples

Index and search local historical material:

```bash
joshmemory index
joshmemory search FedoraCrashDoctor
joshmemory project-history FedoraCrashDoctor
joshmemory recent-work
```

Import evidence:

```bash
joshmemory import-seed /path/to/seed.json
joshmemory import-app-links /path/to/app-links.json
joshmemory import-github-evidence evidence.jsonl
joshmemory import-chatgpt /path/to/chatgpt-export --dry-run
joshmemory import-chatgpt /path/to/chatgpt-export
```

Historical retrieval:

```bash
joshmemory historical-search "what were we coding in March 2023?"
joshmemory earliest-activity coding
```

Add/search durable facts:

```bash
joshmemory add-fact \
  --project AgentWitness \
  --subject deployment \
  --fact "Windows verifier installed" \
  --status VERIFIED \
  --source-type receipt \
  --source-ref AGY-20260827-example

joshmemory search-facts verifier --project AgentWitness
```

Fact statuses are `VERIFIED`, `OBSERVED`, `HISTORICAL`, `INFERRED`, `STALE`, `DISPROVEN`, `UNKNOWN`, and `CURRENT`. `VERIFIED` requires an external/source reference.

Accountability references:

```bash
joshmemory add-accountability \
  --project AgentWitness \
  --claim-summary "Windows verification requirement" \
  --source-system AgentWitness \
  --source-id receipt-123 \
  --verdict EVIDENCED

joshmemory search-accountability verification --project AgentWitness
```

Accountability verdicts are `SATISFIED`, `REJECTED`, or `EVIDENCED`. JoshMemory points to external verification; it does not replace it.

## Fleet/system boundaries

For the wider development stack:

- GitHub = durable code truth;
- JoshMemory = shared context/continuity/provenance;
- ForgeGrid = fleet execution/orchestration;
- AVANCE-WS7 / DadLAN = optional local control plane;
- Action1 = bootstrap/recovery/admin side channel;
- AgentCheck / AgentWitness = verification evidence;
- LLMAccountability = accountability/policy evidence;
- AgentCouncil = reasoning/review coordination where used.

None of those roles allows stale memory to overrule live repository or machine state.

## Safety and provenance rules

- Never commit GitHub tokens, bearer tokens, passwords, cookies or other secrets.
- Keep the backing memory repository private.
- Redact before persistence.
- Do not put a live writable SQLite file on SMB/NFS.
- Preserve provenance and superseded history rather than silently rewriting it.
- Keep unknown facts unknown.
- A session handoff is a bookmark, not proof that the repository still matches it.
- `VERIFIED` claims require a source reference.

## History and roadmap

The architecture did not start in the cloud. It evolved through local SQLite portability, cross-platform auditing, verification/accountability separation, AVANCE-hosted centralisation and finally the requirement that no particular PC be an uptime dependency.

See [`docs/CLOUD_CONTINUITY_HISTORY.md`](docs/CLOUD_CONTINUITY_HISTORY.md) for the consolidated history of those decisions and the remaining roadmap, including real multi-machine proof, leases/current-work coordination, canonical-repo identity improvements, cloud-store indexing/caching and selective migration of useful historical records.
