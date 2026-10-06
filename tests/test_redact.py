from joshmemory.redact import redact


def test_redacts_common_tokens() -> None:
    fake_token = "sk-" + "proj-" + "abcdefghijklmnopqrstuvwxyz1234567890"
    text = f"OPENAI_API_KEY={fake_token} password=hunter2"
    redacted = redact(text)
    assert fake_token not in redacted
    assert "hunter2" not in redacted

