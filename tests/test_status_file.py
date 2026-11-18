import importlib.util
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
_spec = importlib.util.spec_from_file_location("build_status", ROOT / "tools" / "build_status.py")
build_status = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(build_status)


def test_status_file_is_current():
    assert build_status.main(["--check"]) == 0, "Run: python tools/build_status.py"


def test_status_file_stays_short():
    assert len((ROOT / "STATUS.md").read_text(encoding="utf-8").splitlines()) <= 40


def test_status_categories():
    assert build_status._category("VERIFIED_COMPLETE") == "done"
    assert build_status._category("SOURCE_REPORTED_BLOCKED_PROVIDER_ACCESS") == "blocked"
    assert build_status._category("LEGACY_PARENT_TRIAGED_NOT_STEP_VERIFIED") == "open"
