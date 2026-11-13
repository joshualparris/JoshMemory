import pytest
import os

@pytest.fixture(autouse=True)
def prevent_production_db_pollution(tmp_path, monkeypatch):
    '''
    Isolate both SQLite and automatic shared storage from the user's real memory.
    Backend-specific tests can explicitly enable their mocked/local test backend.
    '''
    isolated_home = tmp_path / "isolated_joshmemory_home"
    isolated_home.mkdir(exist_ok=True)
    monkeypatch.setenv("JOSHMEMORY_HOME", str(isolated_home))
    monkeypatch.setenv("JOSHMEMORY_GITHUB_STORE_AUTO", "0")
    monkeypatch.delenv("JOSHMEMORY_REMOTE_URL", raising=False)
    yield
