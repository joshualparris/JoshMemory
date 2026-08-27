import json
from pathlib import Path

from joshmemory.parser import parse_rollout


def test_parse_rollout_uses_real_user_message_for_title(tmp_path: Path) -> None:
    rollout = tmp_path / "rollout-2026-01-01T00-00-00-thread.jsonl"
    lines = [
        {"timestamp": "2026-01-01T00:00:00Z", "type": "session_meta", "payload": {"session_id": "thread", "cwd": "/tmp"}},
        {
            "timestamp": "2026-01-01T00:00:01Z",
            "type": "response_item",
            "payload": {
                "type": "message",
                "role": "user",
                "content": [{"type": "input_text", "text": "<recommended_plugins>noise</recommended_plugins>"}],
            },
        },
        {"timestamp": "2026-01-01T00:00:02Z", "type": "event_msg", "payload": {"type": "user_message", "message": "build the thing"}},
    ]
    rollout.write_text("\n".join(json.dumps(line) for line in lines), encoding="utf-8")

    session = parse_rollout(rollout)

    assert session.thread_id == "thread"
    assert session.title == "build the thing"
    assert len(session.events) == 1

