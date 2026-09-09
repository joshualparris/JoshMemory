# JoshMemory Windows ProBook Configuration

## Locations
- **JoshMemory Install Path:** `C:\dev\JoshMemory`
- **Python Executable / Venv:** `C:\dev\JoshMemory\.venv\Scripts\python.exe`
- **Database Path:** `C:\Users\Josh\.local\share\joshmemory\memory.sqlite`
- **MCP Configuration Path:** `C:\Users\Josh\.gemini\config\mcp_config.json`
- **Antigravity Rule Path:** `C:\Users\Josh\.gemini\config\GEMINI.md`

## Launch Command (MCP Server)
The MCP Server is launched automatically by Antigravity via:
`C:\dev\JoshMemory\.venv\Scripts\python.exe -m joshmemory.server`

## Historical Data Source
Currently, JoshMemory reads from your local Codex rollout JSONL files located at:
`C:\Users\Josh\.codex\sessions`

## How to Update JoshMemory
1. Open PowerShell and navigate to the project: `cd C:\dev\JoshMemory`
2. Pull the latest code: `git pull origin main`
3. Update dependencies if necessary: `.\.venv\Scripts\python.exe -m pip install -e .`

## How to Rebuild / Re-index Memory
Whenever new sessions are added or you transfer data from Fedora, you can re-index:
1. Open PowerShell and navigate to: `cd C:\dev\JoshMemory`
2. Run the indexer: `.\.venv\Scripts\python.exe -m joshmemory.cli index` (add `--force` to rebuild from scratch).

## How to Confirm Antigravity Can See MCP Tools
1. In an Antigravity chat, you can explicitly ask: "List your available tools, specifically checking for MCP tools from joshmemory."
2. Alternatively, watch for the system mounting "joshmemory" tools like `search_sessions`, `project_history`, and `historical_search` in your context.

