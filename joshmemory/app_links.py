from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path
from typing import Any

from .index import open_index, utc_now
from .redact import redact


URL_RE = re.compile(r"https?://[^\s)]+")


def import_app_links(path: Path, *, db_path: Path | None = None, occurred_at: str = "2026-08-27") -> dict[str, int]:
    records = parse_app_links(path.read_text(encoding="utf-8", errors="replace"))
    con = open_index(db_path)
    stat = path.stat()
    counts = {"seen": len(records), "imported": 0, "skipped": 0}
    for index, record in enumerate(records, 1):
        if not record["urls"]:
            counts["skipped"] += 1
            continue
        item_id = slugify(record["project"]) or f"app-links-{index}"
        thread_id = f"seed:app-links-2026-08-27-{item_id}-{index}"
        title = f"App/deployment links: {record['project']}"
        text = app_link_text(record)
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
                f"{path}#L{record['start_line']}",
                path.stem,
                occurred_at,
                occurred_at,
                f"seed://{record['project']}",
                "user_pasted_app_links",
                "user_pasted_app_links",
                None,
                None,
                record["github_repos"][0] if record["github_repos"] else None,
                None,
                None,
                title,
                record["summary"],
                len(record["lines"]),
                stat.st_size,
                utc_now(),
                stat.st_mtime,
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
                record["start_line"],
                occurred_at,
                "user_app_links_fact",
                "seed",
                text,
                hashlib.sha256(text.encode("utf-8", "replace")).hexdigest(),
            ),
        )
        counts["imported"] += 1
    con.commit()
    con.close()
    return counts


def parse_app_links(text: str) -> list[dict[str, Any]]:
    blocks: list[dict[str, Any]] = []
    current: dict[str, Any] | None = None
    pending_heading: tuple[int, str] | None = None

    for line_no, raw in enumerate(text.splitlines(), 1):
        line = raw.strip()
        if not line:
            continue
        urls = URL_RE.findall(line)
        heading = clean_heading(line)
        if urls:
            if heading:
                current = new_block(line_no, heading)
                blocks.append(current)
                pending_heading = None
            elif current is None:
                title = pending_heading[1] if pending_heading else infer_project_from_url(urls[0])
                current = new_block(pending_heading[0] if pending_heading else line_no, title)
                blocks.append(current)
                pending_heading = None
            current["lines"].append(raw)
            current["urls"].extend(urls)
            continue

        if is_heading(line):
            pending_heading = (line_no, heading or line)
            current = None

    for block in blocks:
        block["urls"] = dedupe(block["urls"])
        block["github_repos"] = [url.rstrip("/") for url in block["urls"] if "github.com/" in url and "github.io" not in url]
        block["deployments"] = [url.rstrip("/") for url in block["urls"] if url.rstrip("/") not in block["github_repos"]]
        block["summary"] = f"{block['project']} has {len(block['urls'])} known app/deployment/repository link(s)."
    return blocks


def new_block(line_no: int, project: str) -> dict[str, Any]:
    return {"start_line": line_no, "project": project, "lines": [], "urls": []}


def is_heading(line: str) -> bool:
    if URL_RE.search(line):
        return False
    if len(line) > 90:
        return False
    return bool(re.search(r"[A-Za-z]", line))


def clean_heading(line: str) -> str | None:
    line = URL_RE.sub("", line).strip(" -:\t")
    line = re.sub(r"^\d+\s*[-.)]?\s*", "", line).strip()
    line = re.sub(r"^\d+\s*-\s*", "", line).strip()
    if not line:
        return None
    if " - " in line:
        line = line.split(" - ", 1)[0].strip()
    return line[:80]


def infer_project_from_url(url: str) -> str:
    host_path = re.sub(r"^https?://", "", url).strip("/")
    if host_path.startswith("github.com/"):
        parts = host_path.split("/")
        if len(parts) >= 3:
            return parts[2]
    first = host_path.split("/", 1)[0]
    name = first.split(".", 1)[0]
    return name or "Unknown app link"


def app_link_text(record: dict[str, Any]) -> str:
    return redact(
        "\n".join(
            [
                f"Project: {record['project']}",
                "Type: app_links",
                "Status: links_recorded",
                f"Summary: {record['summary']}",
                f"GitHub repos: {json.dumps(record['github_repos'], ensure_ascii=False)}",
                f"Deployments/docs/other URLs: {json.dumps(record['deployments'], ensure_ascii=False)}",
                "Provenance: User-pasted app links list on 2026-08-27; not a raw Codex transcript.",
                "Important: this is a user-pasted link/backfill fact, not a raw Codex transcript.",
            ]
        )
    )


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug[:80]


def dedupe(values: list[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for value in values:
        cleaned = value.rstrip(".,")
        if cleaned not in seen:
            seen.add(cleaned)
            out.append(cleaned)
    return out
