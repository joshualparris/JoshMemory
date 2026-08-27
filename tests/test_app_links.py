from pathlib import Path

from joshmemory.app_links import import_app_links, parse_app_links
from joshmemory.index import search_sessions


def test_parse_app_links_extracts_github_repo() -> None:
    records = parse_app_links(
        """
PowerApp
https://github.com/joshuaparris-max/PowerApp
https://power-app-delta.vercel.app/
"""
    )

    assert records[0]["project"] == "PowerApp"
    assert records[0]["github_repos"] == ["https://github.com/joshuaparris-max/PowerApp"]
    assert "https://power-app-delta.vercel.app" in records[0]["deployments"]


def test_import_app_links_is_searchable(tmp_path: Path) -> None:
    links = tmp_path / "links.txt"
    links.write_text("PowerApp\nhttps://github.com/joshuaparris-max/PowerApp\n", encoding="utf-8")
    db = tmp_path / "memory.sqlite"

    counts = import_app_links(links, db_path=db)
    results = search_sessions("PowerApp", db_path=db)

    assert counts["imported"] == 1
    assert results[0]["event_kind"] == "user_app_links_fact"
