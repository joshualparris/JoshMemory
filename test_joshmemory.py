import json
from joshmemory.index import project_status
print(json.dumps(project_status("JoshMemory"), indent=2))
