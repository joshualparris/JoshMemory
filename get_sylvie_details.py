import json
from joshmemory.index import get_session

session = get_session('019ded1f-2717-7ac2-a8a3-9349063a2b67')
events = session['events']
user_prompts = [e['text'] for e in events if e['role'] == 'user' and e['text']]
assistant_replies = [e['text'] for e in events if e['role'] == 'assistant' and e['text']]
print(f"First prompt: {user_prompts[0]}")
print(f"Last reply: {assistant_replies[-1][:500] if assistant_replies else 'N/A'}")

