import assert from 'node:assert/strict';
import * as THREE from 'three';
import { buildCivicInterior,CIVIC_INTERIOR_IDS } from '../src/world/shop-interior.js';
// Furnishing count: every placed object, with instanced stock (one mesh, many items) counted per item.
const richness=(g)=>g.children.reduce((n,o)=>n+(o.isInstancedMesh?o.count:1),0);
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
  // Researched multi-room buildings: every room walkable from the door, every hotspot reachable and clear.
  const walkable=(rooms,keys)=>{
    assert.deepEqual(room.rooms.map(r=>r.name),rooms);
    for(const k of keys)assert(room.interactables.some(x=>x.key===id+':'+k),id+' '+k);
    assert(room.interactables.some(x=>x.act.do==='civic-ledger'),id+' opens the live panel');
    const hits=(x,z,r=.35)=>room.colliders.some(c=>x>c.x0-r&&x<c.x1+r&&z>c.z0-r&&z<c.z1+r);
    const step=.25,seen=new Set(['0,0']),queue=[[0,0]],o=room.spawn;
    assert(!hits(o.x,o.z),id+' spawn is clear');
    for(let i=0;i<queue.length;i++){const [gx,gz]=queue[i];for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=gx+dx,nz=gz+dz,x=o.x+nx*step,z=o.z+nz*step,key=nx+','+nz;if(seen.has(key)||x<-7||x>7||z<-12||z>6||hits(x,z))continue;seen.add(key);queue.push([nx,nz]);}}
    const pts=queue.map(([x,z])=>[o.x+x*step,o.z+z*step]);
    for(const r of room.rooms)assert(pts.some(([x,z])=>x>r.x0+.4&&x<r.x1-.4&&z>r.z0+.4&&z<r.z1-.4),id+' reach '+r.name);
    for(const x of room.interactables){
      assert(!hits(x.pos.x,x.pos.z,.3),id+' hotspot '+x.key+' is clear of furniture');
      assert(pts.some(([px,pz])=>Math.hypot(px-x.pos.x,pz-x.pos.z)<.6),id+' hotspot '+x.key+' is reachable on foot');
      const r=room.rooms[x.room];assert(x.pos.x>=r.x0&&x.pos.x<=r.x1&&x.pos.z>=r.z0&&x.pos.z<=r.z1,x.key+' is in '+r.name);
    }
    assert(!hits(room.staff.use.x,room.staff.use.z,.3),id+' staff can be reached');
    assert(room.windows.length>=4,id+' windows look out on the street');
    assert(richness(room.group)>300,id+' is richly furnished');
    room.group.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material?.dispose)o.material.dispose();});
  };
  if(id==='fire'){
    // Country fire station: twin engine bay, dirty PPE/decon and BA rooms, clean watchroom and mess.
    walkable(['Engine bay','PPE and decontamination room','Breathing apparatus room','Watchroom','Mess and training room'],
      ['pumper','exhaust','hazmat','hose','rating','ppc','washer','decon','basets','fill','test','printer','radio','pagers','map','board','kitchen','training','honour']);
    continue;
  }
  if(id==='realty'){
    assert(room.realtyLayout,'M8 uses its own licensed-property agency office');
    assert.deepEqual(room.rooms.map(r=>r.name),[
      'Reception and waiting','Property window displays',
      'Sales and agent workstations','Private client meeting room',
      'Property management and records']);
    assert.equal(room.interactables.length,16);
    assert(room.interactables.some(x=>x.key==='realty:trust'));
    assert(room.interactables.some(x=>x.key==='realty:directory'));
    assert(room.staff&&room.staff.pos.z<room.staff.use.z);
    room.group.traverse(o=>{o.geometry?.dispose();o.material?.dispose?.();});
    continue;
  }
  if(['police','ambulance','court','solicitor'].includes(id)){
    assert(room.justiceFacility,id+' must have researched emergency/justice interior');
    assert.equal(room.rooms.length,5,id+' unique service zones');
    assert(room.interactables.length>=7,id+' public services and case enquiries');
    assert(room.interactables.some(i=>i.act.do==='emergency'||i.act.do==='justice'),id+' real interactions');
    assert(room.exitZone.z1>room.spawn.z,id+' can return to street');
    room.group.traverse(o=>{o.geometry?.dispose();o.material?.dispose?.();});
    continue;
  }
  if(id==='recycling'){
    assert(room.recyclingLayout,'P8 uses dedicated sorted-recycling and reuse centre');
    assert.equal(room.rooms.length,5);
    assert.equal(room.interactables.length,16);
    assert(room.interactables.some(x=>x.key==='recycling:presort'));
    assert(room.interactables.some(x=>x.key==='recycling:dispatch'));
    assert(room.staff && room.staff.pos.z < room.staff.use.z);
    room.group.traverse(o=>{o.geometry?.dispose();o.material?.dispose?.();});
    continue;
  }
  if(id==='landfill'){
    assert(room.wasteDepotLayout,'Q8 Waste Depot is not a generic room');
    assert.equal(room.interactables.length,9,'Q8 transfer-depot stations');
    assert(room.interactables.some(x=>x.key==='landfill:site-rules'));
    assert(room.interactables.some(x=>x.key==='landfill:dispatch'));
    assert.equal(room.interactables.filter(x=>x.act?.do==='waste-depot-status').length,8,'eight stations open the live depot panel');
    assert(room.interactables.some(x=>x.key==='landfill:weighin'&&x.act?.do==='civic-ledger'),'weigh-in desk opens the Town Ledger');
    room.group.traverse(o=>{o.geometry?.dispose();o.material?.dispose?.();});
    continue;
  }
  if(id==='sewage'){
    assert(room.wastewaterLayout,'Wastewater Works is not a generic room');
    assert.equal(room.rooms.length,5,'L8 wastewater treatment galleries');
    assert.equal(room.interactables.length,14);
    assert(room.interactables.some(x=>x.key==='sewage:clarifier'));
    assert(room.interactables.some(x=>x.key==='sewage:biosolids'));
    assert(room.staff&&room.staff.pos.z<room.staff.use.z);
    room.group.traverse(o=>{o.geometry?.dispose();o.material?.dispose?.();});
    continue;
  }
  if(id==='waterworks'){
    assert(room.waterworksLayout,'Water Works has its own treatment-plant interior');
    assert.equal(room.rooms.length,5,'all treatment zones are represented');
    assert.equal(room.interactables.length,12,'Water Works has 12 inspection points');
    assert(room.staff && room.staff.pos.z < room.staff.use.z,'operator behind SCADA console');
    room.group.traverse(o=>{o.geometry?.dispose();o.material?.dispose?.();});
    continue;
  }
  if(id==='power'){
    // Remote-town hybrid diesel-solar-battery station: control room, switchroom, battery room, engine hall.
    walkable(['Control room','Switchroom','Corridor','Battery and inverter room','Engine hall'],
      ['scada','mimic','log','permits','estop','breakers','sync','arcflash','battery','inverters','controller','gen1','gen2','gen3','daytank','crane']);
    // The mimic panel and generator text follow the live grid: a faulted feeder shows open, a busy town runs more sets.
    const town=(power,failed)=>({minute:13*60,civic:{weather:'sunny',supply:{power,powerDemand:power,ok:!failed},powerGrid:{served:power,edges:[{id:'west-feeder',failed,flow:failed?0:20}]}}});
    const quiet=buildCivicInterior({id,name:'Power Station',stock:{fuel:150}},label,town(25,false)), busy=buildCivicInterior({id,name:'Power Station',stock:{fuel:40}},label,town(85,true));
    const text=(r,k)=>r.interactables.find(x=>x.key==='power:'+k).act.text;
    assert(/Every feeder is closed/.test(text(quiet,'mimic'))&&/Faulted now: west-feeder/.test(text(busy,'mimic')),'mimic panel shows feeder faults');
    assert(/standby/.test(text(quiet,'gen1'))&&/Running now/.test(text(busy,'gen3')),'generators start as the load rises');
    assert(/150 drums/.test(text(quiet,'daytank'))&&/40 drums/.test(text(busy,'daytank')),'day tank reports the real fuel stock');
    for(const r of [quiet,busy])r.group.traverse(o=>{if(o.geometry)o.geometry.dispose();});
    continue;
  }
  assert.equal(room.rooms.length,id==='pub'?5:1,id+' walk-in rooms');
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
    assert(richness(room.group)>400,'bakery is richly furnished');
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
    assert(richness(room.group)>300,'bank is richly furnished');
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
    assert(richness(room.group)>250,id+' is richly furnished');
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
  assert(richness(room.group)>20,id+' has furnished meshes');
  room.group.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material?.dispose)o.material.dispose();});
}
console.log('PASS: '+CIVIC_INTERIOR_IDS.length+' civic/farm/shop interiors, including a 10-area farmhouse');
