from __future__ import annotations

import calendar
import datetime as dt
import re
import sqlite3
from typing import Any

from .index import open_index


CONCEPTS: dict[str, tuple[str, ...]] = {
    "coding": (
        "programming", "programmer", "software", "html", "css", "javascript",
        "python", "php", "sql", "api", "json", "git", "github", "terminal",
        "bash", "powershell", "script", "website", "web app", "chatbot", "openai",
        "code",
    ),
    "diagnostics": (
        "crash", "crashes", "logs", "errors", "troubleshooting", "root cause",
        "hardware", "stability", "pcie", "aer",
    ),
    "project_work": (
        "implementation", "tests", "test", "commit", "commits", "deployment",
        "deploy", "bug", "feature", "debugging", "build",
    ),
}

ACTIVITY_ALIASES = {
    "code": "coding", "coded": "coding", "coding": "coding", "programming": "coding",
    "software": "coding", "development": "coding", "developer": "coding",
    "diagnostic": "diagnostics", "diagnostics": "diagnostics", "troubleshooting": "diagnostics",
    "project": "project_work", "projects": "project_work",
}

SOURCE_PRECEDENCE = {
    "exact_transcript": ("historical_chatgpt_export", "codex", "github_evidence", "chatgpt_seed_fact"),
    "release_state": ("github_evidence", "codex", "historical_chatgpt_export", "chatgpt_seed_fact"),
    "historical_intent": ("historical_chatgpt_export", "codex", "chatgpt_seed_fact", "github_evidence"),
}


def parse_historical_query(query: str, *, reference_date: dt.date | None = None) -> dict[str, Any]:
    text = query.strip()
    lowered = text.lower()
    start: dt.date | None = None
    end: dt.date | None = None
    date_uncertainty: str | None = None

    match = re.search(r"between\s+(\d{1,2})\s+(\w+)\s+and\s+(\d{1,2})\s+(\w+)\s+(\d{4})", lowered)
    if match:
        try:
            start = dt.date(int(match.group(5)), month_number(match.group(2)), int(match.group(1)))
            end = dt.date(int(match.group(5)), month_number(match.group(4)), int(match.group(3)))
        except ValueError:
            date_uncertainty = "date expression could not be resolved"
    if start is None:
        match = re.search(r"\b(\d{1,2})\s+and\s+(\d{1,2})\s+([a-z]+)\s+(\d{4})\b", lowered)
        if match:
            try:
                start = dt.date(int(match.group(4)), month_number(match.group(3)), int(match.group(1)))
                end = dt.date(int(match.group(4)), month_number(match.group(3)), int(match.group(2)))
            except ValueError:
                date_uncertainty = "date expression could not be resolved"
    if start is None:
        match = re.search(r"\b(\d{1,2})\s+([a-z]+)\s+(\d{4})\b", lowered)
        if match:
            try:
                start = end = dt.date(int(match.group(3)), month_number(match.group(2)), int(match.group(1)))
            except ValueError:
                date_uncertainty = "date expression could not be resolved"
    if start is None:
        match = re.search(r"\b([a-z]+)\s+(\d{4})\b", lowered)
        if match:
            try:
                month = month_number(match.group(1))
            except ValueError:
                month = None
            if month is not None:
                start = dt.date(int(match.group(2)), month, 1)
                end = dt.date(start.year, start.month, calendar.monthrange(start.year, start.month)[1])
    if start is None:
        match = re.search(r"\b(\d{4})\b", lowered)
        if match:
            start = dt.date(int(match.group(1)), 1, 1)
            end = dt.date(int(match.group(1)), 12, 31)
    if start is None:
        relative = re.search(r"\b(yesterday|last\s+week|last\s+friday|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b", lowered)
        if relative:
            if reference_date is None:
                date_uncertainty = "relative date requires reference_date"
            else:
                start, end = resolve_relative(relative.group(1), reference_date)

    activities = sorted({ACTIVITY_ALIASES[word] for word in re.findall(r"[a-z]+", lowered) if word in ACTIVITY_ALIASES})
    ordering = None
    if re.search(r"\b(first|earliest|oldest)\b", lowered):
        ordering = "earliest"
    elif re.search(r"\b(latest|most\s+recent)\b", lowered):
        ordering = "latest"
    superlative = ordering
    ignored_projects = {"What", "March", "August", "Friday", "Monday", "Tuesday", "Wednesday", "Thursday", "Saturday", "Sunday"}
    projects = [word for word in re.findall(r"\b[A-Z][A-Za-z0-9]+\b", text) if word not in ignored_projects]
    return {
        "query_text": text,
        "activity": activities[0] if len(activities) == 1 else None,
        "activities": activities,
        "date_range": {"start": start.isoformat() if start else None, "end": end.isoformat() if end else None},
        "ordering": ordering,
        "superlative": superlative,
        "projects": projects,
        "source_preferences": [],
        "uncertainty": date_uncertainty,
    }


