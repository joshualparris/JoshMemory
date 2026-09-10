from __future__ import annotations

import json
import sys
from typing import Any, Callable

from .github_evidence import github_evidence
from .github_evidence import github_evidence
from .index import get_session, index_all, project_history, recent_work, search_sessions, project_status
from .historical import earliest_activity, historical_search, historical_timeline
from .facts import project_fact_add, project_fact_search, accountability_reference_add, accountability_reference_search
from .handoff import save_handoff, get_project_context, list_handoffs
from .paths import default_db_path

def get_identity_kwargs():
    from pathlib import Path
    try:
        from .hooks import fast_git_details
        cwd = Path.cwd()
        git_info = fast_git_details(cwd)
        return {
            "canonical_repo": git_info.get("canonical_repo", ""),
            "checkout_path": str(cwd)
        }
    except Exception:
        return {"canonical_repo": "", "checkout_path": ""}

def get_inferred_source_ref(a: dict) -> str:
    if a.get("source_ref"): return a["source_ref"]
    import os
    if "CLAUDE_SESSION_ID" in os.environ: return os.environ["CLAUDE_SESSION_ID"]
    from pathlib import Path
    try:
        from .hooks import infer_claude_session_id
        res = infer_claude_session_id(Path.cwd())
        if res: return res
    except Exception:
        pass
    return ""

def _save_handoff_wrapper(a):
    from .handoff import save_handoff
    from .paths import default_db_path
    return save_handoff(
        str(default_db_path()),
        str(a["project"]),
        {k: v for k, v in a.items() if k not in ("project", "machine", "agent", "source_ref")},
        machine=a.get("machine"),
        agent=a.get("agent"),
        source_ref=get_inferred_source_ref(a),
        **get_identity_kwargs()
    )



TOOLS: dict[str, dict[str, Any]] = {
    "search_sessions": {
        "description": "Search indexed Codex sessions without scanning project files.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {"type": "string"},
                "limit": {"type": "integer", "default": 10, "minimum": 1, "maximum": 50},
            },
            "required": ["query"],
        },
    },
    "get_session": {
        "description": "Retrieve redacted indexed events for a Codex session by thread_id.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "thread_id": {"type": "string"},
                "limit_events": {"type": "integer", "default": 120, "minimum": 1, "maximum": 1000},
            },
            "required": ["thread_id"],
        },
    },
    "project_history": {
        "description": "List sessions related to a project/topic from the JoshMemory index.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "project": {"type": "string"},
                "limit": {"type": "integer", "default": 30, "minimum": 1, "maximum": 100},
            },
            "required": ["project"],
        },
    },
    "recent_work": {
        "description": "List recently indexed Codex sessions.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "limit": {"type": "integer", "default": 10, "minimum": 1, "maximum": 50},
            },
        },
    },
    "github_evidence": {
        "description": "List indexed GitHub evidence records, optionally limited to a project.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "project": {"type": "string"},
                "limit": {"type": "integer", "default": 100, "minimum": 1, "maximum": 1000},
            },
        },
    },
    "project_status": {
        "description": "Combines current live Fedora auditor state with recent Codex work and GitHub evidence.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "project": {"type": "string"}
            },
            "required": ["project"],
        },
    },
    "historical_search": {
        "description": "Search historical evidence using deterministic activity and date intent parsing.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {"type": "string"},
                "limit": {"type": "integer", "default": 20, "minimum": 1, "maximum": 100},
            },
            "required": ["query"],
        },
    },
    "earliest_activity": {
        "description": "Find the earliest qualifying activity in the currently available evidence corpus.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "activity": {"type": "string", "default": "coding"},
            },
        },
    },
    "historical_timeline": {
        "description": "Group date-scoped historical evidence by source without flattening facts into one narrative.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {"type": "string"},
                "limit": {"type": "integer", "default": 50, "minimum": 1, "maximum": 100},
            },
            "required": ["query"],
        },
    },
    "project_fact_search": {
        "description": "Search for durable project facts.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {"type": "string"},
                "project": {"type": "string"}
            },
            "required": ["query", "project"],
        },
    },
    "accountability_search": {
        "description": "Search accountability claims.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {"type": "string"},
                "project": {"type": "string"}
            },
            "required": ["query", "project"],
        },
    },
    "save_handoff": {
        "description": (
            "Save a structured end-of-session handoff for a project so a future agent "
            "session (Claude Code, Codex, Antigravity) can resume without a pasted "
            "transcript. Supersedes this project/machine's previous handoff rather than "
            "erasing it. Never pass raw secrets/tokens/passwords in any field; redaction "
            "is applied as defense-in-depth but is not a substitute for not sending them."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "project": {"type": "string"},
                "objective": {"type": "string", "description": "Current goal, required."},
                "completed": {"type": "array", "items": {"type": "string"}},
                "in_progress": {"type": "array", "items": {"type": "string"}},
                "blockers": {"type": "array", "items": {"type": "string"}},
                "next_action": {"type": "string"},
                "decisions": {"type": "array", "items": {"type": "string"}},
                "bugs_found": {"type": "array", "items": {"type": "string"}},
                "bugs_fixed": {"type": "array", "items": {"type": "string"}},
                "tests_run": {"type": "array", "items": {"type": "string"}},
                "builds_run": {"type": "array", "items": {"type": "string"}},
                "commits": {"type": "array", "items": {"type": "string"}},
                "machines_affected": {"type": "array", "items": {"type": "string"}},
                "branch": {"type": "string"},
                "head_commit": {"type": "string"},
                "agent": {"type": "string", "description": "e.g. claude-code, codex, antigravity"},
                "machine": {"type": "string", "description": "defaults to hostname"},
                "source_ref": {"type": "string", "description": "e.g. a session/thread id"},
            },
            "required": ["project", "objective"],
        },
    },
    "get_project_context": {
        "description": (
            "Compact startup context for a project: latest handoff plus freshly-checked "
            "live git evidence, with any discrepancy between them called out explicitly. "
            "Live evidence always outranks the handoff. Call this at the start of work on "
            "a known project instead of asking the user to paste prior context."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "project": {"type": "string"},
                "machine": {"type": "string"},
            },
            "required": ["project"],
        },
    },
    "list_handoffs": {
        "description": "List recent handoffs for a project, most recent first, including superseded ones.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "project": {"type": "string"},
                "machine": {"type": "string"},
                "limit": {"type": "integer", "default": 10, "minimum": 1, "maximum": 100},
                "active_only": {"type": "boolean", "default": False},
            },
            "required": ["project"],
        },
    },
}


