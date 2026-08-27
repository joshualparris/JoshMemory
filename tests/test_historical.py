import datetime as dt
import json
from pathlib import Path

from joshmemory.chatgpt import import_chatgpt_export
from joshmemory.historical import earliest_activity, historical_search, historical_timeline, parse_historical_query


def make_conversation(cid: str, title: str, timestamp: float, user_text: str, assistant_text: str) -> dict:
    user_id, assistant_id = f"{cid}-user", f"{cid}-assistant"
    return {
        "conversation_id": cid, "title": title, "create_time": timestamp, "update_time": timestamp,
        "current_node": assistant_id,
        "mapping": {
            user_id: {"id": user_id, "parent": None, "children": [assistant_id], "message": {"id": user_id, "author": {"role": "user"}, "create_time": timestamp, "content": {"parts": [user_text]}}},
            assistant_id: {"id": assistant_id, "parent": user_id, "children": [], "message": {"id": assistant_id, "author": {"role": "assistant"}, "create_time": timestamp + 1, "content": {"parts": [assistant_text]}}},
        },
    }


def write_export(path: Path, records: list[dict]) -> None:
    path.write_text(json.dumps(records), encoding="utf-8")


def test_parser_extracts_march_and_earliest_intent() -> None:
    intent = parse_historical_query("what were we coding in March 2023?")
    assert intent["activity"] == "coding"
    assert intent["date_range"] == {"start": "2023-03-01", "end": "2023-03-31"}
    assert parse_historical_query("what was the first thing we coded?")["ordering"] == "earliest"
    assert parse_historical_query("last Friday")["uncertainty"] == "relative date requires reference_date"
    resolved = parse_historical_query("last Friday", reference_date=dt.date(2026, 8, 28))
    assert resolved["date_range"]["start"] == "2026-08-21"
    assert parse_historical_query("26 and 27 August 2026")["date_range"] == {"start": "2026-08-26", "end": "2026-08-27"}


def test_march_coding_search_expands_activity_terms_and_filters_date(tmp_path: Path) -> None:
    export = tmp_path / "conversations.json"
    db = tmp_path / "memory.sqlite"
    write_export(export, [
        make_conversation("march", "Website HTML Code Structure", 1677751460, "Write the HTML code for a complex website", "Here is <!DOCTYPE html> for the website."),
        make_conversation("chat", "AI Chat Creation.", 1679122053, "Create a chatbot", "Here is JavaScript code for an OpenAI chatbot."),
        make_conversation("april", "Later coding", 1680307200, "Write code", "Here is code."),
        make_conversation("false", "Child development", 1678000000, "Tell me about child development", "Development means growth."),
    ])
    import_chatgpt_export(export, db_path=db)
    result = historical_search("what were we coding in March 2023?", db_path=db)
    titles = {item["title"] for item in result["results"] if item["qualifies"]}
    assert titles == {"Website HTML Code Structure", "AI Chat Creation."}
    assert all(item["created_at"] < "1680000000" for item in result["results"])


def test_earliest_activity_reports_available_corpus_not_first_ever(tmp_path: Path) -> None:
    export = tmp_path / "conversations.json"
    db = tmp_path / "memory.sqlite"
    write_export(export, [make_conversation("old", "Website HTML Code Structure", 1677751460, "Write HTML code", "<!DOCTYPE html>")])
    import_chatgpt_export(export, db_path=db)
    result = earliest_activity(db_path=db)
    assert result["result"]["title"] == "Website HTML Code Structure"
    assert "currently available evidence corpus" in result["caveats"][0]


def test_false_positive_activity_is_not_qualified(tmp_path: Path) -> None:
    export = tmp_path / "conversations.json"
    db = tmp_path / "memory.sqlite"
    write_export(export, [
        make_conversation("child", "Child development", 1678000000, "Tell me about child development", "Here is a development answer."),
        make_conversation("discount", "Discount code", 1678000010, "Find me a discount code", "Use code SAVE10."),
        make_conversation("tv", "TV program", 1678000020, "What is on the TV program?", "Here is the program."),
        make_conversation("python", "Python snake", 1678000030, "Tell me about a python snake", "A python is a snake."),
    ])
    import_chatgpt_export(export, db_path=db)
    result = historical_search("coding", db_path=db)
    assert not any(item["qualifies"] for item in result["results"])


def test_timeline_groups_sources_without_flattening(tmp_path: Path) -> None:
    export = tmp_path / "conversations.json"
    db = tmp_path / "memory.sqlite"
    write_export(export, [make_conversation("chat", "March coding", 1677751460, "Create a website", "<!DOCTYPE html>")])
    import_chatgpt_export(export, db_path=db)
    result = historical_timeline("March 2023", db_path=db)
    assert result["historical_activity"]
    assert result["historical_activity"][0]["provenance"] == "historical_chatgpt_export"
    assert result["unknowns"]


def test_generic_work_query_uses_date_without_literal_work_filter(tmp_path: Path) -> None:
    export = tmp_path / "conversations.json"
    db = tmp_path / "memory.sqlite"
    write_export(export, [make_conversation("chat", "Dated work", 1755734400, "A technical API discussion", "The API response was tested.")])
    import_chatgpt_export(export, db_path=db)
    result = historical_search("what were we working on 21 August 2025?", db_path=db)
    assert result["intent"]["activities"] == []