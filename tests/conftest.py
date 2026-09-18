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
    yield
