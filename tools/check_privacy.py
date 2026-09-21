#!/usr/bin/env python3
import os
import re
import sys

# High-risk patterns for JoshMemory specifically
# (Exceptions like Paul-Roe are out of scope for this repo's scanner)
PATTERNS = [
    # Explicit Personal Data
    (r'(?i)\b101 boundary\b', 'Identifiable Street Address'),
    (r'(?i)\bkristy\b', 'Family Member Name'),
    (r'(?i)\bmould\b.*\btenancy\b', 'Tenancy issue'),
    
    # Common Secrets / Credentials
    (r'(?i)ghp_[a-zA-Z0-9]{36}', 'GitHub Token'),
    (r'(?i)github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59}', 'GitHub Fine-grained PAT'),
    (r'(?i)xox[baprs]-[a-zA-Z0-9\-]+', 'Slack Token'),
    (r'(?i)AKIA[0-9A-Z]{16}', 'AWS Access Key'),
    (r'(?i)sk-[a-zA-Z0-9]{48}', 'OpenAI/Anthropic Secret Key'),
    (r'(?i)Bearer\s+[a-zA-Z0-9\-\._~+/]+=*', 'Generic Bearer Token'),
]

# Sensitive file types/names that shouldn't be committed
BAD_FILE_PATTERNS = [
    r'(?i).*fitbit.*\.csv$',
    r'(?i).*health_connect.*\.json$',
    r'(?i).*timeline_.*\.pdf$',
]

IGNORE_DIRS = {'.git', '.josh_private_memories', 'private', 'local_memories', '__pycache__', 'venv', '.venv'}

def scan_file(filepath):
    leaks = []
    
    # Check filename
    filename = os.path.basename(filepath)
    for bad_file_pat in BAD_FILE_PATTERNS:
        if re.match(bad_file_pat, filename):
            leaks.append(f"Forbidden file type/name ({filename})")

    # Check content
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
    else:
        print("\n✅ Privacy check passed. No known sensitive patterns detected.")
        sys.exit(0)

if __name__ == '__main__':
    main()
