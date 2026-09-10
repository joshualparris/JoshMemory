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
    git_info = fast_git_details(cwd)
    ctx = get_project_context(db_path, project, machine=machine, canonical_repo=git_info["canonical_repo"], checkout_path=str(cwd))
    handoff_row = ctx.get("handoff")
    related = ctx.get("related_workstreams", [])
    if (not handoff_row or not handoff_row.get("handoff")) and not related:
        return {}

    lines = []
    if handoff_row and handoff_row.get("handoff"):
        h = handoff_row["handoff"]
        lines.append(f'JoshMemory has a prior handoff for project "{project}" (recorded {handoff_row.get("recorded_at", "an earlier time")} by {h.get("agent", "an earlier agent")} on {handoff_row.get("machine", "an earlier machine")}):')
        if h.get("objective"): lines.append(f"- Objective: {h['objective']}")
        if h.get("completed"): lines.append("- Completed: " + "; ".join(h["completed"][:5]))
        if h.get("in_progress"): lines.append("- In progress: " + "; ".join(h["in_progress"][:5]))
        if h.get("blockers"): lines.append("- Blockers: " + "; ".join(h["blockers"][:5]))
        if h.get("next_action"): lines.append(f"- Suggested next action: {h['next_action']}")
        for disc in ctx.get("discrepancies", []):
            lines.append(f"- STALE: {disc['message']}")
        note = ctx.get("precedence_note")
        if note: lines.append(note)

    if related:
        lines.append("")
        lines.append("Related workstreams for the same repository:")
        for r in related:
            r_proj = r.get("project", "")
            r_branch = r.get("branch", "unknown-branch")
            r_obj = r.get("objective", "No objective")
            r_next = r.get("next_action", "No next action")
            lines.append(f"{r_proj} - {r_branch} - objective: {r_obj} - next: {r_next}")

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

def fast_git_details(cwd: Path) -> dict:
    head = _git(cwd, ["rev-parse", "HEAD"])
    branch = _git(cwd, ["rev-parse", "--abbrev-ref", "HEAD"])
    if branch == "HEAD": branch = ""
    upstream = _git(cwd, ["rev-parse", "--abbrev-ref", "@{u}"])
    status = _git(cwd, ["status", "--porcelain"])
    origin = _git(cwd, ["config", "--get", "remote.origin.url"])
    
    # Import locally to avoid circular dependency
    from .auditor import normalize_git_url
    return {
        "head_commit": head or None,
        "branch": branch or None,
        "upstream": upstream or None,
        "dirty": bool(status),
        "canonical_repo": normalize_git_url(origin)
    }

def extract_transcript_info(path: str) -> tuple[str, str]:
    if not path:
        return "", ""
    try:
        import json
        p = Path(path)
        if not p.exists(): return "", ""
        
        lines = p.read_text(encoding="utf-8", errors="ignore").splitlines()
        last_user = ""
        last_asst = ""
        for line in lines:
            if not line.strip(): continue
            try:
                msg = json.loads(line)
                if msg.get("type") == "last-prompt":
                    val = msg.get("lastPrompt")
                    if val: last_user = val
                
                if msg.get("type") == "message" or msg.get("type") == "assistant":
                    inner = msg.get("message") if "message" in msg else msg
                    if inner.get("role") == "assistant":
                        content = inner.get("content", [])
                        text = "".join(c.get("text", "") for c in content if c.get("type") == "text")
                        if text: last_asst = text
            except Exception:
                pass
                
        return last_user, last_asst
    except Exception:
        return "", ""


def infer_claude_session_id(cwd: Path) -> str:
    escaped = str(cwd).replace(":", "-").replace("\\", "-").replace("/", "-")
    path = Path.home() / ".claude" / "projects" / escaped
    if not path.exists(): return ""
    jsonls = list(path.glob("*.jsonl"))
    if not jsonls: return ""
    latest = max(jsonls, key=lambda p: p.stat().st_mtime)
    return latest.stem

def session_end_context(
    cwd: Path, *, payload: dict, db_path: str, machine: Optional[str] = None
) -> dict:
    from .handoff import save_handoff, get_latest_handoff
    project = detect_project(cwd)
    _machine = machine or default_machine()
    
    # Extract transcript info
    transcript_path = payload.get("transcript_path", "")
    session_id = payload.get("session_id", "")
    last_user, last_asst = extract_transcript_info(transcript_path)
    
    # Git details
    git_info = fast_git_details(cwd)
    
    # Check precedence: did the agent already save an explicit handoff recently?
    # Or specifically, in this session?
    latest = get_latest_handoff(db_path, project, machine=_machine, canonical_repo=git_info["canonical_repo"], checkout_path=str(cwd))
    explicit_exists = False
    old_handoff = None
    
    if latest and latest.get("source_type") == "agent_handoff":
        if session_id and latest.get("source_ref") == session_id:
            explicit_exists = True
            old_handoff = latest.get("handoff", {})
        else:
            explicit_exists = False
            old_handoff = None
            
    # Build fallback handoff
    handoff_data = dict(old_handoff) if old_handoff else {}
    
    if not explicit_exists:
        # Lower quality fallback
        handoff_data["objective"] = last_user if last_user else f"Automatic session end fallback (reason: {payload.get('reason')})"
        
        # Summarize last assistant text safely (first 200 chars)
        asst_sum = (last_asst[:200] + "...") if len(last_asst) > 200 else last_asst
        
        handoff_data["completed"] = [f"Session ended automatically.", f"Last interaction: {asst_sum}"]
        handoff_data["next_action"] = "Review automatic fallback state and resume."
    
    # ALWAYS supplement with deterministic fields
    handoff_data["head_commit"] = git_info["head_commit"]
    handoff_data["branch"] = git_info["branch"]
    handoff_data["canonical_repo"] = git_info["canonical_repo"]
    handoff_data["dirty"] = git_info["dirty"]
    
    # Save it
    save_handoff(
        db_path, 
        project, 
        handoff_data, 
        machine=_machine, 
        agent="claude-code-fallback", 
        source_ref=session_id,
        source_type="automatic_fallback" if not explicit_exists else "agent_handoff",
        canonical_repo=git_info["canonical_repo"],
        checkout_path=str(cwd)
    )
    
    return {}
