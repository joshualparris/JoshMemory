// Server-side Groq proxy. NEVER include Groq keys or playtest access codes
// in client JS, game assets, HTML, analytics, logs, or version control.
import { timingSafeEqual } from 'node:crypto';
import { getNPC } from '../src/ui/npc-data.js';
import { creaturePrompt, residentPrompt } from '../src/ui/npc-prompt.js';

const LIMIT_PER_IP=24, LIMIT_GLOBAL=240, WINDOW=60*60*1000;
// Best-effort protection per function instance. Also set usage caps in Groq's
// console: serverless instances do not share this in-memory map.
const buckets=new Map();
let globalBucket={start:Date.now(),n:0}, keyIdx=0;
const reply=(res,code,json)=>{res.statusCode=code;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store, max-age=0');res.end(JSON.stringify(json));};
function equal(a,b) {
  const x=Buffer.from(String(a||'')),y=Buffer.from(String(b||''));
  return x.length===y.length && x.length>0 && timingSafeEqual(x,y);
}
function allow(ip) {
  const now=Date.now();
  if(now-globalBucket.start>WINDOW)globalBucket={start:now,n:0};
  const old=buckets.get(ip)||{start:now,n:0};
  const b=now-old.start>WINDOW?{start:now,n:0}:old;
  if(b.n>=LIMIT_PER_IP||globalBucket.n>=LIMIT_GLOBAL)return false;
  b.n++;globalBucket.n++;buckets.set(ip,b);
  if(buckets.size>2000)for(const [k,v] of buckets)if(now-v.start>WINDOW)buckets.delete(k);
  return true;
}
const safeText=(x,max)=>typeof x==='string'?x.trim().slice(0,max):'';
function serverKeys() {
  return String(process.env.GROQ_API_KEY||'').split(/[\s,;]+/).map(k=>k.trim()).filter(Boolean);
}
export default async function handler(req,res){
  const keys=serverKeys();
  // Browsers on the public GitHub Pages site must be allowed to reach this
  // Vercel-hosted function. No other cross-site origin is allowed, and every
  // POST still requires the private x-npc-code (the Groq key stays server-side).
  const pagesOrigin='https://parris-tech-services.github.io';
  const origin=String(req.headers.origin||'');
  const host=String(req.headers['x-forwarded-host']||req.headers.host||'');
  let trusted=!origin, fromPages=false;
  if(origin){
    try{
      const url=new URL(origin);
      fromPages=url.origin===pagesOrigin;
      trusted=url.protocol==='https:'&&(fromPages||url.host===host);
    }catch{trusted=false;}
  }
  res.setHeader('Vary','Origin');
  if(!trusted)return reply(res,403,{error:'Use the Repository Town website.'});
  if(fromPages){
    res.setHeader('Access-Control-Allow-Origin',pagesOrigin);
    res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers','Content-Type, X-NPC-Code');
    res.setHeader('Access-Control-Max-Age','600');
  }
  if(req.method==='OPTIONS'){res.statusCode=204;res.end();return;}
  if(req.method==='GET')return reply(res,200,{available:!!(keys.length&&process.env.TOWN_NPC_PIN),model:process.env.GROQ_MODEL||'openai/gpt-oss-20b'});
  if(req.method!=='POST'){res.setHeader('Allow','GET, POST, OPTIONS');return reply(res,405,{error:'Method not supported.'});}
  if(!keys.length||!process.env.TOWN_NPC_PIN)return reply(res,503,{error:'Live NPC chat is not configured yet. Try offline dialogue.'});
  if(Number(req.headers['content-length']||0)>16000)return reply(res,413,{error:'Conversation too long.'});
  // Count unsuccessful PIN guesses too, so an invalid-code flood is limited.
  const ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim().slice(0,90);
  if(!allow(ip))return reply(res,429,{error:'NPC has chatted a lot this hour. Try again later.'});
  if(!equal(req.headers['x-npc-code'],process.env.TOWN_NPC_PIN))return reply(res,401,{error:'Incorrect access code. Check the code supplied with your playtest link.'});
  let body;
  try{body=typeof req.body==='string'?JSON.parse(req.body):req.body;}catch{return reply(res,400,{error:'Invalid JSON.'});}
  if(!body||typeof body!=='object')return reply(res,400,{error:'Invalid request.'});
  const npc=getNPC(body.npcId);
  const resInfo=!npc&&body.resident&&typeof body.resident==='object'?body.resident:null;
  if(!npc&&!resInfo)return reply(res,400,{error:'Unknown town resident.'});
  const raw=body.messages;
  if(!Array.isArray(raw)||raw.length<1||raw.length>12)return reply(res,400,{error:'Invalid conversation.'});
  const messages=raw.slice(-8).map(m=>({role:m?.role,content:safeText(m?.content,850)}));
  if(messages.some(m=>!['user','assistant'].includes(m.role)||!m.content)||messages[messages.length-1].role!=='user')
    return reply(res,400,{error:'Please enter a message.'});
  const guide=npc?creaturePrompt(npc):residentPrompt(resInfo);
  const npcId=npc?npc.id:safeText(body.npcId||resInfo.coordinate||'resident',60);
  const model=process.env.GROQ_MODEL||'openai/gpt-oss-20b';
  try {
    let upstream=null;
    for(let i=0;i<keys.length;i++){
      const key=keys[(keyIdx+i)%keys.length];
      const abort=new AbortController(), timeout=setTimeout(()=>abort.abort(),16000);
      try{
        upstream=await fetch('https://api.groq.com/openai/v1/chat/completions',{
          method:'POST',signal:abort.signal,
          headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},
          body:JSON.stringify({model,temperature:.75,
            max_completion_tokens:420,reasoning_effort:'low',store:false,
            messages:[{role:'system',content:guide},...messages]})
        });
      }finally{clearTimeout(timeout);}
      if(upstream.ok){keyIdx=(keyIdx+i)%keys.length;break;}
      if(upstream.status!==429)break;
    }
    if(!upstream||!upstream.ok){
      // Never forward provider errors, which might contain private request details.
      return reply(res,502,{error:upstream?.status===429?'Groq is rate limited; try again soon.':'Groq is unavailable at the moment.'});
    }
    const result=await upstream.json();
    const answer=safeText(result?.choices?.[0]?.message?.content,2000);
    if(!answer)return reply(res,502,{error:'Groq returned an empty answer. Please retry.'});
    return reply(res,200,{npcId,reply:answer,model});
  }catch(error){
    return reply(res,502,{error:error?.name==='AbortError'?'NPC timed out. Please try again.':'Could not connect to Groq just now.'});
  }
}
