from __future__ import annotations

import json
import socket
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from .central import storage_mode
from .facts import project_fact_search
from .handoff import get_project_context
from .redact import redact
from .schema import connect

LEASE_KIND = "lease_events"
WORK_EVENT_KIND = "work_events"
TRUST_EVENT_KIND = "trust_events"

TRUST_LEVELS = ("UNTRUSTED", "VERIFIED", "APPROVED", "SYSTEM")
TRUST_RANK = {name: index for index, name in enumerate(TRUST_LEVELS)}
LEASE_EVENTS = {"ACQUIRE", "HEARTBEAT", "RELEASE", "RECLAIM"}
WORK_EVENT_TYPES = {
    "NOTE",
    "COMMIT",
    "TEST",
    "BUILD",
    "DEPLOY",
    "BLOCKER",
    "DECISION",
    "BUG",
    "FILE",
    "OTHER",
}


class ContinuityError(RuntimeError):
    """Raised when the continuity/coordination layer cannot serve a request."""


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _iso(value: datetime) -> str:
    return value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def _parse(value: str | None) -> datetime:
    if not value:
        return datetime.min.replace(tzinfo=timezone.utc)
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def _machine() -> str:
    return socket.gethostname()


def _redact_value(value: Any) -> Any:
    if isinstance(value, str):
        return redact(value)
    if isinstance(value, list):
        return [_redact_value(item) for item in value]
    if isinstance(value, dict):
        return {str(key): _redact_value(item) for key, item in value.items()}
    return value


def _ensure_local_store(con) -> None:
    con.execute(
        """
        CREATE TABLE IF NOT EXISTS continuity_records (
            id TEXT PRIMARY KEY,
            kind TEXT NOT NULL,
            recorded_at TEXT NOT NULL,
            payload TEXT NOT NULL
        )
        """
    )
    con.execute(
        "CREATE INDEX IF NOT EXISTS continuity_records_kind_time ON continuity_records(kind, recorded_at)"
    )


def _local_records(db_path: str, kind: str, *, con=None) -> list[dict[str, Any]]:
    owns_connection = con is None
    connection = con or connect(db_path)
    try:
        _ensure_local_store(connection)
        rows = connection.execute(
            "SELECT payload FROM continuity_records WHERE kind = ? ORDER BY recorded_at, id",
            (kind,),
        ).fetchall()
        result: list[dict[str, Any]] = []
        for row in rows:
            try:
                payload = json.loads(row["payload"])
            except (json.JSONDecodeError, TypeError):
                continue
            if isinstance(payload, dict):
                result.append(payload)
        return result
    finally:
        if owns_connection:
            connection.close()


def _local_append(db_path: str, kind: str, record: dict[str, Any], *, con=None) -> None:
    owns_connection = con is None
    connection = con or connect(db_path)
    try:
        _ensure_local_store(connection)
        connection.execute(
            "INSERT INTO continuity_records (id, kind, recorded_at, payload) VALUES (?, ?, ?, ?)",
            (
                record["id"],
                kind,
                record["recorded_at"],
                json.dumps(record, ensure_ascii=False, sort_keys=True),
            ),
        )
        if owns_connection:
            connection.commit()
    finally:
        if owns_connection:
            connection.close()


def _records(db_path: str, kind: str) -> list[dict[str, Any]]:
    mode = storage_mode()
    if mode == "local":
        return _local_records(db_path, kind)
    if mode == "github":
        from . import github_store

        return github_store._load_records(kind)
    raise ContinuityError(
        "The optional HTTP central backend does not yet expose continuity coordination records. "
        "Use the local or GitHub-backed store for leases, trust and work journals."
    )


def _append(db_path: str, kind: str, record: dict[str, Any]) -> None:
    mode = storage_mode()
    if mode == "local":
        _local_append(db_path, kind, record)
        return
    if mode == "github":
        from . import github_store

        github_store._append_record(kind, record)
        return
    raise ContinuityError(
        "The optional HTTP central backend does not yet expose continuity coordination records."
    )


