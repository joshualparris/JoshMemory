// Live two-device protocol test: creates two temporary accounts with strong random passwords.
// Run: node --check src/main.js && node --check src/multiplayer/client.js &&
//      MULTIPLAYER_URL=https://repo-town-multiplayer.parris-neathaustralia.workers.dev node tests/multiplayer-live.mjs
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';

const host = process.env.MULTIPLAYER_URL || 'https://repo-town-multiplayer.parris-neathaustralia.workers.dev';
const origin = 'https://repository-town-claude-complete.vercel.app';
const wsUrl=host.replace(/^https:/,'wss:')+'/ws';
async function api(path,body,token,overrideOrigin=origin){
  const res=await fetch(host+path,{
    method:body?'POST':'GET',
    headers:{origin:overrideOrigin,...(body?{'content-type':'application/json'}:{}),...(token?{authorization:'Bearer '+token}:{})},
    ...(body?{body:JSON.stringify(body)}:{})
  });
  const raw=await res.text();let body;try{body=JSON.parse(raw);}catch{throw Error('API '+path+' returned non-JSON HTTP '+res.status+': '+raw.slice(0,400));}
  return {status:res.status,body};
}
function next(ws,test,timeout=10000){
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{finish();reject(Error('WebSocket event timed out'));},timeout);
    const message=e=>{try{const data=JSON.parse(e.data);if(test(data)){finish();resolve(data);}}catch{}};
    const close=()=>{finish();reject(Error('WebSocket closed before expected message'));};
    function finish(){clearTimeout(timer);ws.removeEventListener('message',message);ws.removeEventListener('close',close);}
    ws.addEventListener('message',message);ws.addEventListener('close',close);
  });
}
function open(){
  return new Promise((resolve,reject)=>{
    const ws=new WebSocket(wsUrl);
    const timer=setTimeout(()=>{ws.close();reject(Error('WebSocket open timed out'));},10000);
    ws.addEventListener('open',()=>{clearTimeout(timer);resolve(ws);},{once:true});
    ws.addEventListener('error',()=>{clearTimeout(timer);reject(Error('WebSocket connection failed'));},{once:true});
  });
}
const suffix=randomBytes(5).toString('hex');
const users=[
  {username:'rtqa_'+suffix+'a',password:randomBytes(18).toString('base64url')},
  {username:'rtqa_'+suffix+'b',password:randomBytes(18).toString('base64url')}
];
const sockets=[];
try{
  assert.deepEqual((await api('/health')).body,{ok:true,service:'repo-town-multiplayer',protocol:1});
  assert.equal((await api('/register',{username:'attacker',password:'not_long_enough'},null,'https://not-repotown.example')).status,403);
  const registrations=await Promise.all(users.map(({username,password})=>api('/register',{username,password})));
  for(const [i,result] of registrations.entries()){
    assert.equal(result.status,200,'register account '+i+': '+JSON.stringify(result.body));
    users[i].token=result.body.token;
    assert.equal(result.body.username,users[i].username);
  }
  assert.notEqual(users[0].token,users[1].token);
  assert.equal((await api('/me',null,users[0].token)).body.username,users[0].username);
  assert.equal((await api('/login',{username:users[0].username,password:'wrong-password-123456'})).status,401);
  assert.equal((await api('/login',{username:users[0].username,password:users[0].password})).status,200);
  const a=await open(),b=await open();sockets.push(a,b);
  const aHello=next(a,v=>v.type==='welcome');
  a.send(JSON.stringify({type:'hello',token:users[0].token}));
  const aWelcome=await aHello;
  assert.equal(aWelcome.name,users[0].username);
  a.send(JSON.stringify({type:'state',zone:'town',x:5,y:0,z:9,yaw:1}));
  const bHello=next(b,v=>v.type==='welcome');
  b.send(JSON.stringify({type:'hello',token:users[1].token}));
  const bWelcome=await bHello;
  assert.equal(bWelcome.name,users[1].username);
  assert(bWelcome.players.some(p=>p.id===aWelcome.id && p.x===5),'second computer must see first computer in snapshot');
  const aJoin=next(a,v=>v.type==='join' && v.id===bWelcome.id);
  b.send(JSON.stringify({type:'state',zone:'town',x:5.2,y:0,z:9,yaw:0}));
  const join=await aJoin;
  assert.equal(join.name,users[1].username);
  await new Promise(r=>setTimeout(r,180));
  const bMove=next(b,v=>v.type==='state' && v.id===aWelcome.id && v.x===7);
  a.send(JSON.stringify({type:'state',zone:'town',x:7,y:0,z:9,yaw:1.4,name:'spoof'}));
  const moved=await bMove;
  assert.equal(moved.name,users[0].username,'client cannot spoof a server-controlled player name');
  const aLeave=next(a,v=>v.type==='leave' && v.id===bWelcome.id);
  b.close();
  await aLeave;
  a.close();
  assert.equal((await api('/logout',{},users[0].token)).status,200);
  assert.equal((await api('/me',null,users[0].token)).status,401,'logout must revoke bearer');
  assert.equal((await api('/logout',{},users[1].token)).status,200);
  console.log('PASS: two accounts, authentication, independent WebSockets, presence, movement, spoof protection, disconnect and logout');
}finally{
  for(const ws of sockets)try{ws.close();}catch{}
}
