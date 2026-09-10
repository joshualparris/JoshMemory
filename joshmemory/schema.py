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

CREATE TABLE IF NOT EXISTS project_facts (
  id TEXT PRIMARY KEY,
  project TEXT NOT NULL,
    canonical_repo TEXT DEFAULT '',
    checkout_path TEXT DEFAULT '',
  machine TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL,
  fact TEXT NOT NULL,
  status TEXT NOT NULL,
  confidence REAL,
  observed_at TEXT,
  recorded_at TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_ref TEXT,
  supersedes TEXT,
  active BOOLEAN NOT NULL DEFAULT 1,
  UNIQUE(project, canonical_repo, checkout_path, subject, fact, status, machine),
  FOREIGN KEY(supersedes) REFERENCES project_facts(id),
  CHECK(status IN ('VERIFIED', 'OBSERVED', 'HISTORICAL', 'INFERRED', 'STALE', 'DISPROVEN', 'UNKNOWN', 'CURRENT')),
  CHECK(confidence IS NULL OR (confidence >= 0.0 AND confidence <= 1.0)),
  CHECK(supersedes != id),
  CHECK(active IN (0, 1))
);

CREATE TABLE IF NOT EXISTS accountability_references (
  id TEXT PRIMARY KEY,
  project TEXT NOT NULL,
    canonical_repo TEXT DEFAULT '',
    checkout_path TEXT DEFAULT '',
  requirement_id TEXT NOT NULL DEFAULT '',
  claim_summary TEXT NOT NULL,
  source_system TEXT NOT NULL,
  source_id TEXT NOT NULL,
  source_ref TEXT,
  reviewer TEXT,
  verdict TEXT,
  commit_sha TEXT,
  observed_at TEXT NOT NULL,
  supersedes TEXT,
  active BOOLEAN NOT NULL DEFAULT 1,
  UNIQUE(project, claim_summary, source_system, source_id, requirement_id),
  FOREIGN KEY(supersedes) REFERENCES accountability_references(id),
  CHECK(supersedes != id),
  CHECK(active IN (0, 1)),
  CHECK(verdict IS NULL OR verdict IN ('SATISFIED', 'REJECTED', 'EVIDENCED'))
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
    import sqlite3
    con = sqlite3.connect(path, timeout=30.0)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA busy_timeout = 10000")
    
    # Do not set foreign_keys = ON until AFTER migration, 
    # because table rebuilding requires it to be OFF.
    con.execute("PRAGMA foreign_keys = OFF")
    
    try:
        con.execute("PRAGMA journal_mode = WAL")
        con.executescript(SCHEMA)
        
        # ALWAYS evaluate safe idempotent migrations using user_version
        with con:
            _migrate(con)
    except sqlite3.OperationalError as e:
        # Don't swallow migration errors silently
        if "duplicate column" not in str(e).lower() and "no such table" not in str(e).lower():
            raise
    
    con.execute("PRAGMA foreign_keys = ON")
    return con


def _migrate(con: sqlite3.Connection) -> None:
    version = con.execute("PRAGMA user_version").fetchone()[0]
    
    if version < 1:
        columns = {row[1] for row in con.execute("PRAGMA table_info(events)")}
        try:
            if "provenance" not in columns:
                con.execute("ALTER TABLE events ADD COLUMN provenance TEXT")
            if "source_id" not in columns:
                con.execute("ALTER TABLE events ADD COLUMN source_id TEXT")
        except sqlite3.OperationalError as e:
            if "duplicate column name" not in str(e): raise
        con.execute("PRAGMA user_version = 1")
        version = 1

    if version < 2:
        # V2: Migrate project_facts to have canonical_repo, checkout_path and the new UNIQUE constraint.
        # This safely handles V0 (no columns), V1 (columns but old constraint), by checking columns first.
        pf_columns = {row[1] for row in con.execute("PRAGMA table_info(project_facts)")}
        
        # We must commit current transaction before DDL if any
        
        if "canonical_repo" not in pf_columns:
            con.execute("ALTER TABLE project_facts ADD COLUMN canonical_repo TEXT DEFAULT ''")
        if "checkout_path" not in pf_columns:
            con.execute("ALTER TABLE project_facts ADD COLUMN checkout_path TEXT DEFAULT ''")
            
        con.execute("ALTER TABLE project_facts RENAME TO project_facts_old")
        
        con.execute("""
        CREATE TABLE project_facts (
            id TEXT PRIMARY KEY,
            project TEXT NOT NULL,
            machine TEXT NOT NULL DEFAULT '',
            subject TEXT NOT NULL,
            fact TEXT NOT NULL,
            status TEXT NOT NULL,
            confidence REAL,
            observed_at TEXT,
            recorded_at TEXT NOT NULL,
            source_type TEXT NOT NULL,
            source_ref TEXT,
            canonical_repo TEXT DEFAULT '',
            checkout_path TEXT DEFAULT '',
            supersedes TEXT,
            active BOOLEAN NOT NULL DEFAULT 1,
            UNIQUE(project, canonical_repo, checkout_path, subject, fact, status, machine),
            FOREIGN KEY(supersedes) REFERENCES project_facts(id),
            CHECK(status IN ('VERIFIED', 'OBSERVED', 'HISTORICAL', 'INFERRED', 'STALE', 'DISPROVEN', 'UNKNOWN', 'CURRENT')),
            CHECK(confidence IS NULL OR (confidence >= 0.0 AND confidence <= 1.0)),
            CHECK(supersedes != id),
            CHECK(active IN (0, 1))
        )
        """)
        
        con.execute("""
        INSERT INTO project_facts 
        SELECT id, project, machine, subject, fact, status, confidence, observed_at, recorded_at, source_type, source_ref, canonical_repo, checkout_path, supersedes, active 
        FROM project_facts_old
        """)
        
        con.execute("DROP TABLE project_facts_old")
        con.execute("PRAGMA user_version = 2")
        version = 2

