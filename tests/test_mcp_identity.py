import pytest
import json
import sqlite3
from joshmemory.server import call_tool, handle
from joshmemory.handoff import save_handoff
from joshmemory.schema import connect, SCHEMA

def create_db_with_facts_schema(db_path, facts_schema, user_version):
    con = sqlite3.connect(db_path)
    schema_parts = SCHEMA.split("CREATE TABLE IF NOT EXISTS project_facts")
    con.executescript(schema_parts[0])
    con.execute(facts_schema)
    if len(schema_parts) > 1:
        rest = schema_parts[1][schema_parts[1].find(");") + 2:]
        con.executescript(rest)
    con.execute(f"PRAGMA user_version = {user_version}")
    con.commit()
    con.close()

def test_mcp_identity_isolation(tmp_path, monkeypatch):
    db_path = str(tmp_path / "mcp_test.sqlite")
    monkeypatch.setattr("joshmemory.server.default_db_path", lambda: db_path)
    monkeypatch.setattr("joshmemory.auditor.run_auditor", lambda: {"projects": []})
    
    res_a = call_tool("save_handoff", {
        "project": "App",
        "canonical_repo": "github.com/client-a/app",
        "checkout_path": "C:/A",
        "objective": "A objective",
        "next_action": "A next",
        "machine": "M1"
    })
    
    res_b = call_tool("save_handoff", {
        "project": "App",
        "canonical_repo": "github.com/client-b/app",
        "checkout_path": "C:/B",
        "objective": "B objective",
        "next_action": "B next",
        "machine": "M1"
    })
    
    ctx_a_str = call_tool("get_project_context", {
        "project": "App",
        "canonical_repo": "github.com/client-a/app",
        "checkout_path": "C:/A",
        "machine": "M1"
    })
    ctx_a = json.loads(ctx_a_str)
    assert ctx_a["handoff"]["handoff"]["objective"] == "A objective"
    
    ctx_b_str = call_tool("get_project_context", {
        "project": "App",
        "canonical_repo": "github.com/client-b/app",
        "checkout_path": "C:/B",
        "machine": "M1"
    })
    ctx_b = json.loads(ctx_b_str)
    assert ctx_b["handoff"]["handoff"]["objective"] == "B objective"

def test_json_rpc_handle(tmp_path, monkeypatch):
    db_path = str(tmp_path / "rpc.sqlite")
    monkeypatch.setattr("joshmemory.server.default_db_path", lambda: db_path)
    monkeypatch.setattr("joshmemory.auditor.run_auditor", lambda: {"projects": []})
    
    req_a = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {
            "name": "save_handoff",
            "arguments": {
                "project": "App",
                "canonical_repo": "A",
                "checkout_path": "A_path",
                "objective": "Obj A",
                "next_action": "Next A",
                "machine": "M1"
            }
        }
    }
    res_a = handle(req_a)
    assert not res_a.get("error"), res_a
    
    req_b = {
        "jsonrpc": "2.0",
        "id": 2,
        "method": "tools/call",
        "params": {
            "name": "save_handoff",
            "arguments": {
                "project": "App",
                "canonical_repo": "B",
                "checkout_path": "B_path",
                "objective": "Obj B",
                "next_action": "Next B",
                "machine": "M1"
            }
        }
    }
    res_b = handle(req_b)
    assert not res_b.get("error")
    
    req_ctx = {
        "jsonrpc": "2.0",
        "id": 3,
        "method": "tools/call",
        "params": {
            "name": "get_project_context",
            "arguments": {
                "project": "App",
                "canonical_repo": "A",
                "checkout_path": "A_path",
                "machine": "M1"
            }
        }
    }
    res_ctx = handle(req_ctx)
    ctx = json.loads(res_ctx["result"]["content"][0]["text"])
    assert ctx["handoff"]["handoff"]["objective"] == "Obj A"
    
    req_list = {
        "jsonrpc": "2.0",
        "id": 4,
        "method": "tools/call",
        "params": {
            "name": "list_handoffs",
            "arguments": {
                "project": "App",
                "canonical_repo": "B",
                "checkout_path": "B_path",
                "machine": "M1"
            }
        }
    }
    res_list = handle(req_list)
    lst = json.loads(res_list["result"]["content"][0]["text"])
    assert len(lst) == 1
    assert lst[0]["handoff"]["objective"] == "Obj B"

def verify_migration_state(db_path):
    con = sqlite3.connect(db_path)
    cols = {row[1] for row in con.execute("PRAGMA table_info(project_facts)")}
    assert "canonical_repo" in cols
    assert "checkout_path" in cols
    uv = con.execute("PRAGMA user_version").fetchone()[0]
    assert uv == 2
    
    res = con.execute("SELECT sql FROM sqlite_master WHERE name='project_facts'").fetchone()[0]
    assert "UNIQUE(project, canonical_repo, checkout_path, subject, fact, status, machine)" in res
    
    assert con.execute("PRAGMA integrity_check").fetchall()[0][0] == "ok"
    assert len(con.execute("PRAGMA foreign_key_check").fetchall()) == 0
    con.close()

def test_migration_fresh(tmp_path):
    db = str(tmp_path / "fresh.sqlite")
    con = connect(db)
    fk = con.execute("PRAGMA foreign_keys").fetchone()[0]
    assert fk == 1, "Foreign keys should be ON for a normal connection"
    con.close()
    verify_migration_state(db)

