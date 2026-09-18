import sqlite3
from joshmemory.index import open_index

con = open_index()
rows = con.execute("SELECT thread_id, source FROM sessions WHERE thread_id = 'seed:chatgpt-2026-08-27-joshmemory-design'").fetchall()
for row in rows:
    print(dict(row))
