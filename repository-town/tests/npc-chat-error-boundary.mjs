// Isolated Node 22 localhost contract: untrusted NPC JSON must not kill the server.
// Fake PIN/Groq credentials only; malformed profiles are rejected BEFORE any provider request.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const TOWN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'autopatch-npc-boundary-'));
fs.writeFileSync(path.join(root, 'index.html'), 'NPC_TEST_HEALTH_OK');
const allocator = net.createServer();
await new Promise((resolve, reject) => {
  allocator.once('error', reject);
  allocator.listen(0, '127.0.0.1', resolve);
});
const port = allocator.address().port;
await new Promise(resolve => allocator.close(resolve));

const child = spawn(process.execPath, [path.join(TOWN,'tools/serve.mjs'), root, String(port)], {
  cwd: TOWN,
  env: {...process.env, GROQ_API_KEY: 'test-only-never-a-provider-key', TOWN_NPC_PIN: 'local-test-pin'},
  stdio: ['ignore','ignore','pipe'],
});
let stderr = '';
child.stderr.on('data', chunk => { stderr = (stderr + String(chunk)).slice(-3000); });

function request(url, method='GET', payload=null) {
  return new Promise((resolve,reject) => {
    const body = payload === null ? null : JSON.stringify(payload);
    const headers = body === null ? {} : {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-NPC-Code': 'local-test-pin',
    };
    const req = http.request({hostname:'127.0.0.1',port,path:url,method,headers,timeout:3000,agent:false}, res => {
      let response = '';
      res.on('data', chunk => { response += String(chunk); });
      res.on('end', () => resolve({status:res.statusCode,body:response}));
    });
    req.on('timeout',()=>req.destroy(new Error('localhost request timed out')));
    req.on('error',reject);
    req.end(body || undefined);
  });
}
async function ready() {
  for(let i=0;i<80;i++){
    if(child.exitCode!==null) throw new Error('Node server exited at startup: '+stderr);
    try { if((await request('/')).status===200)return; }catch{}
    await new Promise(resolve=>setTimeout(resolve,30));
  }
  throw new Error('Test server failed to start: '+stderr);
}
try {
  await ready();
  // JSON can contain a non-callable "toString" own property. String(r.name)
  // throws TypeError, and a rejected async API handler used to be unobserved
  // by serve.mjs. This test never uses a real access token or Groq API.
  const malformed = {
    npcId:'nonexistent-npc',
    resident:{name:{toString:'not-a-function'},coordinate:'M4',role:'villager'},
    messages:[{role:'user',content:'hello'}],
  };
  const response = await request('/api/npc-chat','POST',malformed);
  assert.equal(response.status,400,'malformed NPC JSON must receive HTTP 400');
  assert.doesNotMatch(response.body,/test-only-never-a-provider-key|local-test-pin/);
  const after = await request('/');
  assert.equal(after.status,200,'server must remain healthy after malformed NPC JSON');
  assert.match(after.body,/NPC_TEST_HEALTH_OK/);
  console.log('PASS: malformed NPC JSON rejected, no provider call, localhost server survives');
} finally {
  child.kill('SIGTERM');
  await new Promise(resolve=>{
    if(child.exitCode!==null || child.signalCode!==null)resolve();
    else child.once('exit',resolve);
  });
  fs.rmSync(root,{recursive:true,force:true});
}
