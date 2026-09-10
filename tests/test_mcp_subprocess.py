import pytest
import json
import subprocess
import os

def test_mcp_server_subprocess(tmp_path):
    db_path = str(tmp_path / "sub_rpc.sqlite")
    env = os.environ.copy()
    
    wrapper = str(tmp_path / "run_server.py")
    with open(wrapper, "w") as f:
        f.write(f'''
import sys
sys.path.insert(0, "C:/dev/JoshMemory")
from unittest.mock import patch
from joshmemory.server import main

with patch("joshmemory.server.default_db_path", return_value="{db_path.replace(chr(92), '/')}"), \
     patch("joshmemory.paths.default_db_path", return_value="{db_path.replace(chr(92), '/')}"), \
     patch("joshmemory.auditor.run_auditor", return_value={{"projects": []}}):
    main()
''')

    proc = subprocess.Popen(
        ["C:/dev/JoshMemory/.venv/Scripts/python.exe", wrapper],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        cwd="C:/dev/JoshMemory"
    )
    
    req = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {
            "name": "save_handoff",
            "arguments": {
                "project": "App",
                "objective": "Sub Obj",
                "next_action": "Sub Next"
            }
        }
    }
    
    proc.stdin.write(json.dumps(req) + "\n")
    proc.stdin.flush()
    proc.stdin.close()
    
    res_str = proc.stdout.readline()
    if not res_str:
        err = proc.stderr.read()
        raise Exception(f"Subprocess failed: {err}")
        
    res = json.loads(res_str)
    
    assert res.get("id") == 1
    assert not res.get("error")
    
    proc.wait(timeout=5)