def historical_search(query: str, *, limit: int = 20, db_path=None, reference_date: dt.date | None = None) -> dict[str, Any]:
    intent = parse_historical_query(query, reference_date=reference_date)
    terms = concept_terms(intent)
    con = open_index(db_path)
    clauses = ["1=1"]
    params: list[Any] = []
    if intent["date_range"]["start"]:
        clauses.append("date(CASE WHEN COALESCE(e.timestamp, s.created_at) NOT LIKE '%-%' THEN datetime(CAST(COALESCE(e.timestamp, s.created_at) AS REAL), 'unixepoch') ELSE COALESCE(e.timestamp, s.created_at) END) >= date(?)")
        params.append(intent["date_range"]["start"])
        clauses.append("date(CASE WHEN COALESCE(e.timestamp, s.created_at) NOT LIKE '%-%' THEN datetime(CAST(COALESCE(e.timestamp, s.created_at) AS REAL), 'unixepoch') ELSE COALESCE(e.timestamp, s.created_at) END) <= date(?)")
        params.append(intent["date_range"]["end"])
    if intent["ordering"]:
        clauses.append("COALESCE(e.timestamp, s.created_at) IS NOT NULL")
    for project in intent["projects"]:
        clauses.append("(s.title LIKE ? OR s.cwd LIKE ? OR e.text LIKE ?)")
        params.extend([f"%{project}%", f"%{project}%", f"%{project}%"])
    if terms:
        fts = " OR ".join(f'"{term}"' for term in terms)
        clauses.append("e.id IN (SELECT rowid FROM events_fts WHERE events_fts MATCH ?)")
        params.append(fts)
    order = "COALESCE(e.timestamp, s.created_at) ASC" if intent["ordering"] == "earliest" else "COALESCE(e.timestamp, s.created_at) DESC" if intent["ordering"] == "latest" else "COALESCE(e.timestamp, s.created_at) DESC"
    params.append(min(max(limit * 50, 100), 2000))
    rows = con.execute(
        f"""SELECT s.thread_id, s.title, s.cwd, s.created_at, s.updated_at, s.source,
                   e.source_line, e.timestamp, e.role, e.event_kind, e.provenance, e.source_id,
                   e.text, bm25(events_fts) AS fts_score
            FROM events e JOIN sessions s ON s.thread_id=e.thread_id
            LEFT JOIN events_fts ON events_fts.rowid = e.id
            WHERE {' AND '.join(clauses)}
            ORDER BY {order} LIMIT ?""",
        params,
    ).fetchall()
    coverage = coverage_metadata(con)
    con.close()
    results = [score_result(dict(row), intent, terms) for row in rows]
    if intent.get("activity"):
        qualifying = [item for item in results if item["qualifies"]]
        if qualifying:
            results = qualifying
    results.sort(key=lambda item: item["ranking_score"], reverse=True)
    if intent["ordering"] == "earliest":
        results.sort(key=lambda item: (item["timestamp"] or "9999", -item["ranking_score"]))
    return {
        "answer_type": "historical_search",
        "intent": intent,
        "results": results[:limit],
        "coverage": coverage,
        "caveats": [intent["uncertainty"]] if intent["uncertainty"] else ["Results are evidence, not a generated narrative."],
        "wording_guidance": ["Say earliest known in the searched corpus, never first ever unless the corpus proves it."],
    }


