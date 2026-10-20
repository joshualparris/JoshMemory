import assert from 'node:assert/strict';
import * as THREE from 'three';
import { buildCivicInterior,CIVIC_INTERIOR_IDS } from '../src/world/shop-interior.js';
const label=()=>new THREE.Sprite(new THREE.SpriteMaterial());
assert(CIVIC_INTERIOR_IDS.length>=20,'at least 20 facility styles');
for(const id of CIVIC_INTERIOR_IDS){
  const site={id,name:id.replace(/-/g,' ')};
  const room=buildCivicInterior(site,label);
  if(id==='farmhouse') {
    assert.equal(room.rooms.length,10,'farmhouse must have 10 distinct spaces');
    assert(room.interactables.length>=20,'farmhouse must have domestic interactions');
    assert(room.interactables.some(x=>x.key==='farmhouse:pantry'));
    assert(room.exitZone.z1>room.spawn.z,'farmhouse exit must be reachable');
    room.group.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material?.dispose)o.material.dispose();});
    continue;
  }
  if(id==='hotel'){
    assert.equal(room.rooms.length,5,'hotel has reception and four real bedrooms');
    assert.equal(room.interactables.filter(x=>x.type==='bed').length,4);
    assert(room.exitZone.z1>room.spawn.z,'hotel must have walkable exit');
    room.group.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material?.dispose)o.material.dispose();});
    continue;
  }
  if(id==='fire'){
    // Researched country fire station: twin engine bay, dirty PPE/decon and BA rooms, clean watchroom and mess.
    assert.deepEqual(room.rooms.map(r=>r.name),['Engine bay','PPE and decontamination room','Breathing apparatus room','Watchroom','Mess and training room']);
    for(const k of ['pumper','exhaust','hazmat','hose','rating','ppc','washer','decon','basets','fill','test','printer','radio','pagers','map','board','kitchen','training','honour'])assert(room.interactables.some(x=>x.key==='fire:'+k),'fire '+k);
    assert(room.interactables.some(x=>x.act.do==='civic-ledger'),'station board opens the live station panel');
    // Walk the floor from the front door at the player's radius: every room and every hotspot is reachable.
    const hits=(x,z,r=.35)=>room.colliders.some(c=>x>c.x0-r&&x<c.x1+r&&z>c.z0-r&&z<c.z1+r);
    const step=.25,seen=new Set(['0,0']),queue=[[0,0]],o=room.spawn;
    assert(!hits(o.x,o.z),'spawn is clear');
    for(let i=0;i<queue.length;i++){const [gx,gz]=queue[i];for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=gx+dx,nz=gz+dz,x=o.x+nx*step,z=o.z+nz*step,key=nx+','+nz;if(seen.has(key)||x<-7||x>7||z<-12||z>6||hits(x,z))continue;seen.add(key);queue.push([nx,nz]);}}
    const pts=queue.map(([x,z])=>[o.x+x*step,o.z+z*step]);
    for(const r of room.rooms)assert(pts.some(([x,z])=>x>r.x0+.4&&x<r.x1-.4&&z>r.z0+.4&&z<r.z1-.4),'reach '+r.name);
    for(const x of room.interactables){
      assert(!hits(x.pos.x,x.pos.z,.3),'fire hotspot '+x.key+' is clear of furniture');
      assert(pts.some(([px,pz])=>Math.hypot(px-x.pos.x,pz-x.pos.z)<.6),'fire hotspot '+x.key+' is reachable on foot');
      const r=room.rooms[x.room];assert(x.pos.x>=r.x0&&x.pos.x<=r.x1&&x.pos.z>=r.z0&&x.pos.z<=r.z1,x.key+' is in '+r.name);
    }
    assert(!hits(room.staff.pos.x,room.staff.pos.z,.25)&&!hits(room.staff.use.x,room.staff.use.z,.3),'firefighter stands clear of the trucks');
    assert(room.windows.length>=4,'bay doors and side windows look out on the street');
    assert(room.group.children.length>300,'fire station is richly furnished');
    room.group.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material?.dispose)o.material.dispose();});
    continue;
  }
  assert.equal(room.rooms.length,1,id+' walk-in room');
  if(id==='depot'){
    assert(room.depotLayout,'depot uses its dedicated freight-house layout');
    assert.equal(room.interactables.length,7,'depot inspections and live ledger');
    assert(room.staff.pos.z<room.staff.use.z);
  } else if(id==='mill'){
    assert(room.millLayout,'mill uses its dedicated layout');
    assert.equal(room.interactables.length,7,'mill process inspections and live ledger');
    assert(room.staff.pos.z<room.staff.use.z);
  } else if(id==='bakery'){
    // Researched bakery: counter, pastry case, kitchen view, bread wall and café corner.
    for(const k of ['counter','pastries','kitchen','breadwall','cafe'])assert(room.interactables.some(x=>x.key==='bakery:'+k),'bakery '+k);
    assert.equal(room.sceneObjects.length,room.interactables.length,'bakery scene-aware objects');
    assert(room.group.children.length>400,'bakery is richly furnished');
    // Every hotspot must be reachable on foot and clear of furniture.
    for(const x of room.interactables){const hit=room.colliders.some(c=>x.pos.x>c.x0-0.35&&x.pos.x<c.x1+0.35&&x.pos.z>c.z0-0.35&&x.pos.z<c.z1+0.35);assert.equal(hit,false,'bakery hotspot '+x.key+' is clear');}
    assert(room.staff.pos.z<room.staff.use.z,'baker stands behind the counter');
    // Shelves follow the live stock: empty shelves have fewer meshes than full ones.
    const full=buildCivicInterior({id,name:'Bakery',out:{bread:30,pie:12}},label), bare=buildCivicInterior({id,name:'Bakery',out:{bread:0,pie:0}},label);
    assert(bare.group.children.length<full.group.children.length-40,'sold-out shelves look empty');
    assert(bare.interactables.find(x=>x.key==='bakery:breadwall').act.text.includes('0 loaves'),'bread wall reports stock');
  } else if(id==='bank'){
    // Researched bank branch: counter, ATM, advice desks, private office, vault, waiting area.
    for(const k of ['counter','atm','advice','loans','vault','lounge'])assert(room.interactables.some(x=>x.key==='bank:'+k),'bank '+k);
    assert.equal(room.sceneObjects.length,room.interactables.length,'bank scene-aware objects');
    assert(room.group.children.length>300,'bank is richly furnished');
    for(const x of room.interactables){const hit=room.colliders.some(c=>x.pos.x>c.x0-0.35&&x.pos.x<c.x1+0.35&&x.pos.z>c.z0-0.35&&x.pos.z<c.z1+0.35);assert.equal(hit,false,'bank hotspot '+x.key+' is clear');}
    assert(room.staff.pos.z<room.staff.use.z,'teller stands behind the counter');
    assert(room.staff.pos.z<-5.95,'teller is behind the counter line');
    // Tellers are far from the door and a queue lane leads to them down the middle.
    assert(room.staff.pos.z<-4&&room.spawn.z>3,'teller line is at the back, far from the entrance');
    assert(room.colliders.filter(c=>Math.abs(Math.abs((c.x0+c.x1)/2)-1.15)<0.01&&(c.z1-c.z0)>3).length===2,'queue lane has two rope sides');
  } else if(id==='store'||id==='cafe'||id==='pub'||id==='post'||id==='clinic'||id==='hall'||id==='greengrocer'||id==='butcher'||id==='school'||['sheep','dairy','coop','orchard','garden','silo'].includes(id)){
    // Researched dedicated interiors: full-width counter, staff behind it, hotspots clear of furniture.
    assert(room.interactables.length>=4,id+' has several interactive features');
    assert.equal(room.sceneObjects.length,room.interactables.length,id+' scene-aware objects');
    assert(room.group.children.length>250,id+' is richly furnished');
    assert(room.staff&&room.staff.pos.z<room.staff.use.z,id+' staff stands behind the counter');
    for(const x of room.interactables){const hit=room.colliders.some(c=>x.pos.x>c.x0-0.35&&x.pos.x<c.x1+0.35&&x.pos.z>c.z0-0.35&&x.pos.z<c.z1+0.35);assert.equal(hit,false,id+' hotspot '+x.key+' is clear');}
  } else {
  assert.equal(room.interactables.length,3,id+' three interactive features');
  assert.equal(room.sceneObjects.length,3,id+' scene-aware objects');
  }
  assert(room.colliders.length>=7,id+' walls and counters');
  assert.equal(room.spawn.z,3.75);
  assert(room.exitZone.z1>room.spawn.z);
  for(const p of [{x:0,z:3.75},{x:0,z:5.2},{x:0,z:-3.5},{x:0,z:-4.5}]) {
    const hit=room.colliders.some(c=>p.x>c.x0&&p.x<c.x1&&p.z>c.z0&&p.z<c.z1);
    assert.equal(hit,false,id+' aisle is traversable at '+JSON.stringify(p));
  }
  assert(room.interactables.some(x=>x.act.do==='civic-ledger'),id+' ledger counter');
  assert(room.group.children.length>20,id+' has furnished meshes');
  room.group.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material?.dispose)o.material.dispose();});
}
console.log('PASS: '+CIVIC_INTERIOR_IDS.length+' civic/farm/shop interiors, including a 10-area farmhouse');
