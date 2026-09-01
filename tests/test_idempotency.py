import pytest
import sqlite3
import os
from joshmemory.facts import project_fact_add, accountability_reference_add, project_fact_search

@pytest.fixture
def db_path(tmp_path):
    path = tmp_path / "test.db"
    return str(path)

def test_fact_idempotency_supersedes(db_path):
    # Setup initial fact A
    res_a = project_fact_add(
        db_path, "Proj", "Subj", "Fact A", "CURRENT", source_type="test"
    )
    a_id = res_a["id"]
    assert not res_a["duplicate"]

    # B supersedes A
    res_b = project_fact_add(
        db_path, "Proj", "Subj", "Fact B", "CURRENT", source_type="test", supersedes=a_id
    )
    b_id = res_b["id"]
    assert not res_b["duplicate"]

    # Verify A is inactive, B is active
    con = sqlite3.connect(db_path)
    cur = con.execute("SELECT active FROM project_facts WHERE id = ?", (a_id,))
    assert cur.fetchone()[0] == 0
    cur = con.execute("SELECT active FROM project_facts WHERE id = ?", (b_id,))
    assert cur.fetchone()[0] == 1
    con.close()

    # Retry EXACT SAME B supersedes A
    res_retry = project_fact_add(
        db_path, "Proj", "Subj", "Fact B", "CURRENT", source_type="test", supersedes=a_id
    )
    assert res_retry["duplicate"] == True
    assert res_retry["id"] == b_id

    # Verify A still inactive, B still active
    con = sqlite3.connect(db_path)
    cur = con.execute("SELECT active FROM project_facts WHERE id = ?", (a_id,))
    assert cur.fetchone()[0] == 0
    cur = con.execute("SELECT active FROM project_facts WHERE id = ?", (b_id,))
    assert cur.fetchone()[0] == 1
    con.close()

def test_fact_idempotency_conflicting(db_path):
    res_c = project_fact_add(db_path, "Proj", "Subj", "Fact C", "CURRENT", source_type="test")
    c_id = res_c["id"]
    
    res_d = project_fact_add(db_path, "Proj", "Subj", "Fact D", "CURRENT", source_type="test", supersedes=c_id)
    d_id = res_d["id"]
    
    # Retry D but conflicting supersedes target
    res_e = project_fact_add(db_path, "Proj", "Subj", "Fact E", "CURRENT", source_type="test")
    e_id = res_e["id"]
    
    with pytest.raises(ValueError, match="Fact already exists but with a different supersedes target"):
        project_fact_add(db_path, "Proj", "Subj", "Fact D", "CURRENT", source_type="test", supersedes=e_id)

def test_accountability_idempotency_supersedes(db_path):
    res_a = accountability_reference_add(db_path, "Proj", "Claim A", "Sys", "id1", "req1")
    a_id = res_a["id"]
    assert not res_a["duplicate"]
    
    res_b = accountability_reference_add(db_path, "Proj", "Claim B", "Sys", "id2", "req1", supersedes=a_id)
    b_id = res_b["id"]
    assert not res_b["duplicate"]
    
    # Retry EXACT
    res_retry = accountability_reference_add(db_path, "Proj", "Claim B", "Sys", "id2", "req1", supersedes=a_id)
    assert res_retry["duplicate"]
    assert res_retry["id"] == b_id

def test_accountability_idempotency_conflicting(db_path):
    res_c = accountability_reference_add(db_path, "Proj", "Claim C", "Sys", "id3", "req1")
    c_id = res_c["id"]
    
    res_d = accountability_reference_add(db_path, "Proj", "Claim D", "Sys", "id4", "req1", supersedes=c_id)
    d_id = res_d["id"]
    
    res_e = accountability_reference_add(db_path, "Proj", "Claim E", "Sys", "id5", "req1")
    e_id = res_e["id"]
    
    with pytest.raises(ValueError, match="Reference already exists but with a different supersedes target"):
        accountability_reference_add(db_path, "Proj", "Claim D", "Sys", "id4", "req1", supersedes=e_id)
        
def test_concurrent_idempotency_race(db_path):
    import threading
    errors = []
    
    res_a = project_fact_add(db_path, "ProjRace", "Subj", "Fact A", "CURRENT", source_type="test")
    a_id = res_a["id"]
    
    def writer(thread_idx: int):
        try:
            for _ in range(10):
                project_fact_add(db_path, "ProjRace", "Subj", "Fact B", "CURRENT", source_type="test", supersedes=a_id)
        except Exception as e:
            errors.append(e)

    threads = [threading.Thread(target=writer, args=(i,)) for i in range(5)]
    for t in threads: t.start()
    for t in threads: t.join()
    
    assert not errors, f"Thread errors: {errors}"
    
    results = project_fact_search(db_path, "Fact B", "ProjRace", active_only=True)
    assert len(results) == 1
    
    con = sqlite3.connect(db_path)
    cur = con.execute("SELECT active FROM project_facts WHERE id = ?", (a_id,))
    assert cur.fetchone()[0] == 0
    con.close()
