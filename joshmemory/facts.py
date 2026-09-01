from __future__ import annotations

import sqlite3
import uuid
from typing import Any, Optional
from datetime import datetime, timezone

from .schema import connect

def project_fact_add(
    db_path: str,
    project: str,
    subject: str,
    fact: str,
    status: str,
    confidence: Optional[float] = None,
    observed_at: Optional[str] = None,
    source_type: Optional[str] = None,
    source_ref: Optional[str] = None,
    machine: Optional[str] = None,
    supersedes: Optional[str] = None
) -> dict[str, Any]:
    valid_statuses = {"VERIFIED", "OBSERVED", "HISTORICAL", "INFERRED", "STALE", "DISPROVEN", "UNKNOWN", "CURRENT"}
    status = status.upper()
    if status not in valid_statuses:
        raise ValueError(f"Invalid status {status}")
        
    if status == "VERIFIED" and not source_ref:
        raise ValueError("VERIFIED status requires source_ref")

    if confidence is not None and not (0.0 <= confidence <= 1.0):
        raise ValueError("Confidence must be between 0.0 and 1.0")
    if not source_type:
        raise ValueError("source_type is required")
        
    con = connect(db_path)
    try:
        recorded_at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        
        _machine = machine or ""
        status = status.upper()
        
        with con:
            con.execute("BEGIN IMMEDIATE")
            
            if supersedes:
                cur = con.execute("SELECT id, active, project, subject, machine FROM project_facts WHERE id = ?", (supersedes,))
                row = cur.fetchone()
                if not row:
                    raise ValueError(f"Superseded fact {supersedes} not found")
                if not row["active"]:
                    raise ValueError(f"Superseded fact {supersedes} is already inactive")
                if row["project"] != project or row["subject"] != subject or row["machine"] != _machine:
                    raise ValueError(f"Superseded fact {supersedes} does not match project/subject/machine")
            
            cur = con.execute(
                "SELECT id FROM project_facts WHERE project = ? AND subject = ? AND fact = ? AND status = ? AND machine = ?",
                (project, subject, fact, status, _machine)
            )
            row = cur.fetchone()
            
            if row:
                fact_id = row["id"]
                return {"id": fact_id, "project": project, "fact": fact, "duplicate": True}
            else:
                fact_id = str(uuid.uuid4())
                con.execute(
                    """
                    INSERT INTO project_facts (
                        id, project, machine, subject, fact, status, confidence, 
                        observed_at, recorded_at, source_type, source_ref, supersedes, active
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
                    """,
                    (fact_id, project, _machine, subject, fact, status, confidence,
                     observed_at, recorded_at, source_type, source_ref, supersedes)
                )
            
            if supersedes:
                con.execute("UPDATE project_facts SET active = 0 WHERE id = ?", (supersedes,))
                
        return {"id": fact_id, "project": project, "fact": fact, "duplicate": False}
    finally:
        con.close()

def project_fact_search(
    db_path: str,
    query: str,
    project: Optional[str] = None,
    active_only: bool = True
) -> list[dict[str, Any]]:
    con = connect(db_path)
    try:
        sql = "SELECT * FROM project_facts WHERE (subject LIKE ? OR fact LIKE ?)"
        params: list[Any] = [f"%{query}%", f"%{query}%"]
        
        if project:
            sql += " AND project = ?"
            params.append(project)
        if active_only:
            sql += " AND active = 1"
            
        cur = con.execute(sql, params)
        return [dict(row) for row in cur.fetchall()]
    finally:
        con.close()

def accountability_reference_add(
    db_path: str,
    project: str,
    claim_summary: str,
    source_system: str,
    source_id: str,
    requirement_id: Optional[str] = None,
    source_ref: Optional[str] = None,
    reviewer: Optional[str] = None,
    verdict: Optional[str] = None,
    commit_sha: Optional[str] = None,
    supersedes: Optional[str] = None
) -> dict[str, Any]:
    import re
    if verdict:
        verdict = verdict.upper()
        valid_verdicts = {"SATISFIED", "REJECTED", "EVIDENCED"}
        if verdict not in valid_verdicts:
            raise ValueError(f"Invalid verdict {verdict}")
            
    if commit_sha and not re.match(r"^[0-9a-f]{7,40}$", commit_sha):
        raise ValueError("commit_sha must be a valid hex hash")

    con = connect(db_path)
    try:
        observed_at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        _req = requirement_id or ""
        
        with con:
            con.execute("BEGIN IMMEDIATE")
            
            if supersedes:
                cur = con.execute("SELECT id, active, project, requirement_id FROM accountability_references WHERE id = ?", (supersedes,))
                row = cur.fetchone()
                if not row:
                    raise ValueError(f"Superseded reference {supersedes} not found")
                if not row["active"]:
                    raise ValueError(f"Superseded reference {supersedes} is already inactive")
                if row["project"] != project or row["requirement_id"] != _req:
                    raise ValueError(f"Superseded reference {supersedes} does not match project/requirement_id")

            cur = con.execute(
                "SELECT id FROM accountability_references WHERE project = ? AND claim_summary = ? AND source_system = ? AND source_id = ? AND requirement_id = ?",
                (project, claim_summary, source_system, source_id, _req)
            )
            row = cur.fetchone()
            
            if row:
                ref_id = row["id"]
                return {"id": ref_id, "project": project, "source_system": source_system, "duplicate": True}
            else:
                ref_id = str(uuid.uuid4())
                con.execute(
                    """
                    INSERT INTO accountability_references (
                        id, project, requirement_id, claim_summary, source_system, source_id,
                        source_ref, reviewer, verdict, commit_sha, observed_at, supersedes, active
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
                    """,
                    (ref_id, project, _req, claim_summary, source_system, source_id,
                     source_ref, reviewer, verdict, commit_sha, observed_at, supersedes)
                )
                
            if supersedes:
                con.execute("UPDATE accountability_references SET active = 0 WHERE id = ?", (supersedes,))
                
        return {"id": ref_id, "project": project, "source_system": source_system, "duplicate": False}
    finally:
        con.close()

def accountability_reference_search(
    db_path: str,
    query: str,
    project: Optional[str] = None,
    active_only: bool = True
) -> list[dict[str, Any]]:
    con = connect(db_path)
    try:
        sql = "SELECT * FROM accountability_references WHERE (claim_summary LIKE ? OR source_id LIKE ?)"
        params: list[Any] = [f"%{query}%", f"%{query}%"]
        
        if project:
            sql += " AND project = ?"
            params.append(project)
            
        if active_only:
            sql += " AND active = 1"
            
        cur = con.execute(sql, params)
        return [dict(row) for row in cur.fetchall()]
    finally:
        con.close()
