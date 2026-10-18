// Accessible NPC conversation UI shared by 3D Repository Town and the 2D NPC lounge.
// Only the visitor's submitted conversation is sent to the server; nothing is stored remotely
// by Repository Town and no API key is ever sent to the browser.
import { NPCS, getNPC } from './npc-data.js';

const FALLBACK=[
  'My imagination is working, but the live AI connection is unavailable. Ask me again once your access code is set.',
  'Fancy a little exploration? Find a new house, try an arcade or roll a d20.',
  'I can still keep you company in offline mode. For an open-ended answer, connect Groq with your private access code.',
  'That sounds interesting! I wish I could give a proper answer right now. My offline dialogue is limited.'
];
export function mountNPCChat(root=document) {
  const el=root.getElementById('npc-chat');
  const feed=root.getElementById('npc-messages');
  const title=root.getElementById('npc-name');
  const subtitle=root.getElementById('npc-role');
  const avatar=root.getElementById('npc-avatar');
  const input=root.getElementById('npc-input');
  const pin=root.getElementById('npc-code');
  const status=root.getElementById('npc-status');
  const form=root.getElementById('npc-form');
  const send=root.getElementById('npc-send');
  const chats=new Map();
  let active=null, context=null, busy=false, controller=null, count=0, beforeFocus=null;
  try { pin.value=sessionStorage.getItem('town-npc-code')||''; } catch {}
  function line(who,message) {
    const row=root.createElement('div');row.className='npc-line '+who;
    const bubble=root.createElement('div');bubble.className='npc-bubble';
    bubble.textContent=message;row.appendChild(bubble);feed.appendChild(row);
    feed.scrollTop=feed.scrollHeight;
  }
  function key(npc,house){return npc.id+':'+(house?.coordinate||'town');}
  function show(npcOrId,house=null) {
    const npc=typeof npcOrId==='string'?getNPC(npcOrId):npcOrId;
    if(!npc)return false;
    if(controller)controller.abort();
    beforeFocus=root.activeElement;
    active=npc;context=house;busy=false;
    const k=key(npc,house);
    if(!chats.has(k))chats.set(k,[{role:'assistant',content:npc.welcome}]);
    avatar.textContent=npc.emoji;title.textContent=npc.name;
    subtitle.textContent=npc.title+(house?' · '+house.name:'');
    feed.replaceChildren();
    for(const msg of chats.get(k))line(msg.role==='user'?'user':'npc',msg.content);
    status.textContent='Fictional AI character · never share private information';
    el.hidden=false;input.disabled=false;send.disabled=false;
    input.focus();
    return true;
  }
  function close() {
    controller?.abort();controller=null;busy=false;active=null;el.hidden=true;
    if(beforeFocus?.focus)beforeFocus.focus();
  }
  root.getElementById('npc-close').addEventListener('click',close);
  pin.addEventListener('change',()=>{try{sessionStorage.setItem('town-npc-code',pin.value.trim());}catch{}});
  form.addEventListener('submit',async(e)=>{
    e.preventDefault();if(!active||busy)return;
    const question=input.value.trim().slice(0,750);if(!question)return;
    const npc=active, house=context, k=key(npc,house);
    const history=chats.get(k);
    history.push({role:'user',content:question});line('user',question);
    input.value='';busy=true;input.disabled=true;send.disabled=true;
    status.textContent='Thinking…';
    const accessCode=pin.value.trim();
    let reply='',online=false,stale=false;
    if(!accessCode) {
      reply=FALLBACK[count++%FALLBACK.length];
      status.textContent='Offline dialogue · enter your private access code to enable Groq';
    } else {
      controller=new AbortController();
      const timeout=setTimeout(()=>controller?.abort(),22000);
      try {
        const res=await fetch('/api/npc-chat',{
          method:'POST',
          credentials:'same-origin',
          headers:{'Content-Type':'application/json','x-npc-code':accessCode},
          body:JSON.stringify({npcId:npc.id,house:house?{name:house.name,kind:house.kind,coordinate:house.coordinate}:null,
            messages:history.slice(-8).map(({role,content})=>({role,content}))}),
          signal:controller.signal
        });
        const payload=await res.json().catch(()=>({}));
        if(!res.ok) {
          if(res.status===401){pin.value='';try{sessionStorage.removeItem('town-npc-code');}catch{}}
          throw Error(payload.error||'AI service unavailable ('+res.status+')');
        }
        reply=String(payload.reply||'').trim();
        if(!reply)throw Error('No response received');
        online=true;
        try{sessionStorage.setItem('town-npc-code',accessCode);}catch{}
      }catch(err){
        reply='I could not reach Groq just now. '+(err.name==='AbortError'?'The request timed out.':err.message)+
          ' You can try again or continue using offline dialogue.';
      }finally{clearTimeout(timeout);controller=null;}
    }
    stale=active!==npc||context!==house;
    if(!stale){
      history.push({role:'assistant',content:reply.slice(0,2000)});
      if(history.length>21)history.splice(0,history.length-21);
      line('npc',reply.slice(0,2000));
      status.textContent=online?'Groq live · '+npc.name+' · conversations kept in this tab only':status.textContent;
      input.disabled=false;send.disabled=false;busy=false;input.focus();
    }
  });
  const list=root.getElementById('npc-roster');
  if(list){
    for(const npc of NPCS){
      const button=root.createElement('button');button.className='npc-roster-item';
      button.textContent=npc.emoji+' '+npc.name+' · '+npc.title;
      button.addEventListener('click',()=>show(npc));
      list.appendChild(button);
    }
  }
  root.addEventListener('keydown',e=>{if(e.key==='Escape'&&!el.hidden){e.stopPropagation();close();}});
  return {show,close,isOpen:()=>!el.hidden,characters:NPCS,active:()=>active?.id||null};
}
