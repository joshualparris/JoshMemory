from __future__ import annotations

import threading
from pathlib import Path

import pytest

from joshmemory.central import CentralMemoryError, create_server
from joshmemory.handoff import get_latest_handoff, list_handoffs, save_handoff


def _start_server(tmp_path: Path, token: str = "test-secret"):
    db_path = tmp_path / "central" / "memory.sqlite"
    server = create_server("127.0.0.1", 0, db_path=str(db_path), token=token)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server, thread, db_path


def test_remote_handoff_is_central_and_resumes_from_different_checkout(tmp_path, monkeypatch):
    server, thread, central_db = _start_server(tmp_path)
    try:
        monkeypatch.setenv("JOSHMEMORY_REMOTE_URL", f"http://127.0.0.1:{server.server_address[1]}")
        monkeypatch.setenv("JOSHMEMORY_TOKEN", "test-secret")
        local_db = tmp_path / "client" / "memory.sqlite"
        canonical = "github.com/joshualparris/example"

        saved = save_handoff(
            str(local_db),
            "example",
            {
                "objective": "Finish central memory",
                "next_action": "Resume on the other machine",
                "head_commit": "abc1234",
            },
            machine="fedora-controller",
            canonical_repo=canonical,
            checkout_path="/home/josh/dev/example",
        )
        assert saved["duplicate"] is False
        assert central_db.exists()
        assert not local_db.exists()

        latest = get_latest_handoff(
            str(local_db),
            "example",
            canonical_repo=canonical,
            checkout_path=r"C:\dev\example",
        )
        assert latest is not None
        assert latest["machine"] == "fedora-controller"
        assert latest["handoff"]["objective"] == "Finish central memory"

        save_handoff(
            str(local_db),
            "example",
            {"objective": "Continue on Windows", "next_action": "Run tests"},
            machine="probook",
            canonical_repo=canonical,
            checkout_path=r"C:\dev\example",
        )
        rows = list_handoffs(
            str(local_db),
            "example",
            canonical_repo=canonical,
            checkout_path="/some/third/clone",
            active_only=True,
        )
        assert {row["machine"] for row in rows} == {"fedora-controller", "probook"}
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=2)


def test_remote_auth_failure_does_not_fall_back_to_local(tmp_path, monkeypatch):
    server, thread, _ = _start_server(tmp_path)
    try:
        monkeypatch.setenv("JOSHMEMORY_REMOTE_URL", f"http://127.0.0.1:{server.server_address[1]}")
        monkeypatch.setenv("JOSHMEMORY_TOKEN", "wrong-token")
        local_db = tmp_path / "must-not-exist.sqlite"

        with pytest.raises(CentralMemoryError, match="401"):
            get_latest_handoff(str(local_db), "example")
        assert not local_db.exists()
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=2)


def test_non_loopback_server_requires_token(tmp_path):
    with pytest.raises(ValueError, match="JOSHMEMORY_TOKEN"):
        create_server("0.0.0.0", 0, db_path=str(tmp_path / "memory.sqlite"), token="")
