from __future__ import annotations

import re


SECRET_PATTERNS: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"sk-[A-Za-z0-9_-]{20,}"), "[REDACTED_OPENAI_KEY]"),
    (re.compile(r"sk-proj-[A-Za-z0-9_-]{20,}"), "[REDACTED_OPENAI_KEY]"),
    (re.compile(r"(?i)(api[_-]?key|client[_-]?secret|access[_-]?token|refresh[_-]?token|password|passwd|secret)(\s*[:=]\s*)([^\s'\"`]+)"), r"\1\2[REDACTED_SECRET]"),
    (re.compile(r"(?i)(bearer\s+)[A-Za-z0-9._~+/=-]{16,}"), r"\1[REDACTED_TOKEN]"),
    (re.compile(r"AIza[0-9A-Za-z_-]{25,}"), "[REDACTED_GOOGLE_KEY]"),
    (re.compile(r"ya29\.[0-9A-Za-z._-]+"), "[REDACTED_GOOGLE_TOKEN]"),
    (re.compile(r"gh[pousr]_[A-Za-z0-9_]{20,}"), "[REDACTED_GITHUB_TOKEN]"),
]


def redact(text: str) -> str:
    value = text
    for pattern, replacement in SECRET_PATTERNS:
        value = pattern.sub(replacement, value)
    return value

