// Hosted entirely on Cloudflare Workers; no browser PIN and no Vercel dependency.
// Deployed from JoshMemory alongside npc-data.js and npc-prompt.js.
// GROQ_API_KEY is a Cloudflare secret, never included in the public bundle.
import { getNPC } from './npc-data.js';
import { creaturePrompt, residentPrompt } from './npc-prompt.js';

const ORIGIN='https://parris-tech-services.github.io';
const DAILY_SOFT_LIMIT=70; // per isolate; Groq/provider usage cap is the final hard limit
const MAX_BODY=14000;
const CORS={
 'Access-Control-Allow-Origin':ORIGIN,
 'Access-Control-Allow-Methods':'GET,POST,OPTIONS',
 'Access-Control-Allow-Headers':'Content-Type',
 'Access-Control-Max-Age':'600',
 'Vary':'Origin',
 'Cache-Control':'no-store'
};
const counters=new Map();
let day='',count=0;
function answer(data,status=200){
 return new Response(JSON.stringify(data),{status,headers:{...CORS,'Content-Type':'application/json; charset=utf-8'}});
}
function noteDaily(){
 const today=new Date().toISOString().slice(0,10);
 if(today!==day){day=today;count=0;counters.clear();}
 count+=1;
 return count<=DAILY_SOFT_LIMIT;
}
function safeText(s,n){return typeof s==='string'?s.trim().slice(0,n):'';}
export default {
 async fetch(request,env){
  const u=new URL(request.url);
  if(u.pathname!=='/api/npc-chat')return answer({error:'Not found'},404);
  // CORS is not authentication; enforce the independent Cloudflare rate limits.
  if(request.headers.get('Origin')!==ORIGIN)return answer({error:'Origin not allowed'},403);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:CORS});
  if(request.method==='GET')return answer({available:Boolean(env.GROQ_API_KEY),host:'Cloudflare',codeRequired:false});
  if(request.method!=='POST')return answer({error:'Method not allowed'},405);
  if(!env.GROQ_API_KEY)return answer({error:'AI service is being configured'},503);
  if(Number(request.headers.get('content-length')||0)>MAX_BODY)return answer({error:'Message too long'},413);
  // Built-in Cloudflare counters apply per edge location, across isolates. A
  // second daily soft-limit reduces surprise usage when a site becomes popular.
  const ip=request.headers.get('CF-Connecting-IP')||'unknown';
  try{
   if(!env.IP_LIMIT||!env.GLOBAL_LIMIT)return answer({error:'AI quota protection unavailable'},503);
   const personal=await env.IP_LIMIT.limit({key:ip});
   const shared=await env.GLOBAL_LIMIT.limit({key:'town-ai'});
   if(!personal.success||!shared.success||!noteDaily())
     return answer({error:'NPC chat has reached its usage limit. Try again later.'},429);
  }catch{return answer({error:'AI quota protection unavailable'},503);}
  let body;
  try{
   const raw=await request.text();
   if(raw.length>MAX_BODY)return answer({error:'Message too long'},413);
   body=JSON.parse(raw);
  }catch{return answer({error:'Invalid request'},400);}
  const npc=getNPC(safeText(body?.npcId,60));
  const resident=!npc&&body?.resident&&typeof body.resident==='object'?body.resident:null;
  if(!npc&&!resident)return answer({error:'Unknown NPC'},400);
  const rawMessages=body?.messages;
  if(!Array.isArray(rawMessages)||rawMessages.length<1||rawMessages.length>12)
   return answer({error:'Invalid conversation'},400);
  const messages=rawMessages.slice(-8).map(m=>({role:m?.role,content:safeText(m?.content,750)}));
  if(messages.some(m=>!['assistant','user'].includes(m.role)||!m.content)||messages.at(-1).role!=='user')
    return answer({error:'Invalid messages'},400);
  const persona=npc?creaturePrompt(npc):residentPrompt(resident);
  const keys=String(env.GROQ_API_KEY).split(/[\s,;]+/).filter(Boolean);
  const model=String(env.GROQ_MODEL||'openai/gpt-oss-20b');
  let upstream,reason='';
  for(const key of keys.slice(0,3)){
   const abort=new AbortController();
   const timeout=setTimeout(()=>abort.abort(),15000);
   try {
    upstream=await fetch('https://api.groq.com/openai/v1/chat/completions',{
     method:'POST',signal:abort.signal,
     headers:{'Authorization':'Bearer '+key,'Content-Type':'application/json'},
     body:JSON.stringify({model,store:false,temperature:0.75,max_completion_tokens:300,
      messages:[{role:'system',content:persona},...messages]})
    });
    if(upstream.ok)break;
    reason=upstream.status===429?'AI is busy; try again shortly':'The AI provider is unavailable';
    if(upstream.status!==429)break;
   }catch{reason='Could not reach the AI provider';}
   finally{clearTimeout(timeout);}
  }
  if(!upstream?.ok)return answer({error:reason||'AI currently unavailable'},502);
  try{
   const data=await upstream.json();
   const reply=safeText(data?.choices?.[0]?.message?.content,1700);
   if(!reply)return answer({error:'AI returned an empty reply'},502);
   return answer({reply,model,host:'Cloudflare'});
  }catch{return answer({error:'AI response could not be read'},502);}
 }
};