def _lease_rows(
    db_path: str,
    *,
    project: str,
    work_key: str,
    canonical_repo: str = "",
    rows: Optional[list[dict[str, Any]]] = None,
) -> list[dict[str, Any]]:
    source = rows if rows is not None else _records(db_path, LEASE_KIND)
    result = [
        row
        for row in source
        if row.get("project") == project
        and row.get("work_key") == work_key
        and (row.get("canonical_repo") or "") == (canonical_repo or "")
    ]
    result.sort(key=lambda row: (str(row.get("recorded_at") or ""), str(row.get("id") or "")))
    return result


def _derive_active_lease(rows: list[dict[str, Any]], *, now: Optional[datetime] = None) -> Optional[dict[str, Any]]:
    current: Optional[dict[str, Any]] = None
    current_expiry = datetime.min.replace(tzinfo=timezone.utc)
    now_value = now or _utcnow()

    for row in rows:
        event = str(row.get("event") or "").upper()
        if event not in LEASE_EVENTS:
            continue
        event_time = _parse(str(row.get("recorded_at") or ""))

        if current is not None and current_expiry <= event_time:
            current = None

        if event == "ACQUIRE":
            if current is None:
                current = dict(row)
                current["lease_id"] = row.get("lease_id") or row.get("id")
                current_expiry = _parse(str(row.get("expires_at") or ""))
                current["expires_at"] = _iso(current_expiry)
                current["heartbeat_at"] = row.get("recorded_at")
            continue

        if current is None:
            continue
        if row.get("lease_id") != current.get("lease_id"):
            continue

        if event == "HEARTBEAT" and row.get("owner") == current.get("owner"):
            current_expiry = _parse(str(row.get("expires_at") or ""))
            current["expires_at"] = _iso(current_expiry)
            current["heartbeat_at"] = row.get("recorded_at")
        elif event in {"RELEASE", "RECLAIM"}:
            current = None

    if current is not None and current_expiry <= now_value:
        return None
    return current


def get_active_lease(
    db_path: str,
    project: str,
    *,
    work_key: str = "default",
    canonical_repo: str = "",
) -> Optional[dict[str, Any]]:
    return _derive_active_lease(
        _lease_rows(
            db_path,
            project=project,
            work_key=work_key,
            canonical_repo=canonical_repo,
        )
    )


def acquire_work(
    db_path: str,
    project: str,
    owner: str,
    *,
    work_key: str = "default",
    ttl_seconds: int = 900,
    canonical_repo: str = "",
    checkout_path: str = "",
    machine: Optional[str] = None,
    note: str = "",
) -> dict[str, Any]:
    if ttl_seconds < 30 or ttl_seconds > 86400:
        raise ValueError("ttl_seconds must be between 30 and 86400")
    if not project.strip() or not owner.strip() or not work_key.strip():
        raise ValueError("project, owner and work_key are required")

    now = _utcnow()
    record_id = str(uuid.uuid4())
    record = {
        "id": record_id,
        "lease_id": record_id,
        "event": "ACQUIRE",
        "project": redact(project),
        "work_key": redact(work_key),
        "owner": redact(owner),
        "machine": redact(machine or _machine()),
        "canonical_repo": redact(canonical_repo or ""),
        "checkout_path": redact(checkout_path or ""),
        "note": redact(note),
        "recorded_at": _iso(now),
        "expires_at": _iso(now + timedelta(seconds=ttl_seconds)),
    }

    if storage_mode() == "local":
        con = connect(db_path)
        try:
            _ensure_local_store(con)
            with con:
                con.execute("BEGIN IMMEDIATE")
                rows = _lease_rows(
                    db_path,
                    project=record["project"],
                    work_key=record["work_key"],
                    canonical_repo=record["canonical_repo"],
                    rows=_local_records(db_path, LEASE_KIND, con=con),
                )
                active = _derive_active_lease(rows, now=now)
                if active:
                    return {"acquired": False, "lease": active}
                _local_append(db_path, LEASE_KIND, record, con=con)
            return {"acquired": True, "lease": record}
        finally:
            con.close()

    active = get_active_lease(
        db_path,
        record["project"],
        work_key=record["work_key"],
        canonical_repo=record["canonical_repo"],
    )
    if active:
        return {"acquired": False, "lease": active}

    _append(db_path, LEASE_KIND, record)
    # GitHub is an optimistic append-only store rather than a row-locking database.
    # Re-read after the append and deterministically accept only the elected active lease.
    elected = get_active_lease(
        db_path,
        record["project"],
        work_key=record["work_key"],
        canonical_repo=record["canonical_repo"],
    )
    return {"acquired": bool(elected and elected.get("lease_id") == record_id), "lease": elected}


