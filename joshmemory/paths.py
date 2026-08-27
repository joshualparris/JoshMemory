from __future__ import annotations

import os
from pathlib import Path


def codex_home() -> Path:
    return Path(os.environ.get("CODEX_HOME", Path.home() / ".codex")).expanduser()


def default_sessions_dir() -> Path:
    return codex_home() / "sessions"


def default_data_dir() -> Path:
    return Path(os.environ.get("JOSHMEMORY_HOME", Path.home() / ".local/share/joshmemory")).expanduser()


def default_db_path() -> Path:
    return default_data_dir() / "memory.sqlite"

