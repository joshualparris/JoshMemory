// Cloudflare Workers bridge for Repository Town GitHub Pages to the Vercel AI API.
// This contains no secrets and cannot call Groq directly. Vercel always validates
// the existing private x-npc-code before making a model request.
const PAGES_ORIGIN='https://parris-tech-services.github.io';
const UPSTREAM='https://repository-town-claude-playtest.vercel.app/api/npc-chat';
const WINDOW_MS=3600000, MAX_REQUESTS=28;
const requests=new Map(); // best effort, scoped to one Worker isolate
const cors={
  'Access-Control-Allow-Origin':PAGES_ORIGIN,
  'Access-Control-Allow-Methods':'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers':'Content-Type, X-NPC-Code',
  'Access-Control-Max-Age':'600',
  'Vary':'Origin',
  'Cache-Control':'no-store, max-age=0'
};
function json(message,status=400){return new Response(JSON.stringify({error:message}),{
  status,headers:{...cors,'Content-Type':'application/json; charset=utf-8'}
});}
function limited(ip){
  const now=Date.now(),v=requests.get(ip);
  const b=!v||now-v.start>WINDOW_MS?{start:now,n:0}:v;
  if(b.n>=MAX_REQUESTS)return true;
  b.n++;requests.set(ip,b);
  if(requests.size>2000)for(const [key,item]of requests)if(now-item.start>WINDOW_MS)requests.delete(key);
  return false;
}
export default {
  async fetch(request){
    // A browser from an unrelated website is never allowed to use this bridge.
    // Origin alone isn't authentication: the real PIN is checked by Vercel.
    if(request.headers.get('Origin')!==PAGES_ORIGIN)return json('Origin not allowed.',403);
    const url=new URL(request.url);
    if(url.pathname!=='/api/npc-chat')return json('Not found.',404);
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
    if(!['GET','POST'].includes(request.method))return json('Method not allowed.',405);
    if(request.method==='POST'){
      const ip=request.headers.get('CF-Connecting-IP')||'unknown';
      if(limited(ip))return json('Too many chat attempts. Try later.',429);
      if(!request.headers.get('x-npc-code'))return json('Enter your access code.',401);
      if(Number(request.headers.get('content-length')||0)>16000)return json('Conversation too long.',413);
    }
    // Never forward cookies, API keys, or the browser Origin. Vercel's existing
    // PIN check and rate limits still govern every request.
    const headers={'Accept':'application/json'};
    if(request.method==='POST'){
      headers['Content-Type']='application/json';
      headers['x-npc-code']=request.headers.get('x-npc-code');
    }
    let response;
    try {
      response=await fetch(UPSTREAM,{
        method:request.method,headers,
        body:request.method==='POST'?await request.text():undefined,
        redirect:'manual'
      });
    }catch{return json('AI service temporarily unreachable.',502);}
    const contentType=response.headers.get('Content-Type')||'';
    if(!contentType.includes('application/json')){
      return json('AI service not ready. Please try later.',502);
    }
    const text=await response.text();
    return new Response(text,{status:response.status,
      headers:{...cors,'Content-Type':'application/json; charset=utf-8'}});
  }
};
