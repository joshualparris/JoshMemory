from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from .index import get_session, index_all, project_history, recent_work, search_sessions
from .app_links import import_app_links
from .github_evidence import github_evidence, import_github_evidence
from .paths import default_db_path, default_sessions_dir
from .seed import import_seed_file
from .chatgpt import import_chatgpt_export
from .historical import earliest_activity, historical_search
from .facts import project_fact_add, project_fact_search, accountability_reference_add, accountability_reference_search


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="joshmemory")
    parser.add_argument("--db", type=Path, default=default_db_path())
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_index = sub.add_parser("index")
    p_index.add_argument("--sessions-dir", type=Path, default=default_sessions_dir())
    p_index.add_argument("--force", action="store_true", help="Rebuild JoshMemory's SQLite index.")

    p_search = sub.add_parser("search")
    p_search.add_argument("query")
    p_search.add_argument("--limit", type=int, default=10)

    p_get = sub.add_parser("get-session")
    p_get.add_argument("thread_id")
    p_get.add_argument("--limit-events", type=int, default=80)

    p_hist = sub.add_parser("project-history")
    p_hist.add_argument("project")
    p_hist.add_argument("--limit", type=int, default=30)

    p_recent = sub.add_parser("recent-work")
    p_recent.add_argument("--limit", type=int, default=10)

    p_seed = sub.add_parser("import-seed")
    p_seed.add_argument("path", type=Path)

    p_chatgpt = sub.add_parser("import-chatgpt")
    p_chatgpt.add_argument("path", type=Path, help="ChatGPT export directory or conversations.json")
    p_chatgpt.add_argument("--dry-run", action="store_true")

    p_links = sub.add_parser("import-app-links")
    p_links.add_argument("path", type=Path)

    p_github = sub.add_parser("import-github-evidence")
    p_github.add_argument("path", type=Path)

    p_github_query = sub.add_parser("github-evidence")
    p_github_query.add_argument("--project")
    p_github_query.add_argument("--limit", type=int, default=100)

    p_historical = sub.add_parser("historical-search")
    p_historical.add_argument("query")
    p_historical.add_argument("--limit", type=int, default=20)

    p_earliest = sub.add_parser("earliest-activity")
    p_earliest.add_argument("activity", nargs="?", default="coding")

    p_add_fact = sub.add_parser("add-fact")
    p_add_fact.add_argument("--project", required=True)
    p_add_fact.add_argument("--machine")
    p_add_fact.add_argument("--subject", required=True)
    p_add_fact.add_argument("--fact", required=True)
    p_add_fact.add_argument("--status", required=True)
    p_add_fact.add_argument("--confidence", type=float)
    p_add_fact.add_argument("--observed-at")
    p_add_fact.add_argument("--source-type", required=True)
    p_add_fact.add_argument("--source-ref")
    p_add_fact.add_argument("--supersedes")
    
    p_search_fact = sub.add_parser("search-facts")
    p_search_fact.add_argument("query")
    p_search_fact.add_argument("--project")
    p_search_fact.add_argument("--all", action="store_true", help="Include inactive facts")

    p_add_acc = sub.add_parser("add-accountability")
    p_add_acc.add_argument("--project", required=True)
    p_add_acc.add_argument("--claim-summary", required=True)
    p_add_acc.add_argument("--source-system", required=True)
    p_add_acc.add_argument("--source-id", required=True)
    p_add_acc.add_argument("--requirement-id")
    p_add_acc.add_argument("--source-ref")
    p_add_acc.add_argument("--reviewer")
    p_add_acc.add_argument("--verdict")
    p_add_acc.add_argument("--commit-sha")
    p_add_acc.add_argument("--supersedes")

    p_search_acc = sub.add_parser("search-accountability")
    p_search_acc.add_argument("query")
    p_search_acc.add_argument("--project")
    p_search_acc.add_argument("--all", action="store_true", help="Include inactive claims")

    args = parser.parse_args(argv)
    if args.cmd == "index":
        return print_json(index_all(args.db, args.sessions_dir, force=args.force))
    if args.cmd == "search":
        return print_json(search_sessions(args.query, limit=args.limit, db_path=args.db))
    if args.cmd == "get-session":
        result = get_session(args.thread_id, limit_events=args.limit_events, db_path=args.db)
        return print_json(result or {"error": "not_found", "thread_id": args.thread_id})
    if args.cmd == "project-history":
        return print_json(project_history(args.project, limit=args.limit, db_path=args.db))
    if args.cmd == "recent-work":
        return print_json(recent_work(limit=args.limit, db_path=args.db))
    if args.cmd == "import-seed":
        return print_json(import_seed_file(args.path, db_path=args.db))
    if args.cmd == "import-chatgpt":
        return print_json(import_chatgpt_export(args.path, db_path=args.db, dry_run=args.dry_run))
    if args.cmd == "import-app-links":
        return print_json(import_app_links(args.path, db_path=args.db))
    if args.cmd == "import-github-evidence":
        return print_json(import_github_evidence(args.path, db_path=args.db))
    if args.cmd == "github-evidence":
        return print_json(github_evidence(project=args.project, limit=args.limit, db_path=args.db))
    if args.cmd == "historical-search":
        return print_json(historical_search(args.query, limit=args.limit, db_path=args.db))
    if args.cmd == "earliest-activity":
        return print_json(earliest_activity(args.activity, db_path=args.db))
    if args.cmd == "add-fact":
        return print_json(project_fact_add(args.db, args.project, args.subject, args.fact, args.status, args.confidence, args.observed_at, args.source_type, args.source_ref, args.machine, args.supersedes))
    if args.cmd == "search-facts":
        return print_json(project_fact_search(args.db, args.query, args.project, active_only=not args.all))
    if args.cmd == "add-accountability":
        return print_json(accountability_reference_add(
            args.db, args.project, args.claim_summary, args.source_system, args.source_id,
            args.requirement_id, args.source_ref, args.reviewer, args.verdict, args.commit_sha, args.supersedes
        ))
    if args.cmd == "search-accountability":
        return print_json(accountability_reference_search(args.db, args.query, args.project, active_only=not args.all))
    parser.error("unreachable")
    return 2


def print_json(value: Any) -> int:
    print(json.dumps(value, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
