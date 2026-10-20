import assert from 'node:assert/strict';
import * as THREE from 'three';
import { buildDepotInterior } from '../src/world/depot-interior.js';
const label=()=>new THREE.Sprite(new THREE.SpriteMaterial());
const build=out=>buildDepotInterior({id:'depot',name:'Rail Depot',out},label);
const full=build({coffee:24,tea:24,parcel:12}),empty=build({coffee:0,tea:0,parcel:0});
for(const room of [full,empty,build()]) {
  assert(room.depotLayout);
  assert.equal(room.windows.length,4);
  assert.equal(room.interactables.length,7);
  assert.equal(room.sceneObjects.length,room.interactables.length);
  assert(room.interactables.some(x=>x.act.do==='civic-ledger'));
  const hits=(x,z,r=.35)=>room.colliders.some(c=>x>c.x0-r&&x<c.x1+r&&z>c.z0-r&&z<c.z1+r);
  const o=room.spawn,step=.2,seen=new Set(['0,0']),queue=[[0,0]];
  assert(!hits(o.x,o.z));
  for(let i=0;i<queue.length;i++) {
    const [gx,gz]=queue[i];
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nx=gx+dx,nz=gz+dz,x=o.x+nx*step,z=o.z+nz*step,key=nx+','+nz;
      if(seen.has(key)||x<-7||x>7||z<-12||z>6.5||hits(x,z))continue;
      seen.add(key);queue.push([nx,nz]);
    }
  }
  const pts=queue.map(([x,z])=>[o.x+x*step,o.z+z*step]);
  const targets=[...room.interactables.map(x=>[x.key,x.pos]),['staff',room.staff.pos],['counter',room.staff.use],['exit',{x:0,z:6.1}]];
  for(const [name,p] of targets) {
    assert(!hits(p.x,p.z),name+' clears player radius');
    assert(pts.some(([x,z])=>Math.hypot(x-p.x,z-p.z)<.3),name+' has a continuous walking route from entrance');
  }
  for(const z of [3.75,5.2,-3.5,-4.5])assert(!hits(0,z),'central aisle clear');
  assert(room.staff.pos.z<room.staff.use.z);
  room.group.updateMatrixWorld(true);
  room.group.traverse(o=>{
    if(!o.isMesh)return;
    const b=new THREE.Box3().setFromObject(o);
    assert(Number.isFinite(b.min.x)&&Number.isFinite(b.max.y),'finite geometry');
    assert(b.min.x>=-7.2&&b.max.x<=7.2&&b.min.z>=-12.15&&b.max.z<=6.31,'mesh stays inside shell including sill lips and entrance threshold');
  });
}
assert(full.group.children.length>empty.group.children.length+100,'empty stock clears display cartons');
assert(empty.interactables.find(x=>x.key==='depot:storage').act.text.includes('0 coffee, 0 tea'));
assert(empty.interactables.find(x=>x.key==='depot:outbound').act.text.includes('0 parcels'));
console.log('Depot: reachable staff, seven interactions and exit; empty/full stock; bounded geometry passed.');
