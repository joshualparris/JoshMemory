// Response-time indicators for issue #157: queued calls show a real wait,
// median/P90 come from recorded stage times, non-urgent enquiries are excluded.
//   node tests/emergency-metrics.mjs
import assert from 'node:assert/strict';
import {TownLife} from '../src/world/life.js';
import {advanceEmergency,responseMetrics,INCIDENTS} from '../src/world/emergency-justice.js';
import {emergencyPanel} from '../src/ui/emergency-panels.js';
const homes=Array.from({length:188},(_,i)=>({coordinate:String.fromCharCode(65+i%26)+(1+Math.floor(i/26)),name:'Home '+i,
 door:{x:((i%26)-12.5)*26,z:(Math.floor(i/26)-3.5)*46+4}}));
const t=new TownLife({homes,minute:8*60,seed:20261104});
const step=n=>{for(let k=0;k<n;k++){t.minute++;if(t.minute>=1440){t.minute-=1440;t.day++;}advanceEmergency(t);}};
assert.equal(responseMetrics(t).all.incidents,0);
const enquiry=Object.entries(INCIDENTS).find(([,s])=>s.nonEmergency)?.[0];
if(enquiry)t.dial000(enquiry);
t.dial000('medical');step(1);
t.dial000('crash');            // a crash also needs the only ambulance, which is busy
step(1);
let m=responseMetrics(t).all;
assert.equal(m.incidents,2,'non-urgent enquiries are not counted');
assert.ok(responseMetrics(t).crash.incidents===1,'crash logged');
step(120);
m=responseMetrics(t);
assert.equal(m.all.wait.n,2);
assert.ok(m.crash.allAttended.median>=m.medical.allAttended.median+15,'crash waits for the busy ambulance before every service has attended: '+JSON.stringify([m.crash.allAttended,m.medical.allAttended]));
for(const k of ['firstArrival','allAttended','closed'])assert.equal(m.all[k].n,2,k+' recorded for both');
assert.ok(m.all.firstArrival.median<=m.all.allAttended.median&&m.all.allAttended.median<=m.all.closed.median,'stages in order');
assert.ok(m.medical.incidents===1&&m.crash.incidents===1);
const html=emergencyPanel(t).body;
assert.match(html,/Response times/);assert.match(html,/90% within/);
console.log('PASS emergency response metrics: wait '+JSON.stringify(m.all.wait)+', first arrival '+JSON.stringify(m.all.firstArrival));
