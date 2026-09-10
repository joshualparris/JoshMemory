from __future__ import annotations

import json
import socket
from typing import Any, Optional

from .auditor import get_project_state, get_all_projects
from .facts import project_fact_add
from .redact import redact
from .schema import connect

HANDOFF_SUBJECT = "session_handoff"
HANDOFF_STATUS = "CURRENT"

REQUIRED_HANDOFF_FIELDS = ("objective",)


def default_machine() -> str:
    return socket.gethostname()


def _redact_value(value: Any) -> Any:
    if isinstance(value, str):
        return redact(value)
    if isinstance(value, list):
        return [_redact_value(v) for v in value]
    if isinstance(value, dict):
        return {k: _redact_value(v) for k, v in value.items()}
    return value


def commits_match(a: Optional[str], b: Optional[str]) -> bool:
    """True if two commit references identify the same commit, tolerating a
    short SHA on either side (git/Action1 commonly report abbreviated SHAs).
    Empty/None never matches, so a missing recorded commit is never silently
    treated as current."""
    if not a or not b:
        return False
    a, b = a.lower(), b.lower()
    shorter, longer = (a, b) if len(a) <= len(b) else (b, a)
    return longer.startswith(shorter)


def _normalize_git(git: dict[str, Any]) -> dict[str, Any]:
    """Normalize the two known auditor backends (scan_built_in vs.
    fedora_project_audit.py) to a single shape. They disagree on field
    names for the same facts (branch/head, head_sha/oid, origin_url/upstream)."""
    return {
        "branch": git.get("branch") or git.get("head"),
        "head_sha": git.get("head_sha") or git.get("oid"),
        "modified": git.get("modified", 0),
        "untracked": git.get("untracked", 0),
        "ahead": git.get("ahead", 0),
        "origin_url": git.get("origin_url") or git.get("upstream"),
    }


def save_handoff(
    db_path: str,
    project: str,
    handoff: dict[str, Any],
    *,
    machine: Optional[str] = None,
    agent: Optional[str] = None,
    source_type: str = 'agent_handoff',
    source_ref: Optional[str] = None,
    canonical_repo: Optional[str] = "",
    checkout_path: Optional[str] = ""
) -> dict[str, Any]:
    """Persist a structured session handoff for `project`.

    Reuses the existing project_facts table/precedence model rather than a
    parallel schema: subject='session_handoff', status='CURRENT'. The
    previous CURRENT handoff for (project, machine) is superseded (kept,
    marked inactive), never overwritten in place, so history survives.
    Every string value is passed through the existing redact() filter
    before storage as defense-in-depth against accidental secrets, but
    callers must never pass raw credentials/tokens into a handoff field.
    """
    missing = [f for f in REQUIRED_HANDOFF_FIELDS if not handoff.get(f)]
    if missing:
        raise ValueError(f"handoff missing required field(s): {', '.join(missing)}")

    _machine = machine or default_machine()
    payload = dict(handoff)
    if agent:
        payload.setdefault("agent", agent)
    payload = _redact_value(payload)

    previous = get_latest_handoff(db_path, project, machine=_machine, canonical_repo=canonical_repo, checkout_path=checkout_path)
    fact_text = json.dumps(payload, ensure_ascii=False, sort_keys=True)
    # Only supersede when the content actually changed. A byte-identical
    # handoff is a no-op duplicate, and project_fact_add's own dedup check
    # requires supersedes to match the existing row's (None in that case).
    supersedes = previous["id"] if previous and previous["fact"] != fact_text else None
    result = project_fact_add(
        db_path,
        project=project,
        subject=HANDOFF_SUBJECT,
        fact=fact_text,
        status=HANDOFF_STATUS,
        source_type=source_type,
        source_ref=source_ref,
        machine=_machine,
        supersedes=supersedes,
    )
    result["machine"] = _machine
    return result


def _row_to_handoff(row: dict[str, Any]) -> dict[str, Any]:
    data = dict(row)
    try:
        data["handoff"] = json.loads(data["fact"])
    except (json.JSONDecodeError, TypeError):
        data["handoff"] = None
    return data


def get_latest_handoff(
    db_path: str, project: str, *, machine: Optional[str] = None,
    canonical_repo: Optional[str] = None, checkout_path: Optional[str] = None
) -> Optional[dict[str, Any]]:
    """Latest active handoff for a project. Without `machine`, returns the
    most recently recorded handoff across all machines that worked on it."""
    con = connect(db_path)
    try:
        sql = "SELECT * FROM project_facts WHERE project = ? AND subject = ? AND status = ? AND active = 1"
        params: list[Any] = [project, HANDOFF_SUBJECT, HANDOFF_STATUS]
        if machine:
            sql += " AND machine = ?"
            params.append(machine)
        
        if checkout_path:
            # Match specific checkout path, or fallback to older rows that don't have it
            sql += " AND (checkout_path = ? OR checkout_path = '' OR checkout_path IS NULL)"
            params.append(checkout_path)
            
            # Prioritize the exact checkout_path match, then most recent
            sql += " ORDER BY (checkout_path = ?) DESC, recorded_at DESC LIMIT 1"
            params.append(checkout_path)
        else:
            sql += " ORDER BY recorded_at DESC LIMIT 1"

        row = con.execute(sql, params).fetchone()
        return _row_to_handoff(dict(row)) if row else None
    finally:
        con.close()


