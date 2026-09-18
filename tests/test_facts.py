import pytest
import sqlite3
from typing import Any
from unittest.mock import patch
from joshmemory.facts import project_fact_add, project_fact_search, accountability_reference_add, accountability_reference_search

@pytest.fixture
def db_path(tmp_path) -> str:
    path = tmp_path / "memory.sqlite"
    return str(path)

def test_fact_lifecycle(db_path: str):
    # Add historical fact
    f1 = project_fact_add(db_path, "TestProj", "Kernel", "kernel 7.1.10", "historical", source_type="test")
    assert f1["fact"] == "kernel 7.1.10"
    
    # Add current fact
    f2 = project_fact_add(db_path, "TestProj", "Kernel", "kernel 7.1.12", "current", source_type="test")
    assert f2["fact"] == "kernel 7.1.12"
    
    # Retrieve current
    active_facts = project_fact_search(db_path, "kernel")
    assert len(active_facts) == 2 # both are active by default unless explicitly superseded
    
    # Supersede f2 with f3
    f3 = project_fact_add(db_path, "TestProj", "Kernel", "kernel 7.2.0", "current", supersedes=f2["id"], source_type="test")
    
    # Retrieve active only
    active_now = project_fact_search(db_path, "kernel")
    active_ids = {f["id"] for f in active_now}
    assert f2["id"] not in active_ids
    assert f3["id"] in active_ids
    
    # Retrieve all
    all_facts = project_fact_search(db_path, "kernel", active_only=False)
    assert len(all_facts) == 3

def test_fact_search_fields(db_path: str):
    project_fact_add(db_path, "ProjA", "RAM", "24 GB", "current", machine="WS1", source_type="test")
    project_fact_add(db_path, "ProjB", "Storage", "NVMe 512", "current", machine="WS1", source_type="test")
    
    assert len(project_fact_search(db_path, "24 GB", project="ProjA")) == 1
    assert len(project_fact_search(db_path, "24 GB", project="ProjB")) == 0
    assert len(project_fact_search(db_path, "NVMe")) == 1
    
def test_accountability_references(db_path: str):
    c1 = accountability_reference_add(
        db_path, "Proj", "Test claim", "AgentWitness", "aw-123", requirement_id="REQ-1"
    )
    assert c1["duplicate"] == False
    
    c2 = accountability_reference_add(
        db_path, "Proj", "Test claim superseded", "Codex", "codex-456", requirement_id="REQ-1", supersedes=c1["id"],
        reviewer="Codex", verdict="SATISFIED", commit_sha="1234567"
    )
    assert c2["duplicate"] == False
    
    active_results = accountability_reference_search(db_path, "Test claim")
    assert len(active_results) == 1
    assert active_results[0]["source_system"] == "Codex"
    
    results = accountability_reference_search(db_path, "Test claim", active_only=False)
    assert len(results) == 2
    systems = {r["source_system"] for r in results}
    assert "AgentWitness" in systems
    assert "Codex" in systems
    
def test_concurrent_writes(db_path: str):
    import threading
    errors = []
    
    def writer(thread_idx: int):
        try:
            for i in range(10):
                project_fact_add(db_path, "Proj", f"Subj-{thread_idx}", f"Fact {i}", "current", source_type="test")
        except Exception as e:
            errors.append(e)

    threads = [threading.Thread(target=writer, args=(i,)) for i in range(5)]
    for t in threads: t.start()
    for t in threads: t.join()
    
    assert not errors, f"Thread errors: {errors}"
    results = project_fact_search(db_path, "Fact")
    assert len(results) == 50
