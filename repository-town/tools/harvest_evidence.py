"""Collect per-repository evidence for Repository Town design briefs.

Reads local clones (and optionally shallow-clones missing repositories when
--fetch-missing is passed), while preserving existing inspected entries from
private/evidence.json or data/repo-data.json for repositories not currently
cloned on disk. Output is the PRIVATE master evidence file; it must never be
copied into the public build.
"""
import argparse, json, os, re, subprocess, sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TOWN = ROOT / "repository-town"
INVENTORY = ROOT / "docs" / "repository-town.json"
OUT = TOWN / "private" / "evidence.json"
REPO_DATA = TOWN / "data" / "repo-data.json"
DEFAULT_CLONE_DIR = Path("/home/josh/.gemini/antigravity-cli/brain/b5f2ea27-137a-4b63-8853-396e9a468b56/scratch/repo-clones")
DEFAULT_SEARCH_DIRS = [Path("/home/josh/dev"), DEFAULT_CLONE_DIR, Path("/home/user")]
SKIP_DIRS = {".git", "node_modules", "dist", "build", ".next", "vendor", "__pycache__", ".venv", "venv", "release", "coverage"}
SOURCE_EXT = {".js", ".ts", ".tsx", ".jsx", ".py", ".html", ".css", ".cs", ".ps1", ".sh", ".go", ".rs", ".java", ".kt", ".swift", ".gd", ".lua", ".mjs", ".vue", ".svelte", ".json", ".md"}
URL_RE = re.compile(r"https?://[\w.-]+\.(?:vercel\.app|github\.io|netlify\.app|pages\.dev|onrender\.com|web\.app|firebaseapp\.com|itch\.io|fly\.dev|railway\.app)[^\s)\"'<>]*")


def git(path, *args, timeout=30):
    try:
        return subprocess.run(["git", "-C", str(path), *args], capture_output=True, text=True, timeout=timeout).stdout.strip()
    except Exception:
        return ""


def find_clone(repo, search_dirs):
    owner, name = repo.split("/")
    want = f"github.com/{repo}".lower()
    candidates = []
    for base in search_dirs:
        if not base.exists():
            continue
        for entry in base.iterdir():
            n = entry.name.lower()
            if n in (name.lower(), f"{owner}__{name}".lower()):
                candidates.append(entry)
    for c in candidates:
        url = git(c, "remote", "get-url", "origin").lower().removesuffix(".git")
        if url.endswith(want):
            return c
    return None


def shallow_clone(repo, clone_dir):
    owner, name = repo.split("/")
    target = clone_dir / f"{owner}__{name}"
    if target.exists():
        return target
    clone_dir.mkdir(parents=True, exist_ok=True)
    url = f"https://github.com/{repo}.git"
    try:
        r = subprocess.run(["git", "clone", "--depth", "1", url, str(target)], capture_output=True, text=True, timeout=120)
        if r.returncode == 0 and target.exists():
            return target
    except Exception:
        pass
    return None


def read(path, limit):
    try:
        return path.read_text(errors="replace")[:limit]
    except Exception:
        return ""


def clean_md(text):
    text = re.sub(r"<!--.*?-->", "", text, flags=re.S)
    text = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", text)
    text = re.sub(r"<img[^>]*>", "", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def collect(path):
    files = []
    for dirpath, dirnames, filenames in os.walk(path):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith(".")]
        for f in filenames:
            p = Path(dirpath) / f
            files.append(p)
    rel = [p.relative_to(path) for p in files]
    ext = Counter(p.suffix.lower() or "(none)" for p in rel)
    readme = next((path / n for n in ("README.md", "readme.md", "README.MD", "Readme.md", "README.txt", "README") if (path / n).exists()), None)
    readme_text = clean_md(read(readme, 12000)) if readme else ""
    pkg = {}
    if (path / "package.json").exists():
        try:
            j = json.loads(read(path / "package.json", 200000))
            pkg = {"name": j.get("name"), "description": j.get("description"), "scripts": sorted((j.get("scripts") or {}).keys())[:15],
                   "dependencies": sorted({**(j.get("dependencies") or {}), **(j.get("devDependencies") or {})}.keys())[:30]}
        except Exception:
            pass
    titles = []
    for p in files:
        if p.name == "index.html" and len(titles) < 3:
            m = re.search(r"<title>(.*?)</title>", read(p, 20000), re.S | re.I)
            if m:
                titles.append(m.group(1).strip()[:120])
    docs = sorted(str(r) for r in rel if r.suffix.lower() == ".md" and len(r.parts) <= 3)[:25]
    src = sorted(((p.stat().st_size, str(r)) for p, r in zip(files, rel) if r.suffix.lower() in SOURCE_EXT - {".json", ".md"}), reverse=True)[:12]
    urls = sorted(set(URL_RE.findall(readme_text + " " + read(path / "package.json", 20000) + " " + read(path / "vercel.json", 5000))))[:8]
    top = sorted(e.name + ("/" if e.is_dir() else "") for e in path.iterdir() if e.name != ".git")[:40]
    files_all = sorted(str(r).replace(os.sep, "/") for r in rel)
    return {
        "readme": readme_text[:3000],
        "readmeFull": readme_text[:16000],
        "readmeTruncated": len(readme_text) > 16000,
        "files": files_all[:600],
        "fileTotal": len(files_all),
        "readmeLength": len(readme_text),
        "topLevel": top,
        "fileCount": len(rel),
        "extensions": dict(ext.most_common(10)),
        "package": pkg,
        "htmlTitles": titles,
        "docs": docs,
        "largestSource": [s for _, s in src],
        "deployUrls": urls,
        "lastCommit": git(path, "log", "-1", "--format=%ad %s", "--date=short"),
    }


