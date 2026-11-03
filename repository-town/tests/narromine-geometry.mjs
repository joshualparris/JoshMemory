import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildNarromineRegion} from '../src/world/narromine-region.js';
import {NARROMINE_ROADS,NARROMINE_LANDMARKS} from '../src/world/narromine-location.js';

const parent=new THREE.Group();
let signs=0;
const region=buildNarromineRegion(parent,()=>{signs++;return new THREE.Object3D();});
assert.ok(parent.children.includes(region.group));
assert.equal(region.landmarks.length,NARROMINE_LANDMARKS.length);
assert.ok(signs>=NARROMINE_LANDMARKS.length+2);
assert.ok(region.colliders.length>=NARROMINE_LANDMARKS.length-1);
assert.ok(region.group.children.some(x=>x.children?.some(c=>c.isMesh)), 'Merged world geometry should exist');
for(const c of region.colliders){
  assert.ok(c.x0<c.x1&&c.z0<c.z1);
  for(const road of NARROMINE_ROADS){
    const overlap=c.x0<road.x1&&c.x1>road.x0&&c.z0<road.z1&&c.z1>road.z0;
    assert.equal(overlap,false,`building may block ${road.id} at (${c.x0},${c.z0})`);
  }
}
console.log('Narromine scene: real Three.js geometry build, landmarks and vehicle-safe roads PASS');
