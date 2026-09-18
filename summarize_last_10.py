import json
from joshmemory.index import last_work, get_session

sessions = last_work(limit=10)
for i, s in enumerate(sessions):
    print(f"\n--- Session {i+1}: {s['project']} ---")
    print(f"When: {s['timestamp']}")
    print(f"CWD: {s['cwd']}")
    
    session_data = get_session(s['thread_id'])
    
    user_prompts = [e['text'] for e in session_data['events'] if e['role'] == 'user' and e['text']]
    assistant_replies = [e['text'] for e in session_data['events'] if e['role'] == 'assistant' and e['text']]
    
    print(f"Why (First user prompt): {user_prompts[0].strip() if user_prompts else 'N/A'}")
    if len(user_prompts) > 1:
        print(f"Key Follow-ups: {user_prompts[-1][:200].strip()}")
    
    print(f"What we did (Final assistant message): {assistant_replies[-1][:1000].strip() if assistant_replies else 'N/A'}")
