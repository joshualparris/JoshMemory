import json
import subprocess
from pathlib import Path
from typing import Any

# Hardcode path for now per instructions
AUDITOR_SCRIPT = Path.home() / "dev" / "tools" / "fedora_project_audit.py"
BASE_DIR = Path.home() / "dev"

def run_auditor() -> dict[str, Any]:
    if not AUDITOR_SCRIPT.exists():
        return {}
    
    try:
        result = subprocess.run(
            ["python3", str(AUDITOR_SCRIPT), "--base", str(BASE_DIR), "--include-non-git", "--json"],
            capture_output=True,
            text=True,
            check=True
        )
        return json.loads(result.stdout)
    except (subprocess.CalledProcessError, json.JSONDecodeError):
        return {}

def normalize_name(name: str) -> str:
    return name.lower().replace(" ", "").replace("-", "").replace("_", "")

def get_project_state(project_name: str, auditor_data: dict[str, Any] | None = None) -> dict[str, Any] | None:
    if auditor_data is None:
        auditor_data = run_auditor()
        if not auditor_data:
            return None
            
    projects = auditor_data.get("projects", [])
    
    # Try exact match first
    for p in projects:
        if p.get("name") == project_name:
            return p
            
    # Try fuzzy match
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
