// Narromine layout: the highway joins Street 4 and Dandaloo Street, is driveable end to end,
// buildings sit off the roads and inside Narromine's fenced region, every fact carries a source,
// and the fences leave the highway open.
import assert from 'node:assert/strict';
import { HIGHWAY, REGION, STREETS, BUILDINGS, MEMORIAL, ARRIVAL, onNarromineRoad, onOpenHighway, buildingRect, boundaryColliders } from '../src/world/narromine-layout.js';
assert.equal(HIGHWAY.x1, -343, 'highway starts at the west end of Street 4');
const len = HIGHWAY.x1 - HIGHWAY.x0, secs = len / (HIGHWAY.speed / 3.6);
assert(secs > 80 && secs < 100, `compressed drive ≈ 90 s at 100 km/h (got ${secs.toFixed(0)} s)`);
for (let x = HIGHWAY.x1; x > STREETS[0].a.x; x -= 2) assert(onNarromineRoad(x, HIGHWAY.z), 'driveable at x ' + x);
assert(onOpenHighway(-1500, HIGHWAY.z) && !onOpenHighway(-3000, HIGHWAY.z), '100 km/h only on the open highway');
const inside = (r) => r.x0 >= REGION.x0 && r.x1 <= REGION.x1 && r.z0 >= REGION.z0 && r.z1 <= REGION.z1;
for (const b of BUILDINGS) {
  const r = buildingRect(b);
  assert(inside(r), b.id + ' inside the region');
  for (const [x, z] of [[r.x0 + 0.5, r.z0 + 0.5], [r.x1 - 0.5, r.z1 - 0.5], [(r.x0 + r.x1) / 2, (r.z0 + r.z1) / 2]]) assert(!onNarromineRoad(x, z), b.id + ' is off the road');
  for (const o of BUILDINGS) if (o !== b) { const q = buildingRect(o); assert(r.x1 <= q.x0 || q.x1 <= r.x0 || r.z1 <= q.z0 || q.z1 <= r.z0, b.id + ' overlaps ' + o.id); }
}
for (const f of [...BUILDINGS.filter((b) => !/shops/.test(b.id) && b.id !== 'police-station'), MEMORIAL]) assert(/\((Aussietowns|Visit NSW)\)/.test(f.fact), f.id + ' fact is sourced');
const hit = (x, z) => boundaryColliders().some((c) => x >= c.x0 && x <= c.x1 && z >= c.z0 && z <= c.z1);
for (let x = -1480; x > REGION.x1 - 20; x -= 5) assert(!hit(x, HIGHWAY.z), 'fences leave the highway open at x ' + x);
assert(hit(-2000, HIGHWAY.z - 50) && hit(-2000, HIGHWAY.z + 50), 'the corridor is fenced');
assert(!hit(ARRIVAL.x, ARRIVAL.z) && !onNarromineRoad(ARRIVAL.x, ARRIVAL.z), 'arrival point is on the footpath');
console.log(`PASS Narromine layout: ${len} m highway (≈${secs.toFixed(0)} s at 100 km/h), ${BUILDINGS.length} buildings, sourced facts, fences open on the road`);
