import assert from 'node:assert/strict';
import * as THREE from 'three';
import {TownLife, ROSTER_SIZE} from '../src/world/life.js';
import {buildCivicInterior} from '../src/world/shop-interior.js';
import {JUSTICE_INTERIORS} from '../src/world/justice-interiors.js';
import {INCIDENTS,callTripleZero,advanceEmergency,caseReport,justiceSummary,
  addIndependentEvidence,verifySceneWitness,seekLegalAdvice,
  evaluatePoliceCharge,examineForensics} from '../src/world/emergency-justice.js';
import {emergencyPanel,justicePanel} from '../src/ui/emergency-panels.js';

const homes=Array.from({length:188},(_,i)=>({
 coordinate:String.fromCharCode(65+i%26)+(1+Math.floor(i/26)),name:'Home '+i,
 door:{x:((i%26)-12.5)*26,z:(Math.floor(i/26)-3.5)*46+4}
}));
const t=new TownLife({homes,minute:8*60,seed:20261020});
assert.equal(t.villagers.length,ROSTER_SIZE,'all added residents are real rostered staff with homes');
for(const [id,lot] of [['police','K'],['ambulance','O'],['court','E'],['solicitor','F']]){
  const p=t.place(id);assert(p&&p.col===lot&&p.side==='south');
  assert.deepEqual(JUSTICE_INTERIORS[id].site,lot+'8');
}
assert.equal(t.dial000('no-such-type').ok,false);
const nonurgent=t.dial000('suspicious');
assert(nonurgent.referral);
assert.equal(caseReport(t).calls.length,0,'nonurgent calls do not monopolise emergency resources');
assert.match(nonurgent.message,/131 444/);
const medically=t.dial000('medical',{x:18,z:180});
assert(medically.ok&&/^E\d{4}$/.test(medically.id));
assert.equal(t.dial000('medical').ok,false,'deduplicates an active matching call');
const advance=(minutes=1)=>{t.minute+=minutes;while(t.minute>=1440){t.minute-=1440;t.day++;}advanceEmergency(t)};
advance(1);
assert.equal(caseReport(t).incidents[0].status,'dispatched');
assert.equal(caseReport(t).units.find(x=>x.type==='ambulance').busy,true);
advance(1);assert.equal(caseReport(t).incidents[0].status,'en-route');
advance(3);assert.equal(caseReport(t).incidents[0].status,'on-scene');
advance(6);
const med=caseReport(t).incidents[0];
assert.equal(med.status,'resolved');
assert(med.patient.treated);
assert.equal(med.patient.triage,'high priority');
assert.match(med.patient.transport,/hospital/);
assert(med.timeline.some(x=>/emergency call taker/i.test(x.text)));
assert(med.timeline.some(x=>/responders travel/i.test(x.text)));
assert(med.timeline.some(x=>/paramedics/i.test(x.text)));

// Criminal reports open a case only AFTER scene attendance, not on mere calls.
const reported=t.dial000('breakin',{x:72,z:165});assert(reported.ok);
assert.equal(caseReport(t).cases.length,0);
advance(1);advance(1);advance(7);advance(2);
const c=caseReport(t).cases[0];assert(c,'police created a traceable case on scene');
assert.equal(c.status,'investigation');assert.equal(c.suspect,null);
assert.equal(c.charged,false);
assert.match(evaluatePoliceCharge(t,c.id),/cannot charge/i);
assert.equal(c.charged,false,'no arbitrary criminal allegations against named villagers');
assert.match(verifySceneWitness(t,c.id),/obtain and log/i);
assert.match(addIndependentEvidence(t,c.id,'cctv'),/CCTV evidence entered/);
assert.match(verifySceneWitness(t,c.id),/identity corroboration/);
assert(c.suspect&&!c.suspect.resident,'scripted visiting suspect, not a random villager');
assert.match(seekLegalAdvice(t,c.id),/Legal adviser requested/);
assert.match(evaluatePoliceCharge(t,c.id),/charged/);
assert.equal(c.charged,true);
assert.equal(c.bail.status,'police-granted');
assert.equal(c.custody,'released');
assert(c.lawyer&&c.hearingAt,'legal advice and prompt court listing');
assert.equal(c.verdict,null,'charging must not equal conviction');
const snapshot=t.snapshot();
const t2=new TownLife({homes,minute:9*60,seed:20261020});
assert(t2.restore(snapshot),'new emergency state survives normal town restore');
assert.equal(t2.civic.emergency.cases[0].charged,true);
assert.equal(t2.civic.emergency.incidents.length,2);
advance(2);
assert.match(examineForensics(t,c.id),/Forensic report recorded/);
const preTrial=c.verdict;assert.equal(preTrial,null);
t.day=Math.floor(c.hearingAt/1440)+1;t.minute=c.hearingAt%1440;
advanceEmergency(t);
assert.equal(c.status,'listed-for-hearing');
assert.equal(c.verdict,null,'court mention does not convict');
assert(c.timeline.some(x=>/pleads not guilty/i.test(x.text)));
t.day=Math.floor(c.trialAt/1440)+1;t.minute=c.trialAt%1440;
advanceEmergency(t);
assert.equal(c.status,'finalised');
assert.equal(c.verdict,'guilty');
assert(c.sentence&&c.sentence.type.includes('fine'),'minor nonviolent scenario has a noncustodial illustrative disposal');
assert.equal(c.custody,'released');
assert.equal(t.civic.emergency.statistics.convictions,1);
const newReport=t.dial000('breakin');assert(newReport.ok);
for(let m=0;m<11;m++)advance(1);
const next=t.civic.emergency.cases.at(-1);
assert(next&&next.id!==c.id);
assert.match(addIndependentEvidence(t,next.id,'cctv'),/CCTV evidence/);
assert.match(verifySceneWitness(t,next.id),/identity corroboration/);
assert.match(evaluatePoliceCharge(t,next.id),/charged/);
// Without the independent later forensic link, the prosecution fails to
// prove the charge; the scripted court must acquit rather than auto-convict.
t.day=Math.floor(next.hearingAt/1440)+1;t.minute=next.hearingAt%1440;
advanceEmergency(t);
t.day=Math.floor(next.trialAt/1440)+1;t.minute=next.trialAt%1440;
advanceEmergency(t);
assert.equal(next.verdict,'not-guilty');
assert(next.sentence===null);
assert.equal(next.custody,'released');
assert.equal(t.civic.emergency.statistics.acquittals,1);
assert.match(justiceSummary(t),/Acquittals: 1/);

