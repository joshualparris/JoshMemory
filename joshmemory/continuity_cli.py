from __future__ import annotations

import argparse
import json
from typing import Any

from .continuity import (
    acquire_work,
    append_work_event,
    get_active_lease,
    get_resume_brief,
    get_trust,
    heartbeat_work,
    list_leases,
    list_work_events,
    reclaim_work,
    release_work,
    set_trust,
)
from .paths import default_db_path


def _print(value: Any) -> None:
    print(json.dumps(value, indent=2, ensure_ascii=False))


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="joshmemory-continuity",
        description="JoshMemory coordination, trust governance and work journal commands.",
    )
    parser.add_argument("--db", default=str(default_db_path()), help="Local SQLite path when using local storage")
    sub = parser.add_subparsers(dest="command", required=True)

    claim = sub.add_parser("claim", help="Claim a project work item for a bounded lease")
    claim.add_argument("project")
    claim.add_argument("--owner", required=True)
    claim.add_argument("--work-key", default="default")
    claim.add_argument("--ttl", type=int, default=900)
    claim.add_argument("--canonical-repo", default="")
    claim.add_argument("--checkout-path", default="")
    claim.add_argument("--note", default="")

    heartbeat = sub.add_parser("heartbeat", help="Extend an active lease")
    heartbeat.add_argument("project")
    heartbeat.add_argument("--owner", required=True)
    heartbeat.add_argument("--work-key", default="default")
    heartbeat.add_argument("--ttl", type=int, default=900)
    heartbeat.add_argument("--canonical-repo", default="")
    heartbeat.add_argument("--note", default="")

    release = sub.add_parser("release", help="Release an active lease")
    release.add_argument("project")
    release.add_argument("--owner", required=True)
    release.add_argument("--work-key", default="default")
    release.add_argument("--canonical-repo", default="")
    release.add_argument("--note", default="")

    reclaim = sub.add_parser("reclaim", help="Record reclamation of an expired lease")
    reclaim.add_argument("project")
    reclaim.add_argument("--owner", required=True)
    reclaim.add_argument("--work-key", default="default")
    reclaim.add_argument("--canonical-repo", default="")
    reclaim.add_argument("--note", default="")

    leases = sub.add_parser("leases", help="List active or historical lease state")
    leases.add_argument("--project")
    leases.add_argument("--all", action="store_true", help="Include work keys without an active lease")

    active = sub.add_parser("lease", help="Show the active lease for one work item")
    active.add_argument("project")
    active.add_argument("--work-key", default="default")
    active.add_argument("--canonical-repo", default="")

    journal_add = sub.add_parser("journal-add", help="Append a concise redacted work event")
    journal_add.add_argument("project")
    journal_add.add_argument("event_type")
    journal_add.add_argument("summary")
    journal_add.add_argument("--details-json", default="{}")
    journal_add.add_argument("--canonical-repo", default="")
    journal_add.add_argument("--checkout-path", default="")
    journal_add.add_argument("--agent", default="")
    journal_add.add_argument("--source-ref", default="")

    journal = sub.add_parser("journal", help="List recent work events")
    journal.add_argument("project")
    journal.add_argument("--limit", type=int, default=20)
    journal.add_argument("--canonical-repo", default="")

    trust = sub.add_parser("trust", help="Append a trust decision for a memory record")
    trust.add_argument("target_id")
    trust.add_argument("level", choices=["UNTRUSTED", "VERIFIED", "APPROVED", "SYSTEM"])
    trust.add_argument("--actor", required=True)
    trust.add_argument("--actor-kind", required=True, choices=["agent", "human", "system"])
    trust.add_argument("--project", default="")
    trust.add_argument("--target-type", default="project_fact")
    trust.add_argument("--source-ref", default="")
    trust.add_argument("--note", default="")

    trust_show = sub.add_parser("trust-show", help="Show the current trust overlay for a record")
    trust_show.add_argument("target_id")

    resume = sub.add_parser("resume", help="Build one compact fresh-agent resume brief")
    resume.add_argument("project")
    resume.add_argument("--canonical-repo", default="")
    resume.add_argument("--checkout-path", default="")
    resume.add_argument("--machine")
    resume.add_argument("--agent", default="")
    resume.add_argument("--work-key", default="default")
    resume.add_argument("--event-limit", type=int, default=8)

    return parser


def main(argv: list[str] | None = None) -> int:
    args = _parser().parse_args(argv)
    db = str(args.db)

    if args.command == "claim":
        _print(
            acquire_work(
                db,
                args.project,
                args.owner,
                work_key=args.work_key,
                ttl_seconds=args.ttl,
                canonical_repo=args.canonical_repo,
                checkout_path=args.checkout_path,
                note=args.note,
            )
        )
    elif args.command == "heartbeat":
        _print(
            heartbeat_work(
                db,
                args.project,
                args.owner,
                work_key=args.work_key,
                ttl_seconds=args.ttl,
                canonical_repo=args.canonical_repo,
                note=args.note,
            )
        )
    elif args.command == "release":
        _print(
            release_work(
                db,
                args.project,
                args.owner,
                work_key=args.work_key,
                canonical_repo=args.canonical_repo,
                note=args.note,
            )
        )
    elif args.command == "reclaim":
        _print(
            reclaim_work(
                db,
                args.project,
                args.owner,
                work_key=args.work_key,
                canonical_repo=args.canonical_repo,
                note=args.note,
            )
        )
    elif args.command == "leases":
        _print(list_leases(db, project=args.project, active_only=not args.all))
    elif args.command == "lease":
        _print(
            get_active_lease(
                db,
                args.project,
                work_key=args.work_key,
                canonical_repo=args.canonical_repo,
            )
        )
    elif args.command == "journal-add":
        try:
            details = json.loads(args.details_json)
        except json.JSONDecodeError as exc:
            raise SystemExit(f"--details-json is not valid JSON: {exc}") from exc
        if not isinstance(details, dict):
            raise SystemExit("--details-json must decode to an object")
        _print(
            append_work_event(
                db,
                args.project,
                args.event_type,
                args.summary,
                details=details,
                canonical_repo=args.canonical_repo,
                checkout_path=args.checkout_path,
                agent=args.agent,
                source_ref=args.source_ref,
            )
        )
    elif args.command == "journal":
        _print(
            list_work_events(
                db,
                args.project,
                limit=args.limit,
                canonical_repo=args.canonical_repo,
            )
        )
    elif args.command == "trust":
        _print(
            set_trust(
                db,
                args.target_id,
                args.level,
                project=args.project,
                target_type=args.target_type,
                actor=args.actor,
                actor_kind=args.actor_kind,
                source_ref=args.source_ref,
                note=args.note,
            )
        )
    elif args.command == "trust-show":
        _print(get_trust(db, args.target_id))
    elif args.command == "resume":
        _print(
            get_resume_brief(
                db,
                args.project,
                canonical_repo=args.canonical_repo,
                checkout_path=args.checkout_path,
                machine=args.machine,
                current_agent=args.agent,
                work_key=args.work_key,
                event_limit=args.event_limit,
            )
        )
    else:  # pragma: no cover - argparse guarantees a command
        raise SystemExit(f"Unknown command: {args.command}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
