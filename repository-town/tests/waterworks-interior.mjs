import assert from 'node:assert/strict';
import * as THREE from 'three';
import { buildCivicInterior } from '../src/world/shop-interior.js';
import { buildWaterworksInterior, WATERWORKS_LAYOUT } from '../src/world/waterworks-interior.js';
const label=()=>new THREE.Sprite(new THREE.SpriteMaterial());
const full=buildWaterworksInterior({id:'waterworks',name:'Water Works',stock:{water:160}},label,
 {civic:{supply:{water:85,waterDemand:90,waterOk:false}}});
const empty=buildWaterworksInterior({id:'waterworks',name:'Water Works',stock:{water:0}},label,
 {civic:{supply:{water:0,waterDemand:90,waterOk:false}}});
const routed=buildCivicInterior({id:'waterworks',name:'Water Works'},label);
for(const room of [full,empty,routed]){
  assert(room.waterworksLayout,'J8 must use its dedicated interior rather than a shop');
  assert.equal(room.rooms.length,5,'five distinctly furnished process zones');
  assert.deepEqual(room.rooms.map(r=>r.name),[
    'Operations control office','Water quality laboratory','Membrane filtration gallery',
    'UV disinfection gallery','Pumps and maintenance gallery']);
  assert.equal(room.windows.length,4,'front and side windows retained');
  assert.equal(room.interactables.length,12,'all twelve inspections present');
  assert.equal(room.sceneObjects.length,room.interactables.length,'all inspections appear in scene-awareness');
  assert.equal(room.interactables.filter(i=>i.act.do==='civic-ledger').length,2,'SCADA and reservoir both open live ledger');
  for(const type of ['control-console','water-lab','membrane-skids','uv-reactors','pump-bank','maintenance-bench'])
    assert(room.placedProps.some(p=>p.type===type),'missing '+type);
  assert(room.group.children.length>180,'dedicated room has actual equipment and furnishings');
  const hit=(x,z,r=.35)=>room.colliders.some(c=>x>c.x0-r&&x<c.x1+r&&z>c.z0-r&&z<c.z1+r);
  assert(!hit(room.spawn.x,room.spawn.z),'safe spawn');
  const step=.2,o=room.spawn,key=(x,z)=>x+','+z,seen=new Set([key(0,0)]),queue=[[0,0]];
  for(let i=0;i<queue.length;i++){
    const [gx,gz]=queue[i];
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const nx=gx+dx,nz=gz+dz,x=o.x+nx*step,z=o.z+nz*step,k=key(nx,nz);
      if(seen.has(k)||x<-7||x>7||z<-12||z>6.45||hit(x,z))continue;
      seen.add(k);queue.push([nx,nz]);
    }
  }
  const reachable=(p)=>queue.some(([gx,gz])=>Math.hypot(o.x+gx*step-p.x,o.z+gz*step-p.z)<.32);
  const targets=[...room.interactables.map(i=>[i.key,i.pos]),['staff',room.staff.pos],
    ['staff-use',room.staff.use],['exit',{x:0,z:6.15}]];
  for(const [name,p] of targets){
    assert(!hit(p.x,p.z),name+' clears player-sized collision radius');
    assert(reachable(p),name+' has a connected walkable route from entrance');
  }
  for(const z of [-10.8,-9.3,-7.5,-5.5,-3.3,-1,1,3.75,5.2])
    assert(!hit(0,z),'main pedestrian aisle clear at '+z);
  for(const zone of room.rooms)
    assert(queue.some(([gx,gz])=>{const x=o.x+gx*step,z=o.z+gz*step;return x>zone.x0+.45&&x<zone.x1-.45&&z>zone.z0+.45&&z<zone.z1-.45;}),'reachable zone '+zone.name);
  assert(room.staff.pos.z<room.staff.use.z,'operator behind console');
  assert.equal(room.spawn.z,3.75);
  assert(room.exitZone.z1>6,'front exit remains available');
  room.group.updateMatrixWorld(true);
  room.group.traverse(obj=>{
    if(!obj.isMesh)return;
    const b=new THREE.Box3().setFromObject(obj);
    assert([b.min.x,b.min.y,b.min.z,b.max.x,b.max.y,b.max.z].every(Number.isFinite),'finite geometry');
    assert(b.min.x>=-7.35&&b.max.x<=7.35&&b.min.z>=-12.3&&b.max.z<=6.4,'equipment stays inside room');
  });
}
assert.equal(WATERWORKS_LAYOUT.site,'J8');
assert.equal(full.waterSnapshot.stored,160);
assert.equal(full.waterSnapshot.demand,90);
assert.equal(full.waterSnapshot.available,85);
assert.equal(full.waterSnapshot.ok,false);
assert.match(full.interactables.find(i=>i.key==='waterworks:status').act.text,/160 simulated units/);
assert.match(empty.interactables.find(i=>i.key==='waterworks:status').act.text,/0 simulated units/);
assert(!full.interactables.some(i=>/UV activation|real water safety override/i.test(i.label)),'not a hazardous real-world control panel');
for(const room of [full,empty,routed])room.group.traverse(obj=>{
  obj.geometry?.dispose();obj.material?.dispose?.();
});
console.log('PASS: J8 Water Works process zones, 12 interactions, safe entrances/exits, full routes, live-state snapshots.');
