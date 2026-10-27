import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {AGED_CARE as L} from '../src/world/aged-care-layout.js';
import {EXPANSION_SITES} from '../src/world/town-expansion.js';
import {expansionFootprint,buildExpansionFacade} from '../src/world/town-expansion-facades.js';
import {buildCivicInterior} from '../src/world/shop-interior.js';
import {Builder,animate} from '../src/world/builder.js';
import {civicExitPose} from '../src/world/shop-exit.js';
const site=EXPANSION_SITES.find(s=>s.id==='agedcare');
assert(site && site.col==='P' && site.row===7 && site.side==='north' && site.taskId==='RTBUILD-016');
assert.deepEqual(expansionFootprint(site.style),{w:L.w,d:L.d});
assert.equal(L.front-L.rear,L.d);
const b=new Builder(); b.glass=[];
assert.deepEqual(buildExpansionFacade(b,site),{w:13,d:11,front:7});
assert(b.parts.length>50,'custom facade, porch, gardens, shade and residential windows');
assert(b.glass.length>5,'glazed residential windows and entry are not an opaque storefront');
const label=()=>new THREE.Sprite(new THREE.SpriteMaterial());
const room=buildCivicInterior(site,label);
assert.equal(room.agedCareLayout,L,'must dispatch to dedicated small household');
assert(Array.isArray(room.dynamics),'custom interior always provides animation list');
assert.doesNotThrow(()=>animate(room.dynamics,1,new Set()));
assert.doesNotThrow(()=>animate(undefined,1,new Set()));
// Regression: this interior uses plain doorway metadata, not animated Three.js door meshes.
// Previously main.js accessed d.userData.privacy on these objects and crashed immediately.
assert(room.doors.length>0,'aged-care interior must provide room connection metadata');
assert(room.doors.some(d=>!d.userData),'aged-care doorway descriptors exercise non-mesh handling');
const mainSource=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
assert(mainSource.includes('if (!d?.userData?.centre || !d.rotation) continue;'),'render loop must skip non-mesh door descriptors');
assert(mainSource.includes('(built.doors || []).filter(d=>d?.userData?.centre'),'dynamic collision must ignore metadata-only doors');
assert(mainSource.includes('(next.doors || []).filter(d=>d?.userData?.centre'),'floor transitions must ignore metadata-only doors');
assert(mainSource.includes('Number.isFinite(d.userData.open)'),'door animations must recover from missing open state');
assert.equal(room.rooms.length,6,'foyer, living, dining, two bedrooms and corridor');
assert.equal(room.bounds.x1-room.bounds.x0,L.w);
assert.equal(room.bounds.z1-room.bounds.z0,L.d);
assert(room.group.children.length>85,'interior has furniture, privacy, wall and light details');
assert(room.seats.length>=4,'real seat registrations for residents and dining');
assert(room.windows.length>=5,'daylight from the front and both sides');
const hit=(x,z,r=.30)=>room.colliders.some(c=>x>c.x0-r&&x<c.x1+r&&z>c.z0-r&&z<c.z1+r);
assert(!hit(room.spawn.x,room.spawn.z),'spawn clear of furniture');
for(let z=5;z<7.75;z+=.1)assert(!hit(0,z,.28),'unobstructed front exit at '+z);
for(let z=-2.8;z<5;z+=.12)assert(!hit(0,z,.28),'central care corridor clear at '+z);
for(const door of L.bedroomDoors)assert(!hit(door.x,(door.z0+door.z1)/2,.30),'real gap through bedroom partition');
const spotIds=['welcome','bedrooms','activities','dining','handover','gardens'];
for(const id of spotIds)assert(room.interactables.some(i=>i.key===site.id+':'+id),id+' exhibit');
const step=.17,origin=room.spawn,seen=new Set(['0,0']),queue=[[0,0]];
for(let i=0;i<queue.length;i++){
 const [gx,gz]=queue[i];
 for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){
  const nx=gx+dx,nz=gz+dz,k=nx+','+nz,x=origin.x+nx*step,z=origin.z+nz*step;
  if(seen.has(k)||x<-6.05||x>6.05||z<-3.65||z>7.1||hit(x,z,.25))continue;
  seen.add(k);queue.push([nx,nz]);
 }
}
const reachable=(x,z)=>queue.some(([gx,gz])=>Math.hypot(origin.x+gx*step-x,origin.z+gz*step-z)<.48);
for(const s of room.interactables){
 assert(!hit(s.pos.x,s.pos.z,.15),'hotspot placed inside a physical fixture: '+s.key);
 assert(reachable(s.pos.x,s.pos.z),'visitor cannot reach '+s.key);
}
for(const x of [-2.2,2.2])assert(reachable(x,-1.55),'bedroom entry physically reachable: '+x);
const p={...site,door:{x:42,z:51}};
const e=civicExitPose(p,[{x0:35.5,x1:48.5,z0:51,z1:62}]);
assert(e&&e.z<48&&e.yaw===0,'town exit must return player through front street door');
room.group.traverse(obj=>{obj.geometry?.dispose();obj.material?.dispose?.()});
console.log('PASS P7-N: bespoke 13x11 aged-care household, visible glazing, 2 walkable bedrooms, 6 exhibits, front exit');
