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


# --- record loading: blob-SHA cache, parallel fetch, token memoisation ---------

import base64 as _b64
import json as _json

import pytest as _pytest


def _sha(n: int) -> str:
    return f"{n:040x}"


class _FakeGitHub:
    """Fake GitHub contents API: a tree of record blobs plus request counters."""

    def __init__(self):
        self.blobs: dict[str, dict] = {}  # sha -> record
        self.paths: dict[str, str] = {}  # path -> sha
        self.calls: list[str] = []

    def add(self, kind: str, name: str, n: int, record: dict):
        sha = _sha(n)
        self.blobs[sha] = record
        self.paths[f"joshmemory-cloud/v1/{kind}/{name}.json"] = sha

    def request(self, method: str, endpoint: str, payload=None):
        self.calls.append(endpoint)
        if endpoint.startswith("/git/trees/"):
            return {"tree": [{"path": p, "type": "blob", "sha": s} for p, s in self.paths.items()]}
        if endpoint.startswith("/git/blobs/"):
            record = self.blobs[endpoint.rsplit("/", 1)[1]]
            return {"content": _b64.b64encode(_json.dumps(record).encode()).decode()}
        raise AssertionError(f"unexpected endpoint {endpoint}")

    def blob_calls(self) -> int:
        return sum(1 for c in self.calls if c.startswith("/git/blobs/"))


@_pytest.fixture
def fake_github(monkeypatch, tmp_path):
    monkeypatch.setenv("JOSHMEMORY_HOME", str(tmp_path))
    monkeypatch.delenv("JOSHMEMORY_GITHUB_CACHE", raising=False)
    monkeypatch.delenv("JOSHMEMORY_GITHUB_WORKERS", raising=False)
    fake = _FakeGitHub()
    monkeypatch.setattr(github_store, "_api_request", fake.request)
    return fake


def test_records_are_cached_by_blob_sha(fake_github):
    for i in range(5):
        fake_github.add("project_facts", f"r{i}", i + 1, {"id": f"r{i}", "project": "example"})

    first = github_store._load_records("project_facts")
    assert [r["id"] for r in first] == [f"r{i}" for i in range(5)]  # path order kept
    assert fake_github.blob_calls() == 5

    second = github_store._load_records("project_facts")
    assert second == first
    assert fake_github.blob_calls() == 5  # nothing re-downloaded


def test_only_new_records_are_downloaded(fake_github):
    fake_github.add("project_facts", "a", 1, {"id": "a"})
    github_store._load_records("project_facts")
    fake_github.add("project_facts", "b", 2, {"id": "b"})

    rows = github_store._load_records("project_facts")

    assert [r["id"] for r in rows] == ["a", "b"]
    assert fake_github.blob_calls() == 2  # one per distinct blob, ever


def test_cache_can_be_disabled(fake_github, monkeypatch):
    monkeypatch.setenv("JOSHMEMORY_GITHUB_CACHE", "0")
    fake_github.add("project_facts", "a", 1, {"id": "a"})

    github_store._load_records("project_facts")
    github_store._load_records("project_facts")

    assert fake_github.blob_calls() == 2


def test_sequential_and_parallel_loading_agree(fake_github, monkeypatch):
    for i in range(12):
        fake_github.add("project_facts", f"r{i:02d}", i + 1, {"id": f"r{i:02d}"})
    monkeypatch.setenv("JOSHMEMORY_GITHUB_CACHE", "0")

    monkeypatch.setenv("JOSHMEMORY_GITHUB_WORKERS", "1")
    sequential = github_store._load_records("project_facts")
    monkeypatch.setenv("JOSHMEMORY_GITHUB_WORKERS", "8")
    parallel = github_store._load_records("project_facts")

    assert parallel == sequential


def test_other_kinds_are_not_loaded(fake_github):
    fake_github.add("project_facts", "a", 1, {"id": "a"})
    fake_github.add("coding_chats", "c", 2, {"id": "c"})

    github_store._load_records("project_facts")

    assert fake_github.blob_calls() == 1


def test_damaged_cache_entry_is_discarded_and_redownloaded(fake_github):
    fake_github.add("project_facts", "a", 1, {"id": "a"})
    github_store._load_records("project_facts")
    cached = github_store._cache_dir() / f"{_sha(1)}.json"
    assert cached.exists()
    cached.write_text("{not json", encoding="utf-8")

    rows = github_store._load_records("project_facts")

    assert rows == [{"id": "a"}]
    assert fake_github.blob_calls() == 2  # re-fetched once
    assert _json.loads(cached.read_text(encoding="utf-8")) == {"id": "a"}  # healed


def test_invalid_remote_json_still_raises(fake_github, monkeypatch):
    fake_github.add("project_facts", "a", 1, {"id": "a"})
    real_request = fake_github.request

    def bad(method, endpoint, payload=None):
        if endpoint.startswith("/git/blobs/"):
            return {"content": _b64.b64encode(b"{not json").decode()}
        return real_request(method, endpoint, payload)

    monkeypatch.setattr(github_store, "_api_request", bad)

    with _pytest.raises(github_store.GitHubStoreError):
        github_store._load_records("project_facts")  # a bad remote record is loud
    assert not (github_store._cache_dir() / f"{_sha(1)}.json").exists()  # and never cached as good


def test_invalid_sha_never_touches_the_cache_directory(fake_github):
    assert github_store._cache_read("../../etc/passwd") is None
    github_store._cache_write("../../evil", "x")
    assert not (github_store._cache_dir() / "..").resolve().joinpath("evil.json").exists()


def test_external_token_is_resolved_once(monkeypatch):
    for name in ("JOSHMEMORY_GITHUB_TOKEN", "GH_TOKEN", "GITHUB_TOKEN"):
        monkeypatch.delenv(name, raising=False)
    monkeypatch.setattr(github_store, "_token_cache", None)
    lookups = []
    monkeypatch.setattr(github_store, "_token_from_gh", lambda: lookups.append(1) or "synthetic-token")
    monkeypatch.setattr(github_store, "_token_from_git_credential", lambda: "")

    assert github_store.github_token() == "synthetic-token"
    assert github_store.github_token() == "synthetic-token"

    assert len(lookups) == 1


def test_missing_token_is_not_cached(monkeypatch):
    for name in ("JOSHMEMORY_GITHUB_TOKEN", "GH_TOKEN", "GITHUB_TOKEN"):
        monkeypatch.delenv(name, raising=False)
    monkeypatch.setattr(github_store, "_token_cache", None)
    answers = iter(["", "synthetic-token"])
    monkeypatch.setattr(github_store, "_token_from_gh", lambda: next(answers))
    monkeypatch.setattr(github_store, "_token_from_git_credential", lambda: "")

    assert github_store.github_token() == ""
    assert github_store.github_token() == "synthetic-token"  # a later login is noticed
