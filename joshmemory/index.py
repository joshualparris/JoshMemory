from __future__ import annotations

import datetime as dt
import sqlite3
from pathlib import Path
from typing import Any

from .parser import ParsedSession, parse_rollout
from .paths import default_db_path, default_sessions_dir
from .schema import connect
from .auditor import get_project_state, get_all_projects


def utc_now() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")


def open_index(db_path: Path | None = None) -> sqlite3.Connection:
    path = db_path or default_db_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    return connect(str(path))


def discover_rollouts(sessions_dir: Path | None = None) -> list[Path]:
    root = sessions_dir or default_sessions_dir()
    return sorted(root.glob("**/rollout-*.jsonl"))


def index_all(db_path: Path | None = None, sessions_dir: Path | None = None, *, force: bool = False) -> dict[str, int]:
    if force:
        reset_index(db_path)
    con = open_index(db_path)
    counts = {"seen": 0, "indexed": 0, "skipped": 0, "events": 0}
    for path in discover_rollouts(sessions_dir):
        counts["seen"] += 1
        if is_current(con, path):
            counts["skipped"] += 1
            continue
        session = parse_rollout(path)
        write_session(con, session)
        counts["indexed"] += 1
        counts["events"] += len(session.events)
    con.commit()
    con.close()
    return counts


def reset_index(db_path: Path | None = None) -> None:
    path = db_path or default_db_path()
    for candidate in (path, path.with_name(path.name + "-wal"), path.with_name(path.name + "-shm")):
        if candidate.exists():
            candidate.unlink()


def is_current(con: sqlite3.Connection, path: Path) -> bool:
    row = con.execute("SELECT source_mtime, file_size FROM sessions WHERE rollout_path = ?", (str(path),)).fetchone()
    if not row:
        return False
    stat = path.stat()
    return float(row["source_mtime"]) == stat.st_mtime and int(row["file_size"]) == stat.st_size


