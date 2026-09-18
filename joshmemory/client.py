import json
import subprocess
import os

class JoshMemoryClient:
    def __init__(self, transport="local", ssh_host=None):
        self.transport = transport
        self.ssh_host = ssh_host
        
    def call_tool(self, tool_name, kwargs):
        req = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/call",
            "params": {
                "name": tool_name,
                "arguments": kwargs
            }
        }
        
        cmd = []
        if self.transport == "local":
            cmd = ["C:/dev/JoshMemory/.venv/Scripts/python.exe", "-m", "joshmemory.server"]
        elif self.transport == "ssh":
            if not self.ssh_host:
                raise ValueError("ssh_host required for ssh transport")
            cmd = ["ssh", self.ssh_host, "python", "-m", "joshmemory.server"]
            
        proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
        proc.stdin.write(json.dumps(req) + "\n")
        proc.stdin.flush()
        proc.stdin.close()
        
        res_str = proc.stdout.readline()
        if not res_str:
            return None
            
        res = json.loads(res_str)
        if res.get("error"):
            raise Exception(res["error"])
            
        content = res.get("result", {}).get("content", [])
        if content:
            return json.loads(content[0]["text"])
        return None
