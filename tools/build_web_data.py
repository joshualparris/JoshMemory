"""Export the JoshMemory sqlite index into static JSON for the docs/ GitHub Pages GUI.

Run after re-indexing to refresh the browsable site:
    python tools/build_web_data.py
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


def project_name(cwd: str | None) -> str:
    if not cwd:
        return "Unknown"
    cwd = cwd.rstrip("\\/")
    name = re.split(r"[\\/]", cwd)[-1]
    return name or cwd


def main() -> None:
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
    for s in sessions:
        thread_id = s["thread_id"]
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
                # Defense in depth: re-redact at export time even though the indexer
                # already redacts on ingest, since the sqlite index can carry text
                # indexed before a given secret pattern existed.
                "text": redact(e["text"]),
            }
            for e in events
            if e["text"]
        ]

        project = project_name(s["cwd"])

        session_doc = {
            "thread_id": thread_id,
            "title": s["title"] or s["first_user_message"] or "(untitled session)",
            "project": project,
            "cwd": s["cwd"],
            "source": s["source"],
            "model": s["model"],
            "branch": s["git_branch"],
            "repo": s["git_origin_url"],
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
                "preview": (s["first_user_message"] or "")[:220],
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
        "generated_at": __import__("datetime").datetime.utcnow().isoformat() + "Z",
    }
    (OUT_DIR / "meta.json").write_text(json.dumps(meta, ensure_ascii=False), encoding="utf-8")

    print(f"Wrote {len(index)} sessions to {OUT_DIR}")


if __name__ == "__main__":
    main()