def list_handoffs(
    db_path: str,
    project: str,
    *,
    machine: Optional[str] = None,
    limit: int = 10,
    active_only: bool = False,
) -> list[dict[str, Any]]:
    con = connect(db_path)
    try:
        sql = "SELECT * FROM project_facts WHERE project = ? AND subject = ?"
        params: list[Any] = [project, HANDOFF_SUBJECT]
        if machine:
            sql += " AND machine = ?"
            params.append(machine)
        if active_only:
            sql += " AND active = 1"
        sql += " ORDER BY recorded_at DESC LIMIT ?"
        params.append(limit)
        rows = con.execute(sql, params).fetchall()
        return [_row_to_handoff(dict(row)) for row in rows]
    finally:
        con.close()


def get_project_context(
    db_path: str, project: str, *, machine: Optional[str] = None,
    canonical_repo: Optional[str] = None, checkout_path: Optional[str] = None
) -> dict[str, Any]:
    """Compact startup context for a fresh agent session: the latest
    handoff plus freshly-checked live evidence, with discrepancies called
    out explicitly rather than silently trusting the handoff. Live
    evidence always outranks the handoff when they disagree; neither this
    function nor its caller should overwrite the handoff to "fix" a
    discrepancy — a new handoff, once actually verified, does that."""
    handoff_row = get_latest_handoff(db_path, project, machine=machine)
    _machine = machine or default_machine()
    state = get_project_state(project)

    discrepancies: list[dict[str, Any]] = []
    if handoff_row and handoff_row.get("handoff") and state and state.get("git"):
        live_git = _normalize_git(state["git"])
        recorded = handoff_row["handoff"]

        recorded_head = recorded.get("head_commit")
        live_head = live_git.get("head_sha")
        if recorded_head and live_head and not commits_match(recorded_head, live_head):
            discrepancies.append(
                {
                    "field": "head_commit",
                    "recorded": recorded_head,
                    "live": live_head,
                    "message": (
                        f"Handoff recorded HEAD {recorded_head}, live HEAD is "
                        f"{live_head}. Live state is authoritative."
                    ),
                }
            )

        recorded_branch = recorded.get("branch")
        live_branch = live_git.get("branch")
        if recorded_branch and live_branch and recorded_branch != live_branch:
            discrepancies.append(
                {
                    "field": "branch",
                    "recorded": recorded_branch,
                    "live": live_branch,
                    "message": (
                        f"Handoff recorded branch {recorded_branch}, live branch "
                        f"is {live_branch}. Live state is authoritative."
                    ),
                }
            )

    elif handoff_row and handoff_row.get("handoff") and handoff_row["handoff"].get("head_commit") and not state:
        discrepancies.append(
            {
                "field": "project_state",
                "recorded": handoff_row["handoff"].get("head_commit"),
                "live": None,
                "message": (
                    "Handoff references repository state, but no live project "
                    "matching this name was found by the auditor. Verify the "
                    "project path/name before trusting the handoff."
                ),
            }
        )

    related_workstreams = []
    if state and state.get("canonical_repo"):
        canonical = state["canonical_repo"]
        all_projs = get_all_projects()
        for p in all_projs:
            p_name = p.get("name")
            if p_name and p_name != project and p.get("canonical_repo") == canonical:
                rel_handoff = get_latest_handoff(db_path, p_name, machine=_machine)
                rel_info = {
                    "project": p_name,
                    "path": p.get("path"),
                    "branch": p.get("git", {}).get("branch") if p.get("git") else None
                }
                if rel_handoff and rel_handoff.get("handoff"):
                    h = rel_handoff["handoff"]
                    rel_info["objective"] = h.get("objective")
                    rel_info["next_action"] = h.get("next_action")
                related_workstreams.append(rel_info)

    return {
        "project": project,
        "handoff": handoff_row,
        "live_state": state,
        "discrepancies": discrepancies,
        "related_workstreams": related_workstreams,
        "precedence_note": (
            "Live repository/API/machine evidence outranks this handoff whenever "
            "they conflict. Treat the handoff as historical context to verify, "
            "not as ground truth. Unknown facts should stay unknown rather than "
            "being inferred from the handoff."
        ),
    }
