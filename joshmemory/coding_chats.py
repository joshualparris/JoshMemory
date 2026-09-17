from __future__ import annotations

import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .index import open_index
from .redact import redact


CODING_ARCHIVE_VERSION = 1

TECH_TERMS = (
    "code", "coding", "programming", "software", "developer", "html", "css",
    "javascript", "typescript", "python", "java", "c#", "c++", "golang", "rust",
    "php", "sql", "sqlite", "postgres", "mysql", "api", "json", "yaml",
    "git", "github", "repo", "repository", "commit", "branch", "pull request",
    "vite", "react", "next.js", "nextjs", "node", "npm", "pnpm", "bun",
    "flask", "fastapi", "express", "docker", "kubernetes", "terraform",
    "powershell", "bash", "terminal", "ci", "workflow", "github actions",
    "vercel", "deployment", "deploy", "debug", "bug", "test", "lint",
    "playwright", "vitest", "pytest", "prisma", "drizzle", "supabase",
    "indexeddb", "dexie", "ollama", "qwen", "llm", "mcp", "agent",
    "forgegrid", "action1", "meshcentral", "lancommander",
)

STRONG_ACTION = re.compile(
    r"\b(build|create|write|implement|fix|debug|refactor|deploy|test|code|program|"
    r"push|commit|merge|clone|install|configure|integrate|migrate|audit)\b",
    re.IGNORECASE,
)
CODE_MARKERS = re.compile(
    r"\x60\x60\x60|<!doctype\s+html|<html\b|\bdef\s+\w+\s*\(|"
    r"\bfunction\s+\w+\s*\(|\bconst\s+\w+\s*=|\bclass\s+\w+|"
    r"\bimport\s+[\w{*]|\bnpm\s+(?:run|install)|\bgit\s+(?:commit|push|pull|clone)",
    re.IGNORECASE,
)


def _iso_timestamp(value: Any) -> str | None:
    if value is None or value == "":
        return None
    try:
        number = float(value)
    except (TypeError, ValueError):
        return str(value)
    try:
        return datetime.fromtimestamp(number, timezone.utc).isoformat().replace("+00:00", "Z")
    except (OverflowError, OSError, ValueError):
        return str(value)


def _term_hits(text: str) -> list[str]:
    lowered = text.lower()
    hits: list[str] = []
    for term in TECH_TERMS:
        if re.search(r"(?<![a-z0-9])" + re.escape(term) + r"(?![a-z0-9])", lowered):
            hits.append(term)
    return list(dict.fromkeys(hits))


def classify_coding_conversation(title: str, messages: list[dict[str, Any]]) -> tuple[bool, list[str]]:
    title = title or ""
    user_text = "\\n".join(
        str(row.get("text") or "") for row in messages if str(row.get("author_role") or "") == "user"
    )
    all_text = "\\n".join(str(row.get("text") or "") for row in messages)
    title_hits = _term_hits(title)
    user_hits = _term_hits(user_text)
    all_hits = _term_hits(all_text)
    has_code = bool(CODE_MARKERS.search(all_text))
    actionable = bool(STRONG_ACTION.search(user_text))

    qualifies = bool(
        has_code
        or title_hits
        or (actionable and user_hits)
        or len(user_hits) >= 3
        or any(term in user_hits for term in (
            "github", "repo", "repository", "commit", "branch", "ci", "workflow",
            "deployment", "deploy", "debug", "bug", "test", "vite", "react",
            "typescript", "python", "javascript", "forgegrid", "ollama", "qwen", "mcp",
        ))
    )
    return qualifies, list(dict.fromkeys(title_hits + user_hits + all_hits))[:40]


