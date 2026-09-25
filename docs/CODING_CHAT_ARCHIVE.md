# Dated coding-chat archive

Last updated: 18 September 2026 (Australia/Sydney)

## Goal

JoshMemory should retain a chat-level index of **every ChatGPT conversation about coding or technical software work**, with the conversation's specific date and, when the source provides them, its exact ChatGPT title and conversation ID.

This archive is separate from project facts and handoffs:

- project facts answer **what matters now / what happened to this project**;
- handoffs answer **where should the next agent resume**;
- the coding-chat archive answers **which coding conversations happened, and when**.

Do not replace chat-level history with a project summary.

## Evidence levels

Every archived chat must make its provenance explicit.

### Raw-exact

`source = historical_chatgpt_export`

These records come from an imported ChatGPT `conversations.json`. They preserve the original:

- conversation ID;
- title;
- created/updated timestamps;
- message count;
- branch-aware raw-message source in the local JoshMemory database.

Cloud sync stores only a compact redacted chat index. It does **not** upload the full transcript.

### Reconstructed

`source = reconstructed_post_export_history`

These records are recovered from later ChatGPT/account history, summaries, files or project evidence when a newer raw export is not available. They may preserve an exact recovered timestamp, but their title can be reconstructed. They must never be described as raw or exhaustive.

## Known source coverage

A genuine **22 September 2025 ChatGPT export** was previously imported successfully into JoshMemory:

- 4,660 conversations;
- 118,433 messages;
- 123,093 raw ChatGPT events after import;
- exact conversation IDs, timestamps, titles and branch metadata retained locally;
- repeat import was idempotent;
- SQLite/FTS integrity was verified.

The earliest currently substantiated software-development conversation in that raw archive is:

- **2 March 2023 10:04:20 UTC**
- **Website HTML Code Structure**
- conversation ID `3fc14175-2f02-409e-9328-094612423c6e`
- first user prompt: `Write the HTML code for a complex website`

The raw 22 September 2025 archive/database is **not mounted in the current 18 September 2026 ChatGPT session**, so the complete coding subset of those 4,660 conversations has not yet been copied into private GitHub cloud storage.

## Current private-cloud seed

The private JoshMemory store under `joshmemory-cloud/v1/coding_chats/` currently contains:

- the exact raw 2 March 2023 anchor above;
- **97 reconstructed dated coding-chat records** from 24 September 2025 through 17 September 2026.

These reconstructed records materially improve retrieval but **do not prove exhaustive post-export account coverage**.

## Sync commands

On a machine containing the raw export:

```bash
joshmemory import-chatgpt "/path/to/ChatGPT export/conversations.json"
joshmemory sync-coding-chats
```

If the export is already imported into the selected database:

```bash
joshmemory --db /path/to/memory.sqlite sync-coding-chats
```

Search locally:

```bash
joshmemory coding-chats "ForgeGrid"
joshmemory coding-chats --start-date 2023-03-01 --end-date 2023-03-31
```

Equivalent MCP tools are:

- `coding_chat_search`
- `coding_chat_coverage`
- `sync_coding_chat_archive`

## What cloud sync stores

Each raw-exact chat record contains a compact redacted index such as:

```json
{
  "conversation_id": "...",
  "title": "...",
  "created_at": "2023-03-02T10:04:20Z",
  "updated_at": "...",
  "message_count": 12,
  "first_user_message": "redacted/truncated preview",
  "matched_terms": ["html", "code"],
  "source": "historical_chatgpt_export",
  "classification_version": 1
}
```

The full raw message text remains in the local historical JoshMemory database/export rather than being copied into GitHub.

## Coding classification

The first classifier intentionally errs on the inclusive side for Josh's archive. It considers:

- technical titles;
- explicit coding/build/fix/deploy/test actions;
- code syntax;
- software-development terms such as languages, frameworks, Git/GitHub, CI, deployment, testing, databases, AI coding, ForgeGrid and DadLAN engineering.

False positives should be fixed by classifier-version changes rather than silently deleting historical source data.

## Literal completeness gate

Do **not** say “every coding chat ever is archived” until all of these are true:

1. The oldest available raw ChatGPT export is imported and `sync-coding-chats` completes successfully.
2. `coding_chat_coverage` returns the exact coding subset produced by that raw export.
3. A newest available ChatGPT export covering the period after 22 September 2025 is imported.
4. `sync-coding-chats` is rerun after the newer export.
5. The latest raw-export conversation date reaches the intended account-history cutoff.
6. Reconstructed-only periods are either replaced by raw-exact records or explicitly accepted as an unavoidable source gap.
7. Duplicate conversation IDs are deduplicated and raw evidence outranks reconstructed duplicates.
8. CI is green for the classifier/cloud sync/search code.
9. No raw transcript dump, token, password, API key, personal health export or unrelated private-life material is copied into the public JoshMemory repository.

Until that gate passes, wording must be:

> “Chat-level coding history is partially raw-exact and partially reconstructed; coverage is improving but not yet proven exhaustive.”

## Fresh-agent use

A fresh coding agent should normally:

1. call `resume` / `resume_brief` for the current project;
2. use `coding_chat_search` when exact historical chat chronology matters;
3. use the project facts/master handoff for distilled durable context;
4. verify current Git/CI/deployment/machine state before making changes.

A fresh agent should **not** replay hundreds of historical chats just to resume routine work. The chat archive exists for provenance, chronology, gap recovery and decisions that were not captured in later handoffs.

## Privacy boundary

This is a coding archive, not a whole-life transcript mirror.

Do not cloud-sync:

- unrelated family/marriage/health/finance conversations;
- raw personal health exports;
- credentials/secrets;
- full transcript bodies merely for completeness.

The goal is complete **coding-chat provenance**, with minimal necessary redacted cloud metadata and deeper raw text retained only in the local historical source database.


## Reconstructed technical conversation — 9 September 2026

- **Title:** ProBook Antigravity verification, accountability and deployment hardening
- **Date:** 9 September 2026
- **Archived:** 25 September 2026
- **Source:** reconstructed_post_export_history
- **Coverage:** full technical conversation arc preserved in a dedicated reconstructed record, including JoshMemory/ForgeGrid/Git authentication, AgentCheck/AgentWitness, LLMAccountability, credential-exposure response, and iterative `master_deploy` hardening.
- **Record:** [PROBOOK_ANTIGRAVITY_VERIFICATION_CHAT_2026-09-09.md](./PROBOOK_ANTIGRAVITY_VERIFICATION_CHAT_2026-09-09.md)
- **Important:** actual credential values are intentionally excluded; earlier AGY credentials referenced in the conversation must remain treated as compromised.
