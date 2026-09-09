from __future__ import annotations

import json
import socket
import subprocess
from pathlib import Path
from typing import Any, Optional

from .handoff import get_project_context, get_latest_handoff, commits_match
from .paths import default_data_dir


def default_machine() -> str:
    return socket.gethostname()


def _git(cwd: Path, args: list[str]) -> str:
    try:
        result = subprocess.run(
            ["git", "-C", str(cwd)] + args,
            capture_output=True,
            text=True,
            timeout=5,
        )
        return result.stdout.strip() if result.returncode == 0 else ""
    except (OSError, subprocess.SubprocessError):
        return ""


def detect_project(cwd: Path) -> str:
    """Best-effort project identity from the working directory: the
    basename of the git repo root if inside one (this matches how the
    auditor names projects), else the basename of cwd itself."""
    top_level = _git(cwd, ["rev-parse", "--show-toplevel"])
    if top_level:
        return Path(top_level).name
    return cwd.name


def cheap_git_snapshot(cwd: Path) -> dict[str, Any]:
    """A fast, local-only git read: single `git rev-parse`/`git status`
    call, no repository scanning and no auditor. Safe to call on every
    Stop event; must never be replaced with the full project auditor,
    which walks the whole projects directory and is far too slow to run
    after every turn."""
    head = _git(cwd, ["rev-parse", "HEAD"])
    status = _git(cwd, ["status", "--porcelain"])
    return {"head_sha": head or None, "dirty": bool(status)}


def session_start_context(
    cwd: Path, *, db_path: str, machine: Optional[str] = None
) -> dict[str, Any]:
    """Build the Claude Code SessionStart hook JSON output. Returns an
    empty envelope (no additionalContext) when JoshMemory has no handoff
    for this project, so unrelated projects see no injected noise."""
    project = detect_project(cwd)
    ctx = get_project_context(db_path, project, machine=machine)
    handoff_row = ctx.get("handoff")
    if not handoff_row or not handoff_row.get("handoff"):
        return {}

    h = handoff_row["handoff"]
    lines = [
        f'JoshMemory has a prior handoff for project "{project}" '
        f'(recorded {handoff_row.get("recorded_at", "an earlier time")} by '
        f'{h.get("agent", "an earlier agent")} on '
        f'{handoff_row.get("machine", "an earlier machine")}):'
    ]
    if h.get("objective"):
        lines.append(f"- Objective: {h['objective']}")
    if h.get("completed"):
        lines.append("- Completed: " + "; ".join(h["completed"][:5]))
    if h.get("in_progress"):
        lines.append("- In progress: " + "; ".join(h["in_progress"][:5]))
    if h.get("blockers"):
        lines.append("- Blockers: " + "; ".join(h["blockers"][:5]))
    if h.get("next_action"):
        lines.append(f"- Suggested next action: {h['next_action']}")
    for disc in ctx.get("discrepancies", []):
        lines.append(f"- STALE: {disc['message']}")
    note = ctx.get("precedence_note")
    if note:
        lines.append(note)

    return {
        "hookSpecificOutput": {
            "hookEventName": "SessionStart",
            "additionalContext": "\n".join(lines),
        }
    }


def _state_path() -> Path:
    return default_data_dir() / "stop_hook_state.json"


def _load_state() -> dict[str, Any]:
    try:
        return json.loads(_state_path().read_text())
    except (OSError, json.JSONDecodeError):
        return {}


def _save_state(state: dict[str, Any]) -> None:
    path = _state_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(state))


def stop_nudge(
    cwd: Path, *, db_path: str, machine: Optional[str] = None
) -> dict[str, Any]:
    """Claude Code Stop hook body: nudge the agent to save a handoff when
    new commits exist since the last one recorded for this project, but
    only ONCE per (project, machine, head_sha). This makes the nudge
    converge even if the agent never acts on it, so it can never block
    the session from ending in an infinite loop; it will speak up again
    only once the commit actually changes."""
    project = detect_project(cwd)
    _machine = machine or default_machine()
    live_head = cheap_git_snapshot(cwd)["head_sha"]
    if not live_head:
        return {}

    handoff_row = get_latest_handoff(db_path, project, machine=_machine)
    recorded_head = None
    if handoff_row and handoff_row.get("handoff"):
        recorded_head = handoff_row["handoff"].get("head_commit")

    if commits_match(recorded_head, live_head):
        return {}

    state = _load_state()
    key = f"{project}::{_machine}"
    if state.get(key) == live_head:
        return {}

    state[key] = live_head
    _save_state(state)

    return {
        "decision": "block",
        "reason": (
            f'New commits exist in "{project}" since the last JoshMemory handoff '
            f"(recorded {recorded_head or 'none'}, now at {live_head}). Before "
            "finishing, call the joshmemory MCP tool save_handoff with the "
            "objective, what changed, and the next action, so a future session "
            "can resume without a pasted transcript. This nudge will not repeat "
            "for this commit."
        ),
    }
