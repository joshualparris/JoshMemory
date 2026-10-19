import assert from 'node:assert/strict';
import {NPCS,getNPC} from '../src/ui/npc-data.js';
import handler from '../api/npc-chat.js';
import * as THREE from 'three';
import {placeTownNPCs,animateNPCs} from '../src/world/npcs.js';
import fs from 'node:fs';
assert.equal(NPCS.length,32);
const newNPCs=NPCS.filter(n=>n.shape);
assert.equal(newNPCs.length,20);
assert.equal(new Set(newNPCs.map(n=>n.shape)).size,20);
assert(newNPCs.every(n=>n.challenge && n.challenge.choices.length===3 && Number.isInteger(n.challenge.answer) && n.challenge.answer>=0 && n.challenge.answer<3 && n.challenge.reward));
assert(newNPCs.every(n=>n.prompts && n.prompts.length>=3));
assert.equal(new Set(NPCS.map(n=>n.id)).size,32);
const inventory=JSON.parse(fs.readFileSync(new URL('../../docs/repository-town.json',import.meta.url),'utf8'));
const occupied=new Set(inventory.projects.map(p=>p.coordinate));
assert(NPCS.every(n=>occupied.has(n.coordinate)),'Every NPC needs an occupied town lot');
assert(NPCS.every(n=>n.name && n.title && n.personality && n.coordinate));
assert.equal(getNPC('rowan')?.name,'Rowan');
const fakeLots=new Map(NPCS.map((npc,i)=>[npc.coordinate,{
  lot:{z:i*30},doorPos:new THREE.Vector3(i*22,0,i*30+10)
}]));
const npcGroup=new THREE.Group();
const placed=placeTownNPCs(npcGroup,fakeLots,()=>new THREE.Object3D());
assert.equal(placed.length,32);
assert.equal(npcGroup.children.length,32);
const rowan=placed.find(n=>n.npc.id==='rowan');
assert(Math.hypot(rowan.pos.x,rowan.pos.z-(fakeLots.get('M4').lot.z+16))<3.5,'Rowan must greet the spawn');
animateNPCs(placed,1,new THREE.Vector3(rowan.pos.x,0,rowan.pos.z));
assert(rowan.group.visible);
for(const e of placed){
  assert(e.group.userData.body,'NPC model missing for '+e.npc.id);
  assert(e.group.userData.body.children.length>=3,'NPC silhouette incomplete: '+e.npc.id);
  assert.equal(e.group.userData.npc.id,e.npc.id);
  assert(Number.isFinite(e.pos.x)&&Number.isFinite(e.pos.z));
}
assert(new Set(placed.map(e=>e.npc.coordinate)).size===NPCS.length,'NPCs must occupy unique house coordinates');

const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const npcJs=fs.readFileSync(new URL('../src/ui/npc.js',import.meta.url),'utf8');
const npcChatJs=fs.readFileSync(new URL('../src/ui/npc-chat.js',import.meta.url),'utf8');
assert(main.includes('placeTownNPCs') && main.includes('createTownLife'));
assert(!main.includes('takeKeysFromHash') && !npcJs.includes('api.groq.com') && !npcChatJs.includes('api.groq.com'), 'Client code must never call api.groq.com directly');
assert(fs.readFileSync(new URL('../src/index.html',import.meta.url),'utf8').includes('id="npc-chat"'));
assert(fs.readFileSync(new URL('../src/people.html',import.meta.url),'utf8').includes('people.js'));
process.env.GROQ_API_KEY='fake-key-1,fake-key-2';
process.env.TOWN_NPC_PIN='fake-code-for-test';
const usedKeys=[];
const oldFetch=globalThis.fetch;
globalThis.fetch=async(_url,init)=>{
  const auth=String(init?.headers?.Authorization||'').replace('Bearer ','');
  usedKeys.push(auth);
  if(auth==='fake-key-1'&&usedKeys.length===2)return {ok:false,status:429,json:async()=>({error:'rate limited'})};
  return {ok:true,status:200,json:async()=>({choices:[{message:{content:'NPC reply'}}]})};
};
const req=(code,extra={})=>({method:'POST',headers:{origin:'https://town.test',host:'town.test','x-npc-code':code,'x-forwarded-for':'npc-test'},body:{npcId:'rowan',messages:[{role:'user',content:'Hello!'}],...extra}});
async function respond(request){const res={statusCode:200,setHeader(){},end(x){this.data=JSON.parse(x);}};await handler(request,res);return res;}
const denied=await respond(req('wrong'));
assert.equal(denied.statusCode,401);assert.equal(usedKeys.length,0);
const allowed=await respond(req('fake-code-for-test'));
assert.equal(allowed.statusCode,200);assert.equal(allowed.data.reply,'NPC reply');assert.equal(usedKeys.length,1);
const residentAllowed=await respond(req('fake-code-for-test',{npcId:'H1',resident:{name:'Ada',role:'resident',coordinate:'H1',street:'First Avenue',houseName:'JoshHub',kind:'hub',summary:'Game hub',isPublic:true,rooms:['Foyer','Arcade']}}));
assert.equal(residentAllowed.statusCode,200);assert.equal(residentAllowed.data.reply,'NPC reply');
assert.deepEqual(usedKeys,['fake-key-1','fake-key-1','fake-key-2'],'Server proxy rotates comma-separated GROQ_API_KEY on 429');
globalThis.fetch=oldFetch;
console.log('PASS: 32 NPCs, 20 distinct creature models and quests, 3D placement, guarded server-only Groq proxy');
