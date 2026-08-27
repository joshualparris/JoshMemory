from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any

from .index import open_index, utc_now
from .redact import redact


def import_github_evidence(path: Path, *, db_path: Path | None = None) -> dict[str, int]:
    con = open_index(db_path)
    stat = path.stat()
    counts = {"seen": 0, "imported": 0, "skipped": 0}
    with path.open("r", encoding="utf-8", errors="replace") as fh:
        for line_no, line in enumerate(fh, 1):
            if not line.strip():
                continue
            counts["seen"] += 1
            try:
                item = json.loads(line)
            except json.JSONDecodeError:
                counts["skipped"] += 1
                continue
            item_id = str(item.get("id") or f"line-{line_no}")
            thread_id = f"github_evidence:{item_id}"
            project = str(item.get("project") or item.get("repository") or "unknown")
            text = github_evidence_text(item)
            con.execute("DELETE FROM sessions WHERE thread_id = ?", (thread_id,))
            con.execute(
                """
                INSERT INTO sessions (
                  thread_id, rollout_path, rollout_slug, created_at, updated_at, cwd,
                  originator, source, cli_version, model, git_origin_url, git_branch,
                  git_sha, title, first_user_message, line_count, file_size, indexed_at,
                  source_mtime
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    thread_id, f"{path}#L{line_no}", path.stem,
                    item.get("observed_at"), item.get("observed_at"), f"seed://{project}",
                    "github_evidence", "github_evidence", None, None,
                    item.get("url") if item.get("url_type") == "repository" else None,
                    item.get("branch"), item.get("sha") or item.get("commit"),
                    f"GitHub evidence: {item.get('url_type') or 'reference'}",
                    item.get("url"), 1, stat.st_size, utc_now(), stat.st_mtime,
                ),
            )
            con.execute(
                """
                INSERT OR IGNORE INTO events (
                  thread_id, source_line, timestamp, event_kind, role, text, text_hash
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    thread_id, line_no, item.get("observed_at"), "github_evidence",
                    "evidence", text, hashlib.sha256(text.encode("utf-8", "replace")).hexdigest(),
                ),
            )
            counts["imported"] += 1
    con.commit()
    con.close()
    return counts


def github_evidence_text(item: dict[str, Any]) -> str:
    fields = [
        f"Project: {item.get('project')}", f"Repository: {item.get('repository')}",
        f"URL: {item.get('url')}", f"URL type: {item.get('url_type')}",
        f"Observed at: {item.get('observed_at')}", f"Exactness: {item.get('exactness')}",
        f"Was exactly observed: {item.get('was_exactly_observed')}",
        f"Provenance: {item.get('provenance')}", f"Notes: {item.get('notes')}",
        f"Related: {json.dumps(item.get('related') or {}, ensure_ascii=False, sort_keys=True)}",
        "Important: this is GitHub evidence, not a raw Codex transcript.",
    ]
    return redact("\n".join(field for field in fields if field and not field.endswith("None")))


def github_evidence(*, project: str | None = None, limit: int = 100, db_path: Path | None = None) -> list[dict[str, Any]]:
    con = open_index(db_path)
    clauses = ["s.source = 'github_evidence'"]
    params: list[Any] = []
    if project:
        clauses.append("s.cwd = ?")
        params.append(f"seed://{project}")
    params.append(limit)
    rows = con.execute(
        f"""
        SELECT s.thread_id, s.title, s.cwd, s.created_at, s.rollout_path,
          s.git_origin_url, s.git_branch, s.git_sha, e.source_line, e.text
        FROM sessions s JOIN events e ON e.thread_id = s.thread_id
        WHERE {' AND '.join(clauses)}
        ORDER BY s.created_at, e.source_line LIMIT ?
        """,
        params,
    ).fetchall()
    con.close()
    return [dict(row) for row in rows]