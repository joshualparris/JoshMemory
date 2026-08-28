import os
import sys
import pytest
import subprocess
from pathlib import Path
from unittest import mock

from joshmemory.auditor import get_base_dir, run_auditor, scan_built_in
from joshmemory.index import recent_work

def run_cmd(cwd: Path, args: list[str]):
    subprocess.run(args, cwd=cwd, check=True, capture_output=True)

def setup_git_repo(path: Path, clean: bool = True, branch: str = "main"):
    path.mkdir(parents=True, exist_ok=True)
    run_cmd(path, ["git", "init"])
    run_cmd(path, ["git", "checkout", "-b", branch])
    run_cmd(path, ["git", "config", "user.email", "test@example.com"])
    run_cmd(path, ["git", "config", "user.name", "Test User"])
    
    (path / "file.txt").write_text("hello")
    run_cmd(path, ["git", "add", "file.txt"])
    run_cmd(path, ["git", "commit", "-m", "Initial commit"])
    
    if not clean:
        (path / "file.txt").write_text("modified")
        (path / "untracked.txt").write_text("untracked")

def test_get_base_dir(monkeypatch):
    monkeypatch.setenv("JOSHMEMORY_PROJECTS_DIR", "/custom/dir")
    assert str(get_base_dir()) == str(Path("/custom/dir"))
    
    monkeypatch.delenv("JOSHMEMORY_PROJECTS_DIR", raising=False)
    
    with mock.patch("sys.platform", "win32"):
        with mock.patch("pathlib.Path.exists", return_value=True):
            with mock.patch("pathlib.Path.is_dir", return_value=True):
                assert str(get_base_dir()) == str(Path("C:/dev"))
                
    with mock.patch("sys.platform", "linux"):
        # Should default to ~/dev on Linux
        assert get_base_dir() == Path.home() / "dev"

def test_scan_built_in(tmp_path):
    base_dir = tmp_path / "dev"
    base_dir.mkdir()
    
    clean_repo = base_dir / "CleanRepo"
    setup_git_repo(clean_repo, clean=True, branch="main")
    
    dirty_repo = base_dir / "DirtyRepo"
    setup_git_repo(dirty_repo, clean=False, branch="feature-branch")
    
    not_repo = base_dir / "NotARepo"
    not_repo.mkdir()
    
    result = scan_built_in(base_dir)
    assert result["version"] == "1.0"
    projects = result["projects"]
    assert len(projects) == 2
    
    clean_proj = next(p for p in projects if p["name"] == "CleanRepo")
    assert clean_proj["path"] == str(clean_repo.absolute())
    assert clean_proj["git"]["head"] == "main"
    assert clean_proj["git"]["modified"] == 0
    assert clean_proj["git"]["untracked"] == 0
    assert "latest_commit_date" in clean_proj["git"]
    
    dirty_proj = next(p for p in projects if p["name"] == "DirtyRepo")
    assert dirty_proj["path"] == str(dirty_repo.absolute())
    assert dirty_proj["git"]["head"] == "feature-branch"
    assert dirty_proj["git"]["modified"] == 1
    assert dirty_proj["git"]["untracked"] == 1

def test_missing_fedora_auditor(tmp_path, monkeypatch):
    monkeypatch.setenv("JOSHMEMORY_PROJECTS_DIR", str(tmp_path))
    
    setup_git_repo(tmp_path / "MyRepo")
    
    result = run_auditor()
    assert len(result["projects"]) == 1
    assert result["projects"][0]["name"] == "MyRepo"

@mock.patch("joshmemory.auditor.run_auditor")
def test_recent_work_with_live_windows_repos(mock_run_auditor, tmp_path):
    # This simulates recent_work() returning projects when live repos exist
    db_path = tmp_path / "test.db"
    
    mock_run_auditor.return_value = {
        "projects": [
            {
                "name": "LiveWindowsRepo",
                "path": "C:/dev/LiveWindowsRepo",
                "git": {
                    "head": "main",
                    "modified": 2,
                    "untracked": 0,
                    "ahead": 0,
                    "latest_commit_date": "2026-08-28T10:00:00Z"
                }
            }
        ]
    }
    
    ranked = recent_work(limit=10, db_path=db_path)
    assert len(ranked) >= 1
    assert ranked[0]["project"] == "LiveWindowsRepo"

