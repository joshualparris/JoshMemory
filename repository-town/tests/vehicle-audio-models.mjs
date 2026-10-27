import assert from 'node:assert/strict';
import * as THREE from 'three';
import {VEHICLE_DYNAMICS,vehicleSpec,transmissionFor,intendedSpeedMs,accelerationMs2} from '../src/world/vehicle-dynamics.js';
import {modelMesh} from '../src/world/player-driving.js';
import {vehicleTelemetry} from '../src/world/driving-instruments.js';
import {vehicleAudioParameters} from '../src/ui/vehicle-audio.js';
assert.equal(Object.keys(VEHICLE_DYNAMICS).length,10);
for(const [id,p] of Object.entries(VEHICLE_DYNAMICS)){
 assert(p.topKmh>0&&p.zeroTo100>0&&p.gears>=1,id+' dynamical model incomplete');
 assert.equal(intendedSpeedMs(id,1)*3.6,50,'all models follow posted town limit');
 assert(Math.abs(intendedSpeedMs(id,1,{unrestricted:true})*3.6-p.topKmh)<.001,id+' has distinct maximum speed');
 assert.equal(transmissionFor(id,0).gear,'N');
 assert(transmissionFor(id,-3).gear==='R');
 const n=transmissionFor(id,Math.min(p.topKmh*.5,125)/3.6,.5);
 assert(Number.isFinite(n.rpm)&&n.rpm>=p.idle&&n.rpm<=p.redline);
 const v={model:id,speed:30/3.6,registration:'CHEAT-T',fuel:p.maxFuel/2,gear:n.gear,rpm:n.rpm};
 const tm=vehicleTelemetry(v);assert.equal(tm.fuelCapacityL,p.maxFuel);
 assert.equal(tm.direction,n.gear);
 const audio=vehicleAudioParameters(v);
 assert.equal(audio.rpm,n.rpm);assert(audio.frequency>0&&audio.volume>0);
 const g=modelMesh(id);assert(g.isGroup,'3D model group');
 assert.equal(g.userData.headlights.beams.length,p.kind==='bike'?1:2,'appropriate bike/car front lamps');
 assert(g.children.length>5,'visible wheels and body');
 g.traverse(o=>{o.geometry?.dispose?.();});
}
assert(vehicleSpec('supercar').topKmh>=330);
assert(accelerationMs2('supercar',0,1)>accelerationMs2('sedan',0,1)*2,'supercar faster launch');
assert(vehicleSpec('motorbike').width<1,'motorbike should be much narrower than a car');
assert.equal(vehicleAudioParameters(null).active,false);
assert.notEqual(vehicleAudioParameters({model:'truck',speed:6,rpm:2000}).frequency,
  vehicleAudioParameters({model:'supercar',speed:6,rpm:6000}).frequency,'distinct V8 and diesel engine frequencies');
console.log('PASS: 10 vehicle classes, realistic relative performance, RPM/gears, narrow motorbikes and synthetic exhaust frequencies');
