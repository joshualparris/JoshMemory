from joshmemory.index import open_index, get_session
con = open_index(None)
rows = con.execute("SELECT thread_id, title FROM sessions WHERE cwd = 'c:\JoshHealth'").fetchall()
for r in rows:
    events = get_session(r['thread_id']).get('events', [])
    for e in events:
        print(f"[{e['role']}] {e['text'][:300]}")
