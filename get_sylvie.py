import sqlite3
from joshmemory.index import open_index

con = open_index(None)
rows = con.execute('''
    SELECT thread_id, title, created_at
    FROM sessions
    WHERE cwd LIKE '%Sylvie Phonics%'
    ORDER BY created_at ASC
''').fetchall()

for r in rows:
    print(f"Thread: {r['thread_id']} | Title: {r['title']} | Created: {r['created_at']}")

