from joshmemory.index import open_index, get_session

con = open_index(None)
for query in ['ForbiddenQuests', 'exitbackup', 'Wild2', 'StarHaven', 'AshFallen']:
    print(f"\n--- {query} ---")
    rows = con.execute("SELECT thread_id, title FROM sessions WHERE title LIKE ?", (f"%{query}%",)).fetchall()
    if not rows:
        print("No sessions found by title.")
    for r in rows:
        print(f"Session: {r['title']}")
