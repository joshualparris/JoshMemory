"""Ensure synthetic authentication tests do not weaken the public privacy gate."""
from pathlib import Path
import tempfile

from tools.check_privacy import scan_file

ROOT = Path(__file__).resolve().parents[1]


def test_multiplayer_fixture_has_no_hardcoded_credential_pattern():
    path = ROOT / "repository-town/tests/multiplayer-body-limit.mjs"
    assert path.is_file(), "Auth-size fixture must remain in the repository"
    assert "Hard-coded credential" not in scan_file(str(path))


def test_privacy_scanner_still_detects_real_looking_literal_assignments():
    with tempfile.TemporaryDirectory() as tmp:
        candidate = Path(tmp) / "unsafe.js"
        candidate.write_text('const ' + 'password' + ' = "not-a-placeholder-example-secret";\n')
        assert "Hard-coded credential" in scan_file(str(candidate))


def test_private_pattern_examples_are_never_exempted():
    with tempfile.TemporaryDirectory() as tmp:
        candidate = Path(tmp) / "unsafe.js"
        candidate.write_text('const ' + 'access_token' + ' = "this-is-an-unapproved-static-token";\n')
        assert "Hard-coded credential" in scan_file(str(candidate))
