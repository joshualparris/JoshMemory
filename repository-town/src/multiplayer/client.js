// Optional account-based multiplayer: presence (v1) plus chat, emotes and roster (v2).
// Existing local progress stays local; the server never becomes a source of truth.
const API='https://repo-town-multiplayer.parris-neathaustralia.workers.dev';
const KEY='repo-town-multiplayer-session-v1';
const EMOTES=['wave','dance','point','cheer','sit','bow'];
const EMOTE_MS={wave:2600,dance:3200,point:2600,cheer:2600,sit:8000,bow:2200};
const el=id=>document.getElementById(id);
const storage={
  get(){try{return sessionStorage.getItem(KEY);}catch{return null;}},
  set(t){try{sessionStorage.setItem(KEY,t);}catch{}},
  clear(){try{sessionStorage.removeItem(KEY);}catch{}}
};
function nameTag(THREE,name){
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=64;
  const context=canvas.getContext('2d');
  context.fillStyle='rgba(13,28,40,.9)';context.fillRect(3,4,250,56);
  context.fillStyle='#f3faf9';context.font='bold 25px system-ui';
  context.textAlign='center';context.textBaseline='middle';
  context.fillText(name,128,32,238);
  const texture=new THREE.CanvasTexture(canvas);
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false}));
  sprite.scale.set(2.1,.53,1);sprite.position.y=2.23;
  return sprite;
}
function speechBubble(THREE,text){
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=160;
  const context=canvas.getContext('2d');
  context.fillStyle='rgba(244,251,250,.95)';
  const radius=18,x=6,y=6,w=500,h=148;
  context.beginPath();
  context.moveTo(x+radius,y);context.arcTo(x+w,y,x+w,y+h,radius);context.arcTo(x+w,y+h,x,y+h,radius);
  context.arcTo(x,y+h,x,y,radius);context.arcTo(x,y,x+w,y,radius);context.closePath();context.fill();
  context.fillStyle='#12242f';context.font='600 27px system-ui';
  context.textAlign='center';context.textBaseline='middle';
  // Wrap to at most three lines; extra characters are trimmed.
  const words=String(text).split(' ');const lines=[];let line='';
  for(const word of words){
    const attempt=line?line+' '+word:word;
    if(context.measureText(attempt).width>460&&line){lines.push(line);line=word;}
    else line=attempt;
    if(lines.length===3)break;
  }
  if(lines.length<3&&line)lines.push(line);
  lines.forEach((value,index)=>context.fillText(value,256,34+index*46,470));
  const texture=new THREE.CanvasTexture(canvas);
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false,opacity:0}));
  sprite.scale.set(2.8,.88,1);sprite.position.y=3.05;sprite.visible=false;
  return sprite;
}
function colour(name){
  let h=0;for(const c of name)h=((h*33)^c.charCodeAt(0))>>>0;
  return [0x52c6b5,0xffb264,0x91b8f2,0xee9fd4,0xc5d779][h%5];
}
// Articulated remote avatar: torso, head, pivoting arms and legs, name tag and chat bubble.
function buildAvatar(THREE,name){
  const shade=colour(name||'player');
  const root=new THREE.Group();
  const body=new THREE.Group();root.add(body);
  const torso=new THREE.Mesh(new THREE.BoxGeometry(.5,.62,.3),new THREE.MeshBasicMaterial({color:shade}));
  torso.position.y=1.06;body.add(torso);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.26,10,8),new THREE.MeshBasicMaterial({color:0xf5c9ab}));
  head.position.y=1.66;body.add(head);
  const limb=(x,y,upper,offset)=>{const pivot=new THREE.Group();pivot.position.set(x,y,0);
    const mesh=new THREE.Mesh(upper,new THREE.MeshBasicMaterial({color:shade}));
    mesh.position.y=offset;pivot.add(mesh);return pivot;};
  const armLeft=limb(-.34,1.32,new THREE.BoxGeometry(.13,.52,.13),-.24);
  const armRight=limb(.34,1.32,new THREE.BoxGeometry(.13,.52,.13),-.24);
  const legLeft=limb(-.13,.74,new THREE.BoxGeometry(.16,.6,.16),-.3);
  const legRight=limb(.13,.74,new THREE.BoxGeometry(.16,.6,.16),-.3);
  body.add(armLeft,armRight);root.add(legLeft,legRight);
  const label=nameTag(THREE,name||'Player');root.add(label);
  const bubble=speechBubble(THREE,'');root.add(bubble);
  return {root,body,armLeft,armRight,legLeft,legRight,label,bubble};
}
function disposeAvatar(p){
  p.root.traverse(node=>{
    node.geometry?.dispose?.();
    if(node.material?.map&&node.material.map!==null)node.material.map.dispose?.();
    node.material?.dispose?.();
  });
  p.root.removeFromParent();
}
export function createMultiplayer({THREE,townGroup,getScene,getLocation}){
  let token=storage.get(), username='', myId='',socket=null,ready=false,open=false;
  let lastSent=null,lastTime=0,retry=null,disposed=false;
  let chatSupported=false,typing=false;
  const peers=new Map();const roster=new Map(); // roster: id -> name
  const button=document.createElement('button');
  button.type='button';button.id='btn-multiplayer';button.textContent='👥 Multiplayer';
  const anchor=el('btn-guide')||el('btn-settings');
  if(anchor)anchor.after(button);else el('hud')?.appendChild(button);
  const overlay=document.createElement('div');
  overlay.id='multiplayer-overlay';overlay.className='rt-mp-overlay';overlay.hidden=true;
  overlay.innerHTML=[
    '<section class="rt-mp-dialog" role="dialog" aria-modal="true" aria-labelledby="rt-mp-title">',
    '<div class="rt-mp-top"><h2 id="rt-mp-title">👥 Repository Town online</h2>',
    '<button id="rt-mp-close" type="button" aria-label="Close">✕</button></div>',
    '<p>Play with other people on different computers using separate accounts.</p>',
    '<p id="rt-mp-info" class="rt-mp-info" role="status" aria-live="polite">Not connected</p>',
    '<div id="rt-mp-auth">',
    '<label>Username<input id="rt-mp-username" autocomplete="username" maxlength="24" placeholder="Letters, numbers, underscore"></label>',
    '<label>Password<input id="rt-mp-password" type="password" autocomplete="current-password" placeholder="At least 12 characters"></label>',
    '<div class="rt-mp-actions"><button id="rt-mp-login" type="button">Sign in</button>',
    '<button id="rt-mp-register" type="button">Create account</button></div>',
    '<small>Passwords cannot currently be reset. Other players can see your username.</small></div>',
    '<div id="rt-mp-profile" hidden><p>Signed in as <strong id="rt-mp-name"></strong></p>',
    '<p id="rt-mp-count"></p>',
    '<div id="rt-mp-roster-box" hidden><strong>Online now</strong><ul id="rt-mp-roster"></ul></div>',
    '<p class="rt-mp-hint">Press T to chat. Try /wave, /dance, /point, /cheer, /sit, /bow or /w name message.</p>',
    '<button id="rt-mp-logout" type="button">Sign out</button></div>',
    '<p class="rt-mp-hint">Your characters, positions and chat are shared. NPCs, cars, money and saves still run locally.</p>',
    '</section>'
  ].join('');
  document.body.appendChild(overlay);
  // Chat dock: passive log plus a typing row opened with T or /.
  const chat=document.createElement('div');
  chat.id='rt-chat';chat.className='rt-chat';chat.hidden=true;
  chat.innerHTML=[
    '<div id="rt-chat-log" role="log" aria-live="polite" aria-label="Player chat"></div>',
    '<div id="rt-chat-row" class="rt-chat-row" hidden>',
    '<select id="rt-chat-channel" aria-label="Chat channel">',
    '<option value="local">Local (nearby)</option><option value="global">Global (everyone)</option></select>',
    '<input id="rt-chat-input" maxlength="200" autocomplete="off" spellcheck="false"',
    ' placeholder="Say something… /w name for a whisper, /wave to emote">',
    '<button id="rt-chat-send" type="button">Send</button></div>'
  ].join('');
  document.body.appendChild(chat);
  const info=el('rt-mp-info'), authBox=el('rt-mp-auth'), profile=el('rt-mp-profile');
  const uname=el('rt-mp-username'), pass=el('rt-mp-password');
  const chatLog=el('rt-chat-log'), chatRow=el('rt-chat-row'), chatInput=el('rt-chat-input');
  const chatChannel=el('rt-chat-channel');
  const message=(text,error=false)=>{info.textContent=text;info.dataset.error=String(error);};
  const count=()=>ready?peers.size+1:0;
  const refreshRoster=()=>{
    const box=el('rt-mp-roster-box'),list=el('rt-mp-roster');
    if(!box||!list)return;
    const names=[...roster.values()];
    box.hidden=!ready||!chatSupported||names.length===0;
    list.textContent='';
    for(const name of names){
      const item=document.createElement('li');
      item.textContent=name+(name===username?' (you)':'');
      list.appendChild(item);
    }
  };
  const refresh=()=>{
    authBox.hidden=!!username;profile.hidden=!username;
    el('rt-mp-name').textContent=username;
    el('rt-mp-count').textContent=ready?count()+' connected player(s)':'Connecting to server…';
    button.textContent=ready?'👥 Online '+count():username?'👥 Reconnecting':'👥 Multiplayer';
    chat.hidden=!(ready&&chatSupported);
    refreshRoster();
  };
  const hide=()=>{open=false;overlay.hidden=true;button.focus();};
  const show=()=>{open=true;overlay.hidden=false;refresh();(username?el('rt-mp-logout'):uname).focus();};
  button.addEventListener('click',()=>open?hide():show());
  el('rt-mp-close').addEventListener('click',hide);
  overlay.addEventListener('click',e=>{if(e.target===overlay)hide();});
  overlay.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();hide();}});
  // ---- chat ----
  const LOG_LIMIT=60;
  function log(kind,name,text){
    const entry=document.createElement('div');
    entry.className='rt-chat-line rt-chat-'+kind;
    const label=name?document.createElement('strong'):null;
    if(label){label.textContent=name+' ';}
    const body=document.createElement('span');body.textContent=text;
    if(label)entry.append(label);entry.append(body);
    chatLog.appendChild(entry);
    while(chatLog.children.length>LOG_LIMIT)chatLog.firstChild.remove();
    chatLog.scrollTop=chatLog.scrollHeight;
  }
  function openChat(prefill=''){
    if(!ready||!chatSupported||typing)return;
    typing=true;chatRow.hidden=false;chatInput.value=prefill;chatInput.focus();
  }
  function closeChat(){
    typing=false;chatRow.hidden=true;chatInput.blur();chatInput.value='';
  }
  addEventListener('keydown',e=>{
    if(!chatSupported||!ready||typing)return;
    if(e.target.closest?.('input, textarea, select, [contenteditable]'))return;
    const k=e.key.toLowerCase();
    if(k==='t'){e.preventDefault();openChat();}
    else if(k==='/'){e.preventDefault();openChat('/');}
  });
  chatInput.addEventListener('keydown',e=>{
    e.stopPropagation();
    if(e.key==='Escape'){e.preventDefault();closeChat();}
    else if(e.key==='Enter'){e.preventDefault();sendChat();}
  });
  el('rt-chat-send').addEventListener('click',sendChat);
  function sendChat(){
    const raw=chatInput.value.trim();
    if(!raw){closeChat();return;}
    if(socket?.readyState!==WebSocket.OPEN){log('system',null,'Not connected.');return;}
    let match=raw.match(/^\/(w|whisper|tell)\s+([a-z0-9_]{3,24})\s+([\s\S]+)$/i);
    if(match){socket.send(JSON.stringify({type:'chat',to:match[2].toLowerCase(),text:match[3]}));closeChat();return;}
    match=raw.match(/^\/(emote)\s+(\w+)$/i)||raw.match(/^\/(wave|dance|point|cheer|sit|bow)$/i);
    if(match){
      const emote=(match[2]||match[1]).toLowerCase();
      if(EMOTES.includes(emote))socket.send(JSON.stringify({type:'emote',name:emote}));
      else log('system',null,'Unknown emote. Try /wave /dance /point /cheer /sit /bow.');
      closeChat();return;
    }
    match=raw.match(/^\/([gl])\s+([\s\S]+)$/i);
    const channel=match?(match[1].toLowerCase()==='g'?'global':'local'):chatChannel.value;
    const text=match?match[2]:raw;
    if(text)socket.send(JSON.stringify({type:'chat',channel,text}));
    closeChat();
  }
  // ---- peers ----
  function remove(id){
    const p=peers.get(id);if(!p)return;
    disposeAvatar(p);peers.delete(id);
  }
  const clear=()=>{for(const id of [...peers.keys()])remove(id);refresh();};
  function peer(data){
    if(!data?.id||data.id===myId||![data.x,data.y,data.z,data.yaw].every(Number.isFinite))return;
    let p=peers.get(data.id);
    if(!p){
      if(peers.size>=79)return;
      p=buildAvatar(THREE,data.name);
      p.target=new THREE.Vector3(data.x,data.y,data.z);
      p.zone=data.zone;p.yaw=data.yaw;p.phase=0;p.speed=0;
      p.prev=new THREE.Vector3(data.x,data.y,data.z);
      p.emote=null;p.bubbleUntil=0;p.bubbleText='';
      p.root.position.copy(p.target);townGroup.add(p.root);
      peers.set(data.id,p);
    }
    p.zone=data.zone;p.target.set(data.x,data.y,data.z);p.yaw=data.yaw;refresh();
  }
  function showBubble(p,text){
    if(!p.bubble)return;
    const fresh=p.bubbleText!==text;
    if(fresh){
      p.bubble.material.map.dispose();
      p.bubble.material.map=speechBubble(THREE,text).material.map;
      p.bubbleText=text;
    }
    p.bubble.visible=true;p.bubbleUntil=performance.now()+6000;
  }
  function sendState(){
    if(!ready||socket?.readyState!==WebSocket.OPEN)return;
    const p=getLocation();
    if(!p||![p.x,p.y,p.z,p.yaw].every(Number.isFinite))return;
    const now=Date.now(),moved=!lastSent||p.zone!==lastSent.zone||
      Math.hypot(p.x-lastSent.x,p.y-lastSent.y,p.z-lastSent.z)>.06||
      Math.abs(p.yaw-lastSent.yaw)>.06;
    if((moved&&now-lastTime<200)||(!moved&&now-lastTime<4000))return;
    socket.send(JSON.stringify({type:'state',zone:p.zone,x:p.x,y:p.y,z:p.z,yaw:p.yaw}));
    lastSent={...p};lastTime=now;
  }
  function disconnected(){
    ready=false;myId='';lastSent=null;clear();roster.clear();refreshRoster();refresh();
  }
  function close(){
    if(retry){clearTimeout(retry);retry=null;}
    if(socket){const s=socket;socket=null;s.onclose=null;s.onerror=null;s.onmessage=null;s.close();}
    disconnected();
  }
  function handleServerMessage(msg){
    if(msg.type==='join'||msg.type==='state')peer(msg);
    else if(msg.type==='leave'){remove(msg.id);roster.delete(msg.id);refresh();}
    else if(msg.type==='players'){
      roster.clear();for(const player of msg.players||[])roster.set(player.id,player.name);
      refreshRoster();
    }
    else if(msg.type==='chat'){
      if(msg.channel==='whisper'){
        if(msg.from===username)log('whisper-out','To '+msg.to,msg.text+(msg.delivered?'':' (not online)'));
        else log('whisper-in','From '+msg.from,msg.text);
        return;
      }
      log(msg.channel||'local',msg.name,msg.text);
      if(msg.id&&msg.id!==myId){
        const p=peers.get(msg.id);
        if(p)showBubble(p,msg.text);
      }
    }
    else if(msg.type==='history')for(const item of msg.messages||[])log('history',item.name,item.text);
    else if(msg.type==='emote'){
      const p=peers.get(msg.id);
      if(p&&EMOTES.includes(msg.emote))p.emote={name:msg.emote,until:performance.now()+EMOTE_MS[msg.emote]};
    }
    else if(msg.type==='chaterr')log('system',null,msg.error||'Message not sent.');
  }
  function connect(){
    if(!token||!username||disposed||socket)return;
    const s=new WebSocket(API.replace('https://','wss://')+'/ws');
    socket=s;refresh();
    s.onopen=()=>s.send(JSON.stringify({type:'hello',token}));
    s.onmessage=e=>{
      let msg;try{msg=JSON.parse(e.data);}catch{return;}
      if(msg.type==='welcome'){
        ready=true;myId=msg.id;clear();
        for(const p of msg.players||[])peer(p);
        roster.clear();roster.set(msg.id,msg.name);
        message('Connected to the shared town');refresh();sendState();
      }else handleServerMessage(msg);
    };
    s.onclose=e=>{
      if(socket!==s)return;
      socket=null;disconnected();
      if(e.code===1008){token=null;username='';storage.clear();message('Session expired. Sign in again.',true);refresh();return;}
      if(token&&!disposed){message('Connection lost. Reconnecting…',true);retry=setTimeout(()=>{retry=null;connect();},2500);}
    };
    s.onerror=()=>message('Cannot contact multiplayer server.',true);
  }
  async function api(path,fields=null,bearer=token){
    const response=await fetch(API+path,{
      method:fields?'POST':'GET',
      headers:{...(fields?{'content-type':'application/json'}:{}),...(bearer?{authorization:'Bearer '+bearer}:{})},
      ...(fields?{body:JSON.stringify(fields)}:{})
    });
    const data=await response.json();if(!response.ok)throw new Error(data.error||'Server unavailable');
    return data;
  }
  async function signIn(kind){
    const target=el('rt-mp-'+kind),other=el(kind==='login'?'rt-mp-register':'rt-mp-login');
    target.disabled=true;other.disabled=true;
    message(kind==='login'?'Signing in…':'Creating account…');
    try{
      const data=await api('/'+kind,{username:uname.value.trim(),password:pass.value},null);
      close();token=data.token;username=data.username;storage.set(token);
      pass.value='';message('Account ready. Connecting…');refresh();connect();
    }catch(e){message(e.message,true);}
    finally{target.disabled=false;other.disabled=false;}
  }
  el('rt-mp-login').addEventListener('click',()=>signIn('login'));
  el('rt-mp-register').addEventListener('click',()=>signIn('register'));
  pass.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();signIn('login');}});
  el('rt-mp-logout').addEventListener('click',async()=>{
    const previous=token;close();token=null;username='';storage.clear();
    message('Signed out');refresh();
    if(previous)try{await api('/logout',{},previous);}catch{}
  });
  if(token)api('/me',null,token).then(data=>{if(!disposed){username=data.username;refresh();connect();}})
    .catch(()=>{token=null;storage.clear();message('Please sign in to play online.');refresh();});
  else refresh();
  // Chat and roster need the v2 server; older deployments stay presence-only.
  fetch(API+'/health').then(r=>r.json()).then(d=>{
    if(disposed)return;
    chatSupported=!!d?.ok&&Number(d.protocol)>=2;refresh();
  }).catch(()=>{});
  const heartbeat=setInterval(()=>{if(document.hidden)sendState();},4000);
  addEventListener('pagehide',close);
  // Emote pose overrides; returns to the walk cycle afterwards.
  function animate(p,dt,now){
    const moving=Math.hypot(p.root.position.x-p.prev.x,p.root.position.z-p.prev.z);
    p.speed=moving/Math.max(dt,.001);
    p.prev.copy(p.root.position);
    const walk=Math.min(1,p.speed/2.2);
    p.phase+=p.speed*dt*4.2;
    const swing=Math.sin(p.phase)*.72*walk;
    let armL=-swing*.8,armR=swing*.8,armLZ=0,armRZ=0,legL=swing,legR=-swing;
    let bodyPitch=0,bodyYaw=0,bodyY=0,legBase=0;
    if(p.emote){
      const t=(now-(p.emote.until-EMOTE_MS[p.emote.name]))/1000;
      switch(p.emote.name){
        case 'wave':armRZ=-2.35;armR=Math.sin(t*9)*.5-.2;break;
        case 'point':armR=-1.55;break;
        case 'cheer':armLZ=2.3;armRZ=-2.3;bodyY=Math.abs(Math.sin(t*9))*.09;break;
        case 'dance':bodyYaw=Math.sin(t*6.5)*.55;armL=-1.2+Math.sin(t*6.5)*.8;armR=-1.2-Math.sin(t*6.5)*.8;break;
        case 'sit':legBase=-1.5;bodyY=-.42;break;
        case 'bow':bodyPitch=Math.min(.95,t*3)*(t>1.5?Math.max(0,1-(t-1.5)*2):1);break;
      }
      if(now>=p.emote.until)p.emote=null;
    }
    const ease=Math.min(1,dt*10);
    p.armLeft.rotation.x+=(armL-p.armLeft.rotation.x)*ease;
    p.armRight.rotation.x+=(armR-p.armRight.rotation.x)*ease;
    p.armLeft.rotation.z+=(armLZ-p.armLeft.rotation.z)*ease;
    p.armRight.rotation.z+=(armRZ-p.armRight.rotation.z)*ease;
    p.legLeft.rotation.x+=(legL+legBase-p.legLeft.rotation.x)*ease;
    p.legRight.rotation.x+=(legR+legBase-p.legRight.rotation.x)*ease;
    p.body.rotation.x+=(bodyPitch-p.body.rotation.x)*ease;
    p.body.rotation.y+=(bodyYaw-p.body.rotation.y)*ease;
    p.body.position.y+=(bodyY-p.body.position.y)*ease;
    if(p.bubble){
      const remaining=p.bubbleUntil-now;
      p.bubble.visible=remaining>0;
      p.bubble.material.opacity=Math.min(1,remaining/800);
    }
  }
  return{
    isOpen:()=>open,close:hide,
    isTyping:()=>typing,
    chatSupported:()=>chatSupported,
    info:()=>({connected:ready,username,players:count(),visible:[...peers.values()].filter(p=>p.root.visible).length,
      chat:chatSupported,typing,roster:[...roster.values()],
      emoting:[...peers.values()].filter(p=>p.emote).map(p=>p.name),
      bubbling:[...peers.values()].filter(p=>p.bubble?.visible).map(p=>p.name)}),
    update(dt){
      if(!ready)return;
      const self=getLocation(),parent=getScene()||townGroup,now=performance.now();
      for(const p of peers.values()){
        p.root.visible=p.zone===self.zone&&Math.hypot(p.target.x-self.x,p.target.z-self.z)<90;
        if(!p.root.visible)continue;
        if(p.root.parent!==parent){p.root.removeFromParent();parent.add(p.root);}
        p.root.position.lerp(p.target,Math.min(1,dt*9));
        const angle=Math.atan2(Math.sin(p.yaw-p.root.rotation.y),Math.cos(p.yaw-p.root.rotation.y));
        p.root.rotation.y+=angle*Math.min(1,dt*9);
        animate(p,dt,now);
      }
      sendState();
    },
    destroy(){
      disposed=true;clearInterval(heartbeat);close();clear();button.remove();overlay.remove();chat.remove();
    }
  };
}
