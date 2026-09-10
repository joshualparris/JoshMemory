import pytest
from unittest.mock import patch
import os
import shutil

@pytest.fixture(autouse=True)
def prevent_production_db_pollution(tmp_path, monkeypatch):
    '''
    Enforce that no test can accidentally read/write the user's real JoshMemory SQLite DB.
    This protects ~/.local/share/joshmemory/memory.sqlite.
    '''
    safe_db_path = str(tmp_path / "safe_isolated_test_memory.sqlite")
    
    # Mock the paths
    monkeypatch.setattr("joshmemory.schema.default_db_path", lambda: safe_db_path)
    monkeypatch.setattr("joshmemory.server.default_db_path", lambda: safe_db_path)
    
    yield
