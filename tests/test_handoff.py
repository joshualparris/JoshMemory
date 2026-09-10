import json
from unittest.mock import patch

import pytest
import os
from unittest.mock import patch

@pytest.fixture(autouse=True)
def mock_auditor():
    with patch("joshmemory.handoff.get_all_projects", return_value=[]):
        yield

from joshmemory.handoff import (
    save_handoff,
    get_latest_handoff,
    list_handoffs,
    get_project_context,
)


@pytest.fixture
def db_path(tmp_path) -> str:
    return str(tmp_path / "memory.sqlite")


def test_save_and_retrieve_latest_handoff(db_path: str):
    result = save_handoff(
        db_path, "TestProj",
        {"objective": "Fix the update loop", "next_action": "Ship canary"},
        machine="ws1",
    )
    assert result["duplicate"] is False

    latest = get_latest_handoff(db_path, "TestProj", machine="ws1")
    assert latest is not None
    assert latest["handoff"]["objective"] == "Fix the update loop"
    assert latest["status"] == "CURRENT"
    assert latest["active"] == 1


def test_missing_required_field_rejected(db_path: str):
    with pytest.raises(ValueError):
        save_handoff(db_path, "TestProj", {"next_action": "no objective given"})


def test_second_handoff_supersedes_first(db_path: str):
    first = save_handoff(db_path, "TestProj", {"objective": "Step 1"}, machine="ws1")
    second = save_handoff(db_path, "TestProj", {"objective": "Step 2"}, machine="ws1")

    latest = get_latest_handoff(db_path, "TestProj", machine="ws1")
    assert latest["id"] == second["id"]
    assert latest["handoff"]["objective"] == "Step 2"

    all_handoffs = list_handoffs(db_path, "TestProj", machine="ws1", active_only=False)
    ids = {h["id"] for h in all_handoffs}
    assert first["id"] in ids and second["id"] in ids

    active_only = list_handoffs(db_path, "TestProj", machine="ws1", active_only=True)
    assert [h["id"] for h in active_only] == [second["id"]]


def test_duplicate_handoff_is_deduplicated(db_path: str):
    payload = {"objective": "Same content"}
    first = save_handoff(db_path, "TestProj", payload, machine="ws1")
    second = save_handoff(db_path, "TestProj", payload, machine="ws1")
    assert first["id"] == second["id"]
    assert second["duplicate"] is True


def test_multiple_machines_tracked_separately(db_path: str):
    save_handoff(db_path, "TestProj", {"objective": "Work on ws1"}, machine="ws1")
    save_handoff(db_path, "TestProj", {"objective": "Work on ws2"}, machine="ws2")

    latest_ws1 = get_latest_handoff(db_path, "TestProj", machine="ws1")
    latest_ws2 = get_latest_handoff(db_path, "TestProj", machine="ws2")
    assert latest_ws1["handoff"]["objective"] == "Work on ws1"
    assert latest_ws2["handoff"]["objective"] == "Work on ws2"

    # Without a machine filter, the most recently recorded handoff wins.
    latest_any = get_latest_handoff(db_path, "TestProj")
    assert latest_any["handoff"]["objective"] == "Work on ws2"


def test_secret_redacted_before_storage(db_path: str):
    save_handoff(
        db_path, "TestProj",
        {
            "objective": "Deploy with token",
            "blockers": ["ACTION1_TOKEN=sk-proj-abcdefghijklmnopqrstuvwxyz1234567890"],
        },
        machine="ws1",
    )
    latest = get_latest_handoff(db_path, "TestProj", machine="ws1")
    stored_text = json.dumps(latest["handoff"])
    assert "sk-proj-abcdefghijklmnopqrstuvwxyz1234567890" not in stored_text
    assert "REDACTED" in stored_text


def test_project_with_no_prior_handoff(db_path: str):
    with patch("joshmemory.handoff.get_project_state", return_value=None):
        ctx = get_project_context(db_path, "NeverSeenProject")
    assert ctx["handoff"] is None
    assert ctx["discrepancies"] == []
    assert ctx["live_state"] is None


