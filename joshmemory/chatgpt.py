from __future__ import annotations

import hashlib
import json
import math
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterator

from .index import open_index, utc_now
from .redact import redact


PROVENANCE = "historical_chatgpt_export"


@dataclass
class ChatGPTMessage:
    message_id: str
    parent_message_id: str | None
    role: str | None
    name: str | None
    timestamp: str | None
    model: str | None
    text: str
    branch_status: str
    sequence_index: int | None


def import_chatgpt_export(path: Path, *, db_path: Path | None = None, dry_run: bool = False) -> dict[str, int]:
    if path.is_dir():
        path = path / "conversations.json"
    keys = ("conversations_discovered", "conversations_added", "conversations_updated", "messages_added", "duplicates_skipped", "malformed_records_skipped", "errors")
    stats = {key: 0 for key in keys}
    try:
        conversations = iter_json_array(path)
        source_hash = file_hash(path)
    except OSError:
        stats["errors"] += 1
        return stats
    imported_at = utc_now()
    con = None if dry_run else open_index(db_path)
    try:
        for item in conversations:
            stats["conversations_discovered"] += 1
            if not isinstance(item, dict):
                stats["malformed_records_skipped"] += 1
                continue
            conversation_id = str(item.get("conversation_id") or item.get("id") or "").strip()
            if not conversation_id:
                stats["malformed_records_skipped"] += 1
                continue
            if not dry_run:
                assert con is not None
                existing_hash = con.execute(
                    "SELECT source_hash FROM chatgpt_conversations WHERE conversation_id = ?",
                    (conversation_id,),
                ).fetchone()
                if existing_hash and existing_hash[0] == source_hash:
                    stats["duplicates_skipped"] += con.execute(
                        "SELECT COUNT(*) FROM chatgpt_messages WHERE conversation_id = ?",
                        (conversation_id,),
                    ).fetchone()[0]
                    continue
            try:
                messages = list(parse_conversation(item, stats))
            except (TypeError, ValueError, KeyError):
                stats["errors"] += 1
                continue
            if dry_run:
                stats["conversations_added"] += 1
                stats["messages_added"] += len(messages)
                continue
            assert con is not None
            thread_id = f"chatgpt:{conversation_id}"
            existing = con.execute("SELECT 1 FROM chatgpt_conversations WHERE conversation_id = ?", (conversation_id,)).fetchone()
            con.execute(
                """INSERT INTO chatgpt_conversations
                (conversation_id, title, create_time, update_time, source_filename, imported_at, source_hash, thread_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(conversation_id) DO UPDATE SET
                  title=excluded.title, create_time=excluded.create_time, update_time=excluded.update_time,
                  source_filename=excluded.source_filename, imported_at=excluded.imported_at, source_hash=excluded.source_hash""",
                (conversation_id, item.get("title"), timestamp_text(item.get("create_time")), timestamp_text(item.get("update_time")), path.name, imported_at, source_hash, thread_id),
            )
            if existing:
                stats["conversations_updated"] += 1
            else:
                stats["conversations_added"] += 1
            con.execute(
                """INSERT INTO sessions
                (thread_id, rollout_path, rollout_slug, created_at, updated_at, cwd, originator, source,
                 title, first_user_message, line_count, file_size, indexed_at, source_mtime)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(thread_id) DO UPDATE SET
                  rollout_path=excluded.rollout_path, created_at=excluded.created_at, updated_at=excluded.updated_at,
                  title=excluded.title, first_user_message=excluded.first_user_message,
                  indexed_at=excluded.indexed_at, source_mtime=excluded.source_mtime""",
                (thread_id, f"{path}::{conversation_id}", path.stem, timestamp_text(item.get("create_time")), timestamp_text(item.get("update_time")),
                 f"chatgpt://{conversation_id}", "chatgpt_export", "chatgpt_export", item.get("title"), None,
                 len(messages), path.stat().st_size, imported_at, 0.0),
            )
            con.execute("DELETE FROM events WHERE thread_id = ? AND event_kind = ?", (thread_id, "chatgpt_export_message"))
            metadata_text = " ".join(
                value for value in (
                    str(item.get("title") or ""),
                    format_date(item.get("create_time")),
                    format_date(item.get("update_time")),
                ) if value
            )
            if metadata_text:
                con.execute(
                    """INSERT OR REPLACE INTO events
                    (thread_id, source_line, timestamp, event_kind, role, text, text_hash, provenance, source_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (thread_id, -1, timestamp_text(item.get("create_time")), "chatgpt_export_metadata", None, metadata_text, hashlib.sha256(metadata_text.encode("utf-8", "replace")).hexdigest(), PROVENANCE, conversation_id),
                )
            for message in messages:
                prior = con.execute("SELECT 1 FROM chatgpt_messages WHERE conversation_id = ? AND message_id = ?", (conversation_id, message.message_id)).fetchone()
                con.execute(
                    """INSERT INTO chatgpt_messages
                    (conversation_id, message_id, parent_message_id, author_role, author_name, message_time, model, text, branch_status, sequence_index, source_filename, imported_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(conversation_id, message_id) DO UPDATE SET
                      parent_message_id=excluded.parent_message_id, author_role=excluded.author_role,
                      author_name=excluded.author_name, message_time=excluded.message_time, model=excluded.model,
                      text=excluded.text, branch_status=excluded.branch_status, sequence_index=excluded.sequence_index,
                      source_filename=excluded.source_filename, imported_at=excluded.imported_at""",
                    (conversation_id, message.message_id, message.parent_message_id, message.role, message.name, message.timestamp, message.model, message.text, message.branch_status, message.sequence_index, path.name, imported_at),
                )
                if prior:
                    stats["duplicates_skipped"] += 1
                else:
                    stats["messages_added"] += 1
                event_text = redact(message.text)
                con.execute(
                    """INSERT OR REPLACE INTO events
                    (thread_id, source_line, timestamp, event_kind, role, text, text_hash, provenance, source_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (thread_id, message.sequence_index or 0, message.timestamp, "chatgpt_export_message", message.role, event_text, hashlib.sha256(event_text.encode("utf-8", "replace")).hexdigest(), PROVENANCE, message.message_id),
                )
        if con is not None:
            con.commit()
    finally:
        if con is not None:
            con.close()
    return stats


def parse_conversation(item: dict[str, Any], stats: dict[str, int]) -> Iterator[ChatGPTMessage]:
    mapping = item.get("mapping") or {}
    if not isinstance(mapping, dict):
        stats["malformed_records_skipped"] += 1
        return
    nodes: dict[str, dict[str, Any]] = {}
    for key, node in mapping.items():
        if not isinstance(node, dict):
            stats["malformed_records_skipped"] += 1
            continue
        message = node.get("message")
        if not isinstance(message, dict):
            continue
        message_id = str(message.get("id") or key).strip()
        if not message_id:
            stats["malformed_records_skipped"] += 1
            continue
        nodes[message_id] = {"node": node, "message": message}
    active_ids = active_path(item.get("current_node"), mapping, nodes)
    ordered_ids = active_ids + sorted((node_id for node_id in nodes if node_id not in active_ids), key=lambda node_id: (numeric_time(nodes[node_id]["message"].get("create_time")), node_id))
    for index, message_id in enumerate(ordered_ids):
        message = nodes[message_id]["message"]
        author = message.get("author") or {}
        metadata = message.get("metadata") or {}
        yield ChatGPTMessage(
            message_id=message_id,
            parent_message_id=string_or_none(nodes[message_id]["node"].get("parent")),
            role=string_or_none(author.get("role")),
            name=string_or_none(author.get("name")),
            timestamp=timestamp_text(message.get("create_time") or message.get("update_time")),
            model=string_or_none(metadata.get("model_slug") or metadata.get("model")),
            text=content_text(message.get("content")),
            branch_status="active" if message_id in active_ids else "alternate",
            sequence_index=index,
        )


def active_path(current_node: Any, mapping: dict[str, Any], nodes: dict[str, dict[str, Any]]) -> list[str]:
    current = string_or_none(current_node)
    path: list[str] = []
    seen: set[str] = set()
    while current and current not in seen:
        seen.add(current)
        node = mapping.get(current) or {}
        message = node.get("message") if isinstance(node, dict) else None
        message_id = str(message.get("id") or current) if isinstance(message, dict) else current
        if message_id in nodes:
            path.append(message_id)
        current = string_or_none(node.get("parent")) if isinstance(node, dict) else None
    path.reverse()
    return path


def content_text(content: Any) -> str:
    if not isinstance(content, dict):
        return ""
    parts = content.get("parts") or []
    if isinstance(parts, str):
        return parts
    return "\n".join(str(part) for part in parts if isinstance(part, (str, int, float)) and not (isinstance(part, float) and math.isnan(part)))


def numeric_time(value: Any) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return float("inf")


def timestamp_text(value: Any) -> str | None:
    if value is None:
        return None
    return str(value)


def format_date(value: Any) -> str | None:
    numeric = numeric_time(value)
    if math.isinf(numeric):
        return timestamp_text(value)
    from datetime import datetime, timezone
    return datetime.fromtimestamp(numeric, timezone.utc).strftime("%Y-%m-%d %d %B %Y")


def string_or_none(value: Any) -> str | None:
    return None if value is None else str(value)


def file_hash(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def iter_json_array(path: Path, *, chunk_size: int = 1024 * 1024) -> Iterator[Any]:
    decoder = json.JSONDecoder()
    buffer = ""
    started = False
    finished = False
    with path.open("r", encoding="utf-8", errors="replace") as handle:
        while not finished:
            chunk = handle.read(chunk_size)
            if chunk:
                buffer += chunk
            elif not buffer:
                break
            position = 0
            while position < len(buffer):
                while position < len(buffer) and buffer[position].isspace():
                    position += 1
                if not started:
                    if position >= len(buffer):
                        break
                    if buffer[position] != "[":
                        raise json.JSONDecodeError("expected JSON array", buffer, position)
                    started = True
                    position += 1
                while position < len(buffer) and buffer[position].isspace():
                    position += 1
                if position >= len(buffer):
                    break
                if buffer[position] == "]":
                    finished = True
                    position += 1
                    break
                try:
                    value, end = decoder.raw_decode(buffer, position)
                except json.JSONDecodeError:
                    break
                yield value
                position = end
                while position < len(buffer) and buffer[position].isspace():
                    position += 1
                if position < len(buffer) and buffer[position] == ",":
                    position += 1
                    continue
                if position < len(buffer) and buffer[position] == "]":
                    finished = True
                    position += 1
                    break
                if position >= len(buffer):
                    break
                raise json.JSONDecodeError("expected comma or end of JSON array", buffer, position)
            buffer = buffer[position:]
    if not finished:
        raise json.JSONDecodeError("unterminated JSON array", buffer, 0)