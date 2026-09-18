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



def test_cloud_coding_chat_search_filters_date_and_deduplicates(monkeypatch):
    records = [
        {
            "id": "chatgpt:c1",
            "conversation_id": "c1",
            "title": "Website HTML Code Structure",
            "created_at": "2023-03-02T10:04:20Z",
            "source": "historical_chatgpt_export",
            "matched_terms": ["html", "code"],
        },
        {
            "id": "chatgpt:c1-new",
            "conversation_id": "c1",
            "title": "Website HTML Code Structure",
            "created_at": "2023-03-02T10:04:20Z",
            "updated_at": "2026-01-01T00:00:00Z",
            "source": "historical_chatgpt_export",
            "matched_terms": ["html", "code"],
        },
        {
            "id": "chatgpt:c2",
            "conversation_id": "c2",
            "title": "ForgeGrid worker repair",
            "created_at": "2026-08-20T00:00:00Z",
            "source": "reconstructed_post_export_history",
            "matched_terms": ["forgegrid"],
        },
    ]

    monkeypatch.setattr(
        github_store,
        "_load_records",
        lambda kind: [dict(row) for row in records] if kind == "coding_chats" else [],
    )

    march = github_store.cloud_call(
        "coding_chat_search",
        {"query": "html", "start_date": "2023-03-01", "end_date": "2023-03-31", "limit": 20},
    )
    assert len(march) == 1
    assert march[0]["conversation_id"] == "c1"

    coverage = github_store.cloud_call("coding_chat_coverage", {})
    assert coverage["coding_chats"] == 2
    assert coverage["earliest"].startswith("2023-03-02")
    assert coverage["latest"].startswith("2026-08-20")
