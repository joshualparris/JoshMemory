// Accessible NPC conversation UI shared by 3D Repository Town and the 2D NPC lounge.
// Only the visitor's submitted conversation is sent to the server; nothing is stored remotely
// by Repository Town and no API key is ever sent to the browser.
import { NPCS, getNPC } from './npc-data.js';
import { creaturePrompt } from './npc-prompt.js';
import { groq, getKeys } from './npc.js';

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
  // Small local-only quest progress; neither badges nor scripted choices use Groq.
  const BADGE_KEY='repository-town:npc-badges:v1';
  let badges=[];
  try { const saved=JSON.parse(localStorage.getItem(BADGE_KEY)||'[]'); if(Array.isArray(saved))badges=saved.filter(v=>typeof v==='string').slice(0,100); } catch {}
  const activities=root.createElement('div');activities.id='npc-activities';activities.className='npc-activities';
  form.before(activities);
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
  function renderActivities(npc) {
    activities.replaceChildren();
    const prompts=(npc.prompts||[`Tell me something interesting, ${npc.name}`, 'Can you give me a creative challenge?', 'What can we talk about?']).slice(0,3);
    const caption=root.createElement('span');caption.className='npc-activity-label';caption.textContent='Try asking';activities.appendChild(caption);
    const promptsRow=root.createElement('div');promptsRow.className='npc-prompt-row';
    for(const prompt of prompts){
      const b=root.createElement('button');b.type='button';b.className='npc-suggestion';b.textContent=prompt;
      b.onclick=()=>{ input.value=prompt;input.focus(); };
      promptsRow.appendChild(b);
    }
    activities.appendChild(promptsRow);
    if(npc.challenge){
      const area=root.createElement('div');area.className='npc-quest-area';
      const toggle=root.createElement('button');toggle.type='button';toggle.className='npc-quest-toggle';
      const earned=badges.includes(npc.id);
      toggle.textContent=(earned?'🏅 Replay quest: ':'🗺 Try quest: ')+npc.challenge.title;
      area.appendChild(toggle);activities.appendChild(area);
      toggle.onclick=()=>{
        const old=area.querySelector('.npc-quest');if(old){old.remove();return;}
        const quest=root.createElement('div');quest.className='npc-quest';
        const question=root.createElement('p');question.textContent=npc.challenge.question;quest.appendChild(question);
        const choices=root.createElement('div');choices.className='npc-quest-choices';quest.appendChild(choices);
        const result=root.createElement('p');result.className='npc-quest-result';result.setAttribute('role','status');
        npc.challenge.choices.forEach((label,index)=>{
          const b=root.createElement('button');b.type='button';b.textContent=label;
          b.addEventListener('click',()=>{
            choices.querySelectorAll('button').forEach(x=>x.disabled=true);
            if(index===npc.challenge.answer){
              result.textContent='✅ '+npc.challenge.reward;
              if(!badges.includes(npc.id)){
                badges.push(npc.id);try{localStorage.setItem(BADGE_KEY,JSON.stringify(badges));}catch{}
                updateQuestCount();
              }
              toggle.textContent='🏅 Replay quest: '+npc.challenge.title;
              updateRosterBadge(npc.id);
            }else result.textContent='Not quite! '+npc.name+' will give you another go.';
            const again=root.createElement('button');again.type='button';again.className='npc-quest-retry';again.textContent='↻ Try again';
            again.onclick=()=>{quest.remove();toggle.click();};quest.appendChild(again);
          });choices.appendChild(b);
        });
        quest.appendChild(result);area.appendChild(quest);
      };
    }
  }
  function updateQuestCount() {
    const el=root.getElementById('npc-quest-count');
    if(el)el.textContent=`🏅 ${badges.filter(id=>NPCS.some(n=>n.id===id&&n.challenge)).length}/${NPCS.filter(n=>n.challenge).length} quests complete`;
  }
  function updateRosterBadge(id) {
    const el=root.querySelector('[data-npc-id="'+id+'"]');
    const npc=getNPC(id);
    if(el&&npc)el.textContent=(badges.includes(id)?'🏅 ':'')+npc.emoji+' '+npc.name+' · '+npc.title;
  }
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
    renderActivities(npc);
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
    // A Groq key saved on this device (GitHub Pages, offline zip) answers directly;
    // otherwise the Vercel proxy answers for visitors holding the playtest access code.
    if(getKeys().length) {
      try {
        reply=await groq([{role:'system',content:creaturePrompt(npc)},...history.slice(-8).map(({role,content})=>({role,content}))]);
        online=true;
      } catch(err) {
        reply=FALLBACK[count++%FALLBACK.length]+(err.code==='badkey'?' (Groq rejected the saved key.)':err.code==='busy'?' (Groq is busy right now.)':' (Offline.)');
      }
    } else if(!accessCode) {
      reply=FALLBACK[count++%FALLBACK.length];
      status.textContent='Offline dialogue · save a Groq key in any house resident\'s chat, or enter the playtest access code';
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
  const list=root.getElementById('npc-roster-items');
  if(list){
    const search=root.createElement('input');search.type='search';search.id='npc-roster-search';
    search.placeholder='Find a resident or creature…';search.setAttribute('aria-label','Filter residents');
    list.before(search);
    const tally=root.createElement('p');tally.id='npc-quest-count';tally.className='npc-quest-count';
    search.before(tally);
    for(const npc of NPCS){
      const button=root.createElement('button');button.className='npc-roster-item';
      button.dataset.npcId=npc.id;
      button.textContent=(badges.includes(npc.id)?'🏅 ':'')+npc.emoji+' '+npc.name+' · '+npc.title;
      button.addEventListener('click',()=>{show(npc);if(root.body.classList.contains('npc-lounge'))el.scrollIntoView({behavior:'smooth',block:'start'});else root.getElementById('npc-roster').hidden=true;});
      list.appendChild(button);
    }
    updateQuestCount();
    search.addEventListener('input',()=>{
      const term=search.value.trim().toLowerCase();
      list.querySelectorAll('button[data-npc-id]').forEach(b=>{
        const npc=getNPC(b.dataset.npcId);
        b.hidden=!([npc.name,npc.title,npc.shape||'',npc.coordinate].join(' ').toLowerCase().includes(term));
      });
    });
  }
  root.addEventListener('keydown',e=>{if(e.key==='Escape'&&!el.hidden){e.stopPropagation();close();}});
  return {show,close,isOpen:()=>!el.hidden,characters:NPCS,active:()=>active?.id||null};
}
