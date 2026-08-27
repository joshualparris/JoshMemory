import json
from joshmemory.index import project_status

print("=== FedoraCrashDoctor ===")
print(json.dumps(project_status("FedoraCrashDoctor"), indent=2))

print("\n=== ForgeGrid ===")
print(json.dumps(project_status("ForgeGrid"), indent=2))
