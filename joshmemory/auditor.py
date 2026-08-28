import os
import sys
import json
import subprocess
from pathlib import Path
from typing import Any

def get_base_dir() -> Path:
    if "JOSHMEMORY_PROJECTS_DIR" in os.environ:
        return Path(os.environ["JOSHMEMORY_PROJECTS_DIR"])
    
    if sys.platform == "win32":
        c_dev = Path("C:/dev")
        if c_dev.exists() and c_dev.is_dir():
            return c_dev
            
    return Path.home() / "dev"

def run_git_command(cwd: Path, args: list[str]) -> str:
    try:
        result = subprocess.run(
            ["git", "--no-pager"] + args,
            cwd=cwd,
            capture_output=True,
            text=True,
            check=True,
            creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0
        )
        return result.stdout.strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        return ""

def scan_built_in(base_dir: Path) -> dict[str, Any]:
    projects = []
    if not base_dir.exists() or not base_dir.is_dir():
        return {"version": "1.0", "projects": projects}
        
    for p in base_dir.iterdir():
        if not p.is_dir():
            continue
            
        git_dir = p / ".git"
        if not git_dir.exists():
            continue
            
        head = run_git_command(p, ["rev-parse", "--abbrev-ref", "HEAD"])
        if head == "HEAD" or not head:
            head = run_git_command(p, ["rev-parse", "--short", "HEAD"])
            
        status_output = run_git_command(p, ["status", "--porcelain"])
        modified = 0
        untracked = 0
        for line in status_output.splitlines():
            if line.startswith("??"):
                untracked += 1
            elif line.strip():
                modified += 1
                
        ahead = 0
        if head:
            try:
                upstream = run_git_command(p, ["rev-parse", "--abbrev-ref", "@{u}"])
                if upstream:
                    ahead_str = run_git_command(p, ["rev-list", "--count", f"@{{u}}..HEAD"])
                    if ahead_str.isdigit():
                        ahead = int(ahead_str)
            except Exception:
                pass
                
        latest_date = run_git_command(p, ["log", "-1", "--format=%cI"])
        
        projects.append({
            "name": p.name,
            "path": str(p.absolute()),
            "git": {
                "head": head,
                "modified": modified,
                "untracked": untracked,
                "ahead": ahead,
                "latest_commit_date": latest_date
            }
        })
        
    return {"version": "1.0", "projects": projects}

def run_auditor() -> dict[str, Any]:
    base_dir = get_base_dir()
    
    auditor_script = Path.home() / "dev" / "tools" / "fedora_project_audit.py"
    if auditor_script.exists():
        try:
            result = subprocess.run(
                [sys.executable, str(auditor_script), "--base", str(base_dir), "--include-non-git", "--json"],
                capture_output=True,
                text=True,
                check=True
            )
            return json.loads(result.stdout)
        except (subprocess.CalledProcessError, json.JSONDecodeError):
            pass
            
    return scan_built_in(base_dir)

def normalize_name(name: str) -> str:
    return name.lower().replace(" ", "").replace("-", "").replace("_", "")

def get_project_state(project_name: str, auditor_data: dict[str, Any] | None = None) -> dict[str, Any] | None:
    if auditor_data is None:
        auditor_data = run_auditor()
        if not auditor_data:
            return None
            
    projects = auditor_data.get("projects", [])
    
    for p in projects:
        if p.get("name") == project_name:
            return p
            
    query_norm = normalize_name(project_name)
    for p in projects:
        p_name = p.get("name", "")
        p_norm = normalize_name(p_name)
        if query_norm in p_norm or p_norm in query_norm:
            return p
            
    return None

def get_all_projects(auditor_data: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    if auditor_data is None:
        auditor_data = run_auditor()
    return auditor_data.get("projects", [])
