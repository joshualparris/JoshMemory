// Estate services from the planning audit: every estate road has kerb inlets on both kerbs,
// sewer manholes, hydrants (each with a blue road marker), telecom pits and transformers; nothing
// sits in a junction, on a street light, or outside the 20 m road reserve, and transformers clear
// the footpath and every lot.
//   node tests/civil-works.mjs
import assert from 'node:assert/strict';
import { planCivilWorks } from '../src/world/civil-works.js';
import { PLAN_ROADS, PLAN_PARCELS } from '../src/world/masterplan-built.js';
import { estateStreetLightLocations } from '../src/world/estate-lighting.js';
const items = planCivilWorks(), count = (k) => items.filter((i) => i.kind === k).length;
console.log(Object.fromEntries(['inlet', 'manhole', 'hydrant', 'marker', 'telecom', 'transformer'].map((k) => [k, count(k)])));
for (const r of PLAN_ROADS) for (const k of ['inlet', 'manhole', 'hydrant', 'telecom']) assert(items.some((i) => i.road === r.id && i.kind === k), `${r.name} has ${k}s`);
for (const r of PLAN_ROADS) for (const s of [-1, 1]) assert(items.some((i) => i.road === r.id && i.kind === 'inlet' && i.side === s), `${r.name} drains both kerbs`);
assert.equal(count('marker'), count('hydrant'), 'every hydrant has a blue marker on the road');
assert(count('transformer') >= 10, 'kiosk substations spread through the estate');
const lamps = estateStreetLightLocations(PLAN_ROADS);
for (const i of items) {
  const r = PLAN_ROADS.find((q) => q.id === i.road), off = Math.abs(r.a.z === r.b.z ? i.z - r.a.z : i.x - r.a.x);
  assert(off < 10, `${i.kind} stays inside the 20 m reserve`);
  assert(!lamps.some((l) => Math.hypot(l.x - i.x, l.z - i.z) < 1.5), `${i.kind} clear of street lights`);
  if (i.kind === 'transformer') {
    assert(off - 0.7 > r.width / 2 + 3, 'transformer clear of the footpath');
    assert(!PLAN_PARCELS.some((p) => Math.abs(p.x - i.x) < p.w / 2 + 0.7 && Math.abs(p.z - i.z) < p.d / 2 + 0.7), 'transformer outside every lot');
  }
}
console.log(`PASS: ${items.length} service fixtures on ${PLAN_ROADS.length} estate roads`);
