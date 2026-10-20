// Hosted entirely on Cloudflare Workers; no browser PIN and no Vercel dependency.
// Deployed from JoshMemory alongside npc-data.js and npc-prompt.js.
// GROQ_API_KEY is a Cloudflare secret, never included in the public bundle.
import { getNPC } from './npc-data.js';
import { creaturePrompt, residentPrompt } from './npc-prompt.js';

const ORIGIN='https://parris-tech-services.github.io';
// Authorised public game origins only. Never use wildcard CORS for the Groq proxy.
const ALLOWED_ORIGINS = new Set([
 ORIGIN,
 'https://repository-town-claude-complete.vercel.app',
 'https://repository-town-claude-complete-joshualparris-projects.vercel.app',
 'https://repository-town-no-code-ai.parris-neathaustralia.workers.dev',
]);
const DAILY_SOFT_LIMIT=70; // per isolate; Groq/provider usage cap is the final hard limit
const MAX_BODY=14000;
const CORS={
 'Access-Control-Allow-Methods':'GET,POST,OPTIONS',
 'Access-Control-Allow-Headers':'Content-Type',
 'Access-Control-Max-Age':'600',
 'Vary':'Origin',
 'Cache-Control':'no-store'
};
function corsFor(origin){return {...CORS,'Access-Control-Allow-Origin':origin};}
function loungePage(){const esc=s=>String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));const options=[...NPCS].sort((a,b)=>a.name.localeCompare(b.name)).map(n=>'<option value="'+esc(n.id)+'"'+(n.id==='thistle'?' selected':'')+'>'+esc(n.emoji+' '+n.name+' · '+n.title)+'</option>').join('');const html="<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Repository Town NPC Lounge</title><style>\n*{box-sizing:border-box}body{margin:0;background:#0c1728;color:#e7f5ff;font-family:system-ui,sans-serif;display:flex;justify-content:center}main{width:min(100%,720px);min-height:100dvh;display:flex;flex-direction:column;gap:12px;padding:20px}h1{font-size:24px;margin:5px 0}p{margin:0;line-height:1.4}a{color:#9fe9f9}select,input,button{font:inherit;padding:12px;border-radius:12px;border:1px solid #456d80}select,input{color:white;background:#20344c}#feed{flex:1;min-height:270px;max-height:65dvh;overflow-y:auto;background:#15283d;border:1px solid #37536c;padding:14px;border-radius:14px;display:flex;flex-direction:column;gap:10px}.bubble{padding:12px;border-radius:14px;max-width:90%;line-height:1.5;overflow-wrap:anywhere}.npc{background:#2b4967;align-self:flex-start}.you{background:#08767a;align-self:flex-end}form{display:flex;gap:8px}input{flex:1;min-width:0}button{color:white;background:#0b7883;font-weight:bold;cursor:pointer}button:disabled{opacity:.5}small{color:#a8bfd1}#status{font-size:13px;color:#b8dfb8}\n</style></head><body><main><h1>🏘 Repository Town · NPC Lounge</h1><p>Chat with 32 characters. No codes, no setup.</p><a href=\"https://parris-tech-services.github.io/Repository-town/\">← Back to the 3D town</a><label for=\"people\">Choose a character</label><select id=\"people\">"+options+"</select><div id=\"feed\" role=\"log\" aria-live=\"polite\"></div><p id=\"status\">Ready to chat</p><form id=\"ask\"><input id=\"message\" placeholder=\"Ask me anything…\" maxlength=\"750\" aria-label=\"Your message\" required><button id=\"send\">Send</button></form><small>Powered by Groq via Cloudflare. Messages go to Groq when connected; please avoid sharing sensitive information. Daily limits apply.</small></main><script>\nconst people=document.getElementById('people'),feed=document.getElementById('feed'),form=document.getElementById('ask'),inp=document.getElementById('message'),send=document.getElementById('send'),status=document.getElementById('status');let history=[];\nfunction line(kind,t){const x=document.createElement('div');x.className='bubble '+kind;x.textContent=t;feed.append(x);feed.scrollTop=feed.scrollHeight}\nfunction greet(){history=[];feed.replaceChildren();line('npc','Hello! I am '+people.selectedOptions[0].textContent.split(' · ')[0]+'. What would you like to talk about?')}people.addEventListener('change',greet);greet();\nform.addEventListener('submit',async e=>{e.preventDefault();const q=inp.value.trim();if(!q)return;line('you',q);history.push({role:'user',content:q});inp.value='';send.disabled=true;status.textContent='Thinking…';try{const r=await fetch('/api/npc-chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({npcId:people.value,messages:history.slice(-8)})});const j=await r.json();if(!r.ok||!j.reply)throw Error(j.error||'Service unavailable');line('npc',j.reply);history.push({role:'assistant',content:j.reply});status.textContent='Groq live · Cloudflare'}catch(err){line('npc','The AI is temporarily unavailable: '+err.message);status.textContent='Offline · try again shortly'}finally{send.disabled=false}});\n</script></body></html>";return new Response(html,{status:200,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}})}
const counters=new Map();
let day='',count=0;
function answer(data,status=200,origin=ORIGIN){
 return new Response(JSON.stringify(data),{status,headers:{...corsFor(origin),'Content-Type':'application/json; charset=utf-8'}});
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
  if(u.pathname==='/'&&request.method==='GET')return loungePage();
  if(u.pathname!=='/api/npc-chat')return answer({error:'Not found'},404);
  // CORS is not authentication; enforce the independent Cloudflare rate limits.
  const origin=request.headers.get('Origin');
  if(!ALLOWED_ORIGINS.has(origin))return new Response(JSON.stringify({error:'Origin not allowed'}),{
   status:403,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}
  });
  const respond=(data,status=200)=>answer(data,status,origin);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:corsFor(origin)});
  if(request.method==='GET')return respond({available:Boolean(env.GROQ_API_KEY),host:'Cloudflare',codeRequired:false});
  if(request.method!=='POST')return respond({error:'Method not allowed'},405);
  if(!env.GROQ_API_KEY)return respond({error:'AI service is being configured'},503);
  if(Number(request.headers.get('content-length')||0)>MAX_BODY)return respond({error:'Message too long'},413);
  // Built-in Cloudflare counters apply per edge location, across isolates. A
  // second daily soft-limit reduces surprise usage when a site becomes popular.
  const ip=request.headers.get('CF-Connecting-IP')||'unknown';
  try{
   if(!env.IP_LIMIT||!env.GLOBAL_LIMIT)return respond({error:'AI quota protection unavailable'},503);
   const personal=await env.IP_LIMIT.limit({key:ip});
   const shared=await env.GLOBAL_LIMIT.limit({key:'town-ai'});
   if(!personal.success||!shared.success||!noteDaily())
     return respond({error:'NPC chat has reached its usage limit. Try again later.'},429);
  }catch{return respond({error:'AI quota protection unavailable'},503);}
  let body;
  try{
   const raw=await request.text();
   if(raw.length>MAX_BODY)return respond({error:'Message too long'},413);
   body=JSON.parse(raw);
  }catch{return respond({error:'Invalid request'},400);}
  const npc=getNPC(safeText(body?.npcId,60));
  const resident=!npc&&body?.resident&&typeof body.resident==='object'?body.resident:null;
  if(!npc&&!resident)return respond({error:'Unknown NPC'},400);
  const rawMessages=body?.messages;
  if(!Array.isArray(rawMessages)||rawMessages.length<1||rawMessages.length>12)
   return respond({error:'Invalid conversation'},400);
  const messages=rawMessages.slice(-8).map(m=>({role:m?.role,content:safeText(m?.content,750)}));
  if(messages.some(m=>!['assistant','user'].includes(m.role)||!m.content)||messages.at(-1).role!=='user')
    return respond({error:'Invalid messages'},400);
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
     body:JSON.stringify({model,store:false,temperature:0.75,max_completion_tokens:420,reasoning_effort:'low',
      messages:[{role:'system',content:persona},...messages]})
    });
    if(upstream.ok)break;
    reason=upstream.status===429?'AI is busy; try again shortly':'The AI provider is unavailable';
    if(upstream.status!==429)break;
   }catch{reason='Could not reach the AI provider';}
   finally{clearTimeout(timeout);}
  }
  if(!upstream?.ok)return respond({error:reason||'AI currently unavailable'},502);
  try{
   const data=await upstream.json();
   const reply=safeText(data?.choices?.[0]?.message?.content,1700);
   if(!reply)return respond({error:'AI returned an empty reply'},502);
   return respond({reply,model,host:'Cloudflare'});
  }catch{return respond({error:'AI response could not be read'},502);}
 }
};
