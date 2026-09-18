from joshmemory.index import open_index, get_session
import json

con = open_index(None)
for repo in ['joshuaparris-max__ForbiddenQuests', 'joshuaparris-max__exitbackup', 'joshuaparris-max__Wild2', 'joshuaparris-max__StarHaven']:
    print(f"\n--- {repo} ---")
    rows = con.execute("SELECT thread_id, title FROM sessions WHERE cwd LIKE ?", (f"%{repo}%",)).fetchall()
    if not rows:
        print("No sessions found.")
    for r in rows:
        print(f"Session: {r['title']}")
        events = get_session(r['thread_id']).get('events', [])
        user_prompts = [e['text'] for e in events if e['role'] == 'user' and e['text']]
        assistant_replies = [e['text'] for e in events if e['role'] == 'assistant' and e['text']]
        if user_prompts:
            print("  First Prompt:", user_prompts[0][:200].strip())
        if assistant_replies:
            print("  Last Reply:", assistant_replies[-1][:200].strip())
