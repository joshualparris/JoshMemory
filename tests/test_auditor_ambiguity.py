import pytest
from joshmemory.auditor import get_project_state

def test_ambiguity_resolution():
    # Fake auditor data
    auditor_data = {
        "projects": [
            {"name": "App", "canonical_repo": "A", "path": "C:/A", "git": {}},
            {"name": "App", "canonical_repo": "B", "path": "C:/B", "git": {}},
            {"name": "MultiPath", "canonical_repo": "C", "path": "C:/C1", "git": {}},
            {"name": "MultiPath", "canonical_repo": "C", "path": "C:/C2", "git": {}},
            {"name": "LegacyApp", "path": "C:/Legacy", "git": {}},
            {"name": "Fuzzy1", "path": "C:/F1", "git": {}},
            {"name": "Fuzzy2", "path": "C:/F2", "git": {}}
        ]
    }
    
    # A. same name, different canonical repo
    # no identity supplied -> explicit ambiguity
    res = get_project_state("App", auditor_data)
    assert res is not None and res.get("error") == "ambiguous"
    
    # exact Client A identity
    res = get_project_state("App", auditor_data, canonical_repo="A")
    assert res is not None and res.get("path") == "C:/A"
    
    # exact Client B identity
    res = get_project_state("App", auditor_data, canonical_repo="B")
    assert res is not None and res.get("path") == "C:/B"
    
    # B. same canonical repo, two checkout paths
    # canonical only -> ambiguous
    res = get_project_state("MultiPath", auditor_data, canonical_repo="C")
    assert res is not None and res.get("error") == "ambiguous"
    
    # exact path -> correct checkout
    res = get_project_state("MultiPath", auditor_data, checkout_path="C:/C2")
    assert res is not None and res.get("path") == "C:/C2"
    
    # C. unique old project
    res = get_project_state("LegacyApp", auditor_data)
    assert res is not None and res.get("path") == "C:/Legacy"
    
    # D. fuzzy query with multiple matches
    res = get_project_state("Fuzzy", auditor_data)
    assert res is not None and res.get("error") == "ambiguous"

