#!/usr/bin/env python3
import os
import re
import sys

# Keep private literals (home addresses, family-only identifiers, etc.) out of
# this public repository. Supply them only at scan time, for example:
#   JOSHMEMORY_PRIVATE_TERMS='term one;term two' python tools/check_privacy.py
# CI can store the value in an encrypted repository secret.
PRIVATE_TERMS_ENV = "JOSHMEMORY_PRIVATE_TERMS"

PATTERNS = [
    # Contextual personal-data categories that are safe to describe publicly.
    (r'(?i)\bmould\b.*\btenancy\b', 'Tenancy issue'),

    # Common Secrets / Credentials
    (r'(?i)\bghp_[A-Za-z0-9]{30,}\b', 'GitHub Token'),
    (r'(?i)\bgithub_pat_[A-Za-z0-9_]{30,}\b', 'GitHub Fine-grained PAT'),
    (r'(?i)\bxox[baprs]-[A-Za-z0-9\-]+\b', 'Slack Token'),
    (r'\bAKIA[0-9A-Z]{16}\b', 'AWS Access Key'),
    (r'\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b', 'OpenAI-style Secret Key'),
    (r'\bAIza[0-9A-Za-z_-]{25,}\b', 'Google API Key'),
    (
        r'(?i)(api[_-]?key|client[_-]?secret|access[_-]?token|refresh[_-]?token|password|passwd)'
        r'\s*[:=]\s*[\'\"][^\'\"]{8,}[\'\"]',
        'Hard-coded credential',
    ),
]

BAD_FILE_PATTERNS = [
    r'(?i).*fitbit.*\.csv$',
    r'(?i).*health_connect.*\.json$',
    r'(?i).*timeline_.*\.pdf$',
]

IGNORE_DIRS = {'.git', '.josh_private_memories', 'private', 'local_memories', '__pycache__', 'venv', '.venv'}


def configured_private_patterns():
    terms = os.environ.get(PRIVATE_TERMS_ENV, '')
    return [
        (re.escape(term.strip()), 'Private denylist term')
        for term in terms.split(';')
        if term.strip()
    ]


def scan_file(filepath):
    leaks = []

    filename = os.path.basename(filepath)
    if os.path.abspath(filepath) == os.path.abspath(__file__):
        # The scanner contains credential regex examples by design.
        return []

    for bad_file_pat in BAD_FILE_PATTERNS:
        if re.match(bad_file_pat, filename):
            leaks.append(f"Forbidden file type/name ({filename})")

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            for pattern, desc in [*PATTERNS, *configured_private_patterns()]:
                if re.search(pattern, content, re.IGNORECASE if desc == 'Private denylist term' else 0):
                    leaks.append(desc)
    except (OSError, UnicodeError):
        pass

    return leaks


def main():
    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    leaks_found = False

    print("Running JoshMemory Privacy Scanner...")
    for root, dirs, files in os.walk(repo_root):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for file in files:
            filepath = os.path.join(root, file)
            leaks = scan_file(filepath)
            if leaks:
                print(f"[!] Privacy leak in {os.path.relpath(filepath, repo_root)}: {', '.join(leaks)}")
                leaks_found = True

    if leaks_found:
        print("\n❌ Privacy check failed. Sensitive data detected.")
        print("Please review the listed files, remove the sensitive material, or move them to a private directory.")
        sys.exit(1)

    print("\n✅ Privacy check passed. No known sensitive patterns detected.")
    sys.exit(0)


if __name__ == '__main__':
    main()
