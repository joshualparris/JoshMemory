import importlib.util
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
_spec = importlib.util.spec_from_file_location("build_status", ROOT / "tools" / "build_status.py")
build_status = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(build_status)

COMMITS = ["- `abc1234` 2026-11-19: Example change"]


def test_status_is_short_and_has_every_section():
    text = build_status.build(commits=COMMITS, prs=[])
    assert len(text.splitlines()) <= 60
    for heading in ("## Before you start", "## Recently landed", "## Open pull requests", "## Task progress", "## Next open tasks"):
        assert heading in text
    assert "Built from commit `abc1234`" in text


def test_unreachable_github_is_reported_as_unknown():
    assert "Unknown" in build_status.build(commits=COMMITS, prs=None).split("## Open pull requests")[1].split("##")[0]


def test_bot_prs_are_summarised_not_listed():
    prs = [
        {"number": 7, "title": "Real work", "user": {"login": "joshualparris"}},
        {"number": 8, "title": "Bump x", "user": {"login": "dependabot[bot]"}},
    ]
    section = build_status.build(commits=COMMITS, prs=prs).split("## Open pull requests")[1].split("##")[0]
    assert "#7: Real work" in section and "Bump x" not in section and "1 dependency-update" in section


def test_committed_status_file_exists_and_is_short():
    assert len((ROOT / "STATUS.md").read_text(encoding="utf-8").splitlines()) <= 60


def test_status_categories():
    assert build_status._category("VERIFIED_COMPLETE") == "done"
    assert build_status._category("SOURCE_REPORTED_BLOCKED_PROVIDER_ACCESS") == "blocked"
    assert build_status._category("LEGACY_PARENT_TRIAGED_NOT_STEP_VERIFIED") == "open"
