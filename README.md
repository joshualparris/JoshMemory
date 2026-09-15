# JoshMemory

JoshMemory is an evidence and project-memory index for development history. It keeps searchable, redacted representations of development history in SQLite while preserving the original source material as the authority.

It can run fully local/offline, or use one authenticated central handoff database so Claude Code, Codex and Antigravity sessions on different computers can pause and resume the same GitHub project.

It currently works with:

- Codex rollout JSONL sessions
- ChatGPT `conversations.json` exports
- GitHub evidence JSONL imports
- seed and app-link imports
- durable project facts with provenance and supersession
- accountability references to external verification systems
- live local Git project state via a cross-platform auditor
- structured session handoffs/bookmarks
- authenticated central handoff storage across machines

Raw transcripts and imported evidence remain the source of truth; JoshMemory stores searchable text, metadata, provenance, relationships, and references back to those sources.

## Requirements and install

- Python 3.11+

```bash
pip install -e .
```

This installs the `joshmemory` and `joshmemory-central` commands. You can also run the CLI as `python -m joshmemory.cli`.

## Default paths

- Codex sessions: `~/.codex/sessions/**/*.jsonl`
- SQLite index: `~/.local/share/joshmemory/memory.sqlite`
- Local projects: `JOSHMEMORY_PROJECTS_DIR` when set; otherwise `C:\dev` on Windows when available, or `~/dev`

## Central pause/resume database

JoshMemory handoffs can be centralised without putting a live SQLite file on SMB/NFS or committing private session state to GitHub.

The central machine owns the SQLite database on its local disk and exposes a small authenticated HTTP API. Every other machine keeps doing its live Git checks locally, but handoff reads/writes go to the central service.

This means a handoff saved from `~/dev/MyApp` on Linux can be resumed from `C:\dev\MyApp` on Windows when both clones have the same canonical Git remote. Checkout paths are used as a preference, not as a cross-machine identity barrier.

### Central machine

Use a machine reachable only over a trusted network such as Tailscale. Do not expose this HTTP service directly to the public internet.

```bash
cd ~/dev/JoshMemory
python -m venv .venv
source .venv/bin/activate
pip install -e .

export JOSHMEMORY_BIND="127.0.0.1"   # or the machine's Tailscale IPv4 address
export JOSHMEMORY_PORT="8765"
export JOSHMEMORY_TOKEN="replace-with-a-long-random-secret"
joshmemory-central
```

If the service binds to anything other than loopback, `JOSHMEMORY_TOKEN` is mandatory. The central SQLite file remains at `~/.local/share/joshmemory/memory.sqlite` unless `JOSHMEMORY_HOME` or `--db` changes it.

Health check:

```bash
curl http://127.0.0.1:8765/health
```

### Every development machine

Set the same service URL/token before starting Claude Code, Codex, Antigravity or the JoshMemory MCP server:

Linux/macOS:

```bash
export JOSHMEMORY_REMOTE_URL="http://100.x.y.z:8765"
export JOSHMEMORY_TOKEN="replace-with-the-same-secret"
```

PowerShell:

```powershell
$env:JOSHMEMORY_REMOTE_URL = "http://100.x.y.z:8765"
$env:JOSHMEMORY_TOKEN = "replace-with-the-same-secret"
```

Once `JOSHMEMORY_REMOTE_URL` is configured, handoff operations do **not** silently fall back to local storage. A central outage is surfaced as an error so the fleet cannot accidentally split into divergent bookmark databases.

Existing Claude SessionStart/SessionEnd hooks and MCP `save_handoff`, `get_project_context` and `list_handoffs` calls automatically use the central handoff store because they all go through the same handoff layer.

## CLI

### Index and session history

```bash
joshmemory index
joshmemory search FedoraCrashDoctor
joshmemory get-session 01a03ba2-4826-79a2-af44-443795b01b31
joshmemory project-history FedoraCrashDoctor
joshmemory recent-work
```

### Import evidence

```bash
joshmemory import-seed /path/to/seed.json
joshmemory import-app-links /path/to/app-links.json
joshmemory import-github-evidence joshmemory_github_evidence_ledger_2026-08-27.jsonl
joshmemory github-evidence --project FedoraCrashDoctor
joshmemory import-chatgpt /path/to/chatgpt-export --dry-run
joshmemory import-chatgpt /path/to/chatgpt-export
```

ChatGPT imports preserve original message IDs, parent links, timestamps, roles, model metadata, source filenames, and provenance. The active branch is reconstructed by following `current_node`; alternate-branch messages remain searchable but are not presented as part of the active linear transcript. Re-importing the same conversation/message IDs is repeatable and does not delete existing evidence.

### Historical retrieval

```bash
joshmemory historical-search "what were we coding in March 2023?"
joshmemory earliest-activity coding
```

Historical retrieval is deterministic and offline. It parses date ranges, chronological intent, and activity concepts, then returns evidence with coverage, provenance, and caveats. “Earliest activity” means the earliest qualifying evidence in the available corpus, not the first activity ever.

### Durable project facts

```bash
joshmemory add-fact \
  --project AgentWitness \
  --subject deployment \
  --fact "Windows verifier installed" \
  --status VERIFIED \
  --source-type receipt \
  --source-ref AGY-20260827-example

joshmemory search-facts verifier --project AgentWitness
joshmemory search-facts verifier --project AgentWitness --all
```

Fact statuses are `VERIFIED`, `OBSERVED`, `HISTORICAL`, `INFERRED`, `STALE`, `DISPROVEN`, `UNKNOWN`, and `CURRENT`. `VERIFIED` facts require a `source_ref`. Searches return active facts by default; `--all` also includes superseded records.

A newer fact can explicitly supersede an older fact. Supersession is validated to stay within the same project, subject, machine and repository identity, and the older record is retained as inactive history rather than deleted.

### Accountability references

```bash
joshmemory add-accountability \
  --project AgentWitness \
  --claim-summary "Windows verification requirement" \
  --source-system AgentWitness \
  --source-id receipt-123 \
  --verdict EVIDENCED

joshmemory search-accountability verification --project AgentWitness
joshmemory search-accountability verification --project AgentWitness --all
```

Accountability verdicts are `SATISFIED`, `REJECTED`, or `EVIDENCED`. These records point to external verification evidence; JoshMemory does not manufacture verification by storing a claim. Superseded references remain available as inactive history.

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

`project_status` combines current local project-auditor state with recent indexed Codex work and GitHub evidence. The built-in auditor scans local Git repositories cross-platform and can fall back to `C:\dev` or `~/dev`; `JOSHMEMORY_PROJECTS_DIR` can override the project root.

## Provenance model

JoshMemory is an index and evidence-organising layer, not an authority that turns assertions into facts. Keep these distinctions intact:

- original transcripts/evidence remain canonical
- redacted index text is for retrieval
- live auditor state is current observation, not historical proof
- imported GitHub records keep source references and URL provenance
- `VERIFIED` project facts require an external/source reference
- accountability records reference another system’s result rather than replacing that system
- a session handoff is resume context, not proof that the repository still matches it
- live local Git state still outranks a stored handoff when they disagree
