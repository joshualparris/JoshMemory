#!/usr/bin/env python3
"""Inventory explicit unfinished tasks across every tracked text file.

No changes to existing task IDs or task status. Older source-reported work is not
independent evidence that a bug still exists. Unnumbered candidates get stable,
monotonically allocated JMU IDs in a maintained cross-run registry.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import re
import subprocess
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUTPUT_CSV = "docs/JOSHMEMORY_OPEN_TASK_REGISTER.csv"
OUTPUT_IDS = "docs/JOSHMEMORY_UNNUMBERED_TASK_IDS.json"
OUTPUT_REPORT = "docs/WHOLE_REPO_OPEN_WORK_2026-11-05.md"
GITHUB = "https://github.com/joshualparris/JoshMemory/blob/main/"
MASTER = "docs/MASTER_20_AGENT_EXECUTION_QUEUE_2026-10-25.csv"
EXISTING_STEPS = "docs/PORTFOLIO_TRIAGE_TASK_STEPS_2026-10-25.csv"
GITHUB_SNAPSHOT = "docs/WHOLE_REPO_GITHUB_OPEN_2026-11-05.json"
SKIP_PATHS = {OUTPUT_CSV, OUTPUT_IDS, OUTPUT_REPORT, GITHUB_SNAPSHOT, MASTER, EXISTING_STEPS}
SKIP_NAMES = {"COORDINATION.md", "WORK_CHECKPOINT.md", "PARALLEL_AGENT_COORDINATION.md", "codingprinciples.md", "CODINGPRINCIPLES.md"}
TEXT_SUFFIXES = {".md", ".mdx", ".txt", ".csv", ".json", ".py", ".js", ".mjs", ".cjs",
                 ".ts", ".tsx", ".jsx", ".html", ".css", ".scss", ".sh",
                 ".ps1", ".yaml", ".yml", ".toml", ".sql"}
CODE_SUFFIXES = {".py", ".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx",
                 ".html", ".css", ".scss", ".sh", ".ps1", ".yaml", ".yml", ".toml", ".sql"}
OPEN_STATES = {"OPEN", "PENDING", "TODO", "PLANNED", "IN_PROGRESS", "IN PROGRESS",
               "PARTIAL", "PARTIALLY COMPLETE", "BLOCKED", "UNVERIFIED", "NOT STARTED"}
ID_RE = re.compile(r"\b(?:[A-Z][A-Z0-9]{1,12}(?:-[A-Z0-9]{1,12}){0,3})-(?:\d{2,5}|[A-Z]{1,6}\d{2,5})(?:\.\d{1,2})?\b")
CHECK_RE = re.compile(r"^\s*(?:[-*+]\s+|\d+[.)]\s+)\[\s\]\s*(.+)", re.I)
COMMENT_TODO_RE = re.compile(r"(?:^\s*(?://|#|/\*+|\*|<!--|--)\s*|\s+//\s*)(?:TODO|FIXME|XXX|HACK)\b\s*:?\s*(.*)", re.I)
STATUS_ROW_RE = re.compile(r"\b(?:OPEN|IN PROGRESS|IN_PROGRESS|PENDING|BLOCKED|NOT STARTED|NOT IMPLEMENTED)\b", re.I)
HEADING_TASK_RE = re.compile(r"^\s*#{2,5}\s+\d{1,3}[.)]\s+(.+?)\s*$")
STATUS_BULLET_RE = re.compile(r"^\s*[-*]\s+(?:\*\*)?(?:OPEN|PENDING|BLOCKED|TODO|IN PROGRESS)(?:\*\*)?[\s:—–-]+(.+)", re.I)
UNCLEAR_SOURCE_RE = re.compile(r"(?i)TODO|TASK|BACKLOG|ROADMAP|TRIAGE|IMPROVEMENT|PLAN|NEXT_ACTION|REMAIN|WORK_QUEUE")
SKIP_PARTS = {"node_modules", ".git", "dist", "test-results", "coverage", ".next", "PULL_REQUEST_TEMPLATE",
              ".vercel", "vendor", "screenshots", "conversations", "output"}
REF_STATES = {"REFERENCE_NOT_ACTIONABLE", "COMPLETED", "CLOSED", "VERIFIED_COMPLETE"}

def tracked_paths():
    found = subprocess.check_output(["git", "ls-files", "-z"], cwd=ROOT)
    return sorted(x for x in found.decode("utf-8", "replace").split("\x00") if x)

def normal(text):
    return re.sub(r"\s+", " ", re.sub(r"\[([ xX])\]", "", text)).strip(" -*\t")

def fingerprint(path, title):
    # Path + actual work contract is stable if lines move. Preserve IDs across runs.
    return hashlib.sha256((path + "\n" + normal(title).lower()).encode()).hexdigest()[:20]

def existing_task_id(text):
    values = ID_RE.findall(text[:145])
    return values[0] if values else None

def priority_for(text, path, original=""):
    if original in {"P0", "P1", "P2", "P3"}:
        return original
    raw = (text + " " + path).lower()
    if re.search(r"\b(privacy leak|exposed secret|credential exposure|data loss|corrupt save|crash on launch|security vulnerability|unsafe access)\b", raw):
        return "P0"
    if re.search(r"\b(crash|collision|blocking road|invisible wall|broken deployment|release gate|broken login|failed privacy|fatal|broken navigation)\b", raw):
        return "P1"
    if re.search(r"\b(uncertain|review|audit|document|inventory|research|reconcile)\b", raw):
        return "P2"
    if re.search(r"\b(photo|building|geometry|street|performance|mobile|access|footpath|navigation|dialogue|audio|gameplay|rail|safety)\b", raw):
        return "P1"
    return "P2"

def level(item):
    p = item["priority"]
    return {"P0": 0, "P1": 1, "P2": 2, "P3": 3, "REF": 4}.get(p, 3)

def source(path, line=0):
    return GITHUB + path + (("#L" + str(line)) if line else "")

def task(title, path, line=0, kind="markdown_checkbox", stated="SOURCE_REPORTED_OPEN",
         given_id=None, priority="", evidence="source-report"):
    return {
        "task_id": given_id or "",
        "title": normal(title)[:500],
        "priority": priority_for(title, path, priority),
        "state": stated,
        "origin": kind,
        "source_file": path,
        "source_line": line,
        "source_url": source(path, line),
        "evidence": evidence,
        "fingerprint": fingerprint(path, title),
        "repo_scope": "repository-town" if path.startswith("repository-town/") else "JoshMemory/portfolio",
    }

def read_text(path):
    p = ROOT / path
    if p.stat().st_size > 2_000_000:
        return None
    raw = p.read_bytes()
    if b"\0" in raw[:8192]:
        return None
    try:
        return raw.decode("utf-8")
    except UnicodeDecodeError:
        return None

def scan_markdown(path, text):
    items = []
    lines = text.splitlines()
    for n, line in enumerate(lines, 1):
        match = CHECK_RE.match(line)
        if match:
            s = match.group(1)
            # Continuation lines belong to the same checkbox, not new tasks.
            # Only join indented prose and stop at headings or other list items.
            for following in lines[n:n+5]:
                if re.match(r"^\s*(?:[-*+]\s+|\d+[.)]\s+|#{1,6}\s+)", following):
                    break
                if not following.strip() or len(s) >= 480:
                    break
                if following.startswith("  ") or following.startswith("\t"):
                    s += " " + following.strip()
                else:
                    break
            item = task(s, path, n, given_id=existing_task_id(s))
            item['fingerprint'] = fingerprint(path, match.group(1))  # Stable despite wrapped text
            items.append(item)
            continue
        match = STATUS_BULLET_RE.match(line)
        if match and UNCLEAR_SOURCE_RE.search(path):
            s = match.group(1)
            items.append(task(s, path, n, "status_bullet", "REVIEW_SOURCE_STATUS",
                              existing_task_id(s)))
            continue
        match = HEADING_TASK_RE.match(line)
        if match and UNCLEAR_SOURCE_RE.search(path):
            s = match.group(1)
            items.append(task(s, path, n, "numbered_action_heading", "REVIEW_SOURCE_STATUS",
                              existing_task_id(s)))
            continue
        # Only task-like markdown tables; historic report text is not a confirmed current task.
        if line.lstrip().startswith("|") and UNCLEAR_SOURCE_RE.search(path) and STATUS_ROW_RE.search(line):
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            if len(cells) >= 3 and any(re.match(r"^(OPEN|BLOCKED|PENDING|NOT IMPLEMENTED|IN.PROGRESS)", c, re.I) for c in cells):
                meaningful = [c for c in cells if len(c) > 12 and not re.match(r"^(https?://|OPEN|BLOCKED|PENDING|NOT IMPLEMENTED)", c, re.I)]
                if meaningful:
                    title = max(meaningful, key=lambda c: len(c))
                    if len(title) > 500:
                        title = title[:500]
                    items.append(task(title, path, n, "status_table", "REVIEW_SOURCE_STATUS",
                                      existing_task_id(line)))
    return items

def scan_csv(path, text):
    if not UNCLEAR_SOURCE_RE.search(path):
        return []
    try:
        rows = list(csv.DictReader(io.StringIO(text)))
    except (csv.Error, UnicodeError):
        return []
    if not rows or len(rows) > 7000:
        return []
    items = []
    for idx, row in enumerate(rows, 2):
        state = str(row.get("status") or row.get("state") or row.get("Status") or "").strip().upper().replace("-", "_")
        if not any(state.startswith(x.replace(" ", "_")) for x in OPEN_STATES):
            continue
        title = next((str(row.get(k) or "").strip() for k in ["action", "task", "work_item", "title", "description", "next_action", "summary"] if row.get(k)), "")
        if not title:
            continue
        rid = next((str(row.get(k) or "").strip() for k in ["task_id", "step_id", "id", "ID"] if row.get(k)), "")
        rid = rid if ID_RE.fullmatch(rid) else ""
        items.append(task(title, path, idx, "csv_status", "SOURCE_REPORTED_OPEN", rid or existing_task_id(title),
                          str(row.get("priority") or "")))
    return items

def scan_json(path, text):
    if not UNCLEAR_SOURCE_RE.search(path):
        return []
    try:
        document = json.loads(text)
    except (ValueError, UnicodeError):
        return []
    items = []
    def visit(node, depth=0):
        if depth > 12 or len(items) > 10000:
            return
        if isinstance(node, list):
            for e in node: visit(e, depth + 1)
        elif isinstance(node, dict):
            st = str(node.get("status") or node.get("state") or "").upper().replace("-", "_")
            title = next((str(node.get(k) or "").strip() for k in ("action", "task", "title", "description", "work_item", "name") if node.get(k)), "")
            if title and any(st.startswith(x.replace(" ", "_")) for x in OPEN_STATES):
                rid = str(node.get("task_id") or node.get("id") or "")
                rid = rid if ID_RE.fullmatch(rid) else ""
                items.append(task(title, path, 0, "json_status", "SOURCE_REPORTED_OPEN", rid or existing_task_id(title),
                                  str(node.get("priority") or "")))
            for v in node.values():
                if isinstance(v, (list, dict)): visit(v, depth + 1)
    visit(document)
    return items

def scan_code(path, text):
    items = []
    for n, line in enumerate(text.splitlines(), 1):
        if len(line) > 600:
            continue
        match = COMMENT_TODO_RE.search(line)
        if match:
            s = match.group(1).strip(" */\t")
            if len(s) < 8:
                continue
            items.append(task(s, path, n, "code_comment", "NEEDS_REVIEW_NOT_VERIFIED_OPEN",
                              existing_task_id(s), evidence="code-comment-only"))
    return items

def load_master():
    result = {}
    with (ROOT / MASTER).open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            rid = row["task_id"]
            state = row["status"]
            if state in REF_STATES:
                continue
            result[rid] = task(row["action"], MASTER, int(row["execution_rank"])+1,
                               "legacy_master_2026_10_25", "SOURCE_REPORTED_" + state,
                               rid, row["priority"], evidence="historical-2026-10-25-unverified")
            result[rid]["legacy_rank"] = row["execution_rank"]
            result[rid]["workstream"] = row["workstream"]
            result[rid]["dependencies"] = row["dependency_ids"]
    return result

def read_id_map():
    path = ROOT / OUTPUT_IDS
    if not path.is_file():
        return {"schema_version": 1, "next_number": 1, "ids": {}}
    doc = json.loads(path.read_text(encoding="utf-8"))
    assert doc["schema_version"] == 1
    return doc

def scan(paths):
    found = []
    stats = Counter()
    for path in paths:
        stats["tracked_files"] += 1
        parts = Path(path).parts
        if path in SKIP_PATHS or any(x in SKIP_PARTS for x in parts) or Path(path).name in SKIP_NAMES:
            stats["skipped_metadata_or_historic"] += 1
            continue
        suffix = Path(path).suffix.lower()
        if suffix not in TEXT_SUFFIXES:
            stats["skipped_nontext_extensions"] += 1
            continue
        s = read_text(path)
        if s is None:
            stats["skipped_binary_or_large"] += 1
            continue
        stats["text_files_scanned"] += 1
        if suffix in {".md", ".mdx", ".txt"}:
            extracted = scan_markdown(path, s)
        elif suffix == ".csv":
            extracted = scan_csv(path, s)
        elif suffix == ".json":
            extracted = scan_json(path, s)
        elif suffix == ".html":
            # Embedded/minified third-party libraries contain upstream TODOs;
            # those are not actionable tasks owned by JoshMemory.
            extracted = []
        else:
            extracted = scan_code(path, s)
        stats["extracted_source_entries"] += len(extracted)
        found.extend(extracted)
    return found, stats

def merge_tasks(master, discovered, mapping):
    current_ids = set(master)
    by_id = dict(master)
    unnumbered = {}
    ambiguous = []
    for item in discovered:
        rid = item["task_id"]
        if rid:
            if rid in by_id:
                # Existing canonical task: append a source reference rather than generating a new ID.
                continue
            by_id[rid] = item
            current_ids.add(rid)
        else:
            key = item["fingerprint"]
            unnumbered.setdefault(key, item)
    # Allocate stable sequential identifiers without conflicting with any ID anywhere.
    used = set(current_ids) | {record["id"] for record in mapping["ids"].values()}
    for key, item in sorted(unnumbered.items(), key=lambda x: (x[1]["source_file"], x[1]["source_line"], x[0])):
        previous = mapping["ids"].get(key)
        if previous:
            rid = previous["id"]
        else:
            while True:
                rid = "JMU-" + str(mapping["next_number"]).zfill(5)
                mapping["next_number"] += 1
                if rid not in used:
                    break
            mapping["ids"][key] = {
                "id": rid,
                "source_file": item["source_file"],
                "title_at_allocation": item["title"],
            }
        if rid in by_id:
            ambiguous.append({"id": rid, "source": item["source_file"]})
            continue
        item["task_id"] = rid
        by_id[rid] = item
        used.add(rid)
    if ambiguous:
        raise ValueError("Number collision: " + repr(ambiguous[:6]))
    rows = sorted(by_id.values(), key=lambda x: (
        level(x),
        0 if x["origin"] == "legacy_master_2026_10_25" else 1,
        x.get("legacy_rank", "99999"),
        x["task_id"],
    ))
    return rows

def snapshot_rows():
    filename = ROOT / GITHUB_SNAPSHOT
    if not filename.exists():
        return []
    raw = json.loads(filename.read_text(encoding="utf-8"))
    return raw.get("open_issues", []) + raw.get("open_prs", [])

def generated_report(rows, stats, issues):
    by_origin = Counter(r["origin"] for r in rows)
    by_priority = Counter(r["priority"] for r in rows)
    generated = [r for r in rows if r["task_id"].startswith("JMU-")]
    existing = [r for r in rows if not r["task_id"].startswith("JMU-")]
    github = sorted(issues, key=lambda x: (x["kind"] != "issue", -int(x["number"])))
    lines = [
        "# JoshMemory — Whole-repository outstanding work and priority register",
        "",
        "**Audit date:** 5 November 2026 (AEDT). **Source baseline:** JoshMemory main at audit start; generated in a dedicated audit branch.",
        "**Status:** DOCUMENTARY INVENTORY. An OPEN task in a dated tracker is NOT proof the defect still exists; verify current source and deployments before implementation.",
        "",
        "## Scope and what is actually numbered",
        "",
        f"- Tracked repository files seen: **{stats['tracked_files']:,}**; text files scanned: **{stats['text_files_scanned']:,}**.",
        f"- Explicit unfinished items found in tracked text files (before existing-ID reconciliation): **{stats['extracted_source_entries']:,}**.",
        f"- Canonical *source-reported* outstanding entries from legacy and newer registers: **{len(existing):,}** (existing IDs preserved).",
        f"- **{len(generated):,} NEW permanent JMU IDs** assigned to distinct formerly unnumbered explicit checkboxes, work headings, task-status rows or code comments.",
        f"- Total uniquely keyed source-reported records in generated CSV: **{len(rows):,}**. GitHub open issues and PRs are separate numbered tracks; they may overlap these tasks.",
        f"- Existing task IDs were not renamed, renumbered or marked complete. Generated tasks retain source file and line references.",
        "",
        "**Coverage limits:** This scans the current JoshMemory checkout, not live source trees in the 233+ other repositories referenced by the old portfolio registry. Code comments and decades-old plans are *review candidates*, not independently verified current defects. Unmarked ideas in prose, private connector-only records and untracked files cannot be guaranteed complete. The legacy master is a 25 Oct snapshot; dependency and priority changes after that date are not silently inferred.",
        "",
        "## First action — current blocking work, not new feature count",
        "",
        "The following is the **repo-local triage order**, not a change to the permanent ID order in the 25 Oct cross-portfolio master. Start with an unclaimed task and verify the symptom before editing.",
        "",
        "| Order | Priority | Existing reference | Action / why now |",
        "|---:|:---:|---|---|",
        "| 1 | P0 | [PR #371](https://github.com/joshualparris/JoshMemory/pull/371) | Fix proven invisible road/farm collision barriers; verify actual driving lanes and preserve valid fences. |",
        "| 2 | P0 | [NR-REAL-018](repository-town/docs/NARROMINE_REALISM_CHECKLIST_2026-11-05.md) | Audit collision volumes against actual road and building polygons; keep player/vehicle routes usable. |",
        "| 3 | P0 | RTN-007, RTN-009, RTN-011 | Reconfirm historical crowd/NPC collision and release blockers against current main; close or correct stale status before duplicate code. |",
        "| 4 | P1 | [PR #363](https://github.com/joshualparris/JoshMemory/pull/363) | Phone driving HUD/compass controls must not overlap, hiding navigation. |",
        "| 5 | P1 | [NR-REAL-002](repository-town/docs/NARROMINE_REALISM_CHECKLIST_2026-11-05.md) | Complete actual Narromine walking/interactive WebGL playtest; a source audit is not a walk. |",
        "| 6 | P1 | [PR #377](https://github.com/joshualparris/JoshMemory/pull/377) | Remove unsupported north Dandaloo furniture *locations* without removing observed real trees/lamps. |",
        "| 7 | P1 | [PR #366](https://github.com/joshualparris/JoshMemory/pull/366) | Correct unsupported hotel façade-blocking tree; review photographic provenance. |",
        "| 8 | P1 | [Issue #332](https://github.com/joshualparris/JoshMemory/issues/332), [PR #358](https://github.com/joshualparris/JoshMemory/pull/358) | Finish the 55-view main-street building evidence register and corrected façades, one building at a time. |",
        "| 9 | P1 | [Issue #355](https://github.com/joshualparris/JoshMemory/issues/355) | Audit Coles' real public entrance and interior evidence; avoid presenting fictional plan as true. |",
        "| 10 | P1 | [NR-REAL-003/004/005](repository-town/docs/NARROMINE_REALISM_CHECKLIST_2026-11-05.md) | Replace unsupported building stand-ins and reconcile geospatial transforms/footprint evidence before mass architecture. |",
        "| 11 | P1 | [RTGEO-005/007](repository-town/docs/REPOSITORY_TOWN_GEOGRAPHY_TODO.md) | Distinguish real flooding, water supply and ground data from fictional-world planning. |",
        "| 12 | P1 | JMU-00009 / JMU-00011 | Verify whether a one-call resume packet and active-agent lease registry already exist; otherwise implement without duplicating coordination services. |",
        "| 13 | P2 | [PR #376](https://github.com/joshualparris/JoshMemory/pull/376) | Complete rail-yard playability and evidence-based crossing behaviour after road/navigation safety. |",
        "| 14 | P2 | [PR #359](https://github.com/joshualparris/JoshMemory/pull/359), [Issue #157](https://github.com/joshualparris/JoshMemory/issues/157) | Finish the fictional 195-home park access / council planning evidence without claiming legal approvals. |",
        "",
        "### Cross-portfolio priority retained (historical as of 25 Oct)",
        "",
        "- The [existing 2,663-ID cross-portfolio master](MASTER_20_AGENT_TRIAGE_2026-10-25.md) places SylvieApp recorded-audio tasks **SVA-008** and **SVA-012** first at Josh's previous request; retain those IDs and priority *for that separate project*. Its 2,640 actionable/blocked rows do not equate to 2,640 confirmed code defects.",
        "- Do not shift restricted/private repository names into this public register. Live external repository statuses need their own connector or repo verification.",
        "",
        "## Current GitHub open issue/PR queue (snapshot)",
        "",
        "| Type | Number | Priority | Work |",
        "|---|---:|:---:|---|",
    ]
    for entry in github:
        title = str(entry["title"]).replace("|", "/").replace("\n", " ")
        num = int(entry["number"])
        kind = entry["kind"]
        p = {"371":"P0","363":"P1","377":"P1","366":"P1","358":"P1","355":"P1","332":"P1","376":"P2","359":"P2","157":"P2"}.get(str(num), "P2")
        address = "pull" if kind == "pr" else "issues"
        lines.append(f"| {kind.upper()} | [{num}](https://github.com/joshualparris/JoshMemory/{address}/{num}) | {p} | {title} |")
    lines += [
        "",
        "## Newly numbered unfinished work — review register",
        "",
        "These are task IDs, **not** claims of independently verified unresolved bugs. Do not renumber on subsequent scans.",
        "",
        "| Priority | Permanent ID | Status/evidence | Extracted source action | Source |",
        "|:---:|---|---|---|---|",
    ]
    for row in sorted(generated, key=lambda x:(level(x), x["task_id"])):
        label = row["title"].replace("|", "/").replace("\n", " ")
        if len(label) > 170: label = label[:166]+"…"
        lines.append(f"| {row['priority']} | {row['task_id']} | {row['state']} | {label} | [source]({row['source_url']}) |")
    lines += [
        "",
        "## Audit counts and ownership",
        "",
        "| Priority | Source-reported count |",
        "|---|---:|",
    ]
    for p in ["P0","P1","P2","P3","REF"]:
        lines.append(f"| {p} | {by_priority[p]:,} |")
    lines += [
        "",
        "### Counts by extraction family",
        "",
        "| Source family | Count |",
        "|---|---:|",
    ]
    for kind, count in sorted(by_origin.items(),key=lambda x:(-x[1],x[0])):
        lines.append(f"| {kind} | {count:,} |")
    lines += [
        "",
        "## Reconciliation / next review actions",
        "",
        "1. Verify high-priority tasks on **latest** main, production SHA and real desktop/Android-sized gameplay. If already fixed, update the **canonical original tracker**, not only this mirror.",
        "2. Check and reconcile any reused IDs that refer to different subtasks in historic sources; never infer that two different prefixes mean the same task.",
        "3. Assign claims by **feature**, not geographic monopoly, under [Repository Town parallel-agent rules](repository-town/docs/PARALLEL_AGENT_COORDINATION.md). Do not overwrite other agents' branches.",
        "4. Review the generated JMU candidates and remove false positives only with a recorded reason. Keep allocated IDs in the ID map as reserved, even after closure, to prevent reuse.",
        "5. Refresh the GitHub snapshot and the underlying canonical portfolio/task sources before making future changes. The generated CSV is a **triage index**, not a replacement for source-of-truth ownership, statuses or completion evidence.",
        "",
        "Generated by tools/audit_open_tasks.py, with reproducible inputs and stable cross-run ID allocation.",
        "",
    ]
    return "\n".join(lines)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--write", action="store_true")
    args = ap.parse_args()
    paths = tracked_paths()
    scanned, stats = scan(paths)
    existing = load_master()
    mapping = read_id_map()
    rows = merge_tasks(existing, scanned, mapping)
    ids = [r["task_id"] for r in rows]
    assert len(ids) == len(set(ids)), "duplicate task IDs"
    snapshot = snapshot_rows()
    assert all("number" in r and "kind" in r for r in snapshot), "bad GitHub snapshot"
    report = generated_report(rows, stats, snapshot)
    columns = ["task_id","priority","state","title","origin","source_file","source_line",
               "source_url","repo_scope","evidence","legacy_rank","workstream","dependencies"]
    if args.write:
        with (ROOT / OUTPUT_CSV).open("w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=columns, extrasaction="ignore")
            writer.writeheader()
            writer.writerows(rows)
        (ROOT / OUTPUT_IDS).write_text(json.dumps(mapping, ensure_ascii=False, indent=2, sort_keys=True)+"\n", encoding="utf-8")
        (ROOT / OUTPUT_REPORT).write_text(report, encoding="utf-8")
    print(json.dumps({
        "tracked_files":stats["tracked_files"],
        "text_files_scanned":stats["text_files_scanned"],
        "source_entries":stats["extracted_source_entries"],
        "unique_entries":len(rows),
        "legacy_master_open":len(existing),
        "new_permanent_jmu_ids":sum(r["task_id"].startswith("JMU-") for r in rows),
        "existing_non_master_ids":sum(r["origin"]!="legacy_master_2026_10_25" and not r["task_id"].startswith("JMU-") for r in rows),
        "priority_counts":dict(Counter(x["priority"] for x in rows)),
        "github_open_issues_prs":len(snapshot),
        "write":args.write,
    }, indent=2))

if __name__ == "__main__":
    main()