def _lease_event(
    db_path: str,
    *,
    event: str,
    project: str,
    owner: str,
    work_key: str,
    canonical_repo: str,
    ttl_seconds: int = 900,
    note: str = "",
) -> dict[str, Any]:
    active = get_active_lease(
        db_path,
        project,
        work_key=work_key,
        canonical_repo=canonical_repo,
    )
    if not active:
        raise ContinuityError("No active lease exists for this work item")
    if event in {"HEARTBEAT", "RELEASE"} and active.get("owner") != owner:
        raise ContinuityError(
            f"Work is leased by {active.get('owner')}; {owner} cannot {event.lower()} it"
        )

    now = _utcnow()
    if event == "RECLAIM" and _parse(str(active.get("expires_at") or "")) > now:
        raise ContinuityError("An unexpired lease cannot be reclaimed")

    record = {
        "id": str(uuid.uuid4()),
        "lease_id": active["lease_id"],
        "event": event,
        "project": active["project"],
        "work_key": active["work_key"],
        "owner": active["owner"] if event != "RECLAIM" else redact(owner),
        "machine": active.get("machine") or "",
        "canonical_repo": active.get("canonical_repo") or "",
        "checkout_path": active.get("checkout_path") or "",
        "note": redact(note),
        "recorded_at": _iso(now),
        "expires_at": (
            _iso(now + timedelta(seconds=ttl_seconds))
            if event == "HEARTBEAT"
            else active.get("expires_at")
        ),
    }
    _append(db_path, LEASE_KIND, record)
    return record


def heartbeat_work(
    db_path: str,
    project: str,
    owner: str,
    *,
    work_key: str = "default",
    canonical_repo: str = "",
    ttl_seconds: int = 900,
    note: str = "",
) -> dict[str, Any]:
    if ttl_seconds < 30 or ttl_seconds > 86400:
        raise ValueError("ttl_seconds must be between 30 and 86400")
    return _lease_event(
        db_path,
        event="HEARTBEAT",
        project=project,
        owner=owner,
        work_key=work_key,
        canonical_repo=canonical_repo,
        ttl_seconds=ttl_seconds,
        note=note,
    )


def release_work(
    db_path: str,
    project: str,
    owner: str,
    *,
    work_key: str = "default",
    canonical_repo: str = "",
    note: str = "",
) -> dict[str, Any]:
    return _lease_event(
        db_path,
        event="RELEASE",
        project=project,
        owner=owner,
        work_key=work_key,
        canonical_repo=canonical_repo,
        note=note,
    )


