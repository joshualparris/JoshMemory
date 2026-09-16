# JoshMemory Windows ProBook Configuration

## Locations
- **JoshMemory Install Path:** `C:\dev\JoshMemory`
- **Python Executable / Venv:** `C:\dev\JoshMemory\.venv\Scripts\python.exe`
- **Local fallback/index database:** `C:\Users\Josh\.local\share\joshmemory\memory.sqlite`
- **MCP Configuration Path:** `C:\Users\Josh\.gemini\config\mcp_config.json`
- **Antigravity Rule Path:** `C:\Users\Josh\.gemini\config\GEMINI.md`

## Shared central memory
The ProBook should use the central JoshMemory service for handoffs/bookmarks, durable project facts and accountability references. Raw Codex sessions and live Git state still remain local.

After the central Fedora service is installed, run from `C:\dev\JoshMemory`:

```powershell
.\deploy\configure-client.ps1 -ServerUrl "http://<AVANCE-WS7-Tailscale-IP>:8765" -Token "<central token>"
```

The script verifies `/health`, stores `JOSHMEMORY_REMOTE_URL` and `JOSHMEMORY_TOKEN` as Windows user environment variables, and sets them for the current PowerShell process. Restart Antigravity/Claude/Codex if they were already open so they inherit the variables.

When central mode is configured, JoshMemory deliberately does not silently fall back to the local SQLite database if the server is unavailable. This prevents different computers from creating conflicting bookmark histories.

## Launch Command (MCP Server)
The MCP Server is launched automatically by Antigravity via:
`C:\dev\JoshMemory\.venv\Scripts\python.exe -m joshmemory.server`

No alternate MCP command is required for central mode; the existing handoff/fact layer detects `JOSHMEMORY_REMOTE_URL` automatically.

## Historical Data Source
JoshMemory reads the ProBook's local Codex rollout JSONL files from:
`C:\Users\Josh\.codex\sessions`

## How to Update JoshMemory
1. Open PowerShell and navigate to the project: `cd C:\dev\JoshMemory`
2. Pull the latest code: `git pull origin main`
3. Update the editable install: `.\.venv\Scripts\python.exe -m pip install -e .`

## How to Rebuild / Re-index Local History
Whenever new local sessions are added or historical data is transferred to the ProBook, re-index with:

```powershell
.\.venv\Scripts\python.exe -m joshmemory.cli index
```

Add `--force` only when a full local rebuild is actually needed.

## How to Confirm Antigravity Can See MCP Tools
1. In an Antigravity chat, explicitly ask: "List your available tools, specifically checking for MCP tools from joshmemory."
2. Confirm tools such as `save_handoff`, `get_project_context`, `list_handoffs`, `search_sessions`, `project_history`, and `historical_search` are available.
3. Save a handoff in one clone/machine and retrieve it from another clone of the same canonical GitHub repo to verify cross-machine resume.
