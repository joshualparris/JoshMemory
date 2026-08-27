import pytest
from joshmemory.classification import classify_evidence

def test_fedora_crash_doctor_version_conflict():
    state = {
        "path": "/home/josh/dev/FedoraCrashDoctor",
        "name": "FedoraCrashDoctor",
        "is_git": True,
        "git": {
            "head": "main",
            "tags": ["v3.2.0", "v3.2.1"],
            "latest_commit_date": "2026-08-27T10:00:00Z"
        }
    }
    history = [
        {"title": "Deploy Stability Guard v3.3", "thread_id": "test-1"}
    ]
    github = []

    classified = classify_evidence(state, history, github)
    
    # Verify tag is reported
    assert any(c["claim"] == "Latest local tag is v3.2.1" and c["classification"] == "verified_git_evidence" for c in classified["verified_git_evidence"])
    
    # Verify contradiction detected
    assert len(classified["contradictions"]) == 1
    contra = classified["contradictions"][0]
    assert contra["topic"] == "version"
    assert contra["preferred_evidence"] == "git"
    assert any(e["value"] == "v3.3" and e["source"] == "historical_session" for e in contra["evidence"])
    assert any(e["value"] == "v3.2.1" and e["source"] == "git" for e in contra["evidence"])

def test_pcie_causal_claim():
    state = None
    history = [
        {"title": "Investigating PCIe AER errors causing crashes", "thread_id": "test-1"}
    ]
    github = []

    classified = classify_evidence(state, history, github)
    assert len(classified["historical_session_evidence"]) == 1
    claim = classified["historical_session_evidence"][0]["claim"]
    assert "Investigated possible contributor" in classified["evidence_summary"]["history"][0]

def test_completion_overstatement():
    state = None
    history = [
        {"title": "ForgeGrid fully deployed and finalized", "thread_id": "test-1"}
    ]
    github = []

    classified = classify_evidence(state, history, github)
    assert len(classified["inferences"]) == 1
    inf = classified["inferences"][0]
    assert "implies completion" in inf["claim"]
    assert inf["confidence"] == "low"

def test_date_attribution():
    state = None
    history = [
        {"title": "Started work on foo", "thread_id": "test-1", "created_at": "2026-08-20"},
        {"title": "Finished work on bar", "thread_id": "test-2", "created_at": "2026-08-21"}
    ]
    github = []

    classified = classify_evidence(state, history, github)
    assert len(classified["historical_session_evidence"]) == 2
    assert classified["historical_session_evidence"][0]["timestamp"] == "2026-08-20"
    assert classified["historical_session_evidence"][1]["timestamp"] == "2026-08-21"
