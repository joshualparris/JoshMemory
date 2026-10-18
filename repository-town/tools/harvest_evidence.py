"""Collect per-repository evidence for Repository Town design briefs.

Reads local clones only (no network). Output is the PRIVATE master evidence file;
it must never be copied into the public build.
"""
import json, os, re, subprocess, sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TOWN = ROOT / "repository-town"
INVENTORY = ROOT / "docs" / "repository-town.json"
OUT = TOWN / "private" / "evidence.json"
SEARCH_DIRS = [Path(p) for p in sys.argv[1:]] or [Path("/home/user")]
SKIP_DIRS = {".git", "node_modules", "dist", "build", ".next", "vendor", "__pycache__", ".venv", "venv", "release", "coverage"}
SOURCE_EXT = {".js", ".ts", ".tsx", ".jsx", ".py", ".html", ".css", ".cs", ".ps1", ".sh", ".go", ".rs", ".java", ".kt", ".swift", ".gd", ".lua", ".mjs", ".vue", ".svelte", ".json", ".md"}
URL_RE = re.compile(r"https?://[\w.-]+\.(?:vercel\.app|github\.io|netlify\.app|pages\.dev|onrender\.com|web\.app|firebaseapp\.com|itch\.io|fly\.dev|railway\.app)[^\s)\"'<>]*")


def git(path, *args):
    try:
        return subprocess.run(["git", "-C", str(path), *args], capture_output=True, text=True, timeout=30).stdout.strip()
    except Exception:
        return ""


def find_clone(repo):
    owner, name = repo.split("/")
    want = f"github.com/{repo}".lower()
    candidates = []
    for base in SEARCH_DIRS:
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
    return {
        "readme": readme_text[:3000],
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


def main():
    inventory = json.loads(INVENTORY.read_text())
    out = {}
    for p in inventory["projects"]:
        clone = find_clone(p["repo"])
        entry = {"repo": p["repo"], "visibility": p["visibility"], "archived": p["archived"], "coordinate": p["coordinate"]}
        if clone is None:
            entry["status"] = "unreachable"
        else:
            entry["status"] = "inspected"
            entry.update(collect(clone))
        out[p["repo"]] = entry
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out, indent=1, ensure_ascii=False))
    c = Counter(v["status"] for v in out.values())
    print(dict(c), "->", OUT)


if __name__ == "__main__":
    main()
