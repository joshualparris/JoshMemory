// #398: verify *uncertain* Microsoft footprints do not render over the
// minimum drivable road-centreline envelope. No OSM, detailed building or
// railway collider is disabled by this test or its source filter.
import assert from 'node:assert/strict';
import { CollisionWorld } from '../src/engine/collision.js';
import { STREETS, FILL_HOUSES, FOOTPRINT_ROAD_CONFLICTS,
  ROAD_LANE_SOURCE_CLEARANCE, onNarromineRoad } from '../src/world/narromine-layout.js';

assert.equal(ROAD_LANE_SOURCE_CLEARANCE,3.1,'declared road source conflict envelope');
const world=new CollisionWorld(FILL_HOUSES.map(h=>h.rect));
const blocked=[],samples=[];
for(const [si,st] of STREETS.entries()){
  for(let j=1;j<st.pts.length;j++){
    const [ax,az]=st.pts[j-1],[bx,bz]=st.pts[j],dx=bx-ax,dz=bz-az,len=Math.hypot(dx,dz);
    if(len<0.001)continue;
    const steps=Math.ceil(len/3), nx=-dz/len,nz=dx/len;
    for(let k=0;k<=steps;k++)for(const lateral of [0,-1.6,1.6]){
      const x=ax+dx*k/steps+nx*lateral,z=az+dz*k/steps+nz*lateral;
      if(!onNarromineRoad(x,z))continue;
      samples.push([si,x,z]);
      const hit=world.hits(x,z,1.12);
      if(hit && blocked.length<20)blocked.push({street:si,x,z,hit});
    }
  }
}
assert(samples.length>1000,'real mapped road samples are tested');
assert(FOOTPRINT_ROAD_CONFLICTS.length>0,'clashing source outlines recorded for review');
assert.equal(blocked.length,0,'a generated house still blocks a minimum driveable lane: '+JSON.stringify(blocked.slice(0,5)));
assert(FOOTPRINT_ROAD_CONFLICTS.every(v=>v.source==='Microsoft Global ML Building Footprints' &&
  v.reason==='mapped-road-driving-envelope-source-conflict'));
for(const v of FOOTPRINT_ROAD_CONFLICTS)
  assert(!FILL_HOUSES.some(h=>h.x===v.x&&h.z===v.z),'omitted source conflict was accidentally rendered');
console.log(`PASS Narromine minimum lane clearance: ${samples.length} sampled lane points; ${FOOTPRINT_ROAD_CONFLICTS.length} low-confidence road-overlapping footprints withheld for survey; ${FILL_HOUSES.length} retained`);