def test_stale_handoff_vs_live_git_flagged(db_path: str):
    save_handoff(
        db_path, "TestProj",
        {"objective": "Fix bug", "head_commit": "aaaaaaa", "branch": "main"},
        machine="ws1",
    )
    live_state = {
        "name": "TestProj",
        "path": "/home/josh/dev/TestProj",
        "git": {"head": "main", "oid": "bbbbbbb", "modified": 0, "untracked": 0, "ahead": 0},
    }
    with patch("joshmemory.handoff.get_project_state", return_value=live_state):
        ctx = get_project_context(db_path, "TestProj", machine="ws1")

    assert len(ctx["discrepancies"]) == 1
    assert ctx["discrepancies"][0]["field"] == "head_commit"
    assert ctx["discrepancies"][0]["recorded"] == "aaaaaaa"
    assert ctx["discrepancies"][0]["live"] == "bbbbbbb"
    # The stored handoff itself must be untouched, not silently corrected.
    stored = get_latest_handoff(db_path, "TestProj", machine="ws1")
    assert stored["handoff"]["head_commit"] == "aaaaaaa"


def test_matching_handoff_and_live_state_no_discrepancy(db_path: str):
    save_handoff(
        db_path, "TestProj",
        {"objective": "Fix bug", "head_commit": "aaaaaaa", "branch": "main"},
        machine="ws1",
    )
    live_state = {
        "name": "TestProj",
        "path": "/home/josh/dev/TestProj",
        "git": {"head": "main", "oid": "aaaaaaa", "modified": 0, "untracked": 0, "ahead": 0},
    }
    with patch("joshmemory.handoff.get_project_state", return_value=live_state):
        ctx = get_project_context(db_path, "TestProj", machine="ws1")
    assert ctx["discrepancies"] == []


def test_short_sha_in_handoff_not_flagged_as_discrepancy(db_path: str):
    """Regression: recording a short SHA in a handoff must not falsely
    trigger a stale-handoff discrepancy against the full live SHA."""
    save_handoff(
        db_path, "TestProj",
        {"objective": "x", "head_commit": "4c71dd0", "branch": "main"},
        machine="ws1",
    )
    live_state = {
        "name": "TestProj",
        "path": "/p",
        "git": {"head": "main", "oid": "4c71dd004a231b483349cd3783a1e796bbdfabe7"},
    }
    with patch("joshmemory.handoff.get_project_state", return_value=live_state):
        ctx = get_project_context(db_path, "TestProj", machine="ws1")
    assert ctx["discrepancies"] == []


def test_normalizes_both_auditor_schemas(db_path: str):
    """scan_built_in uses branch/head_sha; fedora_project_audit.py uses head/oid.
    get_project_context must handle either without crashing or missing the
    discrepancy."""
    save_handoff(db_path, "TestProj", {"objective": "x", "head_commit": "ccc1111"}, machine="ws1")

    built_in_shape = {"name": "TestProj", "path": "/p", "git": {"branch": "main", "head_sha": "ddd2222"}}
    with patch("joshmemory.handoff.get_project_state", return_value=built_in_shape):
        ctx = get_project_context(db_path, "TestProj", machine="ws1")
    assert ctx["discrepancies"][0]["live"] == "ddd2222"

    fedora_shape = {"name": "TestProj", "path": "/p", "git": {"head": "main", "oid": "ddd2222"}}
    with patch("joshmemory.handoff.get_project_state", return_value=fedora_shape):
        ctx = get_project_context(db_path, "TestProj", machine="ws1")
    assert ctx["discrepancies"][0]["live"] == "ddd2222"


def test_malformed_stored_fact_does_not_crash(db_path: str):
    from joshmemory.facts import project_fact_add
    project_fact_add(
        db_path, "TestProj", "session_handoff", "not valid json", "CURRENT",
        source_type="agent_handoff", machine="ws1",
    )
    latest = get_latest_handoff(db_path, "TestProj", machine="ws1")
    assert latest is not None
    assert latest["handoff"] is None


def test_get_project_context_precedence_note_present(db_path: str):
    with patch("joshmemory.handoff.get_project_state", return_value=None):
        ctx = get_project_context(db_path, "AnyProject")
    assert "Live" in ctx["precedence_note"]
