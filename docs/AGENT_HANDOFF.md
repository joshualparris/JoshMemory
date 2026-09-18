# JoshMemory agent handoff

This repository is public source code. Shared JoshMemory payloads are private
and live in `joshualparris/JoshDashboard4` under `joshmemory-cloud/v1/`.
Never commit raw transcripts, ChatGPT exports, SQLite databases, generated
`docs/data/`, personal values, credentials, or private cloud payloads.

## Current state

- `main` is the canonical public source branch.
- The SQLite migration repair is merged in commit `043a7ca` (PR #2).
- The local database was migrated to schema version 3 without data loss.
- The legacy source table `project_facts_old` is intentionally retained as a
  recovery source until a later, separately verified cleanup decision.
- A production backup exists at
  `/home/josh/.local/share/joshmemory/backups/20260918-101107/memory.sqlite`.

The migration repaired a partially migrated version-0 database by normalising
legacy status values, copying both current and legacy fact rows by ID, and
preserving repeated observations with `recorded_at` in the database uniqueness
constraint. The application idempotency key remains unchanged.

## Verification baseline

The migrated local database contained 97 current facts, 97 retained legacy
facts, 5,752 sessions, 134,744 events, and 27 accountability references.
SQLite integrity and foreign-key checks passed. The local suite passed with
`JOSHMEMORY_GITHUB_STORE_AUTO=0`; this disables unavailable external cloud
writes while preserving the local and mocked test coverage. GitHub Actions for
the migration PR passed Python 3.11, 3.12, 3.13, and the cloud-container job.

Run the local suite with:

```bash
JOSHMEMORY_GITHUB_STORE_AUTO=0 .venv/bin/pytest -q
```

## Public export safety

`tools/build_web_data.py` is fail-closed and requires the ignored local file
`tools/public_export_filter.local.json`. It applies the generic secret
redactor and configured thread/value exclusions before generating any static
export. Keep the real filter local. The scrubbed raw exports and family-
specific helper scripts are deliberately absent from public `main`.

## External actions still requiring account access

The Vercel connector available to the agent is read-only. Check and manually
disable or protect public deployments that contain private/family/business
content, including the known Elias, Sylvie, HugCoach, and Parris Tech Services
URLs. Wix publishing access was not available; unpublish or edit the obsolete
Parris Tech Services site at its source. GitHub profile metadata requires the
`user` OAuth scope before it can be edited safely.

Do not force-push old JoshMemory history or make contained private repositories
public again. Recheck live URLs after any deployment change.
