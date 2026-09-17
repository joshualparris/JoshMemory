import subprocess
from pathlib import Path
from unittest.mock import patch

import pytest
import os
from unittest.mock import patch

@pytest.fixture(autouse=True)
def mock_auditor():
    with patch("joshmemory.handoff.get_all_projects", return_value=[]):
        yield

from joshmemory.handoff import save_handoff
from joshmemory.hooks import (
    detect_project,
    cheap_git_snapshot,
    session_start_context,
    stop_nudge,
)


def run_cmd(cwd: Path, args: list[str]):
    subprocess.run(args, cwd=cwd, check=True, capture_output=True)


def make_repo(path: Path) -> str:
    path.mkdir(parents=True, exist_ok=True)
    run_cmd(path, ["git", "init"])
    run_cmd(path, ["git", "config", "user.email", "t@example.com"])
    run_cmd(path, ["git", "config", "user.name", "T"])
    (path / "f.txt").write_text("a")
    run_cmd(path, ["git", "add", "f.txt"])
    run_cmd(path, ["git", "commit", "-m", "init"])
    return subprocess.run(
        ["git", "-C", str(path), "rev-parse", "HEAD"], capture_output=True, text=True
    ).stdout.strip()


@pytest.fixture
def db_path(tmp_path) -> str:
    return str(tmp_path / "memory.sqlite")


def test_detect_project_uses_git_root_basename(tmp_path):
    repo = tmp_path / "MyProj"
    make_repo(repo)
    nested = repo / "sub" / "dir"
    nested.mkdir(parents=True)
    assert detect_project(nested) == "MyProj"


def test_detect_project_falls_back_to_cwd_name(tmp_path):
    not_a_repo = tmp_path / "PlainDir"
    not_a_repo.mkdir()
    assert detect_project(not_a_repo) == "PlainDir"


def test_cheap_git_snapshot_clean_vs_dirty(tmp_path):
    repo = tmp_path / "Repo"
    head = make_repo(repo)
    snap = cheap_git_snapshot(repo)
    assert snap["head_sha"] == head
    assert snap["dirty"] is False

    (repo / "f.txt").write_text("changed")
    snap2 = cheap_git_snapshot(repo)
    assert snap2["dirty"] is True


def test_session_start_context_empty_when_no_handoff(tmp_path, db_path):
    repo = tmp_path / "NeverHandedOff"
    make_repo(repo)
    with patch("joshmemory.hooks.get_project_context", return_value={"handoff": None}):
        assert session_start_context(repo, db_path=db_path) == {}


def test_session_start_context_includes_objective_and_precedence(tmp_path, db_path):
    repo = tmp_path / "ProjX"
    head = make_repo(repo)
    save_handoff(
        db_path, "ProjX",
        {"objective": "Ship the thing", "next_action": "Run tests"},
        machine="ws1",
    )
    result = session_start_context(repo, db_path=db_path, machine="ws1")
    ctx = result["hookSpecificOutput"]["additionalContext"]
    assert "Ship the thing" in ctx
    assert "Run tests" in ctx
    assert result["hookSpecificOutput"]["hookEventName"] == "SessionStart"


def test_stop_nudge_silent_when_no_new_commit(tmp_path, db_path):
    repo = tmp_path / "ProjY"
    head = make_repo(repo)
    save_handoff(db_path, "ProjY", {"objective": "x", "head_commit": head}, machine="ws1")
    assert stop_nudge(repo, db_path=db_path, machine="ws1") == {}


def test_stop_nudge_silent_when_handoff_uses_short_sha(tmp_path, db_path):
    """Regression: a handoff recorded with a short/abbreviated SHA (as an
    agent might write by hand) must not look stale forever just because it
    doesn't string-match the full SHA git reports."""
    repo = tmp_path / "ProjShortSha"
    head = make_repo(repo)
    save_handoff(db_path, "ProjShortSha", {"objective": "x", "head_commit": head[:7]}, machine="ws1")
    assert stop_nudge(repo, db_path=db_path, machine="ws1") == {}


def test_stop_nudge_fires_once_then_never_loops(tmp_path, db_path, monkeypatch):
    monkeypatch.setenv("JOSHMEMORY_HOME", str(tmp_path / "state"))
    repo = tmp_path / "ProjZ"
    old_head = make_repo(repo)
    save_handoff(db_path, "ProjZ", {"objective": "x", "head_commit": old_head}, machine="ws1")

    run_cmd(repo, ["git", "commit", "--allow-empty", "-m", "second"])

    first = stop_nudge(repo, db_path=db_path, machine="ws1")
    assert first.get("decision") == "block"
    assert "reason" in first

    # Same HEAD, agent didn't act: must NOT block again (no infinite loop).
    second = stop_nudge(repo, db_path=db_path, machine="ws1")
    assert second == {}

    # A further commit produces a fresh nudge.
    run_cmd(repo, ["git", "commit", "--allow-empty", "-m", "third"])
    third = stop_nudge(repo, db_path=db_path, machine="ws1")
    assert third.get("decision") == "block"


def test_stop_nudge_clears_after_handoff_saved(tmp_path, db_path, monkeypatch):
    monkeypatch.setenv("JOSHMEMORY_HOME", str(tmp_path / "state"))
    repo = tmp_path / "ProjW"
    old_head = make_repo(repo)
    save_handoff(db_path, "ProjW", {"objective": "x", "head_commit": old_head}, machine="ws1")
    run_cmd(repo, ["git", "commit", "--allow-empty", "-m", "second"])
    new_head = cheap_git_snapshot(repo)["head_sha"]

    assert stop_nudge(repo, db_path=db_path, machine="ws1").get("decision") == "block"

    save_handoff(db_path, "ProjW", {"objective": "x done", "head_commit": new_head}, machine="ws1")
    assert stop_nudge(repo, db_path=db_path, machine="ws1") == {}


def test_stop_nudge_non_git_dir_is_silent(tmp_path, db_path):
    plain = tmp_path / "NotGit"
    plain.mkdir()
    assert stop_nudge(plain, db_path=db_path, machine="ws1") == {}

def test_extract_transcript_info(tmp_path):
    from joshmemory.hooks import extract_transcript_info
    import json
    log = tmp_path / "test.jsonl"
    log.write_text('\n'.join([
        json.dumps({"type": "last-prompt", "lastPrompt": "first task"}),
        json.dumps({"type": "message", "message": {"role": "assistant", "content": [{"type": "text", "text": "first answer"}]}}),
        json.dumps({"type": "last-prompt", "lastPrompt": "second task"}),
        json.dumps({"type": "assistant", "message": {"role": "assistant", "content": [{"type": "text", "text": "second answer"}]}}),
        json.dumps({"type": "message", "message": {"role": "assistant", "content": [{"type": "tool_use"}]}}),
    ]))
    user, asst = extract_transcript_info(str(log))
    assert user == "second task"
    assert asst == "second answer"