def from_repo_data(rd):
    readme_full = rd.get("readme", "")
    scripts = rd.get("scripts", [])
    files = rd.get("files", [])
    return {
        "readme": readme_full[:3000],
        "readmeFull": readme_full,
        "readmeTruncated": bool(rd.get("readmeTruncated")),
        "files": files,
        "fileTotal": rd.get("fileTotal", len(files)),
        "readmeLength": len(readme_full),
        "topLevel": sorted({f.split("/")[0] + ("/" if "/" in f else "") for f in files})[:40],
        "fileCount": rd.get("fileTotal", len(files)),
        "extensions": {},
        "package": {"scripts": scripts} if scripts else {},
        "htmlTitles": [],
        "docs": rd.get("docs", []),
        "largestSource": [],
        "deployUrls": rd.get("live", []),
        "lastCommit": rd.get("lastCommit", ""),
    }


def parse_args():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("search_dirs", nargs="*", help="Directories to search for local repository clones")
    ap.add_argument("--fetch-missing", action="store_true", help="Shallow-clone any still-unreachable repository from GitHub")
    ap.add_argument("--clone-dir", type=Path, default=DEFAULT_CLONE_DIR, help="Directory for shallow-cloned repositories")
    ap.add_argument("--pull", action="store_true", help="Run git pull --ff-only on local clones before harvesting")
    return ap.parse_args()


def main():
    args = parse_args()
    search_dirs = []
    for p in ([Path(d) for d in args.search_dirs] + [args.clone_dir] + DEFAULT_SEARCH_DIRS):
        if p not in search_dirs:
            search_dirs.append(p)

    inventory = json.loads(INVENTORY.read_text(encoding="utf-8"))
    existing = {}
    if OUT.exists():
        try:
            existing = json.loads(OUT.read_text(encoding="utf-8"))
        except Exception:
            existing = {}
    existing_rd = {}
    if REPO_DATA.exists():
        try:
            existing_rd = json.loads(REPO_DATA.read_text(encoding="utf-8"))
        except Exception:
            existing_rd = {}

    out = {}
    counts = Counter()
    for p in inventory["projects"]:
        repo = p["repo"]
        base_meta = {"repo": repo, "visibility": p["visibility"], "archived": p["archived"], "coordinate": p["coordinate"]}
        clone = find_clone(repo, search_dirs)
        if clone is not None:
            if args.pull:
                git(clone, "pull", "--ff-only", timeout=60)
            entry = {**base_meta, "status": "inspected", **collect(clone)}
            counts["local_inspected"] += 1
        elif existing.get(repo, {}).get("status") == "inspected":
            entry = {**existing[repo], **base_meta, "status": "inspected"}
            counts["preserved_evidence"] += 1
        elif repo in existing_rd and not existing_rd[repo].get("unreachable"):
            entry = {**base_meta, "status": "inspected", **from_repo_data(existing_rd[repo])}
            counts["preserved_repo_data"] += 1
        elif args.fetch_missing:
            fetched = shallow_clone(repo, args.clone_dir)
            if fetched is not None:
                entry = {**base_meta, "status": "inspected", **collect(fetched)}
                counts["fetched_inspected"] += 1
            else:
                entry = {**base_meta, "status": "unreachable"}
                counts["unreachable"] += 1
        else:
            entry = {**base_meta, "status": "unreachable"}
            counts["unreachable"] += 1
        out[repo] = entry

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out, indent=1, ensure_ascii=False), encoding="utf-8")
    status_counts = Counter(v["status"] for v in out.values())
    print(f"{dict(status_counts)} (breakdown: {dict(counts)}) -> {OUT}")


if __name__ == "__main__":
    main()

