import sqlite3
from joshmemory.index import open_index, get_session
con = open_index(None)

rows = con.execute('''
    SELECT cwd, GROUP_CONCAT(thread_id) as thread_ids
    FROM sessions
    WHERE cwd IS NOT NULL AND cwd != '' AND cwd NOT LIKE 'chatgpt://%' AND source = 'vscode'
    GROUP BY cwd
''').fetchall()

projects = []
for r in rows:
    threads = r['thread_ids'].split(',')
    total_events = 0
    assistant_replies = []
    
    for t_id in threads:
        try:
            events = get_session(t_id).get('events', [])
            total_events += len(events)
            assistant_replies.extend([e['text'] for e in events if e['role'] == 'assistant' and e['text']])
        except:
            pass
            
    if assistant_replies:
        projects.append({
            'cwd': r['cwd'],
            'events': total_events,
            'replies_count': len(assistant_replies),
            'first_reply': assistant_replies[0],
            'last_reply': assistant_replies[-1]
        })

projects.sort(key=lambda x: x['events'])

for p in projects[:3]:
    print(f"Project: {p['cwd']} | Events: {p['events']} | Replies: {p['replies_count']}")
    print(f"What we did: {p['last_reply'][:200].strip()}")
    print("-" * 40)
