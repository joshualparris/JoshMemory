from __future__ import annotations

import io
import json
from subprocess import CompletedProcess
from urllib.error import HTTPError

import pytest

from joshmemory import github_store


def test_store_owner_login_wins_over_unrelated_active_account(monkeypatch):
    monkeypatch.delenv("JOSHMEMORY_GITHUB_ACCOUNT", raising=False)
    monkeypatch.setenv("JOSHMEMORY_GITHUB_STORE_REPO", "memory-owner/private-store")
    calls = []

    def run(command, **kwargs):
        calls.append(command)
        return CompletedProcess(command, 0, "owner-credential", "")

    monkeypatch.setattr(github_store.subprocess, "run", run)
    assert github_store._token_from_gh() == "owner-credential"
    assert calls == [["gh", "auth", "token", "--hostname", "github.com", "--user", "memory-owner"]]


def test_organization_store_can_use_active_member(monkeypatch):
    monkeypatch.delenv("JOSHMEMORY_GITHUB_ACCOUNT", raising=False)
    monkeypatch.setenv("JOSHMEMORY_GITHUB_STORE_REPO", "organization/private-store")

    def run(command, **kwargs):
        return CompletedProcess(command, 1 if "--user" in command else 0, "" if "--user" in command else "member-credential", "")

    monkeypatch.setattr(github_store.subprocess, "run", run)
    assert github_store._token_from_gh() == "member-credential"


def test_explicit_account_does_not_fall_back_to_another_cli_account(monkeypatch):
    monkeypatch.setenv("JOSHMEMORY_GITHUB_ACCOUNT", "required-account")
    calls = []

    def run(command, **kwargs):
        calls.append(command)
        return CompletedProcess(command, 1, "", "not logged in")

    monkeypatch.setattr(github_store.subprocess, "run", run)
    assert github_store._token_from_gh() == ""
    assert len(calls) == 1 and calls[0][-1] == "required-account"


def test_404_identifies_store_and_auth_check_without_exposing_credential(monkeypatch):
    monkeypatch.setenv("JOSHMEMORY_GITHUB_STORE_REPO", "owner/private-store")
    monkeypatch.setattr(github_store, "github_token", lambda: "credential-must-not-leak")

    def urlopen(req, **kwargs):
        raise HTTPError(req.full_url, 404, "Not Found", {}, io.BytesIO(json.dumps({"message": "Not Found"}).encode()))

    monkeypatch.setattr(github_store.request, "urlopen", urlopen)
    with pytest.raises(github_store.GitHubStoreError) as caught:
        github_store._api_request("GET", "/git/trees/main?recursive=1")
    assert "owner/private-store" in str(caught.value)
    assert "selected GitHub account" in str(caught.value)
    assert "credential-must-not-leak" not in str(caught.value)


def test_pinned_account_does_not_use_unrelated_git_helper(monkeypatch):
    for name in ("JOSHMEMORY_GITHUB_TOKEN", "GH_TOKEN", "GITHUB_TOKEN"):
        monkeypatch.delenv(name, raising=False)
    monkeypatch.setenv("JOSHMEMORY_GITHUB_ACCOUNT", "required-account")
    monkeypatch.setattr(github_store, "_token_from_gh", lambda: "")
    monkeypatch.setattr(github_store, "_token_from_git_credential", lambda: "unrelated-account")
    assert github_store.github_token() == ""