def reclaim_work(
    db_path: str,
    project: str,
    owner: str,
    *,
    work_key: str = "default",
    canonical_repo: str = "",
    note: str = "",
) -> dict[str, Any]:
    rows = _lease_rows(
        db_path,
        project=project,
        work_key=work_key,
        canonical_repo=canonical_repo,
    )
    if not rows:
        raise ContinuityError("No lease history exists for this work item")

    # Reconstruct without the final expiry filter so an expired lease can be explicitly reclaimed.
    latest_acquire = None
    for row in rows:
        if row.get("event") == "ACQUIRE":
            latest_acquire = row
    if latest_acquire is None:
        raise ContinuityError("No lease acquisition exists for this work item")

    active_at_expiry = _derive_active_lease(rows, now=_parse(str(latest_acquire.get("expires_at") or "")) - timedelta(microseconds=1))
    candidate = active_at_expiry or latest_acquire
    if _parse(str(candidate.get("expires_at") or "")) > _utcnow():
        raise ContinuityError("An unexpired lease cannot be reclaimed")

    record = {
        "id": str(uuid.uuid4()),
        "lease_id": candidate.get("lease_id") or candidate.get("id"),
        "event": "RECLAIM",
        "project": candidate["project"],
        "work_key": candidate["work_key"],
        "owner": redact(owner),
        "machine": redact(_machine()),
        "canonical_repo": candidate.get("canonical_repo") or "",
        "checkout_path": candidate.get("checkout_path") or "",
        "note": redact(note),
        "recorded_at": _iso(_utcnow()),
        "expires_at": candidate.get("expires_at"),
    }
    _append(db_path, LEASE_KIND, record)
    return record


def list_leases(
    db_path: str,
    *,
    project: Optional[str] = None,
    active_only: bool = True,
) -> list[dict[str, Any]]:
    rows = _records(db_path, LEASE_KIND)
    keys = {
        (
            str(row.get("project") or ""),
            str(row.get("work_key") or "default"),
            str(row.get("canonical_repo") or ""),
        )
        for row in rows
        if not project or row.get("project") == project
    }
    result: list[dict[str, Any]] = []
    for project_name, work_key, canonical_repo in sorted(keys):
        group = _lease_rows(
            db_path,
            project=project_name,
            work_key=work_key,
            canonical_repo=canonical_repo,
            rows=rows,
        )
        active = _derive_active_lease(group)
        if active:
            result.append(active)
        elif not active_only and group:
            item = dict(group[-1])
            item["active"] = False
            result.append(item)
    return result


def append_work_event(
    db_path: str,
    project: str,
    event_type: str,
    summary: str,
    *,
    details: Optional[dict[str, Any]] = None,
    canonical_repo: str = "",
    checkout_path: str = "",
    machine: Optional[str] = None,
    agent: str = "",
    source_ref: str = "",
) -> dict[str, Any]:
    kind = event_type.upper()
    if kind not in WORK_EVENT_TYPES:
        raise ValueError(f"Unsupported work event type: {kind}")
    if not summary.strip():
        raise ValueError("summary is required")

    record = {
        "id": str(uuid.uuid4()),
        "project": redact(project),
        "event_type": kind,
        "summary": redact(summary),
        "details": _redact_value(details or {}),
        "canonical_repo": redact(canonical_repo or ""),
        "checkout_path": redact(checkout_path or ""),
        "machine": redact(machine or _machine()),
        "agent": redact(agent),
        "source_ref": redact(source_ref),
        "recorded_at": _iso(_utcnow()),
    }
    _append(db_path, WORK_EVENT_KIND, record)
    return record


def list_work_events(
    db_path: str,
    project: str,
    *,
    limit: int = 20,
    canonical_repo: str = "",
) -> list[dict[str, Any]]:
    if limit < 1 or limit > 200:
        raise ValueError("limit must be between 1 and 200")
    rows = [
        row
        for row in _records(db_path, WORK_EVENT_KIND)
        if row.get("project") == project
        and (not canonical_repo or (row.get("canonical_repo") or "") in {canonical_repo, ""})
    ]
    rows.sort(key=lambda row: str(row.get("recorded_at") or ""), reverse=True)
    return rows[:limit]


