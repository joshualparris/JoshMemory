import json
import sqlite3
import datetime
from pathlib import Path
from typing import Any

def extract_transcript_state(transcript_path: str) -> dict[str, Any]:
    objective = None
    outcome = None
    try:
        path = Path(transcript_path)
        if not path.exists():
            return {}
            
        with open(path, "r", encoding="utf-8") as f:
            lines = f.readlines()
            
        user_inputs = []
        agent_responses = []
        
        for line in lines:
            if not line.strip():
                continue
            try:
                step = json.loads(line)
                if step.get("type") == "USER_INPUT":
                    content = step.get("content", "")
                    if len(content) > 10:  # Skip trivial yes/no
                        user_inputs.append(content)
                elif step.get("type") == "PLANNER_RESPONSE":
                    content = step.get("content", "")
                    if content:
                        agent_responses.append(content)
            except Exception:
                pass
                
        if user_inputs:
            objective = user_inputs[-1][:500] + ("..." if len(user_inputs[-1]) > 500 else "")
            
        if agent_responses:
            outcome = agent_responses[-1][:500] + ("..." if len(agent_responses[-1]) > 500 else "")
            
    except Exception:
        pass
        
    return {
        "objective": objective,
        "outcome": outcome
    }

def save_checkpoint(
    db_path: str,
    conversation_id: str,
    project: str,
    canonical_repo: str,
    checkout_path: str,
    machine: str,
    branch: str,
    head: str,
    dirty: bool,
    transcript_path: str,
    termination_reason: str,
    fully_idle: bool
) -> dict[str, Any]:
    
    state = extract_transcript_state(transcript_path)
    
    # We leave these unknown if we can't deterministically derive them without an LLM
    completed = state.get("outcome")
    in_progress = None
    blockers = None
    next_action = None
    objective = state.get("objective")
    
    updated_at = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")
    
    import joshmemory.schema as schema
    con = schema.connect(db_path)
    con.execute("PRAGMA foreign_keys = ON")
    
    con.execute('''
        INSERT INTO session_checkpoints (
            conversation_id, canonical_repo, checkout_path, machine, project,
            objective, completed, in_progress, blockers, next_action,
            branch, head, dirty, transcript_path, termination_reason, fully_idle, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(conversation_id) DO UPDATE SET
            canonical_repo=excluded.canonical_repo,
            checkout_path=excluded.checkout_path,
            machine=excluded.machine,
            project=excluded.project,
            objective=excluded.objective,
            completed=excluded.completed,
            in_progress=excluded.in_progress,
            blockers=excluded.blockers,
            next_action=excluded.next_action,
            branch=excluded.branch,
            head=excluded.head,
            dirty=excluded.dirty,
            transcript_path=excluded.transcript_path,
            termination_reason=excluded.termination_reason,
            fully_idle=excluded.fully_idle,
            updated_at=excluded.updated_at
    ''', (
        conversation_id, canonical_repo, checkout_path, machine, project,
        objective, completed, in_progress, blockers, next_action,
        branch, head, dirty, transcript_path, termination_reason, fully_idle, updated_at
    ))
    
    con.commit()
    con.close()
    
    return {"status": "success", "conversation_id": conversation_id}

def get_latest_checkpoint(
    db_path: str,
    canonical_repo: str,
    checkout_path: str,
    machine: str
) -> dict[str, Any] | None:
    import joshmemory.schema as schema
    con = schema.connect(db_path)
    con.row_factory = sqlite3.Row
    
    # We want the most recent checkpoint for this exact checkout path and machine
    cur = con.execute('''
        SELECT * FROM session_checkpoints 
        WHERE canonical_repo = ? AND checkout_path = ? AND machine = ?
        ORDER BY updated_at DESC LIMIT 1
    ''', (canonical_repo, checkout_path, machine))
    
    row = cur.fetchone()
    con.close()
    
    if row:
        return dict(row)
    return None
