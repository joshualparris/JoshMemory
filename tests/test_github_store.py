from __future__ import annotations

from pathlib import Path

from joshmemory import github_store
from joshmemory.central import remote_call, remote_enabled, storage_mode


def _memory_store(monkeypatch):
    records: dict[str, list[dict]] = {"project_facts": [], "accountability": []}

    def load(kind: str):
        return [dict(row) for row in records.get(kind, [])]

    def append(kind: str, record: dict):
        records.setdefault(kind, []).append(dict(record))

    monkeypatch.setattr(github_store, "_load_records", load)
    monkeypatch.setattr(github_store, "_append_record", append)
    return records


def test_github_handoff_resumes_across_checkout_paths(monkeypatch):
    _memory_store(monkeypatch)
    canonical = "github.com/joshualparris/example"

    saved = github_store.cloud_call(
        "save_handoff",
        {
            "project": "example",
            "handoff": {
                "objective": "Finish cloud continuity",
                "next_action": "Resume elsewhere",
                "head_commit": "abc1234",
            },
            "machine": "fedora-controller",
            "canonical_repo": canonical,
            "checkout_path": "/home/josh/dev/example",
            "source_type": "test",
        },
    )
    assert saved["duplicate"] is False

    latest = github_store.cloud_call(
        "get_latest_handoff",
        {
            "project": "example",
            "canonical_repo": canonical,
            "checkout_path": r"C:\dev\example",
        },
    )
    assert latest is not None
    assert latest["machine"] == "fedora-controller"
    assert latest["handoff"]["objective"] == "Finish cloud continuity"

    github_store.cloud_call(
        "save_handoff",
        {
            "project": "example",
            "handoff": {"objective": "Continue on Windows", "next_action": "Run tests"},
            "machine": "probook",
            "canonical_repo": canonical,
            "checkout_path": r"C:\dev\example",
            "source_type": "test",
        },
    )
    rows = github_store.cloud_call(
        "list_handoffs",
        {
            "project": "example",
            "canonical_repo": canonical,
            "checkout_path": "/third/clone",
            "active_only": True,
            "limit": 10,
        },
    )
    assert {row["machine"] for row in rows} == {"fedora-controller", "probook"}


def test_github_fact_supersession_is_append_only(monkeypatch):
    records = _memory_store(monkeypatch)

    first = github_store.cloud_call(
        "project_fact_add",
        {
            "project": "example",
            "subject": "deployment",
            "fact": "workstation hosted",
            "status": "OBSERVED",
            "source_type": "test",
            "machine": "fedora-controller",
        },
    )
    second = github_store.cloud_call(
        "project_fact_add",
        {
            "project": "example",
            "subject": "deployment",
            "fact": "GitHub cloud store enabled",
            "status": "OBSERVED",
            "source_type": "test",
            "machine": "fedora-controller",
            "supersedes": first["id"],
        },
    )

    assert first["id"] != second["id"]
    assert len(records["project_facts"]) == 2

    active = github_store.cloud_call(
        "project_fact_search",
        {"query": "deployment", "project": "example", "active_only": True},
    )
    assert len(active) == 1
    assert active[0]["fact"] == "GitHub cloud store enabled"

    all_rows = github_store.cloud_call(
        "project_fact_search",
        {"query": "", "project": "example", "active_only": False},
    )
    assert len(all_rows) == 2
    assert {row["active"] for row in all_rows} == {0, 1}


def test_central_auto_routes_to_existing_github_auth(monkeypatch, tmp_path: Path):
    monkeypatch.delenv("JOSHMEMORY_REMOTE_URL", raising=False)
    monkeypatch.setenv("JOSHMEMORY_GITHUB_TOKEN", "test-token")
    monkeypatch.setenv("JOSHMEMORY_GITHUB_STORE_AUTO", "1")

    calls = []

    def fake_cloud_call(operation, arguments):
        calls.append((operation, arguments))
        return {"backend": "github"}

    monkeypatch.setattr(github_store, "cloud_call", fake_cloud_call)

    assert remote_enabled() is True
    assert storage_mode() == "github"
    result = remote_call("project_fact_search", {"query": "cloud"})
    assert result == {"backend": "github"}
    assert calls == [("project_fact_search", {"query": "cloud"})]


def test_github_store_can_be_disabled(monkeypatch):
    monkeypatch.delenv("JOSHMEMORY_REMOTE_URL", raising=False)
    monkeypatch.setenv("JOSHMEMORY_GITHUB_TOKEN", "test-token")
    monkeypatch.setenv("JOSHMEMORY_GITHUB_STORE_AUTO", "0")
    assert remote_enabled() is False
    assert storage_mode() == "local"
