import pytest
import json
import subprocess
import os
import sys

def test_mcp_server_subprocess(tmp_path):
    isolated_home = tmp_path / "isolated_home"
    isolated_home.mkdir(exist_ok=True)
    
    env = os.environ.copy()
    env["JOSHMEMORY_HOME"] = str(isolated_home)
    
    proc = subprocess.Popen(
        [sys.executable, "-m", "joshmemory.server"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        env=env
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
