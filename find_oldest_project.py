import sqlite3
from pathlib import Path
from joshmemory.index import open_index, get_session

con = open_index(None)
# Group by cwd, get the maximum updated_at for each, and sort ascending
rows = con.execute('''
    SELECT cwd, MAX(COALESCE(updated_at, created_at)) as last_touched
    FROM sessions
    WHERE cwd IS NOT NULL AND cwd != '' AND source IN ('vscode', 'chatgpt_export')
    GROUP BY cwd
    ORDER BY last_touched ASC
    LIMIT 10
''').fetchall()

for r in rows:
    print(f"Project (CWD): {r['cwd']} | Last Touched: {r['last_touched']}")

