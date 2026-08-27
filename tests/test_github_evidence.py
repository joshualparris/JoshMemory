import json
from pathlib import Path

from joshmemory.github_evidence import github_evidence, import_github_evidence
from joshmemory.index import search_sessions


def test_import_github_evidence_is_searchable_and_idempotent(tmp_path: Path) -> None:
    ledger = tmp_path / "ledger.jsonl"
    records = [
        {
            "id": "github-ledger-0001-repository",
            "url": "https://github.com/joshparri/FedoraCrashDoctor",
            "url_type": "repository",
            "repository": "joshparri/FedoraCrashDoctor",
            "project": "FedoraCrashDoctor",
            "observed_at": "2026-08-27",
            "exactness": "exact_observed",
            "was_exactly_observed": True,
            "provenance": "connected_github_inventory_current_conversation",
            "notes": "Canonical repository URL.",
        },
        {
            "id": "github-ledger-0002-commit",
            "url": "https://github.com/joshparri/FedoraCrashDoctor/commit/358c335",
            "url_type": "commit",
            "repository": "joshparri/FedoraCrashDoctor",
            "project": "FedoraCrashDoctor",
            "observed_at": "2026-08-27",
            "exactness": "reconstructed_from_observed_sha",
            "was_exactly_observed": False,
            "provenance": "historical_session_evidence",
            "notes": "Canonical URL reconstructed from observed SHA.",
        },
    ]
    ledger.write_text("\n".join(json.dumps(record) for record in records), encoding="utf-8")
    db = tmp_path / "memory.sqlite"

    expected = {"seen": 2, "imported": 2, "skipped": 0}
    assert import_github_evidence(ledger, db_path=db) == expected
    assert import_github_evidence(ledger, db_path=db) == expected

    results = search_sessions("358c335", db_path=db)
    assert results[0]["thread_id"] == "github_evidence:github-ledger-0002-commit"
    evidence = github_evidence(project="FedoraCrashDoctor", db_path=db)
    assert len(evidence) == 2
    assert {row["source_line"] for row in evidence} == {1, 2}
    assert "reconstructed_from_observed_sha" in evidence[1]["text"]