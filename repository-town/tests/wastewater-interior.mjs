import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildWastewaterInterior,WASTEWATER_LAYOUT} from '../src/world/wastewater-interior.js';
import {buildCivicInterior} from '../src/world/shop-interior.js';
const label=()=>new THREE.Sprite(new THREE.SpriteMaterial());
const sample=(stock,pollution)=>buildWastewaterInterior({
  id:'sewage',name:'Wastewater Works',stock:{wastewater:stock}},label,
  {civic:{indicators:{pollution},supply:{power:40}}});
const built=[sample(65,12),sample(0,0),buildCivicInterior({id:'sewage',name:'Wastewater Works'},label)];
const expectedKeys=['scada','alarms','samples','licence','screens','grit',
  'aeration','clarifier','biosolids','disinfection','recycled','workshop','safety','ledger'];
assert.equal(WASTEWATER_LAYOUT.site,'L8');
for(const room of built){
  assert(room.wastewaterLayout,'must use a researched Wastewater Works, not generic shop');
  assert.equal(room.rooms.length,5);
  assert.deepEqual(room.rooms.map(r=>r.name),WASTEWATER_LAYOUT.zones);
  assert.equal(room.windows.length,4);
  assert.equal(room.interactables.length,expectedKeys.length);
  assert.equal(room.sceneObjects.length,expectedKeys.length);
  assert.equal(new Set(room.interactables.map(x=>x.key)).size,expectedKeys.length);
  for(const key of expectedKeys)assert(room.interactables.some(x=>x.key==='sewage:'+key),key);
  assert.equal(room.interactables.filter(x=>x.act.do==='civic-ledger').length,3,'SCADA, reuse and ledger expose the civic state');
  for(const type of ['sewage-scada','sample-lab','covered-bar-screen','grit-chamber',
    'aeration-basin','secondary-clarifier','biosolids-dewatering','final-filtration',
    'disinfection-cabinet','pump-maintenance-bay'])
    assert(room.placedProps.some(x=>x.type===type),'missing process exhibit '+type);
  assert(room.group.children.length>240,'building should be richly furnished and not generic');
  const hit=(x,z,r=.35)=>room.colliders.some(c=>x>c.x0-r&&x<c.x1+r&&z>c.z0-r&&z<c.z1+r);
  const start=room.spawn, step=.2,queue=[[0,0]],seen=new Set(['0,0']);
  assert(!hit(start.x,start.z),'spawn is collision-free');
  for(let i=0;i<queue.length;i++){
    const [x,z]=queue[i];
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const nx=x+dx,nz=z+dz,px=start.x+nx*step,pz=start.z+nz*step,key=nx+','+nz;
      if(seen.has(key)||px<-7||px>7||pz<-12||pz>6.5||hit(px,pz))continue;
      seen.add(key);queue.push([nx,nz]);
    }
  }
  const accessible=p=>queue.some(([x,z])=>Math.hypot(start.x+x*step-p.x,start.z+z*step-p.z)<.31);
  for(const it of room.interactables){
    assert(!hit(it.pos.x,it.pos.z),it.key+' point has clear player radius');
    assert(accessible(it.pos),it.key+' is reachable from entrance');
    const zone=room.rooms[it.room];
    assert(zone&&it.roomName===zone.name,'correct room metadata '+it.key);
    assert(it.pos.x>=zone.x0&&it.pos.x<=zone.x1&&it.pos.z>=zone.z0&&it.pos.z<=zone.z1,
      it.key+' belongs to the room containing it');
  }
  for(const p of [room.staff.pos,room.staff.use,{x:0,z:6.1}]){
    assert(!hit(p.x,p.z),'staff station or exit is clear');
    assert(accessible(p),'staff station or exit connected to entrance');
  }
  for(const z of [5.2,3.75,2,0,-2,-4,-6.5,-8.5,-10.6]){
    assert(!hit(0,z),'continuous public aisle is clear at '+z);
  }
  for(const zone of room.rooms) assert(queue.some(([ix,iz])=>{
    const x=start.x+ix*step,z=start.z+iz*step;
    return x>zone.x0+.45&&x<zone.x1-.45&&z>zone.z0+.45&&z<zone.z1-.45;
  }),'accessible gallery zone '+zone.name);
  assert(room.staff.pos.z<room.staff.use.z,'operator behind console');
  assert.equal(room.spawn.z,3.75);
  assert(room.exitZone.z1>6);
  room.group.updateMatrixWorld(true);
  room.group.traverse(o=>{
    if(!o.isMesh)return;
    const b=new THREE.Box3().setFromObject(o);
    assert([b.min.x,b.min.y,b.min.z,b.max.x,b.max.y,b.max.z].every(Number.isFinite),'finite mesh');
    assert(b.min.x>=-7.36&&b.max.x<=7.36&&b.min.z>=-12.32&&b.max.z<=6.4,
      'fittings must remain inside building');
  });
}
assert.equal(built[0].wastewaterSnapshot.stored,65);
assert.equal(built[0].wastewaterSnapshot.pollution,12);
assert.equal(built[1].wastewaterSnapshot.stored,0);
const ledger=built[0].interactables.find(x=>x.key==='sewage:ledger').act.text;
assert.match(ledger,/65 simulated units/);
assert.match(ledger,/Town pollution indicator: 12/);
assert.match(ledger,/snapshot/);
assert.match(built[1].interactables.find(x=>x.key==='sewage:ledger').act.text,/0 simulated units/);
for(const room of built)room.group.traverse(o=>{o.geometry?.dispose();o.material?.dispose?.();});
console.log('PASS: L8 wastewater treatment exhibits, unique gallery, 14 interactions, paths, safety, status and exit.');
