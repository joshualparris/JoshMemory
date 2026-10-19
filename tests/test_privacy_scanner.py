"""Regression tests: keep public-safe docs and generated scripts from causing
false positive CI failures without weakening detection of actual credentials."""
from pathlib import Path
import importlib.util

_ROOT = Path(__file__).resolve().parents[1]
_SPEC = importlib.util.spec_from_file_location(
    "joshmemory_privacy_scanner", _ROOT / "tools" / "check_privacy.py"
)
_SCANNER = importlib.util.module_from_spec(_SPEC)
_SPEC.loader.exec_module(_SCANNER)


def _scan(tmp_path, text):
    sample = tmp_path / "sample.js"
    sample.write_text(text, encoding="utf-8")
    return _SCANNER.scan_file(str(sample))


def _assignment(key, value):
    quote = chr(39)
    return key + "=" + quote + value + quote


def test_documented_placeholders_are_not_credentials(tmp_path):
    assert not _scan(tmp_path, _assignment("GOOGLE_CLIENT_SECRET", "<your_google_client_secret>"))
    assert not _scan(tmp_path, _assignment("refresh_token", r"\u003cyour_refresh_token\u003e"))


def test_vendored_source_escape_sequence_is_not_a_key(tmp_path):
    source = _assignment("password", r"one)\n\nfunction getpass")
    assert not _scan(tmp_path, source)


def test_real_hard_coded_assignments_are_rejected(tmp_path):
    for key in ("password", "client_secret", "api_key", "refresh_token"):
        assert "Hard-coded credential" in _scan(tmp_path, _assignment(key, "s3cret-" + "X" * 24))


def test_real_token_prefix_is_rejected_in_large_js(tmp_path):
    token = "ghp_" + "A" * 40
    assert "GitHub Token" in _scan(tmp_path, "const test = " + chr(39) + token + chr(39))


def test_private_denylist_remains_enforced(tmp_path, monkeypatch):
    monkeypatch.setenv("JOSHMEMORY_PRIVATE_TERMS", "redactedtermforprivacytest")
    assert "Private denylist term" in _scan(tmp_path, "redactedtermforprivacytest")


def test_fake_npc_api_key_fixture_is_safe(tmp_path):
    assert not _scan(tmp_path, _assignment("GROQ_API_KEY", "fake"))
