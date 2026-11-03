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

// Detailed buildings, modelled from NSW aerial imagery inside their cadastre lots.
{
  const { DETAILED, FILL_SHOPS, FILL_HOUSES, polyRect, inPoly } = await import('../src/world/narromine-layout.js');
  const areaOf = (pts) => Math.abs(pts.reduce((s, p, i, a) => { const q = a[(i + 1) % a.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0) / 2);
  const edgeDist = (bd, x, z) => Math.min(...bd.map((a, i, arr) => { const b = arr[(i + 1) % arr.length], dx = b[0] - a[0], dz = b[1] - a[1], l = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / l)); return Math.hypot(x - a[0] - t * dx, z - a[1] - t * dz); }));
  // Cadastre Shape__Area is Web Mercator; true area = value × cos²(32.24°). Royal: 3,355 → ≈2,395 m² (listing "approx 2393 sqm");
  // Narromine Hotel (Lot 13 DP519453): 2,929 → ≈2,097 m²; Post Office (Lot 2 DP814749): 1,330 → ≈952 m².
  for (const [id, want, pubName] of [['royal-hotel', 2393, 'Royal Hotel'], ['narromine-hotel', 2097, 'Narromine Hotel'],
    ['narromine-post-office', 952, 'Narromine Post Office'], ['dandaloo-82', 3821, 'Coles'],
    // The rest of the traced Dandaloo Street block: every lot gets the same placement checks.
    ...DETAILED.filter((b) => !['royal-hotel', 'narromine-hotel', 'narromine-post-office', 'dandaloo-82'].includes(b.id)).map((b) => [b.id, 0, b.name])]) {
    const d = DETAILED.find((b) => b.id === id), area = areaOf(d.boundary);
    if (want) {
      assert(Math.abs(area - want) < 30, `${id} lot is the real ~${want} m² (got ${area.toFixed(0)})`);
      const pub = PLACES.find((p) => p.name === pubName);
      assert(inPoly(pub.x, pub.z, d.boundary) || edgeDist(d.boundary, pub.x, pub.z) < 15, `the mapped ${pubName} lies at its own lot`);
    }
    // Buildings sit on the boundary (2.5 m tolerance); verandahs overhang the footpath (6.5 m, or 9.5 m
    // at a corner, where a wrap-around verandah reaches diagonally past the lot's splayed corner).
    for (const p of d.parts) for (const [x, z] of p.pts) assert(inPoly(x, z, d.boundary) || edgeDist(d.boundary, x, z) <= 2.5, `${id} ${p.name} inside the lot`);
    for (const v of d.verandahs) for (const [x, z] of v.pts) assert(inPoly(x, z, d.boundary) || edgeDist(d.boundary, x, z) <= 9.5, `${id} ${v.name} at the lot`);
    for (const p of d.parts) { const r = polyRect(p.pts); assert(!onNarromineRoad((r.x0 + r.x1) / 2, (r.z0 + r.z1) / 2), `${id} ${p.name} is off the road`); }
    for (const g of [...FILL_SHOPS, ...FILL_HOUSES]) assert(!inPoly(g.x, g.z, d.boundary), 'no generated building inside ' + id);
    for (const b of BUILDINGS) { const c = b.pts.reduce((s, p) => [s[0] + p[0] / b.pts.length, s[1] + p[1] / b.pts.length], [0, 0]); assert(!inPoly(c[0], c[1], d.boundary), 'no mapped outline doubles the model of ' + id); }
    console.log(`PASS ${pubName}: lot ${area.toFixed(0)} m², ${d.parts.length} parts, ${d.verandahs.length} verandah(s) inside the lot`);
  }
  const f = polyRect(DETAILED[0].parts.find((p) => p.name === 'front').pts);
  assert(Math.abs((f.z1 - f.z0) - 20.3) < 0.5 && Math.abs((f.x1 - f.x0) - 7.4) < 0.5, 'Royal front block 20.3 m × 7.4 m as traced');
  const nh = DETAILED.find((b) => b.id === 'narromine-hotel');
  assert(nh.parts.filter((p) => p.storeys === 2).length === 3 && nh.verandahs.every((v) => v.levels === 2 && v.lace), 'Narromine Hotel: two storeys with a two-level lace verandah');
}
