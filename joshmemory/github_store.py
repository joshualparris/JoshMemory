from __future__ import annotations

import base64
import json
import os
import re
import socket
import subprocess
import uuid
from datetime import datetime, timezone
from typing import Any
from urllib import error, parse, request

DEFAULT_REPO = "joshualparris/JoshDashboard4"
DEFAULT_BRANCH = "main"
DEFAULT_ROOT = "joshmemory-cloud/v1"
HANDOFF_SUBJECT = "session_handoff"
HANDOFF_STATUS = "CURRENT"

VALID_FACT_STATUSES = {
    "VERIFIED",
    "OBSERVED",
    "HISTORICAL",
    "INFERRED",
    "STALE",
    "DISPROVEN",
    "UNKNOWN",
    "CURRENT",
}
VALID_ACCOUNTABILITY_VERDICTS = {"SATISFIED", "REJECTED", "EVIDENCED"}


class GitHubStoreError(RuntimeError):
    """Raised when the GitHub-backed shared-memory store cannot be used."""


def _repo() -> str:
    value = os.environ.get("JOSHMEMORY_GITHUB_STORE_REPO", DEFAULT_REPO).strip()
    if not re.fullmatch(r"[^/\s]+/[^/\s]+", value):
        raise GitHubStoreError("JOSHMEMORY_GITHUB_STORE_REPO must be owner/repository")
    return value


def _branch() -> str:
    return os.environ.get("JOSHMEMORY_GITHUB_STORE_BRANCH", DEFAULT_BRANCH).strip() or DEFAULT_BRANCH


def _root() -> str:
    value = os.environ.get("JOSHMEMORY_GITHUB_STORE_ROOT", DEFAULT_ROOT).strip().strip("/")
    return value or DEFAULT_ROOT


def _now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _token_from_gh() -> str:
    try:
        completed = subprocess.run(
            ["gh", "auth", "token"],
            capture_output=True,
            text=True,
            timeout=3,
            check=False,
        )
    except (FileNotFoundError, subprocess.SubprocessError, OSError):
        return ""
    return completed.stdout.strip() if completed.returncode == 0 else ""


def _token_from_git_credential() -> str:
    env = dict(os.environ)
    env["GIT_TERMINAL_PROMPT"] = "0"
    try:
        completed = subprocess.run(
            ["git", "credential", "fill"],
            input="protocol=https\nhost=github.com\n\n",
            capture_output=True,
            text=True,
            timeout=3,
            check=False,
            env=env,
        )
    except (FileNotFoundError, subprocess.SubprocessError, OSError):
        return ""
    if completed.returncode != 0:
        return ""
    for line in completed.stdout.splitlines():
        if line.startswith("password="):
            return line.partition("=")[2].strip()
    return ""


def github_token() -> str:
    """Resolve an existing GitHub credential without prompting or persisting it.

    Explicit JoshMemory/GitHub environment variables win, then GitHub CLI auth,
    then the configured Git credential helper. Tokens are never written to the
    JoshMemory database or backing repository.
    """
    for name in ("JOSHMEMORY_GITHUB_TOKEN", "GH_TOKEN", "GITHUB_TOKEN"):
        value = os.environ.get(name, "").strip()
        if value:
            return value
    return _token_from_gh() or _token_from_git_credential()


def enabled() -> bool:
    if os.environ.get("JOSHMEMORY_GITHUB_STORE_AUTO", "1").strip().lower() in {"0", "false", "no", "off"}:
        return False
    return bool(github_token())


