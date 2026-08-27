import json
from pathlib import Path

from joshmemory.index import index_all, search_sessions


def test_index_and_search(tmp_path: Path) -> None:
    sessions = tmp_path / "sessions"
    day = sessions / "2026/01/01"
    day.mkdir(parents=True)
    rollout = day / "rollout-2026-01-01T00-00-00-thread.jsonl"
    rollout.write_text(
        "\n".join(
            json.dumps(line)
            for line in [
                {"timestamp": "2026-01-01T00:00:00Z", "type": "session_meta", "payload": {"session_id": "thread", "cwd": "/tmp/FedoraCrashDoctor"}},
                {"timestamp": "2026-01-01T00:00:01Z", "type": "event_msg", "payload": {"type": "user_message", "message": "work on FedoraCrashDoctor release hardening"}},
            ]
        ),
        encoding="utf-8",
    )
    db = tmp_path / "memory.sqlite"

    counts = index_all(db, sessions)
    results = search_sessions("FedoraCrashDoctor", db_path=db)

    assert counts["indexed"] == 1
    assert results[0]["thread_id"] == "thread"

