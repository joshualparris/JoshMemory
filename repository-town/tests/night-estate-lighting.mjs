// Lighting regression for user-reported unlit estate and cars (October 2026).
// Rendering intensities are illustrative, not AS/NZS 1158 photometric certification.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {PLAN_ROADS,ESTATE_LAMPS,buildMasterplan} from '../src/world/masterplan-built.js';
import {ESTATE_LAMP_SPACING_M,estateStreetLightLocations,nightLightLevel} from '../src/world/estate-lighting.js';
import {createStreetLighting,lightingLevel} from '../src/world/lighting.js';
import {modelMesh,setVehicleHeadlights,headlightLevel} from '../src/world/player-driving.js';

assert.equal(PLAN_ROADS.length,8,'all planned roads covered');
assert.equal(ESTATE_LAMPS.length,estateStreetLightLocations(PLAN_ROADS).length,'stable deterministic lamp plan');
assert.equal(new Set(ESTATE_LAMPS.map(l=>l.id)).size,ESTATE_LAMPS.length,'unique poles');
assert(ESTATE_LAMPS.length>90,'the western estate needs substantial street lighting');
for(const road of PLAN_ROADS)assert(ESTATE_LAMPS.filter(x=>x.roadId===road.id).length>=2,
  road.id+' requires poles, not just the old high street');
for(const l of ESTATE_LAMPS){
 const road=PLAN_ROADS.find(r=>r.id===l.roadId),horizontal=road.a.z===road.b.z;
 const offset=Math.abs((horizontal?l.z:l.x)-(horizontal?road.a.z:road.a.x));
 const along=horizontal?l.x:l.z;
 const min=horizontal?Math.min(road.a.x,road.b.x):Math.min(road.a.z,road.b.z),
       max=horizontal?Math.max(road.a.x,road.b.x):Math.max(road.a.z,road.b.z);
 assert(along>min+10&&along<max-10,'no pole beyond road termini: '+l.id);
 assert(offset>=road.width/2+road.footpath+.4,'pole behind pedestrian path: '+l.id);
 assert(offset<road.reserve/2,'pole must stay in dedicated road reservation: '+l.id);
 assert(Math.abs((horizontal?l.headZ:l.headX)-(horizontal?road.a.z:road.a.x))<offset,
   'lamp heads face inward to illuminate driving surface');
 assert(l.height>5&&l.height<9);
 assert(l.distanceAlong>10&&l.distanceAlong<Math.hypot(road.b.x-road.a.x,road.b.z-road.a.z)-10);
}
assert.equal(nightLightLevel(1),0);
assert.equal(nightLightLevel(0),1);
assert.equal(headlightLevel(1),0);
assert(headlightLevel(.32)>0&&headlightLevel(.32)<1);
assert.equal(headlightLevel(0),1);
const model=modelMesh('sedan');
const beams=model.userData.headlights.beams;
assert.equal(beams.length,2,'separate real beams per headlight');
assert(beams.every(l=>l.isSpotLight&&!l.castShadow&&l.distance>=50));
assert.equal(setVehicleHeadlights(model,1,true),0,'automatic daytime switch-off');
assert(beams.every(l=>l.intensity===0));
assert.equal(setVehicleHeadlights(model,0,true),1,'night start turns on beams');
assert(beams.every(l=>l.visible&&l.intensity>100),'beam throws real light, not just bright car paint');
model.position.set(12,0,35);model.rotation.y=0;model.updateMatrixWorld(true);
const beam=beams[0],source=new THREE.Vector3(),target=new THREE.Vector3();
beam.getWorldPosition(source);beam.target.getWorldPosition(target);
assert(target.z<source.z-25,'headlight projects forwards down the road');
model.rotation.y=Math.PI/2;model.updateMatrixWorld(true);
beam.getWorldPosition(source);beam.target.getWorldPosition(target);
assert(target.x<source.x-25,'headlight beam turns with the vehicle');
setVehicleHeadlights(model,0,false);
assert(beams.every(l=>l.intensity===0&&!l.visible),'parked engine shuts off lamps even at night');
const town=new THREE.Group(),built=buildMasterplan(town);
assert.equal(built.lampPositions.length,ESTATE_LAMPS.length);
assert.equal(built.lampColliders.length,ESTATE_LAMPS.length);
assert.equal(built.streetLampSources.length,ESTATE_LAMPS.length);
built.setNight(0,true);assert.equal(built.lampHeads.material.emissiveIntensity,0);
built.setNight(1,true);assert(built.lampHeads.material.emissiveIntensity>0);
built.setNight(1,false);assert.equal(built.lampHeads.material.emissiveIntensity,0,'blackout switches off estate');
const rig=createStreetLighting(new THREE.Group(),[{x:0,z:0,y:4,roadward:2}],4);
rig.addSources(built.streetLampSources);
assert.equal(rig.sourceCount,built.streetLampSources.length+1);
const chosen=built.streetLampSources.find(s=>s.x< -600);
assert(chosen,'far-west lamp exists');
rig.update({x:chosen.x,z:chosen.z},1);
assert(rig.slots.some(l=>l.visible&&l.intensity>0),'walking/driving west activates a real road pool');
rig.update({x:chosen.x,z:chosen.z},1,false);
assert(rig.slots.every(l=>l.intensity===0),'power failure turns road light off');
console.log('PASS: 8-road estate, fixed pole clearances, active steered twin headlight beams, dusk/day and grid rules');
