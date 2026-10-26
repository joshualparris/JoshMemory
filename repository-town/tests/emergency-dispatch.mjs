// Regressions for the emergency dispatch and case-register findings in issue #174:
// partial dispatch keeps requesting missing units, queued calls still travel,
// each service must attend before its part is recorded, any open case can be
// worked, offence-specific scene evidence and court counts.
//   node tests/emergency-dispatch.mjs
import assert from 'node:assert/strict';
import {TownLife} from '../src/world/life.js';
import {advanceEmergency,caseReport,justiceSummary,emergencyState} from '../src/world/emergency-justice.js';
import {justicePanel} from '../src/ui/emergency-panels.js';

const homes=Array.from({length:188},(_,i)=>({
 coordinate:String.fromCharCode(65+i%26)+(1+Math.floor(i/26)),name:'Home '+i,
 door:{x:((i%26)-12.5)*26,z:(Math.floor(i/26)-3.5)*46+4}
}));
const town=()=>new TownLife({homes,minute:8*60,seed:20261020});
const step=(t,n=1)=>{for(let k=0;k<n;k++){t.minute++;if(t.minute>=1440){t.minute-=1440;t.day++;}advanceEmergency(t);}};
const incident=(t,id)=>emergencyState(t).incidents.find(i=>i.id===id);

// Partial dispatch: the ambulance is committed to a collapse, so a crash gets
// police first; the ambulance must still be sent later and attend before the
// patient is recorded as treated.
{
 const t=town();
 const med=t.dial000('medical').id;step(t);
 assert.deepEqual(incident(t,med).dispatched,['ambulance']);
 const crash=t.dial000('crash').id;step(t);
 const c=incident(t,crash);
 assert.equal(c.status,'dispatched');assert.deepEqual(c.dispatched,['police']);
 let treatedWithoutAmbulance=false;
 for(let m=0;m<60&&c.status!=='resolved';m++){
  step(t);
  if(c.patient.treated&&!c.dispatched.includes('ambulance'))treatedWithoutAmbulance=true;
 }
 assert.equal(treatedWithoutAmbulance,false,'no paramedic care is recorded before an ambulance is sent');
 assert(c.dispatched.includes('ambulance'),'missing ambulance requested again once free');
 assert(c.timeline.some(x=>/Additional ambulance unit dispatched/.test(x.text)));
 assert.equal(c.status,'resolved');assert(c.patient.treated);
 assert(c.closedAt-c.dispatchedAt.ambulance>=4,'ambulance travelled before the patient was treated');
 console.log('✓ partial dispatch keeps requesting the missing ambulance, which attends before care is recorded');
}

// A call queued behind busy crews still has a journey once a unit is free:
// it must not jump from dispatched to resolved in the same minute.
{
 const t=town();
 t.dial000('breakin');t.dial000('medical');step(t);
 const q=t.dial000('assault').id;
 const i=incident(t,q);
 const seen=[];
 for(let m=0;m<80&&i.status!=='resolved';m++){step(t);if(seen.at(-1)!==i.status)seen.push(i.status);}
 assert.equal(seen[0],'awaiting-unit','assault waits while police and ambulance are committed');
 assert.deepEqual(seen.slice(seen.indexOf('dispatched')),['dispatched','en-route','on-scene','investigating','resolved'],
  'each stage is reached on its own minute: '+seen.join(' > '));
 const at=s=>i.timeline.find(x=>x.text.startsWith(s)).at;
 assert(at('Responders travel')>at('A unit became available'),'en-route after the delayed dispatch');
 assert(at('First response unit arrives')-at('Responders travel')>=3,'queued crew still travels');
 console.log('✓ a queued call is timed from its dispatch, not its original report');
}

// Offence-specific evidence, court counts and selecting an older open case.
{
 const t=town();
 const a=t.dial000('assault').id;step(t,12);
 const b=t.dial000('breakin').id;
 for(let m=0;m<80&&emergencyState(t).cases.length<2;m++)step(t);
 const [assault,breakin]=emergencyState(t).cases;
 assert.equal(assault.incidentId,a);assert.equal(breakin.incidentId,b);
 assert.doesNotMatch(assault.evidence[0].text,/shop lock/,'assault scene is not described as a break-in');
 assert.match(breakin.evidence[0].text,/shop lock/);

 // The panel defaults to the newest case but any open case can be selected and worked.
 let panel=justicePanel(t);
 const select=panel.actions.find(x=>x.label.startsWith('Select case '+assault.id));
 assert(select,'older open case can be selected');
 panel=select.run();
 panel=panel.actions.find(x=>/Record shop CCTV/.test(x.label)).run();
 assert(assault.evidence.some(e=>e.kind==='independent'),'action applied to the selected (older) case');
 assert(!breakin.evidence.some(e=>e.kind==='independent'),'newest case untouched');
 panel.actions.find(x=>/Verify on-scene witness/.test(x.label)).run();
 panel.actions.find(x=>/Review selected case/.test(x.label)).run();
 assert.equal(assault.charged,true,'older case progressed to charge through the panel');

 // The hearing listing still counts as before the court.
 t.day=Math.floor(assault.hearingAt/1440)+1;t.minute=assault.hearingAt%1440;advanceEmergency(t);
 assert.equal(assault.status,'listed-for-hearing');
 assert.match(justiceSummary(t),/Cases before court: 1\./);
 console.log('✓ offence-specific scene evidence, selectable cases and hearing counts');
}

// Stage timing survives save and restore mid-response.
{
 const t=town();
 const id=t.dial000('medical').id;step(t,2);
 const t2=town();assert(t2.restore(t.snapshot()));
 t2.minute=t.minute;t2.day=t.day;
 const i=incident(t2,id);assert.equal(i.status,'en-route');assert(Number.isFinite(i.stageAt));
 step(t2,2);assert.equal(i.status,'en-route');step(t2);assert.equal(i.status,'on-scene');
 console.log('✓ restored incidents keep their stage clock');
}
