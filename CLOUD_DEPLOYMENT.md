# JoshMemory cloud deployment

## Current default: private GitHub cloud store

JoshMemory's shared pause/resume state does **not** require AVANCE-WS7, a home PC, a NAS or another always-on workstation.

The zero-extra-account default is an append-only private GitHub store:

```text
Claude Code / Codex / Antigravity / JoshMemory MCP
                    |
                    | existing GitHub auth
                    v
       joshualparris/JoshDashboard4 (private)
                    |
          joshmemory-cloud/v1/
                    |
      handoffs + facts + evidence refs
```

GitHub remains authoritative for code state. JoshMemory is historical/project continuity. Every resumed session must reconcile the saved handoff with live Git before continuing.

## Why this is the default

The earlier AVANCE-WS7 central-service design worked technically but made shared memory unavailable whenever that machine was off. A hosted container such as Railway also works, but introducing a new provider requires account/connection setup.

The GitHub-backed mode uses infrastructure the development workflow already depends on, stays reachable independently of any workstation and keeps shared memory in an existing private repository rather than the public JoshMemory source repository.

## Automatic authentication

No JoshMemory-specific login flow is required when a development machine already has a usable GitHub credential.

JoshMemory checks, in order:

1. `JOSHMEMORY_GITHUB_TOKEN`
2. `GH_TOKEN`
3. `GITHUB_TOKEN`
4. `gh auth token`
5. the configured Git credential helper for `github.com`

Credential-helper access is non-interactive (`GIT_TERMINAL_PROMPT=0`). Credentials are used in memory only; JoshMemory does not write them into its database or repositories.

The private backing repository defaults are:

```text
JOSHMEMORY_GITHUB_STORE_REPO=joshualparris/JoshDashboard4
JOSHMEMORY_GITHUB_STORE_BRANCH=main
JOSHMEMORY_GITHUB_STORE_ROOT=joshmemory-cloud/v1
```

Those variables are optional overrides; the values above are built in for this deployment.

To deliberately disable automatic GitHub shared storage and stay local:

```text
JOSHMEMORY_GITHUB_STORE_AUTO=0
```

## Stored data

The cloud store currently centralises the durable state needed to pause and resume development work:

- structured handoffs/bookmarks;
- durable project facts;
- accountability references;
- provenance and supersession for those record types.

Each write is a new UUID-named JSON file. Older records are retained. Supersession is represented by references rather than destructive in-place edits.

The following are **not** silently uploaded just because cloud mode is available:

- raw Codex JSONL session corpora;
- full ChatGPT exports;
- local machine observations;
- the complete historical SQLite index;
- repository source code (which remains in its own canonical repo).

## Cross-machine resume

Canonical Git repository identity is the cross-machine key. A handoff written from:

```text
/home/josh/dev/MyApp
```

can be resumed from:

```text
C:\dev\MyApp
```

when both checkouts identify the same canonical repository. Checkout paths are ranking preferences, not a global identity barrier.

When a handoff's branch or HEAD disagrees with the live repository, the live state wins and the discrepancy must be surfaced.

## Existing HTTP central service

The authenticated HTTP service remains supported. If `JOSHMEMORY_REMOTE_URL` is explicitly configured, it takes precedence over the automatic GitHub backend.

Clients use:

```text
JOSHMEMORY_REMOTE_URL=https://<central-service>
JOSHMEMORY_TOKEN=<shared bearer token>
```

There is intentionally no silent local fallback after an explicit HTTP backend has been selected: an outage is reported instead of splitting the fleet into divergent stores.

## Optional container/Railway deployment

The repository still includes a `Dockerfile` and the `joshmemory-central` HTTP service for environments where a conventional web service plus persistent volume is preferred.

For that mode:

```text
joshmemory-central --host 0.0.0.0 --port $PORT --db /data/memory.sqlite
```

Mount persistent storage at `/data` and set `JOSHMEMORY_TOKEN`. Do not place the live SQLite database on ephemeral container storage.

This mode is optional. It is no longer required for the user's normal cross-machine continuity path.

## Optional self-hosted Fedora/AVANCE mode

The previous Fedora installer also remains available:

```bash
cd ~/dev/JoshMemory
bash deploy/install-central-fedora.sh
```

That topology can be useful on a trusted local network, but AVANCE-WS7 is now only an optional client/coordinator. Turning it off must not take the GitHub-backed shared memory offline.

## Security

- Keep `joshualparris/JoshDashboard4` private.
- Never commit credentials or tokens.
- Keep redaction enabled before persistence.
- Do not use SMB/NFS-shared writable SQLite as the central store.
- Treat handoffs as context, never as authority over live Git/API/machine state.
- `VERIFIED` project facts still require a source reference.
- Verification systems such as AgentCheck/AgentWitness/LLMAccountability remain external evidence producers; JoshMemory stores references to their evidence rather than inventing it.

## Historical data migration

Existing per-machine SQLite databases are **not automatically merged** into the GitHub store. This is deliberate to avoid silently uploading an old private corpus.

A future explicit migration/import command should select only the handoffs/facts worth making shared, preserve provenance and redact them before upload. Until then, the old local databases remain historical/local sources.

## More context

See `docs/CLOUD_CONTINUITY_HISTORY.md` for the full decision history covering local SQLite, cross-platform auditing, AVANCE/ForgeGrid/Action1 boundaries, the HTTP central service, the cloud requirement and the final zero-touch GitHub-backed design.
