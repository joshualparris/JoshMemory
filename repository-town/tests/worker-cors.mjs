// Execute the actual Cloudflare module's fetch handler with a mocked Groq response.
// No credentials, network access, or production rate limits are used.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const src=readFileSync(new URL('../deploy/cloudflare-ai-worker.js',import.meta.url),'utf8')
  .replace(/^import .*;\\s*$/gm,'')
  .replace('export default {','globalThis.worker = {');
const scope={
  Response,Request,URL,Date,Map,Set,AbortController,setTimeout,clearTimeout,
  getNPC:id=>id==='dot'?{id,name:'Dot'}:null,
  creaturePrompt:()=> 'You are a helpful fictional villager.',
  residentPrompt:()=> 'You are a helpful fictional resident.',
  fetch:async()=>new Response(JSON.stringify({choices:[{message:{content:'Gday from live Dot!'}}]}),{status:200,headers:{'Content-Type':'application/json'}}),
};
vm.runInNewContext(src,scope,{filename:'cloudflare-ai-worker.js'});
const worker=scope.worker;
assert(worker?.fetch,'Worker fetch handler exists');
const host='https://repository-town-no-code-ai.parris-neathaustralia.workers.dev';
const allowed=[
 'https://parris-tech-services.github.io',
 'https://repository-town-claude-complete.vercel.app',
 'https://repository-town-claude-complete-joshualparris-projects.vercel.app',
 host,
];
const env={GROQ_API_KEY:'TEST-FAKE-KEY',IP_LIMIT:{limit:async()=>({success:true})},GLOBAL_LIMIT:{limit:async()=>({success:true})}};
for(const origin of allowed){
 const req=new Request(host+'/api/npc-chat',{method:'OPTIONS',headers:{Origin:origin,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type'}});
 const res=await worker.fetch(req,env);
 assert.equal(res.status,204,origin+' must pass preflight');
 assert.equal(res.headers.get('access-control-allow-origin'),origin,'CORS must echo the verified origin only');
 assert.equal(res.headers.get('vary'),'Origin');
}
const blocked=await worker.fetch(new Request(host+'/api/npc-chat',{method:'OPTIONS',headers:{Origin:'https://attacker.example'}}),env);
assert.equal(blocked.status,403,'unapproved origins are blocked before proxy or rate limits');
assert.equal(blocked.headers.has('access-control-allow-origin'),false,'rejected origins get no CORS permission');
for(const origin of allowed.slice(0,3)){
 const req=new Request(host+'/api/npc-chat',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({npcId:'dot',messages:[{role:'user',content:'Hello Dot'}]})});
 const res=await worker.fetch(req,env);
 assert.equal(res.status,200,origin+' must reach simulated Groq');
 assert.equal(res.headers.get('access-control-allow-origin'),origin);
 assert.equal((await res.json()).reply,'Gday from live Dot!');
}
console.log('PASS: Cloudflare worker allows known GitHub/Vercel origins, rejects outsiders, and returns live AI responses');
