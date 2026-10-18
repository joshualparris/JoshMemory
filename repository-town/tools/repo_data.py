"""Builds data/repo-data.json — the in-game Repository Archive — from private/evidence.json.

Per repository: README text, file list, documentation files, live site URLs and the
latest commit. Run after tools/harvest_evidence.py:
    python3 -I tools/repo_data.py
"""
import json
import os
import re
import sys

TOWN = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PLACEHOLDER = re.compile(r"your[-_]|your-project|example\.com|localhost", re.I)
SKIP_PATH = re.compile(r"/api/|callback|webhook|\?(api|card)=", re.I)


def clean_url(url):
    """Strips markdown punctuation and drops template, API and placeholder URLs."""
    url = url.strip().rstrip("`.),'\"*>")
    if not url.startswith("https://") or PLACEHOLDER.search(url) or SKIP_PATH.search(url):
        return None
    return url


def main():
    src = os.path.join(TOWN, "private", "evidence.json")
    evidence = json.load(open(src, encoding="utf-8"))
    out = {}
    for repo, ev in sorted(evidence.items()):
        if ev.get("status") != "inspected":
            out[repo] = {"unreachable": True}
            continue
        live = []
        for u in ev.get("deployUrls", []):
            c = clean_url(u)
            if c and c not in live:
                live.append(c)
        out[repo] = {
            "readme": ev.get("readmeFull", ""),
            "readmeTruncated": bool(ev.get("readmeTruncated")),
            "files": ev.get("files", []),
            "fileTotal": ev.get("fileTotal", 0),
            "docs": ev.get("docs", [])[:60],
            "live": live,
            "lastCommit": ev.get("lastCommit", ""),
            "scripts": (ev.get("package") or {}).get("scripts", [])[:20],
        }
    dst = os.path.join(TOWN, "data", "repo-data.json")
    with open(dst, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    readable = sum(1 for v in out.values() if not v.get("unreachable"))
    print(f"{dst}: {readable} readable, {len(out) - readable} unreachable, {os.path.getsize(dst) // 1024} KB", file=sys.stderr)


if __name__ == "__main__":
    main()
