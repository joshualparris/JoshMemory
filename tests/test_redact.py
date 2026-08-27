from joshmemory.redact import redact


def test_redacts_common_tokens() -> None:
    text = "OPENAI_API_KEY=sk-proj-abcdefghijklmnopqrstuvwxyz1234567890 password=hunter2"
    redacted = redact(text)
    assert "sk-proj-" not in redacted
    assert "hunter2" not in redacted

