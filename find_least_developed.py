import sqlite3
import json
from pathlib import Path
from joshmemory.index import open_index, get_session

con = open_index(None)

# Group by cwd to find the number of sessions
rows = con.execute('''
    SELECT cwd, COUNT(thread_id) as session_count, GROUP_CONCAT(thread_id) as thread_ids
    FROM sessions
    WHERE cwd IS NOT NULL AND cwd != '' AND cwd NOT LIKE 'chatgpt://%' AND source = 'vscode'
    GROUP BY cwd
    ORDER BY session_count ASC
''').fetchall()

least_developed = []
for r in rows:
    threads = r['thread_ids'].split(',')
    
    # Let's count total events across all these sessions to measure how 'developed' it is
    total_events = 0
    first_prompt = ""
    last_reply = ""
    
    for t_id in threads:
        try:
            s_data = get_session(t_id)
            events = s_data.get('events', [])
            total_events += len(events)
            
            user_prompts = [e['text'] for e in events if e['role'] == 'user' and e['text']]
            assistant_replies = [e['text'] for e in events if e['role'] == 'assistant' and e['text']]
            
            if not first_prompt and user_prompts:
                first_prompt = user_prompts[0]
            if assistant_replies:
                last_reply = assistant_replies[-1]
        except Exception:
            pass

    least_developed.append({
        'cwd': r['cwd'],
        'sessions': r['session_count'],
        'events': total_events,
        'first_prompt': first_prompt,
        'last_reply': last_reply
    })

# Sort by total_events ascending
least_developed.sort(key=lambda x: x['events'])

# Print top 5 least developed
for p in least_developed[:5]:
    print(f"Project: {p['cwd']} | Sessions: {p['sessions']} | Events: {p['events']}")
    print(f"  First Prompt: {p['first_prompt'][:100].strip() if p['first_prompt'] else 'N/A'}")
    print(f"  Last Reply: {p['last_reply'][:100].strip() if p['last_reply'] else 'N/A'}")
    print("-" * 40)
