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


def test_resume_delivers_values_gate_through_real_handler(tmp_path):
    # Only storage/context boundaries are isolated; the resume builder and MCP
    # handler execute together, so omitting the gate from either breaks this.
    with (
        patch("joshmemory.continuity.get_project_context", return_value={}),
        patch("joshmemory.continuity.get_active_lease", return_value=None),
        patch("joshmemory.continuity.list_work_events", return_value=[]),
    ):
        response = continuity_mcp.handle({
            "jsonrpc": "2.0", "id": 8, "method": "tools/call",
            "params": {"name": "resume_brief", "arguments": {"project": "Example"}},
        })
    brief = json.loads(response["result"]["content"][0]["text"])
    gate = brief["values_pre_task_gate"]
    assert gate["task_ids"] == ["VAL-018", "VAL-019", "VAL-022"]
    assert gate["required_before_optional_work"] is True
    assert "values pre-task gate" in brief["resume_rule"]
    assert "informed choice" in gate["agency"]
    assert "smallest" in gate["urgent_exception"]
    assert "does not prove" in gate["verification"]
