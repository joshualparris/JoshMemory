#!/usr/bin/env python3
"""Validate the canonical values queue against its registry (stdlib only)."""
from __future__ import annotations

import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
QUEUE = ROOT / "docs/MASTER_20_AGENT_EXECUTION_QUEUE_2026-10-25.csv"
REGISTRY = ROOT / "docs/VALUES_ALIGNMENT_TASKS_2026-11-14.csv"
FIELDS = ("execution_rank", "task_id", "priority", "workstream", "action",
          "status", "dependency_ids", "item_type", "source_registry")
REGISTRY_FIELDS = FIELDS[1:]


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def read_rows(path: Path, fields: tuple[str, ...]) -> list[dict[str, str]]:
    with path.open(encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream)
        require(tuple(reader.fieldnames or ()) == fields,
                f"{path.name}: incorrect header")
        rows = list(reader)
    require(bool(rows), f"{path.name}: empty")
    for number, row in enumerate(rows, 2):
        require(None not in row and None not in row.values(),
                f"{path.name}:{number}: missing/extra CSV field")
        require(all(str(v).strip() for k, v in row.items()
                    if k in ("task_id", "priority", "workstream", "action", "status", "item_type")),
                f"{path.name}:{number}: required field blank")
    return rows


def check() -> str:
    queue = read_rows(QUEUE, FIELDS)
    registry = read_rows(REGISTRY, REGISTRY_FIELDS)

    ids = [r["task_id"] for r in queue]
    require(len(ids) == len(set(ids)), "duplicate task ID in queue")

    ranks = []
    for row in queue:
        raw = row["execution_rank"]
        require(raw.lstrip("-").isdigit(), f"invalid rank {raw!r}")
        ranks.append(int(raw))
    require(len(ranks) == len(set(ranks)), "duplicate execution rank")
    require(ranks == sorted(ranks), "execution order is not numerically sorted")

    governance = [r for r in queue if r["item_type"] == "GOVERNANCE"]
    required_governance = [f"VAL-{i:03d}" for i in range(17, 27)]
    require([r["task_id"] for r in queue[:10]] == required_governance,
            "P0 governance rows must precede the action backlog")
    require([int(r["execution_rank"]) for r in queue[:10]] == list(range(-10, 0)),
            "governance ranks must be -10 through -1")
    require([r["task_id"] for r in governance] == required_governance,
            "missing, extra or misordered governance task")
    require(all(r["priority"] == "P0" and r["status"] == "OPEN" for r in governance),
            "governance priorities/statuses changed; review explicitly")

    positive = [r for r in queue if int(r["execution_rank"]) > 0]
    require([int(r["execution_rank"]) for r in positive] ==
            list(range(1, len(positive) + 1)),
            "positive execution ranks must remain consecutive")
    require(positive[0]["task_id"] == "SVA-008",
            "first implementation task changed without an explicit re-triage")

    reg_ids = [r["task_id"] for r in registry]
    require(len(reg_ids) == len(set(reg_ids)), "duplicate registry task ID")
    require(set(f"VAL-{i:03d}" for i in range(1, 27)).issubset(reg_ids),
            "missing established values tasks in registry")
    by_id = {r["task_id"]: r for r in queue}
    for row in registry:
        task_id = row["task_id"]
        require(task_id in by_id, f"{task_id}: missing from queue")
        for key in REGISTRY_FIELDS:
            # Different text descriptions between master queue and its short
            # registry are permitted, but identity/control fields must match.
            if key in ("priority", "status", "dependency_ids", "item_type"):
                require(row[key] == by_id[task_id][key],
                        f"{task_id}: inconsistent {key}")
        for dep in row["dependency_ids"].split(";"):
            require(not dep or dep in by_id,
                    f"{task_id}: unknown dependency {dep}")
    return f"PASS: {len(queue)} unique ranked tasks; {len(governance)} P0 gates first; {len(registry)} values rows reconciled"


if __name__ == "__main__":
    try:
        print(check())
    except (ValueError, OSError, csv.Error) as exc:
        raise SystemExit(f"FAIL: {exc}") from exc
