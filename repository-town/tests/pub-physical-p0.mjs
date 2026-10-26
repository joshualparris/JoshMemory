import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from 'three';
import {buildPubInterior} from '../src/world/pub-interior.js';
import {PUB_PHYSICAL_PLAN_2026,pubScenarioAdmission,pubExitLayout} from '../src/world/pub-physical-plan-2026.js';
import {pubAction,pubUtilities,validPubUtilities} from '../src/world/pub-utilities.js';
const plan=PUB_PHYSICAL_PLAN_2026;
const room=buildPubInterior({id:'pub',name:'The Merged Branch'},()=>new THREE.Sprite(new THREE.SpriteMaterial()));
test('PUB-002 two-storey and cellar 14 x 18 model, unknown age and conservative boundary claims',async()=>{
 assert.deepEqual([plan.footprint.widthM,plan.footprint.depthM,plan.footprint.modelledStoreys],[14,18,2]);
 assert.equal(plan.footprint.originalConstructionYear,null);
 assert.equal(plan.footprint.siteBoundaryVerified,false);
 assert.equal(room.bounds.x1-room.bounds.x0,14);
 assert.equal(room.bounds.z1-room.bounds.z0,18);
 const ext=await readFile(new URL('../src/world/townlife.js',import.meta.url),'utf8');
 assert.match(ext,/return buildPubFacade/);

 assert.doesNotMatch(ext,/fictional Federation-era 1911 hotel/);
});
test('PUB-003 scenario 24 patrons plus 3 staff, NOT legal approval; state bounded',()=>{
 assert.equal(plan.occupancy.totalScenario,27);
 assert.equal(plan.occupancy.legalMaximum,null);
 assert.equal(pubScenarioAdmission(23).accepted,true);
 assert.equal(pubScenarioAdmission(24).accepted,false);
 assert.throws(()=>pubScenarioAdmission(-1),RangeError);
 const life={civic:{supply:{waterOk:true}},gridPowered:()=>true};
 for(let i=0;i<24;i++)pubAction(life,'scenario-admit');
 assert.equal(pubUtilities(life).scenarioPatrons,24);
 assert.match(pubAction(life,'scenario-admit'),/REFUSED/);
 assert.equal(pubUtilities(life).scenarioPatrons,24);
 const corrupt=structuredClone(pubUtilities(life));corrupt.scenarioPatrons=25;assert.equal(validPubUtilities(corrupt),false);
 pubAction(life,'scenario-depart');assert.equal(pubUtilities(life).scenarioPatrons,23);
});
test('PUB-004 rear wall has actual collision opening, functioning door mesh and egress metadata',()=>{
 const names=room.doors.map(d=>d.name);
 assert.deepEqual(names,['pub:cold-room-door','pub:ambulant-wc-door','pub:wc-door','pub:kitchen-door','pub:rear-fire-exit']);
 assert.equal(pubExitLayout().separationM,18);
 assert.equal(pubExitLayout().rearFinalDischargeVerified,false);
 assert.equal(room.rearExitZone.dischargeVerified,false);
 assert(room.colliders.some(c=>c.z0<-11.9&&c.x1<-1.05),'rear left wall');
 assert(room.colliders.some(c=>c.z0<-11.9&&c.x0>1.05),'rear right wall');
 assert(!room.colliders.some(c=>c.x0<0&&c.x1>0&&c.z0<-11.9&&c.z1>-12.1),'rear wall may not block door');
 assert(room.group.getObjectByName('pub:rear-fire-exit'));
});
function reachable(target,clearance=.25){
 const [startX,startZ]=[room.spawn.x,room.spawn.z],step=.2,arr=[[0,0]],seen=new Set(['0,0']);
 const blocked=(x,z)=>room.colliders.some(c=>x>=c.x0-clearance&&x<=c.x1+clearance&&z>=c.z0-clearance&&z<=c.z1+clearance);
 for(let i=0;i<arr.length;i++){
  const [a,b]=arr[i],x=startX+a*step,z=startZ+b*step;
  if(Math.hypot(x-target.x,z-target.z)<.45)return true;
  if(i>40000)throw Error('path search guard');
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const a1=a+dx,b1=b+dz,X=startX+a1*step,Z=startZ+b1*step,key=a1+','+b1;
   if(seen.has(key)||X<-6.75||X>6.75||Z<-11.75||Z>5.75||blocked(X,Z))continue;
   seen.add(key);arr.push([a1,b1]);
  }
 }
 return false;
}
test('PUB-004/009/010 modelled front-to-rear and accessible WC approach remain walkable',()=>{
 assert(reachable({x:0,z:-11.35}),'rear exit approach must be navigable');
 assert(reachable({x:5.6,z:-9.2}),'accessible WC basin/toilet control must be reachable');
 assert(reachable({x:-4.6,z:-7.6}),'kitchen entry fixture must still be reachable');
 assert.equal(plan.accessibleRoute.approachGradient,null);
 assert.equal(plan.sanitary.accessibleCirculationVerified,false);
 assert.equal(plan.sanitary.actualRequiredWCCount,null);
});
test('PUB-005/010 two emergency lights and moved accessible fixtures; outage dependency',()=>{
 const items=['pub:rear-exit-sign','pub:exit-sign','pub:emergency-light','pub:rear-emergency-light','pub:wc-grab-rail'];
 for(const name of items)assert(room.group.getObjectByName(name),name+' missing');
 const life={civic:{supply:{waterOk:true}},gridPowered:()=>true};
 const s=pubUtilities(life);
 s.breaker=false;s.emergencyMinutes=30;room.utilityVisuals(life);
 assert(room.group.getObjectByName('pub:rear-emergency-light').intensity>0);
 s.emergencyMinutes=0;room.utilityVisuals(life);
 assert.equal(room.group.getObjectByName('pub:rear-emergency-light').intensity,0);
 assert.equal(plan.fire.fireScheduleApproved,false);
});
