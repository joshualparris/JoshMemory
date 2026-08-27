from __future__ import annotations

import json
import hashlib
from pathlib import Path
from typing import Any

from .index import open_index, utc_now
from .redact import redact


def import_seed_file(path: Path, *, db_path: Path | None = None) -> dict[str, int]:
    con = open_index(db_path)
    counts = {"seen": 0, "imported": 0, "skipped": 0}
    source_mtime = path.stat().st_mtime
    file_size = path.stat().st_size
    indexed_at = utc_now()

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
            item_id = str(item.get("id") or f"{path.stem}-{line_no}")
            thread_id = f"seed:{item_id}"
            text = seed_item_text(item)
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
                    thread_id,
                    f"{path}#L{line_no}",
                    path.stem,
                    item.get("occurred_at"),
                    item.get("occurred_at"),
                    f"seed://{item.get('project') or 'unknown'}",
                    "chatgpt_seed",
                    "chatgpt_seed",
                    None,
                    None,
                    None,
                    None,
                    evidence_value(item, "commit"),
                    item.get("title"),
                    item.get("summary"),
                    1,
                    file_size,
                    indexed_at,
                    source_mtime,
                ),
            )
            con.execute(
                """
                INSERT OR IGNORE INTO events (
                  thread_id, source_line, timestamp, event_kind, role, text, text_hash
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    thread_id,
                    line_no,
                    item.get("occurred_at"),
                    "chatgpt_seed_fact",
                    "seed",
                    text,
                    hashlib.sha256(text.encode("utf-8", "replace")).hexdigest(),
                ),
            )
            counts["imported"] += 1
    con.commit()
    con.close()
    return counts


def seed_item_text(item: dict[str, Any]) -> str:
    parts: list[str] = [
        f"Project: {item.get('project')}",
        f"Type: {item.get('type')}",
        f"Status: {item.get('status')}",
        f"Title: {item.get('title')}",
        f"Summary: {item.get('summary')}",
        f"Decisions: {'; '.join(item.get('decisions') or [])}",
        f"Tags: {', '.join(item.get('tags') or [])}",
        f"Confidence: {item.get('confidence')}",
        f"Provenance: {item.get('provenance')}",
        f"Evidence: {json.dumps(item.get('evidence') or {}, ensure_ascii=False, sort_keys=True)}",
        "Important: this is a ChatGPT seed fact, not a raw Codex transcript.",
    ]
    return redact("\n".join(part for part in parts if part and not part.endswith("None")))


def evidence_value(item: dict[str, Any], key: str) -> str | None:
    evidence = item.get("evidence")
    if isinstance(evidence, dict) and evidence.get(key):
        return str(evidence[key])
    return None