def write_session(con: sqlite3.Connection, session: ParsedSession) -> None:
    stat = session.rollout_path.stat()
    con.execute("DELETE FROM sessions WHERE thread_id = ?", (session.thread_id,))
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
            session.thread_id,
            str(session.rollout_path),
            session.rollout_slug,
            session.created_at,
            session.updated_at,
            session.cwd,
            session.originator,
            session.source,
            session.cli_version,
            session.model,
            session.git_origin_url,
            session.git_branch,
            session.git_sha,
            session.title,
            session.first_user_message,
            session.line_count,
            session.file_size,
            utc_now(),
            stat.st_mtime,
        ),
    )
    con.executemany(
        """
        INSERT OR IGNORE INTO events (
          thread_id, source_line, timestamp, event_kind, role, text, text_hash
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        [
            (
                session.thread_id,
                event.source_line,
                event.timestamp,
                event.event_kind,
                event.role,
                event.text,
                event.text_hash,
            )
            for event in session.events
        ],
    )


def search_sessions(query: str, *, limit: int = 10, db_path: Path | None = None) -> list[dict[str, Any]]:
    con = open_index(db_path)
    fts_query = make_fts_query(query)
    rows = con.execute(
        """
        SELECT
          s.thread_id, s.title, s.cwd, s.created_at, s.updated_at, s.rollout_path,
          e.source_line, e.role, e.event_kind, e.provenance, e.source_id,
          snippet(events_fts, 0, '[', ']', '...', 18) AS snippet,
          bm25(events_fts) AS score
        FROM events_fts
        JOIN events e ON e.id = events_fts.rowid
        JOIN sessions s ON s.thread_id = e.thread_id
        WHERE events_fts MATCH ?
        ORDER BY score
        LIMIT ?
        """,
        (fts_query, limit),
    ).fetchall()
    con.close()
    return [dict(row) for row in rows]


def get_session(thread_id: str, *, limit_events: int = 200, db_path: Path | None = None) -> dict[str, Any] | None:
    con = open_index(db_path)
    session = con.execute("SELECT * FROM sessions WHERE thread_id = ?", (thread_id,)).fetchone()
    if not session:
        con.close()
        return None
    events = con.execute(
        """
        SELECT source_line, timestamp, event_kind, role, text, provenance, source_id
        FROM events
        WHERE thread_id = ?
        ORDER BY source_line
        LIMIT ?
        """,
        (thread_id, limit_events),
    ).fetchall()
    con.close()
    data = dict(session)
    data["events"] = [dict(row) for row in events]
    return data


def project_history(project: str, *, limit: int = 30, db_path: Path | None = None, state: dict[str, Any] | None = None) -> dict[str, Any]:
    if state is None:
        state = get_project_state(project)
    search_term = state.get("name") if state else project
    
    con = open_index(db_path)
    like = f"%{search_term}%"
    rows = con.execute(
        """
                SELECT DISTINCT s.thread_id, s.title, s.cwd, s.created_at, s.updated_at,
                    s.rollout_path, s.git_origin_url, s.git_branch, s.git_sha, s.source,
          COUNT(e.id) AS indexed_events
        FROM sessions s
        LEFT JOIN events e ON e.thread_id = s.thread_id
        WHERE s.cwd LIKE ? OR s.title LIKE ? OR s.first_user_message LIKE ?
           OR s.git_origin_url LIKE ?
           OR EXISTS (
             SELECT 1 FROM events_fts f
             JOIN events ee ON ee.id = f.rowid
             WHERE ee.thread_id = s.thread_id AND f.text MATCH ?
           )
        GROUP BY s.thread_id
        ORDER BY
          CASE
            WHEN s.cwd = ? THEN 0
            WHEN s.cwd LIKE ? THEN 1
            WHEN s.title LIKE ? THEN 2
            ELSE 3
          END,
          s.created_at DESC
        LIMIT ?
        """,
        (like, like, like, like, make_fts_query(search_term), f"seed://{search_term}", like, like, limit),
    ).fetchall()
    con.close()
    
    # Also fetch github evidence related to this project
    try:
        from .github_evidence import github_evidence
        ev = github_evidence(project=search_term, limit=limit, db_path=db_path)
    except Exception:
        ev = []
        
    return {
        "live_state": state,
        "history": [dict(row) for row in rows],
        "github_evidence": ev
    }


def recent_work(*, limit: int = 10, db_path: Path | None = None) -> list[dict[str, Any]]:
    con = open_index(db_path)
    rows = con.execute(
        """
        SELECT thread_id, title, cwd, created_at, updated_at, rollout_path,
          git_origin_url, git_branch, git_sha, line_count, file_size
        FROM sessions
        ORDER BY COALESCE(updated_at, created_at) DESC
        LIMIT ?
        """,
        (limit * 3,),
    ).fetchall()
    con.close()
    
    db_recent = [dict(row) for row in rows]
    all_projects = get_all_projects()
    
    scored_projects = {}
    for p in all_projects:
        name = p.get("name")
        if not name: continue
        score = 0
        git = p.get("git")
        if git:
            if git.get("modified", 0) > 0 or git.get("untracked", 0) > 0:
                score += 50
            if git.get("branch") not in ("main", "master", None):
                score += 30
            commit_date = git.get("latest_commit_date")
            if commit_date:
                try:
                    dt_obj = dt.datetime.fromisoformat(commit_date.replace("Z", "+00:00"))
                    if dt_obj.tzinfo is None:
                        dt_obj = dt_obj.replace(tzinfo=dt.timezone.utc)
                    days = (dt.datetime.now(dt.timezone.utc) - dt_obj).days
                    score += max(0, 40 - days)
                except ValueError:
                    pass
        scored_projects[name] = {"project": p, "score": score, "recent_sessions": []}
        
    for r in db_recent:
        cwd = r.get("cwd", "")
        for name, data in scored_projects.items():
            if name.lower() in cwd.lower():
                data["score"] += 60
                if len(data["recent_sessions"]) < 3:
                    data["recent_sessions"].append(r)
                break
                
    ranked = sorted(scored_projects.values(), key=lambda x: x["score"], reverse=True)
    
    result = []
    for item in ranked:
        if item["score"] > 0:
            reasons = []
            git = item["project"].get("git", {})
            if git.get("modified", 0) > 0:
                reasons.append(f"{git['modified']} modified files")
            if git.get("untracked", 0) > 0:
                reasons.append(f"{git['untracked']} untracked files")
            for sess in item["recent_sessions"]:
                reasons.append(f"recent historical session on {sess.get('created_at', 'unknown date')}")
            
            result.append({
                "project": item["project"]["name"],
                "activity_score": item["score"],
                "confidence": "high" if len(item["recent_sessions"]) > 0 else "medium",
                "reasons": reasons,
                "project_details": item["project"]
            })
            if len(result) >= limit:
                break
                
    return result


def project_status(project: str, *, db_path: Path | None = None) -> dict[str, Any]:
    state = get_project_state(project)
    search_term = state.get("name") if state else project
    
    # 2. recent Codex/session work & GitHub evidence via project_history
    hist = project_history(search_term, limit=10, db_path=db_path, state=state)
    
    
    from .classification import classify_evidence
    classified = classify_evidence(state, hist.get("history", []), hist.get("github_evidence", []))
    
    return {
        "project_query": project,
        "live_auditor_state": state,
        "historical_sessions": hist.get("history", []),
        "github_evidence": hist.get("github_evidence", []),
        "current_state": classified["verified_live_state"],
        "historical_evidence": classified["historical_session_evidence"] + classified["historical_imported_evidence"],
        "verified_claims": classified["verified_git_evidence"],
        "inferences": classified["inferences"],
        "contradictions": classified["contradictions"],
        "evidence_summary": classified["evidence_summary"],
        "wording_guidance": classified["wording_guidance"],
        "note": "Inference (Last known goal, Likely next step, etc.) should be performed by the agent reading this data. Live filesystem state is distinct from historical index data."
    }


def make_fts_query(query: str) -> str:
    terms = [term.strip().replace('"', "") for term in query.split() if term.strip()]
    if not terms:
        return '""'
    return " OR ".join(f'"{term}"' for term in terms)
