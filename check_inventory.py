import json
from pathlib import Path

inventory_file = Path('C:/dev/repo_inventory_final.json')
if inventory_file.exists():
    with open(inventory_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        repos = data.get('repositories', [])
        print(f"Loaded {len(repos)} repos from inventory.")
        if repos:
            # Sort by total commit count or file count or size? Let's check available keys in first repo
            print("Keys:", repos[0].keys())
else:
    print("No inventory file found.")
