# JoshMemory

JoshMemory is a local index over Codex rollout JSONL files. The JSONL files
remain the canonical archive; JoshMemory stores searchable redacted text,
metadata, and source references in SQLite FTS5.

Default paths:

- Source: `~/.codex/sessions/**/*.jsonl`
- Index: `~/.local/share/joshmemory/memory.sqlite`

## Commands

```bash
python3 -m joshmemory.cli index
python3 -m joshmemory.cli search FedoraCrashDoctor
python3 -m joshmemory.cli get-session 01a03ba2-4826-79a2-af44-443795b01b31
python3 -m joshmemory.cli project-history FedoraCrashDoctor
python3 -m joshmemory.cli recent-work
python3 -m joshmemory.cli import-github-evidence joshmemory_github_evidence_ledger_2026-08-27.jsonl
python3 -m joshmemory.cli github-evidence --project FedoraCrashDoctor
python3 -m joshmemory.cli import-chatgpt /path/to/chatgpt-export --dry-run
python3 -m joshmemory.cli import-chatgpt /path/to/chatgpt-export
python3 -m joshmemory.cli historical-search "what were we coding in March 2023?"
python3 -m joshmemory.cli earliest-activity coding
```

## MCP

```bash
python3 -m joshmemory.server
```

Tools:

- `search_sessions`
- `get_session`
- `project_history`
- `recent_work`
- `github_evidence`
- `historical_search`
- `earliest_activity`
- `historical_timeline`

GitHub evidence is indexed separately from Codex transcripts. The ledger JSONL
remains the source of truth, while SQLite stores redacted searchable text and
references back to each ledger line. Exact and reconstructed URLs retain their
original provenance and exactness labels.

ChatGPT exports are imported from `conversations.json`. Raw exported messages
are stored with their original IDs, parent links, timestamps, roles, model
metadata, source filename, and `historical_chatgpt_export` provenance. The
active branch is reconstructed by following `current_node` parents; other
messages remain searchable with `branch_status=alternate` rather than being
presented as part of the active linear transcript. Imports are repeatable by
conversation/message IDs and do not delete existing seed/backfill evidence.

Historical retrieval is deterministic and offline. It parses date ranges,
chronological intent, and activity concepts such as coding and diagnostics,
then returns evidence, coverage metadata, provenance, and caveats. Earliest
activity means earliest qualifying evidence in the available corpus, not first
activity ever.

