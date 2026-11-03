import assert from 'node:assert/strict';
import { NARROMINE_REAL,NARROMINE_ROADS,NARROMINE_LANDMARKS,
  narromineRoadAllows,nearestNarromineLandmark,inNarromine } from '../src/world/narromine-location.js';
import {onPlannedOrCoreRoad} from '../src/world/masterplan-built.js';

assert.equal(NARROMINE_REAL.name,'Narromine');
assert.equal(NARROMINE_REAL.postcode,'2821');
assert.equal(NARROMINE_REAL.urbanCentrePopulation2021,3507);
assert.equal(NARROMINE_REAL.shirePopulation2021,6360);
assert.notEqual(NARROMINE_REAL.urbanCentrePopulation2021,NARROMINE_REAL.shirePopulation2021);
assert.equal(NARROMINE_REAL.mapStatus,'representative, compressed, unsurveyed');

// The same junction is part of an existing western estate road and the new
// regional link; players can drive the full route without teleporting.
assert.equal(onPlannedOrCoreRoad(-1330,277),true,'Existing Wattle Street terminus');
assert.equal(narromineRoadAllows(-1330,277),true,'Connected regional westbound road');
for(let x=-1330;x>=-2630;x-=5)
  assert.ok(onPlannedOrCoreRoad(x,277)||narromineRoadAllows(x,277),`route break at x=${x}`);
assert.ok(narromineRoadAllows(-2630,277),'Narromine main street crossing');
for(let z=110;z<=488;z+=4)assert.ok(narromineRoadAllows(-2630,z),`Dandaloo street gap z=${z}`);
assert.ok(narromineRoadAllows(-2575,440),'Museum access road');
assert.ok(narromineRoadAllows(-2480,483),'Aerodrome access road');
assert.equal(narromineRoadAllows(-2800,280),false,'Do not classify paddocks as road');
assert.equal(narromineRoadAllows(NaN,277),false);
assert.equal(inNarromine(-2650,317),true);
assert.equal(inNarromine(-1330,277),false);

// No two interaction markers share identity or site, and every panel can
// ground its interpretive text in a public source.
assert.equal(new Set(NARROMINE_ROADS.map(r=>r.id)).size,NARROMINE_ROADS.length);
assert.equal(new Set(NARROMINE_LANDMARKS.map(s=>s.id)).size,NARROMINE_LANDMARKS.length);
assert.ok(NARROMINE_LANDMARKS.length>=9);
for(const site of NARROMINE_LANDMARKS){
  assert.ok(site.name && site.summary && /^https:\/\//.test(site.source),site.id);
  assert.ok(Number.isFinite(site.x)&&Number.isFinite(site.z));
  assert.ok(site.x>=-2900&&site.x<=-2150&&site.z>=105&&site.z<=500);
  assert.equal(nearestNarromineLandmark({x:site.x,z:site.z})?.id,site.id,site.id);
  assert.equal(nearestNarromineLandmark({x:site.x+70,z:site.z+700}),null);
}
assert.equal(nearestNarromineLandmark({x:Infinity,z:1}),null);
console.log('Narromine regional drive: connected roads, town navigation, sourced POIs, ABS locality distinction PASS');