const label=()=>new THREE.Sprite(new THREE.SpriteMaterial());
for(const id of Object.keys(JUSTICE_INTERIORS)){
 const room=buildCivicInterior(t.place(id),label,t),c=JUSTICE_INTERIORS[id];
 assert(room.justiceFacility,id+' must not use generic shop');
 assert.deepEqual(room.rooms.map(r=>r.name),c.zones,id+' distinct zones');
 assert(room.interactables.length>=7,id+' interactions');
 assert.equal(room.interactables.length,room.sceneObjects.length);
 assert.equal(room.windows.length,4);
 assert(room.group.children.length>140,id+' detailed equipment and furnishings');
 assert(room.exitZone.z1>6);
 const hit=(x,z,r=.35)=>room.colliders.some(c=>x>c.x0-r&&x<c.x1+r&&z>c.z0-r&&z<c.z1+r);
 const step=.25,o=room.spawn,seen=new Set(['0,0']),queue=[[0,0]];
 assert(!hit(o.x,o.z),'spawn clear '+id);
 for(let i=0;i<queue.length;i++){
  const [ax,az]=queue[i];
  for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){
   const x=ax+dx,z=az+dz,px=o.x+x*step,pz=o.z+z*step,k=x+','+z;
   if(seen.has(k)||px<-7||px>7||pz<-12||pz>6.4||hit(px,pz))continue;
   seen.add(k);queue.push([x,z]);
  }
 }
 const reachable=p=>queue.some(([x,z])=>Math.hypot(o.x+x*step-p.x,o.z+z*step-p.z)<.40);
 for(const i of room.interactables){
  assert(!hit(i.pos.x,i.pos.z),id+' hotspot blocked '+i.key);
  assert(reachable(i.pos),id+' hotspot unreachable '+i.key);
  const zone=room.rooms[i.room];
  assert(zone&&zone.name===i.roomName,id+' hotspot has correct zone');
 }
 for(const p of [room.staff.pos,room.staff.use,{x:0,z:6.1}]){
  assert(!hit(p.x,p.z),id+' exit/staff collides');
  assert(reachable(p),id+' staff and exit connected');
 }
 for(const z of [5.1,3.75,1.4,-2.2,-4.8,-8.2,-10.3])
  assert(!hit(0,z),id+' centre aisle at '+z);
 room.group.traverse(o=>{o.geometry?.dispose();o.material?.dispose?.()});
}
const e=emergencyPanel(t),j=justicePanel(t);
assert(e.title.includes('Triple Zero'));assert(e.body.includes('NOT call Triple Zero'));
assert(e.actions.length>=6);
assert(j.body.includes('remand'));
assert(j.actions.some(a=>/witness/i.test(a.label)));
console.log('PASS: emergency triage, dispatch, trauma, evidence, legal advice, bail, independent court verdict, saved state, four unique walkable buildings.');
