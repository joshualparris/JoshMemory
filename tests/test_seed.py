import json
from pathlib import Path

from joshmemory.index import search_sessions
from joshmemory.seed import import_seed_file


def test_import_seed_file(tmp_path: Path) -> None:
    seed = tmp_path / "seed.jsonl"
    seed.write_text(
        json.dumps(
            {
                "id": "fact-1",
                "occurred_at": "2026-08-27",
                "project": "AgentWitness",
                "type": "milestone",
                "title": "PR merged",
                "summary": "AgentWitness tests passed.",
                "status": "completed",
                "evidence": {"commit": "abc123"},
                "tags": ["agentwitness"],
                "provenance": "Synthetic seed.",
            }
        )
        + "\n",
        encoding="utf-8",
    )
    db = tmp_path / "memory.sqlite"

    counts = import_seed_file(seed, db_path=db)
    results = search_sessions("AgentWitness", db_path=db)

    assert counts["imported"] == 1
    assert results[0]["thread_id"] == "seed:fact-1"
    assert results[0]["event_kind"] == "chatgpt_seed_fact"

