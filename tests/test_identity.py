import pytest
from joshmemory.auditor import normalize_git_url

def test_normalize_git_url():
    # Embedded usernames
    assert normalize_git_url("https://Josh@github.com/joshualparris/AgentCheck.git") == "github.com/joshualparris/agentcheck"
    
    # Standard HTTPS
    assert normalize_git_url("https://github.com/joshualparris/AgentCheck.git") == "github.com/joshualparris/agentcheck"
    assert normalize_git_url("http://github.com/joshualparris/AgentCheck") == "github.com/joshualparris/agentcheck"
    
    # SSH
    assert normalize_git_url("git@github.com:joshualparris/AgentCheck.git") == "github.com/joshualparris/agentcheck"
    assert normalize_git_url("ssh://git@github.com/joshualparris/AgentCheck.git") == "github.com/joshualparris/agentcheck"
    
    # Edge cases
    assert normalize_git_url("") is None
    assert normalize_git_url(None) is None
    assert normalize_git_url("just-a-local-path") == "just-a-local-path"

import pytest
from joshmemory.handoff import get_project_context
from unittest.mock import patch

@patch('joshmemory.handoff.get_project_state')
@patch('joshmemory.handoff.get_all_projects')
@patch('joshmemory.handoff.get_latest_handoff')
def test_related_workstreams(mock_latest, mock_all_projects, mock_state):
    # Mock auditor data
    mock_state.return_value = {
        "name": "AgentWitness",
        "path": "C:/dev/LLMLieDetector/AgentWitness",
        "canonical_repo": "github.com/joshualparris/agentcheck",
        "git": {"branch": "feat/auto"}
    }
    mock_all_projects.return_value = [
        {
            "name": "AgentWitness",
            "path": "C:/dev/LLMLieDetector/AgentWitness",
            "canonical_repo": "github.com/joshualparris/agentcheck",
            "git": {"branch": "feat/auto"}
        },
        {
            "name": "AgentCheck",
            "path": "C:/dev/AI-Verification/AgentCheck",
            "canonical_repo": "github.com/joshualparris/agentcheck",
            "git": {"branch": "integration/auto"}
        }
    ]
    
    # Mock handoffs: give AgentCheck a handoff
    def side_effect(db, proj, machine=None):
        if proj == "AgentCheck":
            return {"handoff": {"objective": "Test Integration", "next_action": "Merge"}}
        return None
    mock_latest.side_effect = side_effect
    
    ctx = get_project_context(":memory:", "AgentWitness")
    
    assert ctx["project"] == "AgentWitness"
    assert "related_workstreams" in ctx
    rel = ctx["related_workstreams"]
    assert len(rel) == 1
    assert rel[0]["project"] == "AgentCheck"
    assert rel[0]["branch"] == "integration/auto"
    assert rel[0]["objective"] == "Test Integration"

@patch('joshmemory.handoff.get_project_state')
def test_non_git_projects(mock_state):
    mock_state.return_value = {
        "name": "LocalOnly",
        "path": "C:/dev/LocalOnly"
        # no canonical_repo
    }
    ctx = get_project_context(":memory:", "LocalOnly")
    assert ctx["project"] == "LocalOnly"
    assert ctx.get("related_workstreams") == []
import pytest
from joshmemory.handoff import get_project_context
from unittest.mock import patch

@patch('joshmemory.handoff.get_project_state')
@patch('joshmemory.handoff.get_all_projects')
@patch('joshmemory.handoff.get_latest_handoff')
def test_complex_identity_scenarios(mock_latest, mock_all_projects, mock_state):
    # Setup mock data for 4 clones
    projects = [
        {
            "name": "ProjA", # AgentWitness
            "path": "C:/1/ProjA",
            "canonical_repo": "github.com/user/repo",
            "git": {"branch": "feat/1"}
        },
        {
            "name": "ProjB", # AgentCheck
            "path": "C:/2/ProjB",
            "canonical_repo": "github.com/user/repo",
            "git": {"branch": "integration"}
        },
        {
            "name": "ProjA", # Different repo, same folder name
            "path": "C:/3/ProjA",
            "canonical_repo": "github.com/user/other-repo",
            "git": {"branch": "main"}
        },
        {
            "name": "NonGit", # Path fallback
            "path": "C:/4/NonGit"
        }
    ]
    mock_all_projects.return_value = projects
    
    # 1. Two clones of same remote -> family
    mock_state.return_value = projects[0]
    ctx = get_project_context(":memory:", "ProjA", machine="M1")
    assert ctx["project"] == "ProjA"
    
    # Filter related workstreams
    rel = ctx.get("related_workstreams", [])
    
    # Verify no recursion (ProjA not in related workstreams, only ProjB)
    assert len(rel) == 1
    assert rel[0]["project"] == "ProjB"
    assert rel[0]["branch"] == "integration"
    
    # Verify different repo with same name doesn't collide
    for r in rel:
        assert r["project"] != "ProjA"  # The other ProjA shouldn't be here because canonical_repo differs

    # 2. Non-git fallback
    mock_state.return_value = projects[3]
    ctx = get_project_context(":memory:", "NonGit", machine="M1")
    assert len(ctx.get("related_workstreams", [])) == 0
from joshmemory.handoff import get_project_context
from unittest.mock import patch

@patch('joshmemory.handoff.get_project_state')
@patch('joshmemory.handoff.get_all_projects')
@patch('joshmemory.handoff.get_latest_handoff')
def test_cross_machine_identity(mock_latest, mock_all_projects, mock_state):
    projects = [
        {
            "name": "ProjA",
            "path": "C:/1/ProjA",
            "canonical_repo": "github.com/user/repo",
            "git": {"branch": "feat/1"}
        },
        {
            "name": "ProjB",
            "path": "C:/2/ProjB",
            "canonical_repo": "github.com/user/repo",
            "git": {"branch": "integration"}
        }
    ]
    mock_all_projects.return_value = projects
    mock_state.return_value = projects[0]
    
    def side_effect(db, proj, machine=None):
        if proj == "ProjB":
            if machine == "THINKPAD":
                return {"handoff": {"objective": "Thinkpad work", "next_action": "Thinkpad next"}}
            else:
                # ProjB has no handoff on PROBOOK
                return None
        return None
        
    mock_latest.side_effect = side_effect
    
    # Run context for ProjA on PROBOOK
    ctx = get_project_context(":memory:", "ProjA", machine="PROBOOK")
    
    assert ctx["project"] == "ProjA"
    rel = ctx.get("related_workstreams", [])
    
    # ProjB is on the same machine but has NO handoff on PROBOOK, so it shouldn't leak THINKPAD's handoff
    assert len(rel) == 1
    assert rel[0]["project"] == "ProjB"
    assert rel[0]["branch"] == "integration"
    assert "objective" not in rel[0]  # Because no handoff exists on PROBOOK for ProjB!
    
    # If we run context for ProjA on THINKPAD
    ctx_think = get_project_context(":memory:", "ProjA", machine="THINKPAD")
    rel_think = ctx_think.get("related_workstreams", [])
    assert len(rel_think) == 1
    assert rel_think[0]["project"] == "ProjB"
    assert rel_think[0]["objective"] == "Thinkpad work"

