import json
from pathlib import Path

from joshmemory.chatgpt import import_chatgpt_export
from joshmemory.index import open_index, search_sessions


def conversation(conversation_id="conv-1", title="Old coding chat", messages=None):
    messages = messages or [
        ("u1", None, "user", 1679097600, ["Build a chatbot with XAMPP and JavaScript"]),
        ("a1", "u1", "assistant", 1679097660, ["Use OpenAI carefully."]),
    ]
    mapping = {}
    for message_id, parent, role, timestamp, parts in messages:
        mapping[message_id] = {
            "id": message_id,
            "parent": parent,
            "children": [],
            "message": {
                "id": message_id,
                "author": {"role": role},
                "create_time": timestamp,
                "content": {"content_type": "text", "parts": parts},
                "metadata": {"model_slug": "test-model"},
            },
        }
    return {
        "conversation_id": conversation_id,
        "title": title,
        "create_time": 1679097600,
        "update_time": 1679097660,
        "current_node": messages[-1][0],
        "mapping": mapping,
    }


def write_export(path: Path, conversations: list[dict]) -> None:
    path.write_text(json.dumps(conversations), encoding="utf-8")


def test_basic_import_preserves_raw_metadata_and_search(tmp_path: Path) -> None:
    export = tmp_path / "conversations.json"
    db = tmp_path / "memory.sqlite"
    write_export(export, [conversation()])

    stats = import_chatgpt_export(export, db_path=db)
    assert stats["conversations_added"] == 1
    assert stats["messages_added"] == 2
    result = search_sessions("chatbot XAMPP", db_path=db)[0]
    assert result["provenance"] == "historical_chatgpt_export"
    assert result["timestamp"] if "timestamp" in result else True
    row = open_index(db).execute("SELECT * FROM chatgpt_messages WHERE message_id = 'u1'").fetchone()
    assert row["parent_message_id"] is None
    assert row["text"] == "Build a chatbot with XAMPP and JavaScript"
    assert row["model"] == "test-model"


def test_duplicate_and_incremental_import(tmp_path: Path) -> None:
    export = tmp_path / "conversations.json"
    db = tmp_path / "memory.sqlite"
    write_export(export, [conversation()])
    first = import_chatgpt_export(export, db_path=db)
    second = import_chatgpt_export(export, db_path=db)
    assert first["messages_added"] == 2
    assert second["messages_added"] == 0
    assert second["duplicates_skipped"] == 2

    write_export(export, [conversation(), conversation("conv-2", "New chat", [("u2", None, "user", 1679097700, ["new material"])])])
    third = import_chatgpt_export(export, db_path=db)
    assert third["conversations_added"] == 1
    assert third["messages_added"] == 1
    assert third["conversations_updated"] == 1


def test_branching_preserves_alternates_and_active_path(tmp_path: Path) -> None:
    export = tmp_path / "conversations.json"
    db = tmp_path / "memory.sqlite"
    item = conversation("branch", messages=[
        ("u", None, "user", 1679097600, ["prompt"]),
        ("a-old", "u", "assistant", 1679097610, ["old answer"]),
        ("a-new", "u", "assistant", 1679097620, ["new answer"]),
    ])
    item["current_node"] = "a-new"
    write_export(export, [item])
    import_chatgpt_export(export, db_path=db)
    rows = open_index(db).execute("SELECT message_id, branch_status, sequence_index FROM chatgpt_messages ORDER BY sequence_index").fetchall()
    assert {row["message_id"] for row in rows} == {"u", "a-old", "a-new"}
    assert {row["message_id"] for row in rows if row["branch_status"] == "active"} == {"u", "a-new"}
    assert [row["message_id"] for row in rows if row["branch_status"] == "alternate"] == ["a-old"]


def test_malformed_records_are_counted_without_aborting(tmp_path: Path) -> None:
    export = tmp_path / "conversations.json"
    db = tmp_path / "memory.sqlite"
    write_export(export, [None, {"title": "missing id"}, conversation()])
    stats = import_chatgpt_export(export, db_path=db)
    assert stats["conversations_discovered"] == 3
    assert stats["malformed_records_skipped"] == 2
    assert stats["messages_added"] == 2


def test_old_date_metadata_is_searchable(tmp_path: Path) -> None:
    export = tmp_path / "conversations.json"
    db = tmp_path / "memory.sqlite"
    write_export(export, [conversation()])
    import_chatgpt_export(export, db_path=db)
    results = search_sessions("18 March 2023", db_path=db)
    assert results
    assert results[0]["created_at"] == "1679097600"