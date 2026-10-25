import {dailyClose} from '../src/world/finance.js';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {TownLife} from '../src/world/life.js';
import {buildPubInterior} from '../src/world/pub-interior.js';
import {pubUtilities,pubAction,pubKitchenReady,tickPubUtilities} from '../src/world/pub-utilities.js';
import {pubStandards,pubStandardsAction,pubConnected,pubFoodGate,pubAlcoholRefusal,pubAdmission,validPubStandards,tickPubStandards} from '../src/world/pub-standards.js';
import {pubExteriorRoute,pubRearExitPose} from '../src/world/pub-physical-plan-2026.js';
const life={civic:{supply:{waterOk:true}},gridPowered:()=>true};const u=pubUtilities(life),s=pubStandards(life);
assert(pubKitchenReady(life));pubStandardsAction(life,'fault:grease-arrestor');assert(!pubKitchenReady(life));assert(pubConnected(life,'sanitary','wc','town-sewer'));assert(pubConnected(life,'water','town-water','bar-water'));const w=u.waterL;pubAction(life,'meal');assert.equal(u.waterL,w);pubStandardsAction(life,'fault:grease-arrestor');
pubStandardsAction(life,'fault:wc');assert.match(pubAction(life,'flush'),/isolated/);assert(pubKitchenReady(life));pubStandardsAction(life,'fault:wc');
assert.match(pubAlcoholRefusal(life),/ID/);pubStandardsAction(life,'adult');assert.equal(pubAlcoholRefusal(life),null);pubStandardsAction(life,'intoxicated');assert.match(pubAlcoholRefusal(life),/intoxicated/);pubStandardsAction(life,'intoxicated');
for(const key of ['clean','soap','towels','pests','supervisor','training','exhaust']){pubStandardsAction(life,key);assert(!pubFoodGate(life),key+' must stop food service');pubStandardsAction(life,key);assert(pubFoodGate(life));}
pubStandardsAction(life,'gas-leak');assert(!pubAdmission(life).allowed);assert(!pubKitchenReady(life));assert.equal(u.lpgValve,false);pubStandardsAction(life,'reset-emergency');assert.equal(u.lpgValve,false);u.lpgValve=true;
u.rainMmHour=20;tickPubStandards(life,60);assert.equal(s.stormDischargedL,4536);pubStandardsAction(life,'fault:storm-outlet');tickPubStandards(life,60);assert.equal(s.stormStoredL+s.stormOverflowL,4536);assert.equal(u.sewageL+u.tradeWasteL,0,'roof runoff never enters sewage');
assert.match(pubStandardsAction(life,'inspect'),/FAILED/);assert.equal(s.inspections[0].officialApproval,false);assert(validPubStandards(s));const bad=structuredClone(s);bad.stormStoredL=-1;assert(!validPubStandards(bad));
const room=buildPubInterior({id:'pub',name:'Merged Branch'},()=>new THREE.Sprite(new THREE.SpriteMaterial()));
const r=.6,step=.15,origin=room.spawn,seen=new Set(['0,0']),queue=[[0,0]];const hit=(x,z)=>room.colliders.some(c=>x>c.x0-r&&x<c.x1+r&&z>c.z0-r&&z<c.z1+r);
for(let i=0;i<queue.length;i++){const [a,b]=queue[i];for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){const A=a+dx,B=b+dz,x=origin.x+A*step,z=origin.z+B*step,key=A+','+B;if(seen.has(key)||x<-6.4||x>6.4||z<-11.4||z>5.4||hit(x,z))continue;seen.add(key);queue.push([A,B]);}}
for(const [name,x,z]of [['WC',5.6,-9.2],['rear escape',0,-10.9],['kitchen entrance',-5.55,-6.1]])assert(queue.some(([a,b])=>Math.hypot(origin.x+a*step-x,origin.z+b*step-z)<.45),'1.2m interior clearance to '+name);
const route=pubExteriorRoute({x:13,originZ:161});assert.equal(route[0].z,147.8);assert(pubRearExitPose({x:13,originZ:161},[{x0:6,x1:20,z0:150,z1:168}]));assert.equal(pubRearExitPose({x:13,originZ:161},[{x0:12,x1:14,z0:147,z1:149}]),null);
const homes=[];for(let row=0;row<7;row++)for(let col=0;col<26;col+=2)homes.push({coordinate:String.fromCharCode(65+col)+(row+1),name:'Home',door:{x:(col-12.5)*26,z:row*46-157}});
const town=new TownLife({homes});pubUtilities(town);pubStandardsAction(town,'adult');pubStandardsAction(town,'fault:grease-arrestor');const snap=town.snapshot();const restored=new TownLife({homes});assert(restored.restore(snap));assert(pubStandards(restored).verifiedAdult);assert(!pubConnected(restored,'trade','prep','town-sewer'));
const altered=structuredClone(snap);altered.civic.pubStandards.stormStoredL=-1;assert.equal(restored.restore(altered),false);
const couple=[town.villagers[0],town.villagers[1]];couple[1].household=couple[0].household;couple[1].home=couple[0].home;assert.equal(couple[0].household,couple[1].household);town.villagers=couple;for(const v of couple){v.wallet=100;v.savings=0;v.housingArrears=0;}couple[0].household.tenure='rent';couple[0].household.bills=[];town.civic.finance.lastClosedDay=0;dailyClose(town);assert.equal(couple[0].wallet+couple[1].wallet,192,'one shared rent debit, not two spouse debits');assert.equal(couple[0].wallet,couple[1].wallet,'shared household costs contribute fairly');
console.log('PASS pub completion: independent networks, conservation, food/RSA refusal, drills, no invented approvals, 1.2m route, rear discharge and saved faults');