def earliest_activity(activity: str = "coding", *, db_path=None, reference_date: dt.date | None = None) -> dict[str, Any]:
    result = historical_search(f"{activity} earliest", limit=1000, db_path=db_path, reference_date=reference_date)
    candidates = [item for item in result["results"] if item["qualifies"]]
    selected = candidates[0] if candidates else None
    return {
        "answer_type": "earliest_activity",
        "activity": activity,
        "result": selected,
        "searched_from": result["coverage"].get("overall", {}).get("earliest"),
        "searched_to": result["coverage"].get("overall", {}).get("latest"),
        "confidence": "high" if selected else "low",
        "caveats": ["This is the earliest qualifying record in the currently available evidence corpus."],
        "coverage": result["coverage"],
    }


def historical_timeline(query: str, *, limit: int = 50, db_path=None, reference_date: dt.date | None = None) -> dict[str, Any]:
    result = historical_search(query, limit=limit, db_path=db_path, reference_date=reference_date)
    grouped = {"verified_activity": [], "historical_activity": [], "supporting_git_evidence": [], "inferences": [], "contradictions": [], "unknowns": []}
    for item in result["results"]:
        provenance = item.get("provenance") or "unknown"
        if provenance in {"historical_chatgpt_export", "chatgpt_seed", "chatgpt_export"}:
            grouped["historical_activity"].append(item)
        elif provenance in {"codex", "raw_codex"} or item.get("thread_id", "").startswith(("01", "02")):
            grouped["verified_activity"].append(item)
        elif provenance == "github_evidence":
            grouped["supporting_git_evidence"].append(item)
        else:
            grouped["inferences"].append(item)
    grouped["unknowns"].append("Live auditor state is available through project_status, not as a timestamped event in this timeline.")
    return {"answer_type": "historical_timeline", "intent": result["intent"], "coverage": result["coverage"], **grouped, "caveats": result["caveats"]}


def concept_terms(intent: dict[str, Any]) -> list[str]:
    terms: list[str] = []
    for activity in intent["activities"]:
        terms.extend(CONCEPTS.get(activity, ()))
    if not terms and not intent["date_range"]["start"]:
        terms = [word for word in re.findall(r"[a-z0-9]+", intent["query_text"].lower()) if word not in {"what", "were", "we", "in", "the", "a", "an", "on", "did", "do", "with", "can", "you", "find"}]
    return list(dict.fromkeys(terms))


