from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Iterable

from .redact import redact


SKIP_ROLES = {"system", "developer"}


@dataclass
class ParsedEvent:
    source_line: int
    timestamp: str | None
    event_kind: str
    role: str | None
    text: str

    @property
    def text_hash(self) -> str:
        return hashlib.sha256(self.text.encode("utf-8", "replace")).hexdigest()


@dataclass
class ParsedSession:
    thread_id: str
    rollout_path: Path
    rollout_slug: str
    created_at: str | None = None
    updated_at: str | None = None
    cwd: str | None = None
    originator: str | None = None
    source: str | None = None
    cli_version: str | None = None
    model: str | None = None
    git_origin_url: str | None = None
    git_branch: str | None = None
    git_sha: str | None = None
    title: str | None = None
    first_user_message: str | None = None
    line_count: int = 0
    file_size: int = 0
    events: list[ParsedEvent] = field(default_factory=list)


def parse_rollout(path: Path) -> ParsedSession:
    thread_id: str | None = None
    session = ParsedSession(thread_id="", rollout_path=path, rollout_slug=path.stem)
    stat = path.stat()
    session.file_size = stat.st_size

    with path.open("r", encoding="utf-8", errors="replace") as fh:
        for line_no, line in enumerate(fh, 1):
            session.line_count = line_no
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue
            timestamp = obj.get("timestamp")
            kind = obj.get("type")
            payload = obj.get("payload") or {}

            if kind == "session_meta":
                sid = payload.get("session_id") or payload.get("id")
                if sid:
                    thread_id = sid
                    session.thread_id = sid
                session.created_at = payload.get("timestamp") or timestamp
                session.cwd = payload.get("cwd")
                session.originator = payload.get("originator")
                session.source = payload.get("source")
                session.cli_version = payload.get("cli_version")
                session.model = payload.get("model")
                session.git_origin_url = payload.get("git_origin_url")
                session.git_branch = payload.get("git_branch")
                session.git_sha = payload.get("git_sha")
                continue

            for event in events_from_payload(kind, payload, timestamp, line_no):
                if not thread_id:
                    thread_id = infer_thread_id(payload)
                    if thread_id:
                        session.thread_id = thread_id
                if event.text.strip():
                    if event.role == "user" and not session.first_user_message:
                        session.first_user_message = event.text[:500]
                    session.events.append(event)

    if not session.thread_id:
        session.thread_id = path.stem.split("-")[-1]
    session.updated_at = session.events[-1].timestamp if session.events else session.created_at
    session.title = derive_title(session)
    return session


def events_from_payload(kind: str, payload: dict[str, Any], timestamp: str | None, line_no: int) -> Iterable[ParsedEvent]:
    if kind == "response_item":
        ptype = payload.get("type")
        if ptype == "message":
            role = payload.get("role")
            if role in SKIP_ROLES:
                return []
            text = content_to_text(payload.get("content"))
            if is_injected_context(text):
                return []
            return [ParsedEvent(line_no, timestamp, "message", role, redact(text))]
        if ptype in {"function_call", "function_call_output"}:
            name = payload.get("name") or payload.get("call_id") or ptype
            args = payload.get("arguments") or payload.get("output") or ""
            return [ParsedEvent(line_no, timestamp, ptype, "tool", redact(f"{name}\n{args}"))]
        if ptype == "reasoning":
            summary = content_to_text(payload.get("summary"))
            return [ParsedEvent(line_no, timestamp, "reasoning_summary", "assistant", redact(summary))] if summary else []

    if kind == "event_msg":
        ptype = payload.get("type")
        if ptype == "user_message":
            return [ParsedEvent(line_no, timestamp, "user_message", "user", redact(payload.get("message") or ""))]
        if ptype in {"agent_message", "assistant_message"}:
            return [ParsedEvent(line_no, timestamp, ptype, "assistant", redact(payload.get("message") or ""))]
        if ptype in {"exec_command_begin", "exec_command_end", "patch_apply_begin", "patch_apply_end"}:
            return [ParsedEvent(line_no, timestamp, ptype, "tool", redact(json.dumps(payload, ensure_ascii=False, sort_keys=True)))]

    return []


def content_to_text(content: Any) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts: list[str] = []
        for item in content:
            if isinstance(item, dict):
                text = item.get("text") or item.get("content") or item.get("input_text") or item.get("output_text")
                if text:
                    parts.append(str(text))
            elif item is not None:
                parts.append(str(item))
        return "\n".join(parts)
    if isinstance(content, dict):
        return str(content.get("text") or content.get("content") or "")
    return ""


def infer_thread_id(payload: dict[str, Any]) -> str | None:
    for key in ("thread_id", "session_id"):
        if payload.get(key):
            return str(payload[key])
    meta = payload.get("internal_chat_message_metadata_passthrough")
    if isinstance(meta, dict) and meta.get("thread_id"):
        return str(meta["thread_id"])
    return None


def derive_title(session: ParsedSession) -> str | None:
    if session.first_user_message:
        first_line = " ".join(session.first_user_message.strip().split())
        return first_line[:100]
    for event in session.events:
        if event.role == "assistant" and event.text.strip():
            return " ".join(event.text.strip().split())[:100]
    return session.rollout_slug


def is_injected_context(text: str) -> bool:
    stripped = text.lstrip()
    return stripped.startswith("<recommended_plugins>") or stripped.startswith("<environment_context>")
