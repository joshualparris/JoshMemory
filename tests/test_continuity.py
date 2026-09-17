from datetime import datetime, timedelta, timezone
from unittest.mock import patch

import pytest

from joshmemory.continuity import (
    ContinuityError,
    acquire_work,
    append_work_event,
    get_active_lease,
    get_resume_brief,
    get_trust,
    heartbeat_work,
    list_leases,
    list_work_events,
    release_work,
    set_trust,
    trusted_fact_search,
)
from joshmemory.facts import project_fact_add


@pytest.fixture
def db_path(tmp_path) -> str:
    return str(tmp_path / "memory.sqlite")


@pytest.fixture(autouse=True)
def local_storage():
    with patch("joshmemory.continuity.storage_mode", return_value="local"):
        yield


def test_claim_blocks_duplicate_owner_and_release_allows_next(db_path: str):
    first = acquire_work(db_path, "Repo", "agent-a", work_key="ci")
    assert first["acquired"] is True

    blocked = acquire_work(db_path, "Repo", "agent-b", work_key="ci")
    assert blocked["acquired"] is False
    assert blocked["lease"]["owner"] == "agent-a"

    release_work(db_path, "Repo", "agent-a", work_key="ci")
    assert get_active_lease(db_path, "Repo", work_key="ci") is None

    second = acquire_work(db_path, "Repo", "agent-b", work_key="ci")
    assert second["acquired"] is True
    assert second["lease"]["owner"] == "agent-b"


def test_wrong_owner_cannot_heartbeat_or_release(db_path: str):
    acquire_work(db_path, "Repo", "agent-a")
    with pytest.raises(ContinuityError):
        heartbeat_work(db_path, "Repo", "agent-b")
    with pytest.raises(ContinuityError):
        release_work(db_path, "Repo", "agent-b")


def test_heartbeat_extends_expiry(db_path: str):
    start = datetime(2026, 9, 18, 0, 0, tzinfo=timezone.utc)
    later = start + timedelta(seconds=60)
    with patch("joshmemory.continuity._utcnow", return_value=start):
        claim = acquire_work(db_path, "Repo", "agent-a", ttl_seconds=120)
    old_expiry = claim["lease"]["expires_at"]

    with patch("joshmemory.continuity._utcnow", return_value=later):
        heartbeat_work(db_path, "Repo", "agent-a", ttl_seconds=300)
        active = get_active_lease(db_path, "Repo")
    assert active is not None
    assert active["expires_at"] > old_expiry


def test_expired_lease_does_not_block_new_claim(db_path: str):
    start = datetime(2026, 9, 18, 0, 0, tzinfo=timezone.utc)
    with patch("joshmemory.continuity._utcnow", return_value=start):
        acquire_work(db_path, "Repo", "agent-a", ttl_seconds=30)

    after_expiry = start + timedelta(seconds=31)
    with patch("joshmemory.continuity._utcnow", return_value=after_expiry):
        assert get_active_lease(db_path, "Repo") is None
        claim = acquire_work(db_path, "Repo", "agent-b", ttl_seconds=30)
    assert claim["acquired"] is True
    assert claim["lease"]["owner"] == "agent-b"


def test_list_leases_returns_active_work_keys(db_path: str):
    acquire_work(db_path, "Repo", "agent-a", work_key="ci")
    acquire_work(db_path, "Repo", "agent-b", work_key="docs")
    leases = list_leases(db_path, project="Repo")
    assert {(row["work_key"], row["owner"]) for row in leases} == {
        ("ci", "agent-a"),
        ("docs", "agent-b"),
    }


def test_work_journal_is_append_only_and_redacts_secrets(db_path: str):
    event = append_work_event(
        db_path,
        "Repo",
        "TEST",
        "CI passed",
        details={"token": "sk-proj-abcdefghijklmnopqrstuvwxyz1234567890"},
        agent="codex",
    )
    assert event["event_type"] == "TEST"
    rows = list_work_events(db_path, "Repo")
    assert len(rows) == 1
    assert "sk-proj-abcdefghijklmnopqrstuvwxyz1234567890" not in str(rows[0])
    assert "REDACTED" in str(rows[0])


def test_agent_cannot_self_promote_trust(db_path: str):
    with pytest.raises(PermissionError):
        set_trust(
            db_path,
            "fact-1",
            "VERIFIED",
            actor="coding-agent",
            actor_kind="agent",
            source_ref="https://example.invalid/evidence",
        )


def test_verified_trust_requires_source_and_is_retrievable(db_path: str):
    with pytest.raises(ValueError):
        set_trust(
            db_path,
            "fact-1",
            "VERIFIED",
            actor="Josh",
            actor_kind="human",
        )

    set_trust(
        db_path,
        "fact-1",
        "VERIFIED",
        actor="Josh",
        actor_kind="human",
        source_ref="https://example.invalid/evidence",
    )
    trust = get_trust(db_path, "fact-1")
    assert trust["level"] == "VERIFIED"
    assert trust["actor_kind"] == "human"
    assert trust["implicit"] is False


def test_unknown_fact_is_implicitly_untrusted(db_path: str):
    assert get_trust(db_path, "never-seen") == {
        "target_id": "never-seen",
        "level": "UNTRUSTED",
        "implicit": True,
    }


def test_trusted_fact_search_separates_fact_status_from_trust(db_path: str):
    fact = project_fact_add(
        db_path,
        project="Repo",
        subject="architecture",
        fact="Live Git outranks memory",
        status="CURRENT",
        source_type="agent_note",
    )
    assert trusted_fact_search(db_path, "Git", project="Repo") == []

    set_trust(
        db_path,
        fact["id"],
        "APPROVED",
        project="Repo",
        actor="Josh",
        actor_kind="human",
        note="Portfolio engineering rule",
    )
    result = trusted_fact_search(db_path, "Git", project="Repo")
    assert len(result) == 1
    assert result[0]["status"] == "CURRENT"
    assert result[0]["trust"]["level"] == "APPROVED"


def test_resume_brief_surfaces_collision_and_recent_work(db_path: str):
    acquire_work(db_path, "Repo", "agent-a", work_key="ci")
    append_work_event(db_path, "Repo", "TEST", "pytest passed")

    context = {
        "handoff": {
            "recorded_at": "2026-09-18T00:00:00Z",
            "handoff": {"objective": "Repair CI", "next_action": "Check Actions"},
        },
        "live_state": {"git": {"branch": "main"}},
        "discrepancies": [],
        "precedence_note": "Live evidence wins.",
    }
    with patch("joshmemory.continuity.get_project_context", return_value=context):
        brief = get_resume_brief(
            db_path,
            "Repo",
            current_agent="agent-b",
            work_key="ci",
        )

    assert brief["objective"] == "Repair CI"
    assert brief["next_action"] == "Check Actions"
    assert brief["active_lease"]["owner"] == "agent-a"
    assert "leased by agent-a" in brief["collision_warning"]
    assert brief["recent_work"][0]["summary"] == "pytest passed"
