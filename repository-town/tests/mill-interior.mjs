import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildMillInterior} from '../src/world/mill-interior.js';
const label=()=>new THREE.Sprite(new THREE.SpriteMaterial());
const full=buildMillInterior({id:'mill',name:'Flour Mill',stock:{grain:20},out:{flour:18}},label);
const empty=buildMillInterior({id:'mill',name:'Flour Mill',stock:{grain:0},out:{flour:0}},label);
assert(full.millLayout);assert.equal(full.windows.length,4);assert(full.group.children.length>150);
assert(full.group.children.length>empty.group.children.length+50,'stock is not invented on empty pallets');
for(const type of ['grain-pallet','flour-pallet','grain-cleaner','conditioning-bin','roller-mills','plansifter','bagging-scale','quality-bench','dust-extraction','dispatch-desk','handwash','maintenance-cabinet'])assert(full.placedProps.some(p=>p.type===type),type);
const clear=(x,z)=>!full.colliders.some(c=>x>c.x0-.35&&x<c.x1+.35&&z>c.z0-.35&&z<c.z1+.35);
for(const i of full.interactables)assert(clear(i.pos.x,i.pos.z),i.key+' collision clearance');
assert(clear(full.staff.pos.x,full.staff.pos.z),'staff is not inside a desk or machine');
assert(full.staff.pos.z<full.staff.use.z);
// Flood-fill the actual collision world with a player-radius margin, not just isolated clear points.
const step=.2, key=(x,z)=>`${x},${z}`,queue=[[0,19]],seen=new Set([key(0,19)]);
for(let i=0;i<queue.length;i++){
 const [x,z]=queue[i];for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
 const nx=x+dx,nz=z+dz,k=key(nx,nz);
 if(nx<-32||nx>32||nz<-57||nz>30||seen.has(k)||!clear(nx*step,nz*step))continue;
 seen.add(k);queue.push([nx,nz]);
 }
}
for(const p of [...full.interactables.map(i=>i.pos),full.staff.pos,{x:0,z:6}])assert(queue.some(([x,z])=>Math.hypot(x*step-p.x,z*step-p.z)<.3),'reachable from entrance: '+JSON.stringify(p));
assert.equal(full.interactables.filter(i=>i.act.do==='civic-ledger').length,2,'both stock counters use the live ledger');
for(const r of [full,empty])r.group.traverse(o=>{o.geometry?.dispose();o.material?.dispose?.();});
console.log('PASS: dedicated mill, stock-aware pallets, seven reachable inspections, staff position and round-trip exit');