def test_migration_repeated_open(tmp_path):
    db = str(tmp_path / "repeat.sqlite")
    connect(db).close()
    verify_migration_state(db)
    
    con = connect(db)
    fk = con.execute("PRAGMA foreign_keys").fetchone()[0]
    assert fk == 1
    con.close()
    verify_migration_state(db)

def test_migration_v0(tmp_path):
    db = str(tmp_path / "v0.sqlite")
    create_db_with_facts_schema(db, '''
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
        supersedes TEXT,
        active BOOLEAN NOT NULL DEFAULT 1,
        UNIQUE(project, subject, fact, status, machine),
        FOREIGN KEY(supersedes) REFERENCES project_facts(id)
    );
    ''', 0)
    
    # insert a row
    con = sqlite3.connect(db)
    con.execute("INSERT INTO project_facts (id, project, subject, fact, status, recorded_at, source_type) VALUES ('test1', 'A', 'B', 'C', 'CURRENT', '2026-09-10', 'test')")
    con.commit()
    con.close()
    
    connect(db).close()
    verify_migration_state(db)
    
    # Ensure row survived
    con = sqlite3.connect(db)
    row = con.execute("SELECT id FROM project_facts").fetchone()
    assert row[0] == 'test1'
    con.close()

def test_migration_v1(tmp_path):
    db = str(tmp_path / "v1.sqlite")
    create_db_with_facts_schema(db, '''
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
        supersedes TEXT,
        active BOOLEAN NOT NULL DEFAULT 1,
        canonical_repo TEXT DEFAULT '',
        checkout_path TEXT DEFAULT '',
        UNIQUE(project, subject, fact, status, machine),
        FOREIGN KEY(supersedes) REFERENCES project_facts(id)
    );
    ''', 1)
    
    con = sqlite3.connect(db)
    con.execute("INSERT INTO project_facts (id, project, subject, fact, status, recorded_at, source_type, canonical_repo) VALUES ('test2', 'A', 'B', 'C', 'CURRENT', '2026-09-10', 'test', 'repo')")
    con.commit()
    con.close()
    
    connect(db).close()
    verify_migration_state(db)
    
    con = sqlite3.connect(db)
    row = con.execute("SELECT canonical_repo FROM project_facts WHERE id='test2'").fetchone()
    assert row[0] == 'repo'
    con.close()
    
def test_supersedes_validation_cross_identity(tmp_path):
    db = str(tmp_path / "sup.sqlite")
    connect(db).close()
    from joshmemory.facts import project_fact_add
    
    r = project_fact_add(db, "App", "test_subj", "fact1", "CURRENT", source_type="test", canonical_repo="A", checkout_path="A_path", machine="M")
    old_id = r["id"]
    
    try:
        project_fact_add(db, "App", "test_subj", "fact2", "CURRENT", source_type="test", supersedes=old_id, canonical_repo="B", checkout_path="B_path", machine="M")
        assert False, "Should have thrown ValueError"
    except ValueError as e:
        assert "different canonical repo" in str(e)

def test_migration_supersedes_chain(tmp_path):
    db = str(tmp_path / "chain.sqlite")
    create_db_with_facts_schema(db, '''
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
        supersedes TEXT,
        active BOOLEAN NOT NULL DEFAULT 1,
        canonical_repo TEXT DEFAULT '',
        checkout_path TEXT DEFAULT '',
        UNIQUE(project, subject, fact, status, machine),
        FOREIGN KEY(supersedes) REFERENCES project_facts(id)
    );
    ''', 1)
    
    con = sqlite3.connect(db)
    con.execute("PRAGMA foreign_keys = ON")
    
    # Handoff A (active=0, supersedes=None)
    con.execute("INSERT INTO project_facts (id, project, subject, fact, status, recorded_at, source_type, active) VALUES ('A', 'App', 'S', 'F1', 'CURRENT', '1', 'test', 0)")
    
    # Handoff B (active=0, supersedes='A')
    con.execute("INSERT INTO project_facts (id, project, subject, fact, status, recorded_at, source_type, supersedes, active) VALUES ('B', 'App', 'S', 'F2', 'CURRENT', '2', 'test', 'A', 0)")
    
    # Handoff C (active=1, supersedes='B')
    con.execute("INSERT INTO project_facts (id, project, subject, fact, status, recorded_at, source_type, supersedes, active) VALUES ('C', 'App', 'S', 'F3', 'CURRENT', '3', 'test', 'B', 1)")
    
    con.commit()
    con.close()
    
    # Open to trigger migration
    connect(db).close()
    
    # Verify State
    verify_migration_state(db)
    
    con = sqlite3.connect(db)
    con.row_factory = sqlite3.Row
    rows = {r[0]: dict(r) for r in con.execute("SELECT id, supersedes, active FROM project_facts")}
    
    assert len(rows) == 3
    assert rows['A']['supersedes'] is None
    assert rows['A']['active'] == 0
    
    assert rows['B']['supersedes'] == 'A'
    assert rows['B']['active'] == 0
    
    assert rows['C']['supersedes'] == 'B'
    assert rows['C']['active'] == 1
    con.close()
