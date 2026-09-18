import pytest
import datetime as dt
from unittest import mock

from joshmemory.index import project_history, write_session
from joshmemory.parser import ParsedSession
from joshmemory.schema import connect

@mock.patch("joshmemory.auditor.run_auditor")
def test_historical_provenance_preserved_on_windows(mock_run, tmp_path, monkeypatch):
    monkeypatch.setenv("JOSHMEMORY_PROJECTS_DIR", "C:\\dev")
    db_path = tmp_path / "test.db"
    
    mock_run.return_value = {
        "projects": [
            {
                "name": "AgentWitness",
                "path": "C:\\dev\\AgentWitness",
                "git": {
                    "head": "main",
                    "branch": "main",
                    "head_sha": "abc1234",
                    "origin_url": "https://github.com/test/AgentWitness.git",
                    "modified": 0,
                    "untracked": 0,
                    "ahead": 0,
                    "latest_commit_date": "2026-08-28T10:00:00Z"
                }
            }
        ]
    }
    
    fake_path = tmp_path / "fake.jsonl"
    fake_path.touch()
    
    con = connect(str(db_path))
    session = ParsedSession(
        thread_id="test-fedora-123",
        rollout_path=fake_path,
        rollout_slug="fake",
        created_at=dt.datetime.now(dt.timezone.utc).isoformat(),
        updated_at=dt.datetime.now(dt.timezone.utc).isoformat(),
        cwd="/home/josh/dev/AgentWitness",
        originator="test",
        source="codex",
        cli_version="1.0",
        model="gpt-4",
        git_origin_url=None,
        git_branch="main",
        git_sha=None,
        title="Fedora Session",
        first_user_message="Hello from Fedora",
        line_count=10,
        file_size=100,
        events=[]
    )
    write_session(con, session)
    con.commit()
    con.close()
    
    from joshmemory.index import project_status
    history = project_status("AgentWitness", db_path=db_path)
    
    # Check that live path is Windows and historical cwd is Fedora
    assert history["live_auditor_state"]["path"] == "C:\\dev\\AgentWitness"
    assert len(history["historical_sessions"]) == 1
    assert history["historical_sessions"][0]["cwd"] == "/home/josh/dev/AgentWitness"
    assert history["historical_sessions"][0]["thread_id"] == "test-fedora-123"