def main() -> int:
    for line in sys.stdin:
        if not line.strip():
            continue
        try:
            request = json.loads(line)
            response = handle(request)
        except Exception as exc:
            response = {
                "jsonrpc": "2.0",
                "id": request.get("id") if isinstance(locals().get("request"), dict) else None,
                "error": {"code": -32603, "message": str(exc)},
            }
        if response is not None:
            sys.stdout.write(json.dumps(response, ensure_ascii=False) + "\n")
            sys.stdout.flush()
    return 0


def handle(request: dict[str, Any]) -> dict[str, Any] | None:
    method = request.get("method")
    request_id = request.get("id")
    params = request.get("params") or {}
    if request_id is None:
        return None

    if method == "initialize":
        return result(
            request_id,
            {
                "protocolVersion": "2024-11-05",
                "capabilities": {"tools": {}},
                "serverInfo": {"name": "joshmemory", "version": "0.1.0"},
            },
        )
    if method == "tools/list":
        return result(
            request_id,
            {"tools": [{"name": name, **schema} for name, schema in TOOLS.items()]},
        )
    if method == "tools/call":
        name = params.get("name")
        arguments = params.get("arguments") or {}
        return result(request_id, {"content": [{"type": "text", "text": call_tool(name, arguments)}]})
    if method == "ping":
        return result(request_id, {})
    return {"jsonrpc": "2.0", "id": request_id, "error": {"code": -32601, "message": f"Unknown method: {method}"}}


def result(request_id: Any, value: Any) -> dict[str, Any]:
    return {"jsonrpc": "2.0", "id": request_id, "result": value}


def call_tool(name: str, arguments: dict[str, Any]) -> str:
    dispatch: dict[str, Callable[[dict[str, Any]], Any]] = {
        "search_sessions": lambda a: search_sessions(str(a["query"]), limit=int(a.get("limit", 10))),
        "get_session": lambda a: get_session(str(a["thread_id"]), limit_events=int(a.get("limit_events", 120))) or {"error": "not_found"},
        "project_history": lambda a: project_history(str(a["project"]), limit=int(a.get("limit", 30))),
        "recent_work": lambda a: recent_work(limit=int(a.get("limit", 10))),
        "github_evidence": lambda a: github_evidence(project=a.get("project"), limit=int(a.get("limit", 100))),
        "project_status": lambda a: project_status(str(a["project"])),
        "historical_search": lambda a: historical_search(str(a["query"]), limit=int(a.get("limit", 20))),
        "earliest_activity": lambda a: earliest_activity(str(a.get("activity", "coding"))),
        "historical_timeline": lambda a: historical_timeline(str(a["query"]), limit=int(a.get("limit", 50))),
        "project_fact_search": lambda a: project_fact_search(
            db_path=default_db_path(), query=str(a["query"]), project=str(a["project"]), active_only=True
        ),
        "accountability_search": lambda a: accountability_reference_search(
            db_path=default_db_path(), query=str(a["query"]), project=str(a["project"]), active_only=True
        ),
        "save_handoff": lambda a: save_handoff(
            str(default_db_path()),
            str(a["project"]),
            {k: v for k, v in a.items() if k not in ("project", "machine", "agent", "source_ref")},
            machine=a.get("machine"),
            agent=a.get("agent"),
            source_ref=a.get("source_ref"),
        ),
        "get_project_context": lambda a: get_project_context(
            str(default_db_path()), str(a["project"]), machine=a.get("machine")
        ),
        "list_handoffs": lambda a: list_handoffs(
            str(default_db_path()),
            str(a["project"]),
            machine=a.get("machine"),
            limit=int(a.get("limit", 10)),
            active_only=bool(a.get("active_only", False)),
        ),
    }
    if name not in dispatch:
        raise ValueError(f"Unknown tool: {name}")
    # Keep the index fresh; unchanged rollout files are skipped cheaply.
    # We omit this for tools that only touch the fact/handoff tables because
    # those don't depend on parsing Codex rollout files.
    if name not in ("project_fact_search", "accountability_search", "save_handoff", "get_project_context", "list_handoffs"):
        index_all()
    return json.dumps(dispatch[name](arguments), indent=2, ensure_ascii=False)


if __name__ == "__main__":
    raise SystemExit(main())

