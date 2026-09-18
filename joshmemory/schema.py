from __future__ import annotations

import sqlite3
import threading


# The central service is threaded. A brand-new database must not let one
# connection observe a partially-created schema while another connection is
# still running SCHEMA/migrations. SQLite serialises writes, but our old
# application-level "is this fresh?" check could race before those writes were
# complete. Keep schema setup/migration single-threaded within this process.
_SCHEMA_LOCK = threading.RLock()


SCHEMA = """

CREATE TABLE IF NOT EXISTS session_checkpoints (
    conversation_id TEXT PRIMARY KEY,
    canonical_repo TEXT NOT NULL,
    checkout_path TEXT NOT NULL,
    machine TEXT NOT NULL,
    project TEXT NOT NULL,
    objective TEXT,
    completed TEXT,
    in_progress TEXT,
    blockers TEXT,
    next_action TEXT,
    branch TEXT,
    head TEXT,
    dirty BOOLEAN,
    transcript_path TEXT,
    termination_reason TEXT,
    fully_idle BOOLEAN,
    updated_at TEXT NOT NULL
);
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
  provenance TEXT,
  source_id TEXT,
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
  -- The application-level idempotency key omits recorded_at. Keeping it in
  -- the database constraint preserves repeated observations from old imports.
  UNIQUE(project, canonical_repo, checkout_path, subject, fact, status, machine, recorded_at),
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
    con = sqlite3.connect(path, timeout=30.0)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA busy_timeout = 10000")

    with _SCHEMA_LOCK:
        try:
            con.execute("PRAGMA journal_mode = WAL")
        except sqlite3.OperationalError:
            pass

        version = con.execute("PRAGMA user_version").fetchone()[0]
        tables = con.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='project_facts'"
        ).fetchall()
        old_fact_table = con.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='project_facts_old'"
        ).fetchone()
        is_fresh = len(tables) == 0 and old_fact_table is None

        if is_fresh:
            con.execute("PRAGMA foreign_keys = ON")
            with con:
                con.executescript(SCHEMA)
                con.execute("PRAGMA user_version = 3")
            return con

        if version < 3:
            con.execute("PRAGMA foreign_keys = OFF")
            with con:
                con.executescript(SCHEMA)
                _migrate(con, version)
                con.execute("PRAGMA user_version = 3")

            violations = con.execute("PRAGMA foreign_key_check").fetchall()
            if violations:
                raise sqlite3.IntegrityError(
                    f"Foreign key violations after migration: {violations}"
                )

        con.execute("PRAGMA foreign_keys = ON")
    return con


def _migrate(con: sqlite3.Connection, version: int) -> None:
    if version < 1:
        columns = {row[1] for row in con.execute("PRAGMA table_info(events)")}
        if "provenance" not in columns:
            con.execute("ALTER TABLE events ADD COLUMN provenance TEXT")
        if "source_id" not in columns:
            con.execute("ALTER TABLE events ADD COLUMN source_id TEXT")

    if version < 2:
        _migrate_project_facts(con)

    if version < 3:
        con.execute("""
        CREATE TABLE IF NOT EXISTS session_checkpoints (
            conversation_id TEXT PRIMARY KEY,
            canonical_repo TEXT NOT NULL,
            checkout_path TEXT NOT NULL,
            machine TEXT NOT NULL,
            project TEXT NOT NULL,
            objective TEXT,
            completed TEXT,
            in_progress TEXT,
            blockers TEXT,
            next_action TEXT,
            branch TEXT,
            head TEXT,
            dirty BOOLEAN,
            transcript_path TEXT,
            termination_reason TEXT,
            fully_idle BOOLEAN,
            updated_at TEXT NOT NULL
        )
        """)


_FACT_STATUSES = {
    "VERIFIED",
    "OBSERVED",
    "HISTORICAL",
    "INFERRED",
    "STALE",
    "DISPROVEN",
    "UNKNOWN",
    "CURRENT",
}


def _create_project_facts_table(con: sqlite3.Connection, table_name: str) -> None:
    if not table_name.replace("_", "").isalnum():
        raise ValueError("Unsafe project facts table name")
    con.execute(
        f"""
        CREATE TABLE {table_name} (
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
            UNIQUE(project, canonical_repo, checkout_path, subject, fact, status, machine, recorded_at),
            FOREIGN KEY(supersedes) REFERENCES {table_name}(id),
            CHECK(status IN ('VERIFIED', 'OBSERVED', 'HISTORICAL', 'INFERRED', 'STALE', 'DISPROVEN', 'UNKNOWN', 'CURRENT')),
            CHECK(confidence IS NULL OR (confidence >= 0.0 AND confidence <= 1.0)),
            CHECK(supersedes != id),
            CHECK(active IN (0, 1))
        )
        """
    )


def _validate_legacy_fact_statuses(con: sqlite3.Connection, table_name: str) -> None:
    placeholders = ",".join("?" for _ in _FACT_STATUSES)
    invalid = [
        row[0]
        for row in con.execute(
            f"SELECT DISTINCT status FROM {table_name} "
            f"WHERE upper(trim(status)) NOT IN ({placeholders})",
            tuple(sorted(_FACT_STATUSES)),
        )
    ]
    if invalid:
        raise sqlite3.IntegrityError(
            f"Unsupported project fact statuses in {table_name}: {invalid}"
        )


def _insert_project_facts(
    con: sqlite3.Connection,
    source_table: str,
    destination_table: str,
    *,
    exclude_existing_ids: bool = False,
) -> None:
    _validate_legacy_fact_statuses(con, source_table)
    id_filter = (
        f"AND NOT EXISTS (SELECT 1 FROM {destination_table} current WHERE current.id = source.id)"
        if exclude_existing_ids
        else ""
    )
    con.execute(
        f"""
        INSERT INTO {destination_table} (
            id, project, machine, subject, fact, status, confidence,
            observed_at, recorded_at, source_type, source_ref,
            canonical_repo, checkout_path, supersedes, active
        )
        SELECT
            source.id,
            source.project,
            coalesce(source.machine, ''),
            source.subject,
            source.fact,
            upper(trim(source.status)),
            source.confidence,
            source.observed_at,
            source.recorded_at,
            coalesce(source.source_type, 'legacy'),
            source.source_ref,
            coalesce(source.canonical_repo, ''),
            coalesce(source.checkout_path, ''),
            source.supersedes,
            coalesce(source.active, 1)
        FROM {source_table} source
        WHERE 1=1 {id_filter}
        """
    )


def _migrate_project_facts(con: sqlite3.Connection) -> None:
    """Migrate facts and recover a database left mid-migration.

    A prior migration could leave both tables after the copy failed. The old
    table is retained as the recovery source; all rebuild work is transactional
    and the old table is never dropped automatically.
    """
    old_exists = con.execute(
        "SELECT 1 FROM sqlite_master WHERE type='table' AND name='project_facts_old'"
    ).fetchone()
    if old_exists:
        con.execute("DROP TABLE IF EXISTS project_facts_repaired")
        _create_project_facts_table(con, "project_facts_repaired")
        if con.execute("SELECT count(*) FROM project_facts").fetchone()[0]:
            _insert_project_facts(con, "project_facts", "project_facts_repaired")
        _insert_project_facts(
            con,
            "project_facts_old",
            "project_facts_repaired",
            exclude_existing_ids=True,
        )
        con.execute("DROP TABLE project_facts")
        con.execute("ALTER TABLE project_facts_repaired RENAME TO project_facts")
        return

    pf_columns = {row[1] for row in con.execute("PRAGMA table_info(project_facts)")}
    if "canonical_repo" not in pf_columns:
        con.execute("ALTER TABLE project_facts ADD COLUMN canonical_repo TEXT DEFAULT ''")
    if "checkout_path" not in pf_columns:
        con.execute("ALTER TABLE project_facts ADD COLUMN checkout_path TEXT DEFAULT ''")

    con.execute("ALTER TABLE project_facts RENAME TO project_facts_old")
    _create_project_facts_table(con, "project_facts")
    _insert_project_facts(con, "project_facts_old", "project_facts")