def score_result(row: dict[str, Any], intent: dict[str, Any], terms: list[str]) -> dict[str, Any]:
    text = (row.get("text") or "").lower()
    explicit_code_terms = ("html", "css", "javascript", "python", "php", "sql", "api", "json", "github", "terminal", "bash", "powershell", "xampp", "code", "programming")
    user_code_request = bool(re.search(r"\b(write|create|build|develop|how do i|how can i)\b.*\b(code|html|css|javascript|python|php|sql|api|json|github|terminal|bash|powershell|xampp)\b", text))
    score = 0.0
    if row.get("role") == "user":
        score += 12
    code_markers = ("```", "<!doctype html>", "<html")
    has_code_syntax = any(marker in text for marker in code_markers) or bool(re.search(r"\bfunction\s+\w+\s*\(|\bconst\s+\w+\s*=|\bdef\s+\w+\s*\(", text))
    if has_code_syntax:
        score += 15
    if user_code_request:
        score += 30
    if row.get("provenance") == "historical_chatgpt_export":
        score += 6
    score += min(10, sum(text.count(term.lower()) for term in terms) * 0.4)
    non_code_context = ("python" in text and "snake" in text) or ("java" in text and "coffee" in text)
    title_text = (row.get("title") or "").lower()
    title_technical = any(has_term(title_text, term) for term in ("html", "code", "chat", "chatbot", "xampp", "website", "programming", "javascript", "python"))
    qualifies = intent.get("activity") == "coding" and not non_code_context and (
        row.get("role") == "user" and user_code_request
        or has_code_syntax
        or row.get("role") == "assistant" and title_technical and any(has_term(text, term) for term in ("html", "css", "javascript", "python", "php", "sql", "api", "json", "github", "terminal", "bash", "powershell", "xampp"))
    )
    return {
        "thread_id": row["thread_id"], "title": row.get("title"), "timestamp": row.get("timestamp") or row.get("created_at"),
        "created_at": row.get("created_at"), "role": row.get("role"), "event_kind": row.get("event_kind"),
        "provenance": row.get("provenance") or row.get("source"), "source_id": row.get("source_id"),
        "source_precedence": precedence_rank(row.get("provenance") or row.get("source"), "historical_intent"),
        "snippet": (row.get("text") or "")[:500], "qualifies": bool(qualifies), "ranking_score": round(score, 2),
    }


def has_term(text: str, term: str) -> bool:
    return bool(re.search(r"(?<![a-z0-9])" + re.escape(term.lower()) + r"(?![a-z0-9])", text.lower()))


def precedence_rank(source: str | None, claim_type: str) -> int:
    order = SOURCE_PRECEDENCE.get(claim_type, SOURCE_PRECEDENCE["historical_intent"])
    normalized = source or "unknown"
    aliases = {"vscode": "codex", "chatgpt_seed": "chatgpt_seed_fact", "chatgpt_export": "historical_chatgpt_export"}
    normalized = aliases.get(normalized, normalized)
    return order.index(normalized) + 1 if normalized in order else len(order) + 1


def coverage_metadata(con: sqlite3.Connection) -> dict[str, Any]:
    def bounds(where: str, params: tuple[Any, ...] = ()) -> dict[str, Any]:
        row = con.execute(f"SELECT MIN(NULLIF(COALESCE(e.timestamp, s.created_at), '')) AS earliest, MAX(NULLIF(COALESCE(e.timestamp, s.created_at), '')) AS latest FROM events e JOIN sessions s ON s.thread_id = e.thread_id WHERE {where}", params).fetchone()
        return {"earliest": row[0] or None, "latest": row[1] or None}
    return {
        "raw_chatgpt": bounds("provenance = 'historical_chatgpt_export'"),
        "raw_codex": bounds("e.provenance IS NULL AND s.source NOT IN ('chatgpt_export', 'github_evidence')"),
        "manual_backfill": bounds("event_kind = 'chatgpt_seed_fact'"),
        "overall": bounds("1=1"),
    }


def month_number(name: str) -> int:
    for number in range(1, 13):
        if calendar.month_name[number].lower().startswith(name.lower()[:3]):
            return number
    raise ValueError(name)


def resolve_relative(expression: str, reference: dt.date) -> tuple[dt.date, dt.date]:
    if expression == "yesterday":
        day = reference - dt.timedelta(days=1)
        return day, day
    if expression == "last week":
        end = reference - dt.timedelta(days=reference.weekday() + 1)
        return end - dt.timedelta(days=6), end
    if expression == "last friday":
        delta = (reference.weekday() - 4) % 7 or 7
        day = reference - dt.timedelta(days=delta)
        return day, day
    weekdays = {name: index for index, name in enumerate(calendar.day_name)}
    target = weekdays[expression.title()]
    delta = (reference.weekday() - target) % 7 or 7
    day = reference - dt.timedelta(days=delta)
    return day, day