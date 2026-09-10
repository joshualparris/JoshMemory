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
