// Narromine from OpenStreetMap: the compressed highway joins the real Mitchell Highway, which
// becomes Dandaloo Street; real street names, buildings and named places are present and placed
// where the map puts them; private homes are never named; fences leave the highway open.
import assert from 'node:assert/strict';
import { HIGHWAY, REGION, OSM, STREETS, BUILDINGS, PLACES, ARRIVAL, OFFSET, onNarromineRoad, onOpenHighway, boundaryColliders } from '../src/world/narromine-layout.js';

const secs = (HIGHWAY.x1 - HIGHWAY.x0) / (HIGHWAY.speed / 3.6);
assert(secs > 80 && secs < 100, `compressed drive ≈ 90 s at 100 km/h (got ${secs.toFixed(0)} s)`);
for (let x = HIGHWAY.x1; x >= HIGHWAY.x0; x -= 2) assert(onNarromineRoad(x, HIGHWAY.z), 'highway driveable at x ' + x);
assert(onOpenHighway(-1500, HIGHWAY.z) && !onOpenHighway(HIGHWAY.x0 - 50, HIGHWAY.z), '100 km/h only on the open highway');
assert.equal(OSM.licence, 'ODbL 1.0'); assert.match(OSM.attribution, /OpenStreetMap contributors/);

// The real Mitchell Highway starts where the game highway ends, and is driveable from there.
const mitchell = STREETS.filter((s) => s.name === 'Mitchell Highway');
assert(mitchell.some((s) => s.pts.some(([x, z]) => Math.hypot(x - OFFSET.x, z - OFFSET.z) < 1)), 'real Mitchell Highway meets the game highway');
for (const s of STREETS) for (const [x, z] of s.pts) if (x > REGION.x0 && x < REGION.x1) assert(onNarromineRoad(x, z), `${s.name || s.kind} driveable at its mapped point`);

const names = new Set(STREETS.map((s) => s.name));
for (const n of ['Dandaloo Street', 'Burraway Street', 'Cathundril Street', 'Meryula Street', 'Manildra Street', 'Merilba Street', 'Nymagee Street', 'Temoin Street'])
  assert(names.has(n), 'real street present: ' + n);
assert(BUILDINGS.length > 150, `mapped buildings present (${BUILDINGS.length})`);

// Named places sit on or beside their real street (main-street shops within 60 m of Dandaloo Street).
const place = (n) => PLACES.find((p) => p.name === n);
for (const n of ['Royal Hotel', 'Narromine Hotel', 'Coles', 'Narromine Post Office', 'Narromine Pharmacy', 'Imperial Hotel', 'Narromine RSL Club', 'Narromine Aviation Museum'])
  assert(place(n), 'named place present: ' + n);
const dandaloo = STREETS.filter((s) => s.name === 'Dandaloo Street').flatMap((s) => s.pts);
const nearStreet = (p, pts) => pts.some(([x, z]) => Math.hypot(x - p.x, z - p.z) < 60);
for (const n of ['Coles', 'Narromine Post Office', 'Narromine Pharmacy', 'Royal Hotel', 'Narromine Hotel']) assert(nearStreet(place(n), dandaloo), n + ' is on Dandaloo Street');
assert.match(place('Royal Hotel').fact, /1890/); assert.match(place('Narromine Aviation Museum').fact, /Sabre/);

// Privacy: no private home names or home addresses (the export contains a named private house).
for (const p of PLACES) assert(p.kind !== 'house' && !/'s (house|home)|residence/i.test(p.name), 'no private home named: ' + p.name);
for (const b of BUILDINGS) assert(!b.name || !/'s house|residence/i.test(b.name), 'no named private building: ' + b.name);
assert(!/Parris/i.test(JSON.stringify(OSM)), 'no family names from private homes in the data');

const hit = (x, z) => boundaryColliders().some((c) => x >= c.x0 && x <= c.x1 && z >= c.z0 && z <= c.z1);
for (let x = -1480; x > REGION.x1 - 20; x -= 5) assert(!hit(x, HIGHWAY.z), 'fences leave the highway open at x ' + x);
assert(hit(-2000, HIGHWAY.z - 50) && hit(-2000, HIGHWAY.z + 50), 'the corridor is fenced');
console.log(`PASS Narromine (OpenStreetMap): ${STREETS.length} street pieces, ${BUILDINGS.length} buildings, ${PLACES.length} named places; ${names.size} street names; drive ≈${secs.toFixed(0)} s`);
