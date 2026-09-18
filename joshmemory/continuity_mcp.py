from __future__ import annotations

import json
import sys
from typing import Any, Callable

from .continuity import (
    acquire_work,
    append_work_event,
    get_active_lease,
    get_resume_brief,
    get_trust,
    heartbeat_work,
    list_leases,
    list_work_events,
    release_work,
    trusted_fact_search,
)
from .paths import default_db_path


TOOLS: dict[str, dict[str, Any]] = {
    "resume_brief": {
        "description": (
            "Return a compact fresh-agent resume brief: latest handoff, live-state discrepancies, "
            "active work lease, recent journal events and the next action. Live evidence remains authoritative."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "project": {"type": "string"},
                "canonical_repo": {"type": "string"},
                "checkout_path": {"type": "string"},
                "machine": {"type": "string"},
                "current_agent": {"type": "string"},
                "work_key": {"type": "string", "default": "default"},
                "event_limit": {"type": "integer", "default": 8, "minimum": 1, "maximum": 50},
            },
            "required": ["project"],
        },
    },
    "claim_work": {
        "description": (
            "Claim one project work item for a bounded lease. If another unexpired lease exists, "
            "returns acquired=false and its owner instead of silently duplicating work."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "project": {"type": "string"},
                "owner": {"type": "string"},
                "work_key": {"type": "string", "default": "default"},
                "ttl_seconds": {"type": "integer", "default": 900, "minimum": 30, "maximum": 86400},
                "canonical_repo": {"type": "string"},
                "checkout_path": {"type": "string"},
                "machine": {"type": "string"},
                "note": {"type": "string"},
            },
            "required": ["project", "owner"],
        },
    },
    "heartbeat_work": {
        "description": "Extend a work lease owned by this agent.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "project": {"type": "string"},
                "owner": {"type": "string"},
                "work_key": {"type": "string", "default": "default"},
                "ttl_seconds": {"type": "integer", "default": 900, "minimum": 30, "maximum": 86400},
                "canonical_repo": {"type": "string"},
                "note": {"type": "string"},
            },
            "required": ["project", "owner"],
        },
    },
    "release_work": {
        "description": "Release a work lease owned by this agent.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "project": {"type": "string"},
                "owner": {"type": "string"},
                "work_key": {"type": "string", "default": "default"},
                "canonical_repo": {"type": "string"},
                "note": {"type": "string"},
            },
            "required": ["project", "owner"],
        },
    },
    "active_lease": {
        "description": "Show the current unexpired lease for one work item.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "project": {"type": "string"},
                "work_key": {"type": "string", "default": "default"},
                "canonical_repo": {"type": "string"},
            },
            "required": ["project"],
        },
    },
    "list_leases": {
        "description": "List currently active work leases, optionally for one project.",
        "inputSchema": {
            "type": "object",
            "properties": {"project": {"type": "string"}},
        },
    },
    "append_work_event": {
        "description": (
            "Append one concise redacted event to the durable work journal. Use for commits, tests, "
            "builds, deployments, blockers, decisions and bugs; do not dump whole transcripts."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "project": {"type": "string"},
                "event_type": {
                    "type": "string",
                    "enum": ["NOTE", "COMMIT", "TEST", "BUILD", "DEPLOY", "BLOCKER", "DECISION", "BUG", "FILE", "OTHER"],
                },
                "summary": {"type": "string"},
                "details": {"type": "object"},
                "canonical_repo": {"type": "string"},
                "checkout_path": {"type": "string"},
                "machine": {"type": "string"},
                "agent": {"type": "string"},
                "source_ref": {"type": "string"},
            },
            "required": ["project", "event_type", "summary"],
        },
    },
    "recent_work_events": {
        "description": "List recent append-only work journal entries for a project.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "project": {"type": "string"},
                "limit": {"type": "integer", "default": 20, "minimum": 1, "maximum": 200},
                "canonical_repo": {"type": "string"},
            },
            "required": ["project"],
        },
    },
    "memory_trust": {
        "description": (
            "Read the trust overlay for a memory record. Missing trust is explicitly UNTRUSTED. "
            "This server deliberately exposes no trust-promotion tool; promotion is an operator action."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {"target_id": {"type": "string"}},
            "required": ["target_id"],
        },
    },
    "trusted_fact_search": {
        "description": "Search project facts while requiring an explicit trust level.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "project": {"type": "string"},
                "query": {"type": "string"},
                "minimum_trust": {
                    "type": "string",
                    "enum": ["UNTRUSTED", "VERIFIED", "APPROVED", "SYSTEM"],
                    "default": "VERIFIED",
                },
                "limit": {"type": "integer", "default": 20, "minimum": 1, "maximum": 100},
            },
            "required": ["project", "query"],
        },
    },
}


def _db() -> str:
    return str(default_db_path())


