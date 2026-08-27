import re
from typing import Any, Dict, List, Optional
import datetime as dt

def classify_evidence(state: Optional[Dict[str, Any]], history: List[Dict[str, Any]], github: List[Dict[str, Any]]) -> Dict[str, Any]:
    result = {
        "verified_live_state": [],
        "verified_git_evidence": [],
        "historical_session_evidence": [],
        "historical_imported_evidence": [],
        "contradictions": [],
        "inferences": [],
        "unknowns": [],
        "evidence_summary": {
            "facts": [],
            "history": [],
            "inferences": [],
            "contradictions": [],
            "unknowns": []
        }
    }

    git_tags = []

    # 1. Live State
    if state:
        path = state.get('path', 'unknown')
        result["verified_live_state"].append({
            "claim": f"Project exists at {path}",
            "classification": "verified_live_state",
            "confidence": "high",
            "source_type": "auditor",
            "source": path,
            "timestamp": dt.datetime.now(dt.timezone.utc).isoformat()
        })
        result["evidence_summary"]["facts"].append(f"Project exists at {path}")

        if state.get("is_git"):
            git = state.get("git", {})
            head = git.get("head")
            if head:
                result["verified_live_state"].append({
                    "claim": f"Current git branch is '{head}'",
                    "classification": "verified_live_state",
                    "confidence": "high",
                    "source_type": "git",
                    "source": f"{path}/.git/HEAD",
                    "timestamp": git.get("latest_commit_date") or dt.datetime.now(dt.timezone.utc).isoformat()
                })
                result["evidence_summary"]["facts"].append(f"On branch {head}")
            
            git_tags = git.get("tags", [])
            if git_tags:
                latest_tag = git_tags[-1]
                result["verified_git_evidence"].append({
                    "claim": f"Latest local tag is {latest_tag}",
                    "classification": "verified_git_evidence",
                    "confidence": "high",
                    "source_type": "git",
                    "source": f"{path}/.git/refs/tags/{latest_tag}",
                    "timestamp": git.get("latest_commit_date") or dt.datetime.now(dt.timezone.utc).isoformat()
                })
                result["evidence_summary"]["facts"].append(f"Latest tag is {latest_tag}")

            ahead = git.get("ahead", 0)
            if ahead > 0:
                result["verified_live_state"].append({
                    "claim": f"Local branch is ahead of upstream by {ahead} commit(s)",
                    "classification": "verified_live_state",
                    "confidence": "high",
                    "source_type": "git",
                    "source": "git status",
                    "timestamp": dt.datetime.now(dt.timezone.utc).isoformat()
                })
                result["evidence_summary"]["facts"].append(f"Ahead of upstream by {ahead} commit(s)")

            untracked = git.get("untracked", 0)
            modified = git.get("modified", 0)
            if untracked > 0 or modified > 0:
                result["verified_live_state"].append({
                    "claim": f"Working tree is dirty ({modified} modified, {untracked} untracked)",
                    "classification": "verified_live_state",
                    "confidence": "high",
                    "source_type": "git",
                    "source": "git status",
                    "timestamp": dt.datetime.now(dt.timezone.utc).isoformat()
                })
                result["evidence_summary"]["facts"].append(f"Dirty tree ({modified} mod, {untracked} untr)")

    # 2. History
    version_regex = re.compile(r"v\d+\.\d+(?:\.\d+)?")
    for session in history:
        title = session.get("title", "")
        thread_id = session.get("thread_id", "")
        created_at = session.get("created_at")
        
        # Soften overstatements
        lower_title = title.lower()
        if any(w in lower_title for w in ["completed", "finished", "finalized", "deployed", "production-ready", "fully integrated", "entirely"]):
            result["inferences"].append({
                "claim": f"Session '{title}' implies completion, but this is historically claimed intent, not a verified current state.",
                "classification": "inference",
                "confidence": "low",
                "source_type": "internal_logic",
                "source": thread_id,
                "timestamp": created_at
            })
            result["evidence_summary"]["inferences"].append(f"Session '{title}' claims completion, which remains unverified.")

        # Soften causal claims
        if any(w in lower_title for w in ["root cause", "caused the crash", "fixed the issue", "pcie", "aer"]):
            result["historical_session_evidence"].append({
                "claim": f"Session mentions investigating issues: {title}",
                "classification": "historical_session_evidence",
                "confidence": "medium",
                "source_type": "codex_session",
                "source": thread_id,
                "timestamp": created_at
            })
            result["evidence_summary"]["history"].append(f"Investigated possible contributor: {title}")
        else:
            result["historical_session_evidence"].append({
                "claim": f"Historical session: {title}",
                "classification": "historical_session_evidence",
                "confidence": "medium",
                "source_type": "codex_session",
                "source": thread_id,
                "timestamp": created_at
            })
            result["evidence_summary"]["history"].append(title)

        # Contradictions on tags vs sessions
        match = version_regex.search(title)
        if match and git_tags:
            session_version = match.group(0)
            if session_version not in git_tags:
                latest_tag = git_tags[-1]
                result["contradictions"].append({
                    "contradiction": True,
                    "topic": "version",
                    "evidence": [
                        {"value": session_version, "source": "historical_session", "source_id": thread_id},
                        {"value": latest_tag, "source": "git"}
                    ],
                    "preferred_evidence": "git",
                    "reason": "repository state is authoritative for released tags"
                })
                result["evidence_summary"]["contradictions"].append(f"Historical session mentions {session_version}, but latest git tag is {latest_tag}")

    # 3. GitHub Evidence
    for ev in github:
        ev_title = ev.get("title", "")
        ev_url = ev.get("git_origin_url") or "unknown"
        result["historical_imported_evidence"].append({
            "claim": f"GitHub Evidence: {ev_title}",
            "classification": "historical_imported_evidence",
            "confidence": "medium",
            "source_type": "github",
            "source": ev_url,
            "timestamp": ev.get("created_at")
        })
        result["evidence_summary"]["history"].append(f"GitHub evidence: {ev_title}")

    result["wording_guidance"] = [
        "When answering the user:",
        "- State verified facts plainly.",
        "- Attribute historical claims to retrieved sessions when appropriate.",
        "- Label inference explicitly.",
        "- Do not invent versions, dates, filenames, root causes, implementation details, or completion states.",
        "- If evidence conflicts, mention the conflict.",
        "- Prefer 'evidence suggests' over 'confirmed' unless the evidence actually confirms it."
    ]

    return result
