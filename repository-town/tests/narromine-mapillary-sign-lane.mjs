import assert from 'node:assert/strict';
import * as THREE from 'three';
import {NARROMINE_MAPILLARY_OBJECTS as source} from '../src/world/narromine-mapillary-data.js';
import {buildNarromineMapillaryObjects} from '../src/world/narromine-mapillary-objects.js';
import {SIGN_LANE_REVIEW,SIGN_LANE_AUDIT,classifyMapillarySign,allowMapillarySignDisplay} from
 '../src/world/narromine-mapillary-sign-placement.js';

assert.equal(source.length,312,'historical Mapillary detections preserved');
assert.equal(SIGN_LANE_AUDIT.detected,245,'245 sign-like detections in source');
assert.equal(SIGN_LANE_AUDIT.withheld,44,'44 sign/traffic light source poles project onto sampled roadway');
assert.equal(SIGN_LANE_AUDIT.safe,201,'all other original sign posts remain displayed');
assert.equal(SIGN_LANE_REVIEW.length,44);
assert.equal(SIGN_LANE_REVIEW.filter(s=>s.status==='unverified-median-island').length,4,
  'keep-left islands require actual dated photo confirmation');
assert(SIGN_LANE_REVIEW.every(s=>s.clearanceFromRoadEdgeM<=.35));
assert(SIGN_LANE_REVIEW.some(s=>s.type==='stop')&&SIGN_LANE_REVIEW.some(s=>s.type==='warning'));
assert(SIGN_LANE_REVIEW.every(s=>s.id&&s.seen),'retain source identifiers/observation date for next review');
assert(source.some(s=>s.type==='zebra')&&source.some(s=>s.type==='bench'),'normal road furniture retained');

const original=JSON.stringify(source);
const target=new THREE.Group();
const counts=buildNarromineMapillaryObjects(target);
const sourceCounts=source.reduce((acc,o)=>(acc[o.type]=(acc[o.type]||0)+1,acc),{});
assert.deepEqual(counts,sourceCounts,'the original 312 Mapillary observations remain countable');
const vertices=t=>t.children.reduce((a,o)=>a+(o.geometry?.attributes?.position?.count||0),0);
const filteredVertices=vertices(target);
assert(filteredVertices>500,'real material-merged static meshes remain present');

const previous=globalThis.location;
try{
  globalThis.location={search:'?mapillarySigns=raw'};
  const qa=new THREE.Group(),all=buildNarromineMapillaryObjects(qa);
  assert.deepEqual(all,sourceCounts,'QA mode still retains raw source counts');
  assert(vertices(qa)>filteredVertices,'opt-in raw QA physically exposes excluded signs');
}finally{
  if(previous===undefined)delete globalThis.location;
  else globalThis.location=previous;
}
assert.equal(JSON.stringify(source),original,'sign source positions and metadata are immutable');
for(const sign of source){
  const c=classifyMapillarySign(sign);
  assert.equal(allowMapillarySignDisplay(sign,true),true,'QA must preserve every source detection');
  if(!c.sign)assert.equal(allowMapillarySignDisplay(sign),true,'do not hide other furniture, marking or crossings');
  else if(c.withhold)assert.equal(allowMapillarySignDisplay(sign),false);
}
console.log('PASS Mapillary sign lane evidence: 245 total source signs; 44 held for 2026 placement verification; 201 clear; 4 keep-left median islands awaiting confirmation; raw QA shows all; no new fake locations');
