"""Export the JoshMemory sqlite index into static JSON for the docs/ GitHub Pages GUI.

Run after re-indexing to refresh the browsable site:
    python tools/build_web_data.py

The local public-export filter is required and gitignored. The exporter fails
closed when it is absent, so private session data cannot be published by
accident.
"""
from __future__ import annotations

import json
import re
import sqlite3
from pathlib import Path

from joshmemory.paths import default_db_path
from joshmemory.redact import redact

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "docs" / "data"
SESSIONS_DIR = OUT_DIR / "sessions"
FILTER_CONFIG_PATH = Path(__file__).resolve().parent / "public_export_filter.local.json"


def load_filter_config() -> dict:
    if not FILTER_CONFIG_PATH.exists():
        raise RuntimeError(
            f"{FILTER_CONFIG_PATH} is required; refusing to publish private session data"
        )
    config = json.loads(FILTER_CONFIG_PATH.read_text(encoding="utf-8"))
    if not isinstance(config, dict):
        raise ValueError("public export filter must be a JSON object")
    return config


def compile_scrub_patterns(scrub_values: list[dict]) -> list[tuple[re.Pattern[str], str]]:
    patterns = []
    for entry in scrub_values:
        flags = re.IGNORECASE if entry.get("ignore_case", True) else 0
        patterns.append((re.compile(entry["pattern"], flags), entry.get("replacement", "[REDACTED]")))
    return patterns


def project_name(cwd: str | None) -> str:
    if not cwd:
        return "Unknown"
    cwd = cwd.rstrip("\\/")
    name = re.split(r"[\\/]", cwd)[-1]
    return name or cwd


def main() -> None:
    config = load_filter_config()
    excluded_thread_ids = set(config.get("excluded_thread_ids", []))
    scrub_patterns = compile_scrub_patterns(config.get("scrub_values", []))

    def scrub_personal(text: str) -> str:
        for pattern, replacement in scrub_patterns:
            text = pattern.sub(replacement, text)
        return text

    db_path = default_db_path()
    con = sqlite3.connect(db_path)
    con.row_factory = sqlite3.Row
    cur = con.cursor()

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    SESSIONS_DIR.mkdir(parents=True, exist_ok=True)

    sessions = cur.execute(
        """
        SELECT thread_id, title, cwd, source, model, created_at, updated_at,
               first_user_message, git_branch, git_origin_url
        FROM sessions
        ORDER BY COALESCE(updated_at, created_at) DESC
        """
    ).fetchall()

    index = []
    excluded_count = 0
    for s in sessions:
        thread_id = s["thread_id"]
        if thread_id in excluded_thread_ids:
            excluded_count += 1
            continue
        events = cur.execute(
            """
            SELECT role, event_kind, timestamp, text
            FROM events
            WHERE thread_id = ?
            ORDER BY source_line
            """,
            (thread_id,),
        ).fetchall()

        event_list = [
            {
                "role": e["role"],
                "kind": e["event_kind"],
                "timestamp": e["timestamp"],
                "text": scrub_personal(redact(e["text"])),
            }
            for e in events
            if e["text"]
        ]

        project = scrub_personal(project_name(s["cwd"]))

        session_doc = {
            "thread_id": thread_id,
            "title": scrub_personal(redact(s["title"] or s["first_user_message"] or "(untitled session)")),
            "project": project,
            "cwd": scrub_personal(s["cwd"] or ""),
            "source": s["source"],
            "model": s["model"],
            "branch": s["git_branch"],
            "repo": scrub_personal(s["git_origin_url"] or ""),
            "created_at": s["created_at"],
            "updated_at": s["updated_at"],
            "events": event_list,
        }
        (SESSIONS_DIR / f"{thread_id}.json").write_text(
            json.dumps(session_doc, ensure_ascii=False), encoding="utf-8"
        )

        index.append(
            {
                "thread_id": thread_id,
                "title": session_doc["title"],
                "project": project,
                "source": s["source"],
                "created_at": s["created_at"],
                "updated_at": s["updated_at"],
                "event_count": len(event_list),
                "preview": scrub_personal(redact((s["first_user_message"] or "")[:220])),
            }
        )

    (OUT_DIR / "index.json").write_text(
        json.dumps(index, ensure_ascii=False), encoding="utf-8"
    )

    projects = sorted({row["project"] for row in index})
    sources = sorted({row["source"] for row in index if row["source"]})
    meta = {
        "session_count": len(index),
        "event_count": sum(r["event_count"] for r in index),
        "projects": projects,
        "sources": sources,
        "generated_at": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
    }
    (OUT_DIR / "meta.json").write_text(json.dumps(meta, ensure_ascii=False), encoding="utf-8")

    print(f"Wrote {len(index)} sessions to {OUT_DIR} ({excluded_count} excluded as unsafe to publish)")


if __name__ == "__main__":
    main()
