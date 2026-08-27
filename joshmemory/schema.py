from __future__ import annotations

import sqlite3


SCHEMA = """
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS sessions (
  thread_id TEXT PRIMARY KEY,
  rollout_path TEXT NOT NULL UNIQUE,
  rollout_slug TEXT NOT NULL,
  created_at TEXT,
  updated_at TEXT,
  cwd TEXT,
  originator TEXT,
  source TEXT,
  cli_version TEXT,
  model TEXT,
  git_origin_url TEXT,
  git_branch TEXT,
  git_sha TEXT,
  title TEXT,
  first_user_message TEXT,
  line_count INTEGER NOT NULL DEFAULT 0,
  file_size INTEGER NOT NULL DEFAULT 0,
  indexed_at TEXT NOT NULL,
  source_mtime REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  thread_id TEXT NOT NULL REFERENCES sessions(thread_id) ON DELETE CASCADE,
  source_line INTEGER NOT NULL,
  timestamp TEXT,
  event_kind TEXT NOT NULL,
  role TEXT,
  text TEXT NOT NULL,
  text_hash TEXT NOT NULL,
  UNIQUE(thread_id, source_line, event_kind, role, text_hash)
);

CREATE TABLE IF NOT EXISTS chatgpt_conversations (
  conversation_id TEXT PRIMARY KEY,
  title TEXT,
  create_time TEXT,
  update_time TEXT,
  source_filename TEXT NOT NULL,
  imported_at TEXT NOT NULL,
  source_hash TEXT NOT NULL,
  thread_id TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS chatgpt_messages (
  conversation_id TEXT NOT NULL REFERENCES chatgpt_conversations(conversation_id) ON DELETE CASCADE,
  message_id TEXT NOT NULL,
  parent_message_id TEXT,
  author_role TEXT,
  author_name TEXT,
  message_time TEXT,
  model TEXT,
  text TEXT NOT NULL,
  branch_status TEXT NOT NULL,
  sequence_index INTEGER,
  source_filename TEXT NOT NULL,
  imported_at TEXT NOT NULL,
  PRIMARY KEY (conversation_id, message_id)
);

CREATE VIRTUAL TABLE IF NOT EXISTS events_fts USING fts5(
  text,
  role UNINDEXED,
  event_kind UNINDEXED,
  thread_id UNINDEXED,
  content='events',
  content_rowid='id'
);

CREATE TRIGGER IF NOT EXISTS events_ai AFTER INSERT ON events BEGIN
  INSERT INTO events_fts(rowid, text, role, event_kind, thread_id)
  VALUES (new.id, new.text, new.role, new.event_kind, new.thread_id);
END;

CREATE TRIGGER IF NOT EXISTS events_ad AFTER DELETE ON events BEGIN
  INSERT INTO events_fts(events_fts, rowid, text, role, event_kind, thread_id)
  VALUES('delete', old.id, old.text, old.role, old.event_kind, old.thread_id);
END;

CREATE TRIGGER IF NOT EXISTS events_au AFTER UPDATE ON events BEGIN
  INSERT INTO events_fts(events_fts, rowid, text, role, event_kind, thread_id)
  VALUES('delete', old.id, old.text, old.role, old.event_kind, old.thread_id);
  INSERT INTO events_fts(rowid, text, role, event_kind, thread_id)
  VALUES (new.id, new.text, new.role, new.event_kind, new.thread_id);
END;
"""


def connect(path: str) -> sqlite3.Connection:
    con = sqlite3.connect(path)
    con.row_factory = sqlite3.Row
    con.executescript(SCHEMA)
    _migrate(con)
    return con


def _migrate(con: sqlite3.Connection) -> None:
    columns = {row[1] for row in con.execute("PRAGMA table_info(events)")}
    if "provenance" not in columns:
        con.execute("ALTER TABLE events ADD COLUMN provenance TEXT")
    if "source_id" not in columns:
        con.execute("ALTER TABLE events ADD COLUMN source_id TEXT")