def coding_chat_records(*, db_path: Path | str | None = None) -> list[dict[str, Any]]:
    con = open_index(Path(db_path) if db_path is not None else None)
    conversations = con.execute(
        """SELECT conversation_id, title, create_time, update_time, source_filename
           FROM chatgpt_conversations
           ORDER BY CAST(create_time AS REAL), conversation_id"""
    ).fetchall()
    output: list[dict[str, Any]] = []
    for conversation in conversations:
        rows = con.execute(
            """SELECT author_role, message_time, text, branch_status, sequence_index
               FROM chatgpt_messages
               WHERE conversation_id = ?
               ORDER BY sequence_index, CAST(message_time AS REAL)""",
            (conversation["conversation_id"],),
        ).fetchall()
        messages = [dict(row) for row in rows]
        qualifies, matched_terms = classify_coding_conversation(
            str(conversation["title"] or ""), messages
        )
        if not qualifies:
            continue

        first_user = next(
            (str(row.get("text") or "") for row in messages
             if row.get("author_role") == "user" and str(row.get("text") or "").strip()),
            "",
        )
        first_user = redact(first_user).strip()
        if len(first_user) > 500:
            first_user = first_user[:497] + "..."

        output.append({
            "id": f"chatgpt:{conversation['conversation_id']}",
            "conversation_id": str(conversation["conversation_id"]),
            "title": str(conversation["title"] or ""),
            "created_at": _iso_timestamp(conversation["create_time"]),
            "updated_at": _iso_timestamp(conversation["update_time"]),
            "message_count": len(messages),
            "first_user_message": first_user,
            "matched_terms": matched_terms,
            "source": "historical_chatgpt_export",
            "source_filename": str(conversation["source_filename"] or ""),
            "classification_version": CODING_ARCHIVE_VERSION,
        })
    con.close()
    return output


def local_coding_chat_search(
    query: str = "",
    *,
    db_path: Path | str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    limit: int = 100,
) -> list[dict[str, Any]]:
    needle = query.strip().lower()
    result: list[dict[str, Any]] = []
    for row in coding_chat_records(db_path=db_path):
        created = str(row.get("created_at") or "")
        day = created[:10]
        if start_date and day and day < start_date:
            continue
        if end_date and day and day > end_date:
            continue
        searchable = " ".join([
            str(row.get("title") or ""),
            str(row.get("first_user_message") or ""),
            " ".join(row.get("matched_terms") or []),
        ]).lower()
        if needle and needle not in searchable:
            continue
        result.append(row)
    result.sort(key=lambda row: (str(row.get("created_at") or ""), str(row.get("conversation_id") or "")))
    return result[: max(1, min(int(limit), 5000))]


def coding_chat_batches(
    *,
    db_path: Path | str | None = None,
    batch_size: int = 150,
) -> list[dict[str, Any]]:
    rows = coding_chat_records(db_path=db_path)
    size = max(1, min(int(batch_size), 250))
    batches: list[dict[str, Any]] = []
    for offset in range(0, len(rows), size):
        records = rows[offset: offset + size]
        digest = hashlib.sha256(
            json.dumps(records, ensure_ascii=False, sort_keys=True).encode("utf-8")
        ).hexdigest()[:20]
        batches.append({
            "batch_id": f"chatgpt-export-v{CODING_ARCHIVE_VERSION}-{offset:06d}-{digest}",
            "records": records,
        })
    return batches


def sync_coding_chat_archive_to_github(
    *,
    db_path: Path | str | None = None,
    batch_size: int = 150,
) -> dict[str, Any]:
    from .github_store import cloud_call

    batches = coding_chat_batches(db_path=db_path, batch_size=batch_size)
    seen = 0
    duplicates = 0
    for batch in batches:
        result = cloud_call("coding_chat_sync", batch)
        seen += int(result.get("records", 0))
        duplicates += int(bool(result.get("duplicate")))
    return {
        "coding_chats": sum(len(batch["records"]) for batch in batches),
        "batches": len(batches),
        "duplicate_batches": duplicates,
        "cloud_records_seen": seen,
        "classification_version": CODING_ARCHIVE_VERSION,
    }
