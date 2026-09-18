import json
from pathlib import Path
from joshmemory.parser import parse_rollout

def test_parse_rollout_with_dict_source(tmp_path: Path):
    rollout_path = tmp_path / "rollout-2026-08-01-test.jsonl"
    payload = {
        "type": "session_meta",
        "payload": {
            "timestamp": "2026-08-01T00:00:00Z",
            "session_id": "test-session-123",
            "source": {
                "role": "system",
                "name": "Antigravity"
            }
        }
    }
    rollout_path.write_text(json.dumps(payload) + "\n")
    
    session = parse_rollout(rollout_path)
    assert isinstance(session.source, str)
    assert "Antigravity" in session.source
    
    # Also test with string source
    rollout_path_str = tmp_path / "rollout-2026-08-01-test-str.jsonl"
    payload_str = {
        "type": "session_meta",
        "payload": {
            "timestamp": "2026-08-01T00:00:00Z",
            "session_id": "test-session-456",
            "source": "vscode"
        }
    }
    rollout_path_str.write_text(json.dumps(payload_str) + "\n")
    session_str = parse_rollout(rollout_path_str)
    assert session_str.source == "vscode"

