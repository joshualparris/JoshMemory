// Audio-clock contract: a long WebGL frame cannot skip the engine's actual
// synthesised shutdown. Fake AudioParams record the exact WebAudio automation.
import assert from 'node:assert/strict';
import {scheduleVehicleRundown} from '../src/ui/vehicle-audio.js';

const makeParam = (value) => ({
 value, events: [],
 cancelScheduledValues(t){this.events.push(['cancel',t]);},
 setValueAtTime(v,t){this.events.push(['set',v,t]);},
 exponentialRampToValueAtTime(v,t){this.events.push(['exponential',v,t]);},
 linearRampToValueAtTime(v,t){this.events.push(['linear',v,t]);},
});
const tones=[makeParam(55),makeParam(27),makeParam(111)];
const gains=[makeParam(.32),makeParam(.06),makeParam(0),makeParam(.08)];
const schedule=scheduleVehicleRundown({tones,gains},17,1.2);
assert.equal(schedule.start,17);
assert.equal(schedule.end,18.2);
assert.equal(schedule.toneRamps,3);
assert.equal(schedule.gainRamps,4);
for(const param of tones) {
 assert.equal(param.events[0][0],'cancel');
 assert.deepEqual(param.events[1],['set',param.value,17]);
 assert.equal(param.events[2][0],'exponential');
 assert(param.events[2][1]>0&&param.events[2][1]<param.value/2);
 assert.equal(param.events[2][2],18.2);
}
for(const param of gains) {
 assert.deepEqual(param.events[1],['set',param.value,17]);
 assert.deepEqual(param.events[2],['linear',0,18.2]);
}
for(const seconds of [-1,0,Infinity,NaN]) {
 assert.throws(()=>scheduleVehicleRundown({tones,gains},17,seconds),RangeError);
}
console.log('PASS WebAudio shutdown: 3 scheduled declining pitch ramps, 4 gain ramps to zero, render-frame independent');
