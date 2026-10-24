import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createStreetLighting, lightingLevel, STREET_LIGHT_BUDGET, shopLightingOn, householdLightingOn } from '../src/world/lighting.js';
import { buildCivicInterior, CIVIC_INTERIOR_IDS } from '../src/world/shop-interior.js';
const group=new THREE.Group();
const sources=Array.from({length:300},(_,i)=>({x:i*13,y:4,z:0,roadward:2}));
const lights=createStreetLighting(group,sources);
assert.equal(lights.slots.length,STREET_LIGHT_BUDGET);
lights.update({x:24,z:0},0);assert(lights.slots.every(l=>l.intensity===0&&!l.visible));
lights.update({x:24,z:0},1);assert(lights.slots.some(l=>l.intensity>0));
assert(lights.slots.every(l=>l.target.position.y<l.position.y&&!l.castShadow));
const first=lights.slots[0].position.x;
lights.update({x:1200,z:0},1);assert.notEqual(lights.slots[0].position.x,first);
assert(Math.abs(lights.slots[0].position.x-1200)<14);
lights.update({x:1200,z:0},1,false);assert(lights.slots.every(l=>l.intensity===0));
assert(lightingLevel(.3)>0&&lightingLevel(.3)<1);
const store={id:'store',opens:8*60,closes:20*60};
assert(shopLightingOn(store,19*60));assert(!shopLightingOn(store,23*60));
assert(shopLightingOn({id:'pub',opens:16*60,closes:60},30));
assert(!shopLightingOn({id:'pub',opens:16*60,closes:60},9*60));
assert(shopLightingOn({id:'fire'},23*60));
assert(householdLightingOn(19*60,0));
assert(!householdLightingOn(23*60,0));
assert(householdLightingOn(23*60,1));
assert(!householdLightingOn(2*60,2));
assert(householdLightingOn(30,2));
assert(shopLightingOn({id:'square',opens:0,closes:1440},19*60));
assert(shopLightingOn({id:'farmhouse',kind:'home',opens:0,closes:1440},19*60));
assert(!shopLightingOn({id:'farmhouse',kind:'home',opens:0,closes:1440},23*60));
for(const id of CIVIC_INTERIOR_IDS){
  const room=buildCivicInterior({id,name:id},()=>new THREE.Sprite(new THREE.SpriteMaterial()));
  let count=0;room.group.traverse(o=>{if(o.isLight&&o.intensity>0)count++;});
  assert(count>0,id+' has independent electric lighting');
  if(['university','tafe','trades','hardware'].includes(id)){
    assert(count>=5,id+' has fill and four ceiling sources');
    assert.equal(room.group.userData.lightingSite,id);
    room.group.userData.updateLighting(false);
    room.group.traverse(o=>{if(o.isLight)assert.equal(o.intensity,0);});
    room.group.userData.updateLighting(true);
  }
}
console.log('PASS: all civic interiors lit; street light budget, falloff, clock, relocation, blackout and trading/overnight schedules');
