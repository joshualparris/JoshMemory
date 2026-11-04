import assert from 'node:assert/strict';
import { PLAN_HOMES, PLAN_PARCELS } from '../src/world/masterplan-built.js';
import { proposedParkRouteBaseline } from '../src/world/council-park-routes.js';
const a=proposedParkRouteBaseline();
assert.equal(a.method.includes('proposed/existing game-road'),true);
assert.equal(a.sourceCount,195,'baseline must cover all designed homes, not only 188 legacy repos');
assert.equal(a.sourceCount,PLAN_HOMES.length);
assert.equal(a.planningParcelCount,PLAN_PARCELS.length);
assert.equal(a.routes.length,195,'every home requires a row even if no route');
assert.equal(new Set(a.routes.map(r=>r.parcelId)).size,195,'no duplicate household/parcel row');
assert.equal(a.reachableCount+a.unreachableCount,195);
assert.equal(a.roadGraphComponents,1,'connected game-road centreline graph expected');
assert.equal(a.reachableCount,195,'each home currently has a proposed graph path to model park');
assert(a.homesBeyond400mByProposedRoad>0,'the western long-distance park-access gap must remain reported');
assert(a.p90ProposedWalkingM>=a.p50ProposedWalkingM);
assert(a.longestProposedWalkingM>=a.p90ProposedWalkingM);
assert.equal(a.routes.every(r=>r.streetFrontageValid&&r.reachableOnModel),true);
for(const r of a.routes){
 assert(r.houseApproachM>=0&&r.roadCentrelineDistanceM>=0&&r.totalProposedWalkingM>0);
 assert(r.totalProposedWalkingM+0.02>=r.directToParkRoadPointM,
   'road route must not undershoot straight-line distance to the same road-point goal');
 assert(r.proposedParkEntranceOffsetM>0,'explicit reserve-crossing assumption, not full park survey');
 assert.equal(r.approval,'NOT APPROVED, NO PEDESTRIAN ACCESS VERIFIED');
}
assert(/NOT footpath/.test(a.caveat),'must disclose this is not pedestrian-infrastructure verification');
const removed=proposedParkRouteBaseline({removeRoad:a.parkRoadId});
assert.equal(removed.missingParkFrontage,true,'a missing park frontage must fail closed');
assert.equal(removed.reachableCount,0,'must not invent a replacement park entrance');
console.log(JSON.stringify({status:'PASS',method:a.method,proposedHomes:a.sourceCount,
  park:a.parkParcelId,reachable:a.reachableCount,beyond400m:a.homesBeyond400mByProposedRoad,
  p50m:a.p50ProposedWalkingM,p90m:a.p90ProposedWalkingM,maxM:a.longestProposedWalkingM,
  disclaimer:a.caveat},null,2));
