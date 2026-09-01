from __future__ import annotations

import json
import sys
from typing import Any, Callable

from .github_evidence import github_evidence
from .github_evidence import github_evidence
from .index import get_session, index_all, project_history, recent_work, search_sessions, project_status
from .historical import earliest_activity, historical_search, historical_timeline
from .facts import project_fact_add, project_fact_search, accountability_reference_add, accountability_reference_search
from .paths import default_db_path


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
    }
    if name not in dispatch:
        raise ValueError(f"Unknown tool: {name}")
    # Keep the index fresh; unchanged rollout files are skipped cheaply.
    # We omit this for new read-only fact tables because they don't depend on parsing rollout files.
    if name not in ("project_fact_search", "accountability_search"):
        index_all()
    return json.dumps(dispatch[name](arguments), indent=2, ensure_ascii=False)


if __name__ == "__main__":
    raise SystemExit(main())

