import pytest
import os

@pytest.fixture(autouse=True)
def prevent_production_db_pollution(tmp_path, monkeypatch):
    '''
    Enforce that no test can accidentally read/write the user's real JoshMemory SQLite DB.
    This protects ~/.local/share/joshmemory/memory.sqlite by redirecting the home dir.
    '''
    isolated_home = tmp_path / "isolated_joshmemory_home"
    isolated_home.mkdir(exist_ok=True)
    monkeypatch.setenv("JOSHMEMORY_HOME", str(isolated_home))
    # CI must never discover credentials and write test records to the real
    # GitHub-backed memory store. Explicit integration tests can opt back in.
    monkeypatch.setenv("JOSHMEMORY_GITHUB_STORE_AUTO", "0")
    monkeypatch.delenv("JOSHMEMORY_REMOTE_URL", raising=False)
    yield
