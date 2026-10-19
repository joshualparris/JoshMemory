// Shop NPCs are sourced from the existing TownLife roster, not a second
// disconnected set of random names. A volunteer host covers unstaffed places.
import * as THREE from 'three';
import { makePerson, Walker } from './npcs.js';

const SHIRTS={shop:0x557e9f,cafe:0x528c75,pub:0x9b6847,farm:0x71914e,clinic:0x77a7ac,school:0x6883b0,post:0x96745c};
const HOST_NAMES={square:'Market Guide',farmhouse:'Nell'};

export function populateShopStaff(site,life,interior,makeLabel){
  const workers=life.villagers.filter(v=>v.work===site.id);
  // Keep the worker's real name, role, and home available to the conversation.
  const worker=workers.find(v=>v.step?.kind==='work'&&v.step.at===site.id&&!v.path?.length)
    || workers[0] || null;
  const name=worker?.name||HOST_NAMES[site.id]||site.name+' Guide';
  const job=worker?.job||(site.id==='farmhouse'?'farmhouse resident':site.kind==='farm'?'farm guide':'visitor assistant');
  if(site.id==='bakery'){
    // The actual TownLife Bakery has two shift bakers. Keep both names from
    // the simulation and place them by the till and dough bench respectively.
    // Do not replace them with arbitrary unconnected fictional names.
    const jobs=workers.slice(0,2);
    if(!jobs.length)jobs.push(null);
    const spots=[
      {x:4.45,z:.65,tx:3.50,tz:2.43,room:0,role:'Bakery counter'},
      {x:-4.05,z:-1.65,tx:-3.18,tz:-3.45,room:2,role:'Mixing bench'}
    ];
    const result=[];
    for(let i=0;i<Math.min(jobs.length,2);i++){
      const v=jobs[i],p=spots[i];
      const who=v?.name||'Bakery Assistant',work=v?.job||'shop assistant';
      const pos=new THREE.Vector3(p.x,0,p.z);
      const model=makePerson(59+i*13,0xb4a18e,0x343b45);
      const npc=new Walker(model,pos,{name:who,speed:.4});
      npc.key='staff:bakery'+(i?':baker':'');
      npc.room=p.room;
      npc.heading=0;npc.group.rotation.y=0;
      npc.v=v;npc.workplace='Bakery';
      npc.activity=(i?'preparing dough':'serving the sales counter')+' at the Bakery';
      npc.plan=()=>[];
      const label=makeLabel(who+' · '+work,'interactive');
      label.position.set(0,2.30,0);label.userData.labelKind='interactive';
      npc.group.add(label);npc.tag=label;interior.group.add(npc.group);
      const usePos=new THREE.Vector3(p.tx,0,p.tz);
      interior.interactables.push({
        key:npc.key,label:'Talk to '+who,person:true,type:'npc',
        room:p.room,roomName:interior.rooms[p.room]?.name||'Bakery',pos:usePos,
        act:{do:'npc',name:who,role:'villager',job:work,workplace:'Bakery'}
      });
      interior.sceneObjects.push({type:'person',label:who+' ('+work+')',
        room:p.room,pos:{x:p.x,z:p.z},interactive:true});
      result.push(npc);
    }
    return result;
  }
  const home=site.id==='farmhouse';
  const pos=home?new THREE.Vector3(-5.20,0,-3.65):new THREE.Vector3(2.65,0,-8.25);
  const seed=[...site.id].reduce((x,ch)=>x+ch.charCodeAt(0),31);
  const model=makePerson(seed,SHIRTS[site.kind]||0x7297aa,0x303e4e);
  const npc=new Walker(model,pos,{name,speed:0.4});
  npc.heading=0; // Face towards the front door, behind the service counter.
  npc.group.rotation.y=0;
  npc.key='staff:'+site.id;
  npc.room=home?3:0;
  npc.activity=home?'at home organising family farm jobs':job+' at '+site.name;
  npc.v=worker;
  npc.workplace=site.name;
  // The counter blocks passage but not conversation: interaction hotspot
  // is on the customer's side, close enough to press E/✋ without clipping.
  const label=makeLabel(name+' · '+job,'interactive');
  label.position.set(0,2.28,0);
  label.userData.labelKind='interactive';
  npc.tag=label;
  npc.group.add(label);
  interior.group.add(npc.group);
  npc.plan=()=>[]; // Stay at the counter instead of walking through furniture.
  const posUse=home?new THREE.Vector3(-5.10,0,-3.10):new THREE.Vector3(2.6,0,-5.1);
  interior.interactables.push({
    key:npc.key,label:'Talk to '+name,type:'npc',person:true,room:npc.room,
    roomName:interior.rooms[npc.room].name,pos:posUse,
    act:{do:'npc',name,role:'villager',workplace:site.name,job},
  });
  interior.sceneObjects.push({type:'person',label:name+' ('+job+')',room:npc.room,
    pos:{x:pos.x,z:pos.z},interactive:true});
  return [npc];
}
