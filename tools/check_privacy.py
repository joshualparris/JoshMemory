#!/usr/bin/env python3
import os
import re
import sys

# High-risk patterns
PATTERNS = [
    (r'(?i)\b101 boundary\b', 'Identifiable Street Address'),
    (r'(?i)\bkristy\b', 'Family Member Name'),
    (r'(?i)\bmould\b.*\btenancy\b', 'Tenancy issue'),
    (r'(?i)ghp_[a-zA-Z0-9]{36}', 'GitHub Token'),
    (r'(?i)xoxb-[a-zA-Z0-9\-]+', 'Slack Token'),
]

IGNORE_DIRS = {'.git', '.josh_private_memories', 'private', '__pycache__'}

def scan_file(filepath):
    leaks = []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            for pattern, desc in PATTERNS:
                if re.search(pattern, content):
                    leaks.append(desc)
    except Exception:
        pass
    return leaks

def main():
    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    leaks_found = False

    for root, dirs, files in os.walk(repo_root):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for file in files:
            filepath = os.path.join(root, file)
            leaks = scan_file(filepath)
            if leaks:
                print(f"[!] Privacy leak in {os.path.relpath(filepath, repo_root)}: {', '.join(leaks)}")
                leaks_found = True

    if leaks_found:
        print("Privacy check failed.")
        sys.exit(1)
    else:
        print("Privacy check passed.")
        sys.exit(0)

if __name__ == '__main__':
    main()
