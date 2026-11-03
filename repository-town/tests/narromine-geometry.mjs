import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildNarromineRegion} from '../src/world/narromine-region.js';
import {NARROMINE_ROADS,NARROMINE_LANDMARKS,NARROMINE_REAL_ROAD_COUNT,
 NARROMINE_APPROACH,narromineRoadAllows,nearestRegionalRoad,
 DANDALOO_MEDIAN_Z} from '../src/world/narromine-location.js';

const parent=new THREE.Group();let signs=0;
const site=buildNarromineRegion(parent,()=>{signs++;return new THREE.Object3D();});
assert(parent.children.includes(site.group),'real region scene must join outdoor town');
assert(site.group.children.some(x=>x.children.some(c=>c.isMesh)), 'merged real-map road meshes must render');
assert.equal(site.landmarks.length,NARROMINE_LANDMARKS.length);
assert.equal(site.sourceRoadSegments,NARROMINE_REAL_ROAD_COUNT);
assert(site.realStreetNames>=70);
assert(signs>=site.landmarks.length+4);
assert(site.accuracy.includes('unverified'));
assert.equal(site.colliders.length,0,'must not pretend synthetic facade rectangles are surveyed property collisions');
const bb=new THREE.Box3().setFromObject(site.group);
assert(bb.min.x < -6700 && bb.max.x > -1400,'all mapped streets and rural connection fit region');
assert(bb.min.z < -1900 && bb.max.z > 2600,'full surveyed town north/south extent fits region');
for(const pt of NARROMINE_APPROACH) assert(narromineRoadAllows(pt.x,pt.z),'real car connection geometry available');
for(const r of NARROMINE_ROADS){
 assert(Number.isFinite(r.a.x)&&Number.isFinite(r.b.z),'finite mapped road');
 assert(r.width>=3&&r.width<=15,'no huge road masks covering whole blocks');
}
console.log('PASS Narromine scene: actual Three.js world with '+NARROMINE_REAL_ROAD_COUNT+' GIS road segments, '+site.realStreetNames+' street names, '+site.landmarks.length+' geocoded venues, zero invented building collision blocks');
