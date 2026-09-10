import pytest
import json
from joshmemory.server import call_tool
from joshmemory.handoff import save_handoff
import os
import sqlite3
from joshmemory.schema import connect, SCHEMA

def create_db_with_facts_schema(db_path, facts_schema, user_version):
    con = sqlite3.connect(db_path)
    # Run the normal schema EXCEPT project_facts
    schema_parts = SCHEMA.split("CREATE TABLE IF NOT EXISTS project_facts")
    con.executescript(schema_parts[0])
    con.execute(facts_schema)
    if len(schema_parts) > 1:
        # get everything after the closing parenthesis of project_facts
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
    
    list_a_str = call_tool("list_handoffs", {
        "project": "App",
        "canonical_repo": "github.com/client-a/app",
        "checkout_path": "C:/A",
        "machine": "M1"
    })
    list_a = json.loads(list_a_str)
    assert len(list_a) == 1
    assert list_a[0]["handoff"]["objective"] == "A objective"

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
    
    con = connect(db)
    con.close()
    
    con = sqlite3.connect(db)
    cols = {row[1] for row in con.execute("PRAGMA table_info(project_facts)")}
    assert "canonical_repo" in cols
    assert "checkout_path" in cols
    uv = con.execute("PRAGMA user_version").fetchone()[0]
    assert uv == 2
    
    res = con.execute("SELECT sql FROM sqlite_master WHERE name='project_facts'").fetchone()[0]
    assert "UNIQUE(project, canonical_repo, checkout_path, subject, fact, status, machine)" in res

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
    
    con = connect(db)
    con.close()
    
    con = sqlite3.connect(db)
    cols = {row[1] for row in con.execute("PRAGMA table_info(project_facts)")}
    assert "canonical_repo" in cols
    uv = con.execute("PRAGMA user_version").fetchone()[0]
    assert uv == 2
    
    res = con.execute("SELECT sql FROM sqlite_master WHERE name='project_facts'").fetchone()[0]
    assert "UNIQUE(project, canonical_repo, checkout_path, subject, fact, status, machine)" in res
    
def test_supersedes_validation_cross_identity(tmp_path):
    db = str(tmp_path / "sup.sqlite")
    connect(db).close()
    from joshmemory.facts import project_fact_add
    
    # Save a fact as Client A
    r = project_fact_add(db, "App", "test_subj", "fact1", "CURRENT", source_type="test", canonical_repo="A", checkout_path="A_path", machine="M")
    old_id = r["id"]
    
    # Try to supersede it as Client B
    try:
        project_fact_add(db, "App", "test_subj", "fact2", "CURRENT", source_type="test", supersedes=old_id, canonical_repo="B", checkout_path="B_path", machine="M")
        assert False, "Should have thrown ValueError"
    except ValueError as e:
        assert "different canonical repo" in str(e)
