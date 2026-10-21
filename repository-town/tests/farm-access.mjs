// Farm paddocks behind the south-side civic buildings: work spots and every walking or cycling
// route into and out of a paddock must stay clear of the building standing in front of it.
//   node tests/farm-access.mjs
import assert from 'node:assert/strict';
import { TownLife, walkRoute, fieldAccessRoute, FIELD_Z0, SOUTH_SITE_DEPTH } from '../src/world/life.js';
import { cyclingRoute } from '../src/world/bicycle-safety.js';

const homes = [];
for (let r = 0; r < 7; r++) for (let c = 0; c < 26; c += 2)
  homes.push({ coordinate: String.fromCharCode(65 + c) + (r + 1), name: 'Home', door: { x: (c - 12.5) * 26, z: r * 46 - 161 + 4 } });
const t = new TownLife({ homes, minute: 8 * 60, seed: 20261021 });
const places = [...t.places.values()];
// The widest south-side footprint is 14 m; a body's core is 0.25 m.
const boxes = places.filter((s) => s.side === 'south').map((s) => ({ id: s.id, x0: s.x - 7.25, x1: s.x + 7.25, z0: FIELD_Z0 - 0.25, z1: FIELD_Z0 + SOUTH_SITE_DEPTH + 0.25 }));
const crosses = (a, b, c) => {
  // Sample the straight segment a→b every 10 cm against box c.
  const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) / 0.1));
  for (let i = 0; i <= n; i++) {
    const x = a.x + ((b.x - a.x) * i) / n, z = a.z + ((b.z - a.z) * i) / n;
    if (x > c.x0 && x < c.x1 && z > c.z0 && z < c.z1) return true;
  }
  return false;
};
const clear = (path, from, what) => {
  let prev = from;
  for (const p of path) {
    for (const c of boxes) assert(!crosses(prev, p, c), `${what} passes through the ${c.id} building (${prev.x.toFixed(1)},${prev.z.toFixed(1)} → ${p.x.toFixed(1)},${p.z.toFixed(1)})`);
    prev = p;
  }
};
const shop = t.place('store').front, farms = places.filter((p) => p.field?.access);
assert.equal(farms.length, 6, 'all six paddocks have a civic building in front');
let routes = 0;
for (const p of farms) {
  assert(p.field.z0 >= FIELD_Z0 + SOUTH_SITE_DEPTH, `${p.id} paddock starts behind the building in front`);
  for (let i = 0; i < 25; i++) {
    const spot = t.workSpot({ work: p.id, job: 'farmer' });
    for (const c of boxes) assert(!(spot.x > c.x0 && spot.x < c.x1 && spot.z > c.z0 && spot.z < c.z1), `${p.id} work spot inside ${c.id}`);
    assert(spot.z <= p.field.z1 - 5.6, `${p.id} work spot clear of the hen house and trough`);
    for (const [from, to] of [[shop, spot], [spot, shop], [p.front, spot], [spot, p.front]]) {
      const walk = fieldAccessRoute(t.places, walkRoute(from, to), from, to);
      clear(walk, from, `${p.id} walk`);
      const ride = fieldAccessRoute(t.places, cyclingRoute(walkRoute(from, to), from, to, () => 177), from, to);
      clear(ride, from, `${p.id} ride`);
      routes += 2;
    }
  }
}
console.log(`PASS: 6 paddocks behind their civic buildings; ${routes} walking and cycling routes and 150 work spots clear of every building`);
