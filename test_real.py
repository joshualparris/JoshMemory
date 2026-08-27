import json
from joshmemory.index import project_status

projects = ["FedoraCrashDoctor", "JoshMemory", "ForgeGrid", "KaseyaFieldOps", "DadlanControlCentre"]

for p in projects:
    print(f"=== {p} ===")
    status = project_status(p)
    print("State Name:", status["live_auditor_state"]["name"] if status["live_auditor_state"] else None)
    print("Modified Files:", status["live_auditor_state"]["git"]["modified"] if status["live_auditor_state"] and status["live_auditor_state"]["git"] else None)
    print("Historical Sessions:", len(status["historical_sessions"]))
    print("GitHub Evidence:", len(status["github_evidence"]))
    print()
