from __future__ import annotations

import json
import importlib.util
from pathlib import Path

import pytest

_SPEC = importlib.util.spec_from_file_location(
    "build_web_data", Path(__file__).parents[1] / "tools" / "build_web_data.py"
)
assert _SPEC and _SPEC.loader
build_web_data = importlib.util.module_from_spec(_SPEC)
_SPEC.loader.exec_module(build_web_data)


def test_public_export_fails_closed_without_local_filter(tmp_path, monkeypatch) -> None:
    monkeypatch.setattr(build_web_data, "FILTER_CONFIG_PATH", tmp_path / "missing.json")

    with pytest.raises(RuntimeError, match="required"):
        build_web_data.load_filter_config()


def test_public_export_filter_is_local_only(tmp_path, monkeypatch) -> None:
    config_path = tmp_path / "public_export_filter.local.json"
    config_path.write_text(
        json.dumps(
            {
                "excluded_thread_ids": ["private-thread"],
                "scrub_values": [
                    {
                        "pattern": "example-person",
                        "replacement": "[REDACTED_NAME]",
                        "ignore_case": True,
                    }
                ],
            }
        ),
        encoding="utf-8",
    )
    monkeypatch.setattr(build_web_data, "FILTER_CONFIG_PATH", config_path)

    config = build_web_data.load_filter_config()
    patterns = build_web_data.compile_scrub_patterns(config["scrub_values"])
    value = "Example-Person is excluded from the public export."
    for pattern, replacement in patterns:
        value = pattern.sub(replacement, value)
    assert value == "[REDACTED_NAME] is excluded from the public export."