def _api_request(method: str, endpoint: str, payload: dict[str, Any] | None = None) -> Any:
    token = github_token()
    if not token:
        raise GitHubStoreError(
            "GitHub shared memory is configured but no existing GitHub credential was found"
        )

    body = None
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {token}",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "JoshMemory",
    }
    if payload is not None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = request.Request(
        f"https://api.github.com/repos/{_repo()}{endpoint}",
        data=body,
        headers=headers,
        method=method,
    )
    try:
        with request.urlopen(req, timeout=float(os.environ.get("JOSHMEMORY_GITHUB_TIMEOUT", "10"))) as response:
            raw = response.read()
            return json.loads(raw.decode("utf-8")) if raw else None
    except error.HTTPError as exc:
        try:
            detail = json.loads(exc.read().decode("utf-8")).get("message", str(exc))
        except Exception:
            detail = str(exc)
        raise GitHubStoreError(f"GitHub shared memory HTTP {exc.code}: {detail}") from exc
    except (error.URLError, TimeoutError, OSError, json.JSONDecodeError) as exc:
        raise GitHubStoreError(f"GitHub shared memory unavailable: {exc}") from exc


def _record_prefix(kind: str) -> str:
    return f"{_root()}/{kind}/"


def _load_records(kind: str) -> list[dict[str, Any]]:
    branch = parse.quote(_branch(), safe="")
    tree = _api_request("GET", f"/git/trees/{branch}?recursive=1") or {}
    prefix = _record_prefix(kind)
    paths = sorted(
        entry.get("path", "")
        for entry in tree.get("tree", [])
        if entry.get("type") == "blob"
        and entry.get("path", "").startswith(prefix)
        and entry.get("path", "").endswith(".json")
    )

    records: list[dict[str, Any]] = []
    for path in paths:
        encoded_path = parse.quote(path, safe="/")
        ref = parse.quote(_branch(), safe="")
        payload = _api_request("GET", f"/contents/{encoded_path}?ref={ref}") or {}
        encoded = str(payload.get("content") or "").replace("\n", "")
        if not encoded:
            continue
        try:
            decoded = base64.b64decode(encoded).decode("utf-8")
            record = json.loads(decoded)
        except (ValueError, UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise GitHubStoreError(f"Invalid JoshMemory cloud record at {path}: {exc}") from exc
        if isinstance(record, dict):
            records.append(record)
        elif isinstance(record, list):
            records.extend(item for item in record if isinstance(item, dict))
    return records


def _append_record(kind: str, record: dict[str, Any]) -> None:
    record_id = str(record["id"])
    path = f"{_record_prefix(kind)}{record_id}.json"
    encoded_path = parse.quote(path, safe="/")
    content = json.dumps(record, ensure_ascii=False, sort_keys=True, indent=2).encode("utf-8")
    _api_request(
        "PUT",
        f"/contents/{encoded_path}",
        {
            "message": f"JoshMemory: add {kind} record {record_id}",
            "content": base64.b64encode(content).decode("ascii"),
            "branch": _branch(),
        },
    )


def _with_active(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    superseded = {str(row["supersedes"]) for row in records if row.get("supersedes")}
    result: list[dict[str, Any]] = []
    for row in records:
        item = dict(row)
        item["active"] = 0 if str(item.get("id")) in superseded else 1
        result.append(item)
    return result


def _project_facts() -> list[dict[str, Any]]:
    return _with_active(_load_records("project_facts"))


def _accountability_records() -> list[dict[str, Any]]:
    return _with_active(_load_records("accountability"))


def _project_fact_add(arguments: dict[str, Any]) -> dict[str, Any]:
    project = str(arguments["project"])
    subject = str(arguments["subject"])
    fact = str(arguments["fact"])
    status = str(arguments["status"]).upper()
    confidence = arguments.get("confidence")
    observed_at = arguments.get("observed_at")
    source_type = arguments.get("source_type")
    source_ref = arguments.get("source_ref")
    machine = arguments.get("machine") or ""
    supersedes = arguments.get("supersedes")
    canonical_repo = arguments.get("canonical_repo") or ""
    checkout_path = arguments.get("checkout_path") or ""

    if status not in VALID_FACT_STATUSES:
        raise ValueError(f"Invalid status {status}")
    if status == "VERIFIED" and not source_ref:
        raise ValueError("VERIFIED status requires source_ref")
    if confidence is not None and not (0.0 <= float(confidence) <= 1.0):
        raise ValueError("Confidence must be between 0.0 and 1.0")
    if not source_type:
        raise ValueError("source_type is required")

    records = _project_facts()
    for row in records:
        if (
            row.get("project") == project
            and (row.get("canonical_repo") or "") == canonical_repo
            and (row.get("checkout_path") or "") == checkout_path
            and row.get("subject") == subject
            and row.get("fact") == fact
            and row.get("status") == status
            and (row.get("machine") or "") == machine
        ):
            if row.get("supersedes") != supersedes:
                raise ValueError(
                    f"Fact already exists but with a different supersedes target ({row.get('supersedes')})"
                )
            for key, supplied in (
                ("source_type", source_type),
                ("source_ref", source_ref),
                ("confidence", confidence),
                ("observed_at", observed_at),
            ):
                if supplied is not None and row.get(key) != supplied:
                    raise ValueError("Duplicate operation has conflicting provenance/history fields")
            return {"id": row["id"], "project": project, "fact": fact, "duplicate": True}

    if supersedes:
        old = next((row for row in records if row.get("id") == supersedes), None)
        if not old:
            raise ValueError(f"Superseded fact {supersedes} not found")
        if not old.get("active"):
            raise ValueError(f"Superseded fact {supersedes} is already inactive")
        if old.get("project") != project or old.get("subject") != subject or (old.get("machine") or "") != machine:
            raise ValueError(f"Superseded fact {supersedes} does not match project/subject/machine")
        old_canon = old.get("canonical_repo") or ""
        old_path = old.get("checkout_path") or ""
        if canonical_repo and old_canon and canonical_repo != old_canon:
            raise ValueError(f"Superseded fact {supersedes} belongs to a different canonical repo")
        if checkout_path and old_path and checkout_path != old_path:
            raise ValueError(f"Superseded fact {supersedes} belongs to a different checkout path")

    record = {
        "id": str(uuid.uuid4()),
        "project": project,
        "machine": machine,
        "subject": subject,
        "fact": fact,
        "status": status,
        "confidence": confidence,
        "observed_at": observed_at,
        "recorded_at": _now(),
        "source_type": source_type,
        "source_ref": source_ref,
        "supersedes": supersedes,
        "canonical_repo": canonical_repo,
        "checkout_path": checkout_path,
    }
    _append_record("project_facts", record)
    return {"id": record["id"], "project": project, "fact": fact, "duplicate": False}


def _project_fact_search(arguments: dict[str, Any]) -> list[dict[str, Any]]:
    query = str(arguments["query"]).lower()
    project = arguments.get("project")
    active_only = bool(arguments.get("active_only", True))
    rows = []
    for row in _project_facts():
        if project and row.get("project") != project:
            continue
        if active_only and not row.get("active"):
            continue
        if query in str(row.get("subject") or "").lower() or query in str(row.get("fact") or "").lower():
            rows.append(row)
    return rows


def _row_to_handoff(row: dict[str, Any]) -> dict[str, Any]:
    item = dict(row)
    try:
        item["handoff"] = json.loads(str(item.get("fact") or ""))
    except (json.JSONDecodeError, TypeError):
        item["handoff"] = None
    return item


def _handoff_rows(
    project: str,
    *,
    machine: str | None = None,
    canonical_repo: str | None = None,
    checkout_path: str | None = None,
    strict_checkout: bool = False,
    active_only: bool = True,
) -> list[dict[str, Any]]:
    rows = [
        row
        for row in _project_facts()
        if row.get("project") == project
        and row.get("subject") == HANDOFF_SUBJECT
        and row.get("status") == HANDOFF_STATUS
        and (not active_only or row.get("active"))
    ]
    if machine:
        rows = [row for row in rows if row.get("machine") == machine]

    if canonical_repo:
        rows = [row for row in rows if (row.get("canonical_repo") or "") in {canonical_repo, ""}]
        if strict_checkout and checkout_path:
            rows = [row for row in rows if (row.get("checkout_path") or "") in {checkout_path, ""}]
    elif checkout_path:
        rows = [row for row in rows if (row.get("checkout_path") or "") in {checkout_path, ""}]

    def rank(row: dict[str, Any]) -> tuple[int, int, str]:
        canon_rank = int(bool(canonical_repo) and (row.get("canonical_repo") or "") == canonical_repo)
        path_rank = int(bool(checkout_path) and (row.get("checkout_path") or "") == checkout_path)
        return canon_rank, path_rank, str(row.get("recorded_at") or "")

    rows.sort(key=rank, reverse=True)
    return rows


def _get_latest_handoff(arguments: dict[str, Any]) -> dict[str, Any] | None:
    rows = _handoff_rows(
        str(arguments["project"]),
        machine=arguments.get("machine"),
        canonical_repo=arguments.get("canonical_repo"),
        checkout_path=arguments.get("checkout_path"),
        strict_checkout=bool(arguments.get("strict_checkout", False)),
        active_only=True,
    )
    return _row_to_handoff(rows[0]) if rows else None


def _list_handoffs(arguments: dict[str, Any]) -> list[dict[str, Any]]:
    rows = _handoff_rows(
        str(arguments["project"]),
        machine=arguments.get("machine"),
        canonical_repo=arguments.get("canonical_repo"),
        checkout_path=arguments.get("checkout_path"),
        active_only=bool(arguments.get("active_only", False)),
    )
    return [_row_to_handoff(row) for row in rows[: int(arguments.get("limit", 10))]]


def _save_handoff(arguments: dict[str, Any]) -> dict[str, Any]:
    project = str(arguments["project"])
    handoff = dict(arguments["handoff"])
    if not handoff.get("objective"):
        raise ValueError("handoff missing required field(s): objective")

    machine = arguments.get("machine") or socket.gethostname()
    agent = arguments.get("agent")
    if agent:
        handoff.setdefault("agent", agent)
    canonical_repo = arguments.get("canonical_repo") or ""
    checkout_path = arguments.get("checkout_path") or ""

    previous = _get_latest_handoff(
        {
            "project": project,
            "machine": machine,
            "canonical_repo": canonical_repo,
            "checkout_path": checkout_path,
            "strict_checkout": True,
        }
    )
    fact_text = json.dumps(handoff, ensure_ascii=False, sort_keys=True)
    if previous and previous.get("fact") == fact_text:
        result = dict(previous)
        result["duplicate"] = True
        return result

    result = _project_fact_add(
        {
            "project": project,
            "subject": HANDOFF_SUBJECT,
            "fact": fact_text,
            "status": HANDOFF_STATUS,
            "source_type": str(arguments.get("source_type") or "agent_handoff"),
            "source_ref": arguments.get("source_ref"),
            "machine": machine,
            "supersedes": previous.get("id") if previous else None,
            "canonical_repo": canonical_repo,
            "checkout_path": checkout_path,
        }
    )
    result["machine"] = machine
    return result


def _accountability_reference_add(arguments: dict[str, Any]) -> dict[str, Any]:
    project = str(arguments["project"])
    claim_summary = str(arguments["claim_summary"])
    source_system = str(arguments["source_system"])
    source_id = str(arguments["source_id"])
    requirement_id = arguments.get("requirement_id") or ""
    source_ref = arguments.get("source_ref")
    reviewer = arguments.get("reviewer")
    verdict = arguments.get("verdict")
    commit_sha = arguments.get("commit_sha")
    supersedes = arguments.get("supersedes")

    if verdict:
        verdict = str(verdict).upper()
        if verdict not in VALID_ACCOUNTABILITY_VERDICTS:
            raise ValueError(f"Invalid verdict {verdict}")
    if commit_sha and not re.fullmatch(r"[0-9a-f]{7,40}", str(commit_sha)):
        raise ValueError("commit_sha must be a valid hex hash")

    records = _accountability_records()
    for row in records:
        if (
            row.get("project") == project
            and row.get("claim_summary") == claim_summary
            and row.get("source_system") == source_system
            and row.get("source_id") == source_id
            and (row.get("requirement_id") or "") == requirement_id
        ):
            if row.get("supersedes") != supersedes:
                raise ValueError(
                    f"Reference already exists but with a different supersedes target ({row.get('supersedes')})"
                )
            for key, supplied in (
                ("source_ref", source_ref),
                ("reviewer", reviewer),
                ("verdict", verdict),
                ("commit_sha", commit_sha),
            ):
                if supplied is not None and row.get(key) != supplied:
                    raise ValueError("Duplicate operation has conflicting provenance/history fields")
            return {"id": row["id"], "project": project, "source_system": source_system, "duplicate": True}

    if supersedes:
        old = next((row for row in records if row.get("id") == supersedes), None)
        if not old:
            raise ValueError(f"Superseded reference {supersedes} not found")
        if not old.get("active"):
            raise ValueError(f"Superseded reference {supersedes} is already inactive")
        if old.get("project") != project or (old.get("requirement_id") or "") != requirement_id:
            raise ValueError(f"Superseded reference {supersedes} does not match project/requirement_id")

    record = {
        "id": str(uuid.uuid4()),
        "project": project,
        "requirement_id": requirement_id,
        "claim_summary": claim_summary,
        "source_system": source_system,
        "source_id": source_id,
        "source_ref": source_ref,
        "reviewer": reviewer,
        "verdict": verdict,
        "commit_sha": commit_sha,
        "observed_at": _now(),
        "supersedes": supersedes,
    }
    _append_record("accountability", record)
    return {"id": record["id"], "project": project, "source_system": source_system, "duplicate": False}


def _accountability_reference_search(arguments: dict[str, Any]) -> list[dict[str, Any]]:
    query = str(arguments["query"]).lower()
    project = arguments.get("project")
    active_only = bool(arguments.get("active_only", True))
    rows = []
    for row in _accountability_records():
        if project and row.get("project") != project:
            continue
        if active_only and not row.get("active"):
            continue
        if query in str(row.get("claim_summary") or "").lower() or query in str(row.get("source_id") or "").lower():
            rows.append(row)
    return rows


def _coding_chats() -> list[dict[str, Any]]:
    rows = _load_records("coding_chats")
    by_id: dict[str, dict[str, Any]] = {}
    for row in rows:
        key = str(row.get("conversation_id") or row.get("id") or "")
        if not key:
            continue
        existing = by_id.get(key)
        if not existing or str(row.get("recorded_at") or row.get("updated_at") or "") >= str(existing.get("recorded_at") or existing.get("updated_at") or ""):
            by_id[key] = row
    return sorted(
        by_id.values(),
        key=lambda row: (str(row.get("created_at") or ""), str(row.get("conversation_id") or row.get("id") or "")),
    )


def _coding_chat_sync(arguments: dict[str, Any]) -> dict[str, Any]:
    batch_id = str(arguments.get("batch_id") or "").strip()
    records = arguments.get("records")
    if not batch_id or not re.fullmatch(r"[A-Za-z0-9._-]{1,160}", batch_id):
        raise ValueError("coding chat batch_id is required and must be filename-safe")
    if not isinstance(records, list) or not records or len(records) > 250:
        raise ValueError("coding chat records must contain 1..250 objects")
    normalized: list[dict[str, Any]] = []
    for item in records:
        if not isinstance(item, dict):
            raise ValueError("coding chat record must be an object")
        conversation_id = str(item.get("conversation_id") or "").strip()
        created_at = str(item.get("created_at") or "").strip()
        if not conversation_id or not created_at:
            raise ValueError("coding chat record requires conversation_id and created_at")
        row = dict(item)
        row.setdefault("id", f"chatgpt:{conversation_id}")
        row.setdefault("recorded_at", _now())
        normalized.append(row)

    path = f"{_record_prefix('coding_chats')}{batch_id}.json"
    encoded_path = parse.quote(path, safe="/")
    ref = parse.quote(_branch(), safe="")
    try:
        existing = _api_request("GET", f"/contents/{encoded_path}?ref={ref}") or {}
    except GitHubStoreError as exc:
        if "HTTP 404" not in str(exc):
            raise
        existing = {}

    content = json.dumps(normalized, ensure_ascii=False, sort_keys=True, indent=2).encode("utf-8")
    encoded = base64.b64encode(content).decode("ascii")
    if existing:
        current = str(existing.get("content") or "").replace("\n", "")
        if current and base64.b64decode(current).decode("utf-8") == content.decode("utf-8"):
            return {"batch_id": batch_id, "records": len(normalized), "duplicate": True}
        payload = {
            "message": f"JoshMemory: update coding chat batch {batch_id}",
            "content": encoded,
            "branch": _branch(),
            "sha": existing.get("sha"),
        }
    else:
        payload = {
            "message": f"JoshMemory: add coding chat batch {batch_id}",
            "content": encoded,
            "branch": _branch(),
        }
    _api_request("PUT", f"/contents/{encoded_path}", payload)
    return {"batch_id": batch_id, "records": len(normalized), "duplicate": False}


def _coding_chat_search(arguments: dict[str, Any]) -> list[dict[str, Any]]:
    query = str(arguments.get("query") or "").lower().strip()
    start_date = str(arguments.get("start_date") or "").strip()
    end_date = str(arguments.get("end_date") or "").strip()
    limit = max(1, min(int(arguments.get("limit", 100)), 5000))
    result: list[dict[str, Any]] = []
    for row in _coding_chats():
        created = str(row.get("created_at") or "")
        day = created[:10]
        if start_date and day and day < start_date:
            continue
        if end_date and day and day > end_date:
            continue
        searchable = " ".join(
            [
                str(row.get("title") or ""),
                str(row.get("first_user_message") or ""),
                " ".join(row.get("matched_terms") or []),
                str(row.get("source") or ""),
            ]
        ).lower()
        if query and query not in searchable:
            continue
        result.append(row)
        if len(result) >= limit:
            break
    return result


def _coding_chat_coverage(arguments: dict[str, Any]) -> dict[str, Any]:
    rows = _coding_chats()
    dates = [str(row.get("created_at") or "") for row in rows if row.get("created_at")]
    sources: dict[str, int] = {}
    for row in rows:
        source = str(row.get("source") or "unknown")
        sources[source] = sources.get(source, 0) + 1
    return {
        "coding_chats": len(rows),
        "earliest": min(dates) if dates else None,
        "latest": max(dates) if dates else None,
        "sources": sources,
    }


def cloud_call(operation: str, arguments: dict[str, Any]) -> Any:
    """Execute one JoshMemory shared-state operation against private GitHub storage."""
    if operation == "save_handoff":
        return _save_handoff(arguments)
    if operation == "get_latest_handoff":
        return _get_latest_handoff(arguments)
    if operation == "list_handoffs":
        return _list_handoffs(arguments)
    if operation == "project_fact_add":
        return _project_fact_add(arguments)
    if operation == "project_fact_search":
        return _project_fact_search(arguments)
    if operation == "accountability_reference_add":
        return _accountability_reference_add(arguments)
    if operation == "accountability_reference_search":
        return _accountability_reference_search(arguments)
    if operation == "coding_chat_sync":
        return _coding_chat_sync(arguments)
    if operation == "coding_chat_search":
        return _coding_chat_search(arguments)
    if operation == "coding_chat_coverage":
        return _coding_chat_coverage(arguments)
    raise ValueError(f"unsupported GitHub shared-memory operation: {operation}")
