# JoshMemory cloud deployment

## Goal

Run JoshMemory somewhere that is reachable from every development machine without depending on AVANCE-WS7, a home PC, or any other client machine being powered on.

The recommended deployment is a small Railway web service with one persistent volume. The service exposes JoshMemory over HTTPS; the SQLite database lives on the Railway volume rather than on a workstation.

## Architecture

```text
Claude Code / Codex / Antigravity
        on any computer
              |
              | HTTPS + bearer token
              v
      JoshMemory cloud service
           (Railway)
              |
              v
      /data/memory.sqlite
      persistent Railway volume
```

GitHub remains authoritative for code state. JoshMemory remains historical/project continuity. A resumed session must still reconcile the handoff with live Git before continuing.

## Railway service

Deploy this repository as a Railway service. The included `Dockerfile` starts:

```text
joshmemory-central --host 0.0.0.0 --port $PORT --db /data/memory.sqlite
```

Create a persistent volume mounted at:

```text
/data
```

Set this secret environment variable on the service:

```text
JOSHMEMORY_TOKEN=<long random secret>
```

Optional explicit database path:

```text
JOSHMEMORY_DB_PATH=/data/memory.sqlite
```

The service refuses a non-loopback bind without `JOSHMEMORY_TOKEN`.

Generate a public Railway domain for the service. The root URL and `/health` are intentionally non-sensitive status endpoints. All memory operations use `POST /v1/call` and require the bearer token.

## Client machines

On every computer that runs Claude Code, Codex, Antigravity or the JoshMemory MCP server, set:

```text
JOSHMEMORY_REMOTE_URL=https://<your-railway-domain>
JOSHMEMORY_TOKEN=<same secret>
```

Linux/macOS example:

```bash
export JOSHMEMORY_REMOTE_URL="https://<your-railway-domain>"
export JOSHMEMORY_TOKEN="<same secret>"
```

PowerShell example:

```powershell
$env:JOSHMEMORY_REMOTE_URL = "https://<your-railway-domain>"
$env:JOSHMEMORY_TOKEN = "<same secret>"
```

The existing MCP server and Claude hooks automatically use the remote store once `JOSHMEMORY_REMOTE_URL` is present.

## Availability and cost

Railway can run the service continuously, or Serverless mode can put it to sleep after inactivity and wake it on the next request. Continuous mode gives the lowest resume latency. Serverless mode reduces idle compute cost but the first request after sleep may have cold-start delay.

A persistent Railway volume keeps `memory.sqlite` across deploys and restarts. Do not run the database on the container's ephemeral filesystem.

## Backups

Use Railway volume backups in addition to JoshMemory's provenance model. A backup protects the database file; GitHub and the original evidence sources remain the authority for code/history claims.

## Migration from a workstation database

If the existing AVANCE-WS7 database contains handoffs/facts that should become the initial shared state:

1. Stop writes to the old central service.
2. Copy `memory.sqlite` from the old JoshMemory data directory.
3. Upload it to the Railway volume as `/data/memory.sqlite`.
4. Start/restart the Railway service.
5. Point every client at the Railway HTTPS URL.
6. Verify a known project with `get_project_context` before retiring the workstation-hosted service.

Do not keep two writable central databases after cutover.
