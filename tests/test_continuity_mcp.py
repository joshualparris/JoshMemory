import json
from unittest.mock import patch

from joshmemory import continuity_mcp


def test_tools_do_not_expose_trust_promotion():
    assert "memory_trust" in continuity_mcp.TOOLS
    assert "trusted_fact_search" in continuity_mcp.TOOLS
    assert "promote_trust" not in continuity_mcp.TOOLS
    assert "set_trust" not in continuity_mcp.TOOLS


def test_initialize_identifies_continuity_server():
    response = continuity_mcp.handle({"jsonrpc": "2.0", "id": 1, "method": "initialize"})
    assert response["result"]["serverInfo"]["name"] == "joshmemory-continuity"


def test_tools_list_contains_resume_and_coordination():
    response = continuity_mcp.handle({"jsonrpc": "2.0", "id": 1, "method": "tools/list"})
    names = {tool["name"] for tool in response["result"]["tools"]}
    assert {"resume_brief", "claim_work", "heartbeat_work", "release_work", "append_work_event"} <= names


def test_resume_tool_serializes_result():
    expected = {"project": "Repo", "next_action": "check CI"}
    with patch("joshmemory.continuity_mcp.get_resume_brief", return_value=expected):
        response = continuity_mcp.handle(
            {
                "jsonrpc": "2.0",
                "id": 7,
                "method": "tools/call",
                "params": {"name": "resume_brief", "arguments": {"project": "Repo"}},
            }
        )
    text = response["result"]["content"][0]["text"]
    assert json.loads(text) == expected