def set_trust(
    db_path: str,
    target_id: str,
    level: str,
    *,
    project: str = "",
    target_type: str = "project_fact",
    actor: str,
    actor_kind: str,
    source_ref: str = "",
    note: str = "",
) -> dict[str, Any]:
    trust = level.upper()
    actor_type = actor_kind.lower()
    if trust not in TRUST_LEVELS:
        raise ValueError(f"Invalid trust level: {trust}")
    if actor_type not in {"agent", "human", "system"}:
        raise ValueError("actor_kind must be agent, human or system")
    if actor_type == "agent" and trust != "UNTRUSTED":
        raise PermissionError("Agents may propose/store untrusted memory but may not self-promote trust")
    if actor_type == "system" and trust != "SYSTEM":
        raise PermissionError("System actors may only assign SYSTEM trust")
    if trust == "VERIFIED" and not source_ref:
        raise ValueError("VERIFIED trust requires source_ref")
    if not target_id.strip() or not actor.strip():
        raise ValueError("target_id and actor are required")

    record = {
        "id": str(uuid.uuid4()),
        "target_type": redact(target_type),
        "target_id": redact(target_id),
        "project": redact(project),
        "level": trust,
        "actor": redact(actor),
        "actor_kind": actor_type,
        "source_ref": redact(source_ref),
        "note": redact(note),
        "recorded_at": _iso(_utcnow()),
    }
    _append(db_path, TRUST_EVENT_KIND, record)
    return record


def get_trust(db_path: str, target_id: str) -> dict[str, Any]:
    rows = [row for row in _records(db_path, TRUST_EVENT_KIND) if row.get("target_id") == target_id]
    rows.sort(key=lambda row: str(row.get("recorded_at") or ""))
    if not rows:
        return {"target_id": target_id, "level": "UNTRUSTED", "implicit": True}
    result = dict(rows[-1])
    result["implicit"] = False
    return result


def trusted_fact_search(
    db_path: str,
    query: str,
    *,
    project: str,
    minimum_trust: str = "VERIFIED",
    limit: int = 20,
) -> list[dict[str, Any]]:
    minimum = minimum_trust.upper()
    if minimum not in TRUST_RANK:
        raise ValueError(f"Invalid trust level: {minimum}")

    result: list[dict[str, Any]] = []
    for fact in project_fact_search(db_path, query=query, project=project, active_only=True):
        trust = get_trust(db_path, str(fact["id"]))
        if TRUST_RANK[trust["level"]] < TRUST_RANK[minimum]:
            continue
        item = dict(fact)
        item["trust"] = trust
        result.append(item)
    result.sort(key=lambda row: str(row.get("recorded_at") or ""), reverse=True)
    return result[:limit]


def get_resume_brief(
    db_path: str,
    project: str,
    *,
    canonical_repo: str = "",
    checkout_path: str = "",
    machine: Optional[str] = None,
    current_agent: str = "",
    work_key: str = "default",
    event_limit: int = 8,
) -> dict[str, Any]:
    context = get_project_context(
        db_path,
        project,
        machine=machine,
        canonical_repo=canonical_repo or None,
        checkout_path=checkout_path or None,
    )
    lease = get_active_lease(
        db_path,
        project,
        work_key=work_key,
        canonical_repo=canonical_repo,
    )
    recent_events = list_work_events(
        db_path,
        project,
        limit=event_limit,
        canonical_repo=canonical_repo,
    )

    handoff = context.get("handoff") or {}
    handoff_payload = handoff.get("handoff") or {}
    collision_warning = None
    if lease and current_agent and lease.get("owner") != current_agent:
        collision_warning = (
            f"Work key '{work_key}' is currently leased by {lease.get('owner')} until "
            f"{lease.get('expires_at')}. Do not duplicate that work without coordination."
        )

    return {
        "project": project,
        "objective": handoff_payload.get("objective"),
        "next_action": handoff_payload.get("next_action"),
        "handoff": handoff or None,
        "live_state": context.get("live_state"),
        "discrepancies": context.get("discrepancies", []),
        "active_lease": lease,
        "collision_warning": collision_warning,
        "recent_work": recent_events,
        "precedence_note": context.get("precedence_note"),
        "resume_rule": (
            "Verify live Git/API/machine state first; then continue the first still-valid next action. "
            "Do not redo completed work merely because a new agent lacks conversational context."
        ),
    }
