import pytest
import json
import sqlite3
from unittest import mock
from pathlib import Path
import datetime as dt

from joshmemory.auditor import get_project_state, get_all_projects, normalize_name
from joshmemory.index import project_status, project_history, recent_work, write_session
from joshmemory.parser import ParsedSession
from joshmemory.schema import connect

FAKE_AUDITOR_JSON = {
    "version": "1.0",
    "projects": [
        {
            "name": "FedoraCrashDoctor",
            "path": "/home/josh/dev/FedoraCrashDoctor",
            "git": {
                "head": "main",
                "modified": 2,
                "untracked": 1,
                "ahead": 0,
                "latest_commit_date": "2026-08-27T10:00:00Z"
            }
        },
        {
            "name": "ForgeGrid",
            "path": "/home/josh/dev/6 Laptops/ForgeGrid",
            "git": {
                "head": "forgegrid-upgrade",
                "modified": 0,
                "untracked": 0,
                "ahead": 1,
                "latest_commit_date": "2026-08-21T10:00:00Z"
            }
        },
        {
            "name": "CleanRepo",
            "path": "/home/josh/dev/Clean",
            "git": {
                "head": "main",
                "modified": 0,
                "untracked": 0,
                "ahead": 0,
                "latest_commit_date": "2026-01-01T10:00:00Z"
            }
        }
    ]
}

@mock.patch("joshmemory.auditor.run_auditor")
def test_valid_auditor_output(mock_run):
    mock_run.return_value = FAKE_AUDITOR_JSON
    state = get_project_state("FedoraCrashDoctor")
    assert state is not None
    assert state["name"] == "FedoraCrashDoctor"
    assert state["git"]["modified"] == 2

@mock.patch("joshmemory.auditor.run_auditor")
def test_auditor_unavailable(mock_run):
    mock_run.return_value = {}
    state = get_project_state("FedoraCrashDoctor")
    assert state is None

@mock.patch("joshmemory.auditor.run_auditor")
def test_unknown_project(mock_run):
    mock_run.return_value = FAKE_AUDITOR_JSON
    state = get_project_state("NonExistent")
    assert state is None

@mock.patch("joshmemory.auditor.run_auditor")
def test_fuzzy_project_matching(mock_run):
    mock_run.return_value = FAKE_AUDITOR_JSON
    state = get_project_state("fedora crash doctor")
    assert state is not None
    assert state["name"] == "FedoraCrashDoctor"
    
    state = get_project_state("Forge Grid")
    assert state is not None
    assert state["name"] == "ForgeGrid"

@mock.patch("joshmemory.auditor.run_auditor")
def test_combining_live_and_historical(mock_run, tmp_path):
    mock_run.return_value = FAKE_AUDITOR_JSON
    db_path = tmp_path / "test.db"
    
    fake_rollout = tmp_path / "fake.jsonl"
    fake_rollout.touch()
    
    con = connect(str(db_path))
    session = ParsedSession(
        thread_id="test-123",
        rollout_path=fake_rollout,
        rollout_slug="fake",
        created_at=dt.datetime.now(dt.timezone.utc).isoformat(),
        updated_at=dt.datetime.now(dt.timezone.utc).isoformat(),
        cwd="seed://FedoraCrashDoctor",
        originator="test",
        source="codex",
        cli_version="1.0",
        model="gpt-4",
        git_origin_url=None,
        git_branch="main",
        git_sha=None,
        title="Test Session",
        first_user_message="Hello",
        line_count=10,
        file_size=100,
        events=[]
    )
    write_session(con, session)
    con.commit()
    con.close()
    
    status = project_status("FedoraCrashDoctor", db_path=db_path)
    assert status["live_auditor_state"]["name"] == "FedoraCrashDoctor"
    assert status["live_auditor_state"]["git"]["modified"] == 2
    assert len(status["historical_sessions"]) == 1
    assert status["historical_sessions"][0]["thread_id"] == "test-123"
    assert "Inference" in status["note"]

@mock.patch("joshmemory.auditor.run_auditor")
def test_recent_work_ranking(mock_run, tmp_path):
    mock_run.return_value = FAKE_AUDITOR_JSON
    db_path = tmp_path / "test.db"
    
    ranked = recent_work(limit=10, db_path=db_path)
    # FedoraCrashDoctor has modified files and recent date -> highest score
    # ForgeGrid has ahead state and older date -> medium score
    # CleanRepo has old date and clean -> lowest score
    assert len(ranked) >= 2
    assert ranked[0]["project"] == "FedoraCrashDoctor"
    assert ranked[1]["project"] == "ForgeGrid"

def test_malformed_json_run_auditor():
    import joshmemory.auditor
    import subprocess
    with mock.patch("subprocess.run") as mock_run:
        # Return invalid JSON
        mock_result = mock.Mock()
        mock_result.stdout = "not valid json"
        mock_run.return_value = mock_result
        
        # Must patch path exists to bypass early return
        with mock.patch("pathlib.Path.exists", return_value=True):
            result = joshmemory.auditor.run_auditor()
            assert result == {}