def call_tool(name: str, arguments: dict[str, Any]) -> Any:
    dispatch: dict[str, Callable[[dict[str, Any]], Any]] = {
        "resume_brief": lambda a: get_resume_brief(
            _db(),
            str(a["project"]),
            canonical_repo=str(a.get("canonical_repo") or ""),
            checkout_path=str(a.get("checkout_path") or ""),
            machine=a.get("machine"),
            current_agent=str(a.get("current_agent") or ""),
            work_key=str(a.get("work_key") or "default"),
            event_limit=int(a.get("event_limit", 8)),
        ),
        "claim_work": lambda a: acquire_work(
            _db(),
            str(a["project"]),
            str(a["owner"]),
            work_key=str(a.get("work_key") or "default"),
            ttl_seconds=int(a.get("ttl_seconds", 900)),
            canonical_repo=str(a.get("canonical_repo") or ""),
            checkout_path=str(a.get("checkout_path") or ""),
            machine=a.get("machine"),
            note=str(a.get("note") or ""),
        ),
        "heartbeat_work": lambda a: heartbeat_work(
            _db(),
            str(a["project"]),
            str(a["owner"]),
            work_key=str(a.get("work_key") or "default"),
            canonical_repo=str(a.get("canonical_repo") or ""),
            ttl_seconds=int(a.get("ttl_seconds", 900)),
            note=str(a.get("note") or ""),
        ),
        "release_work": lambda a: release_work(
            _db(),
            str(a["project"]),
            str(a["owner"]),
            work_key=str(a.get("work_key") or "default"),
            canonical_repo=str(a.get("canonical_repo") or ""),
            note=str(a.get("note") or ""),
        ),
        "active_lease": lambda a: get_active_lease(
            _db(),
            str(a["project"]),
            work_key=str(a.get("work_key") or "default"),
            canonical_repo=str(a.get("canonical_repo") or ""),
        ),
        "list_leases": lambda a: list_leases(_db(), project=a.get("project"), active_only=True),
        "append_work_event": lambda a: append_work_event(
            _db(),
            str(a["project"]),
            str(a["event_type"]),
            str(a["summary"]),
            details=dict(a.get("details") or {}),
            canonical_repo=str(a.get("canonical_repo") or ""),
            checkout_path=str(a.get("checkout_path") or ""),
            machine=a.get("machine"),
            agent=str(a.get("agent") or ""),
            source_ref=str(a.get("source_ref") or ""),
        ),
        "recent_work_events": lambda a: list_work_events(
            _db(),
            str(a["project"]),
            limit=int(a.get("limit", 20)),
            canonical_repo=str(a.get("canonical_repo") or ""),
        ),
        "memory_trust": lambda a: get_trust(_db(), str(a["target_id"])),
        "trusted_fact_search": lambda a: trusted_fact_search(
            _db(),
            str(a["query"]),
            project=str(a["project"]),
            minimum_trust=str(a.get("minimum_trust") or "VERIFIED"),
            limit=int(a.get("limit", 20)),
        ),
    }
    if name not in dispatch:
        raise ValueError(f"Unknown tool: {name}")
    return dispatch[name](arguments)


def result(request_id: Any, value: Any) -> dict[str, Any]:
    return {"jsonrpc": "2.0", "id": request_id, "result": value}


def handle(request: dict[str, Any]) -> dict[str, Any] | None:
    request_id = request.get("id")
    if request_id is None:
        return None
    method = request.get("method")
    params = request.get("params") or {}

    if method == "initialize":
        return result(
            request_id,
            {
                "protocolVersion": "2024-11-05",
                "capabilities": {"tools": {}},
                "serverInfo": {"name": "joshmemory-continuity", "version": "0.3.0"},
            },
        )
    if method == "tools/list":
        return result(request_id, {"tools": [{"name": name, **schema} for name, schema in TOOLS.items()]})
    if method == "tools/call":
        name = str(params.get("name") or "")
        arguments = dict(params.get("arguments") or {})
        value = call_tool(name, arguments)
        return result(
            request_id,
            {"content": [{"type": "text", "text": json.dumps(value, ensure_ascii=False, indent=2)}]},
        )
    if method == "ping":
        return result(request_id, {})
    return {
        "jsonrpc": "2.0",
        "id": request_id,
        "error": {"code": -32601, "message": f"Unknown method: {method}"},
    }


def main() -> int:
    for line in sys.stdin:
        if not line.strip():
            continue
        request: dict[str, Any] | None = None
        try:
            request = json.loads(line)
            response = handle(request)
        except Exception as exc:
            response = {
                "jsonrpc": "2.0",
                "id": request.get("id") if isinstance(request, dict) else None,
                "error": {"code": -32603, "message": str(exc)},
            }
        if response is not None:
            sys.stdout.write(json.dumps(response, ensure_ascii=False) + "\n")
            sys.stdout.flush()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
