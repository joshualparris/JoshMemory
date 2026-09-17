import sqlite3
import datetime
from pathlib import Path
from joshmemory.index import open_index, get_session

con = open_index(None)
# Group by cwd, get the maximum updated_at for each, and sort ascending
rows = con.execute('''
    SELECT cwd, MAX(COALESCE(updated_at, created_at)) as last_touched
    FROM sessions
    WHERE cwd IS NOT NULL AND cwd != '' AND cwd NOT LIKE 'chatgpt://%' AND source = 'vscode'
    GROUP BY cwd
    ORDER BY last_touched ASC
    LIMIT 5
''').fetchall()

for r in rows:
    # last_touched might be a float or iso string
    lt = r['last_touched']
    if isinstance(lt, (int, float)):
        lt_str = datetime.datetime.fromtimestamp(lt, tz=datetime.timezone.utc).isoformat()
    else:
        lt_str = lt
    print(f"Project (CWD): {r['cwd']} | Last Touched: {lt_str}")

