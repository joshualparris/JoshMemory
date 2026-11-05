// Narromine traffic volumes follow the NSW level crossing register (Dandaloo St 7,000 vehicles/day,
// Manildra St 500/day): at the morning peak Dandaloo Street carries about 11 cars per km (both
// directions at 50 km/h), residential streets well under 1, and the night is quiet.
//   node tests/narromine-traffic.mjs
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createNarromineTraffic, DAILY_VEHICLES, leftLaneOffset } from '../src/world/narromine-traffic.js';
import { VEHICLE_MODELS, pickVehicle } from '../src/world/narromine-vehicle-models.js';
import fs from 'node:fs';
// World north is negative z. Left-of-travel keeps northbound cars to the
// west and southbound cars to the east, as required on an NSW two-way street.
assert.ok(leftLaneOffset(0, -1, 8).x < -1.5, 'northbound uses western lane');
assert.ok(leftLaneOffset(0, 1, 8).x > 1.5, 'southbound uses eastern lane');
assert.ok(leftLaneOffset(1, 0, 8).z < -1.5, 'eastbound uses northern lane');
assert.ok(leftLaneOffset(-1, 0, 8).z > 1.5, 'westbound uses southern lane');
const t = createNarromineTraffic(new THREE.Group());
const perKm = (name, hour) => { const es = t.edges.filter(e => e.name === name); const len = es.reduce((s, e) => s + e.len, 0); return es.reduce((s, e) => s + t.expected(e, hour), 0) / (len / 1000); };
assert.equal(DAILY_VEHICLES['Dandaloo Street'], 7000);
const peak = perKm('Dandaloo Street', 8), night = perKm('Dandaloo Street', 3), manildra = perKm('Manildra Street', 8);
assert.ok(peak > 9 && peak < 13, 'Dandaloo St peak density ' + peak.toFixed(1) + '/km');
assert.ok(night < peak / 10, 'quiet at night');
assert.ok(manildra < peak / 8, 'Manildra St lighter than Dandaloo');
// Simulate a minute near the hotel: cars appear, move, and stay on the road network.
const player = { x: -4805, z: -760 };
for (let i = 0; i < 600; i++) t.update(0.1, player, 8 * 60);
assert.ok(t.count > 5, 'cars around the town centre at 8 am: ' + t.count);
assert.ok(t.cars.every(c => Number.isFinite(c.x) && Number.isFinite(c.z)), 'all cars placed');

 // Cars must not occupy the same same-direction lane footprint after one minute.
 // Cars at intersections can cross at angles; check actual same-lane overlap only.
 for (let i = 0; i < t.cars.length; i++) for (let j = i + 1; j < t.cars.length; j++) {
   const a = t.cars[i], b = t.cars[j];
   if (a.ux * b.ux + a.uz * b.uz < 0.95) continue;
   const dx = b.x - a.x, dz = b.z - a.z;
   const along = Math.abs(dx * a.ux + dz * a.uz);
   const lateral = Math.abs(dx * a.uz - dz * a.ux);
   assert.ok(lateral >= 1.7 || along >= (a.L + b.L) / 2 - 0.1,
     'vehicles overlap same lane: ' + a.id + '/' + b.id);
 }
 // Catch respawn pile-ups during another two simulated minutes.
 for (let i = 0; i < 1200; i++) t.update(0.1, player, 8 * 60);
 assert.ok(t.cars.every(c => Number.isFinite(c.x) && Number.isFinite(c.z) && c.v >= 0),
   'extended drive remains finite with no reverse speeds');
// Vehicle mix: every model file ships, most traffic is SUVs and utes, emergency vehicles are rare.
for (const m of VEHICLE_MODELS) assert.ok(fs.existsSync(new URL('../src/assets/vehicles/' + m.file, import.meta.url)), 'model shipped: ' + m.file);
let seed = 7; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647, n = {};
for (let i = 0; i < 20000; i++) { const f = VEHICLE_MODELS[pickVehicle(r)].file; n[f] = (n[f] || 0) + 1; }
const share = (re) => Object.entries(n).filter(([f]) => re.test(f)).reduce((s, [, k]) => s + k, 0) / 20000;
assert.ok(share(/suv/) > 0.45 && share(/^truck/) > 0.15, 'SUVs and utes dominate: ' + JSON.stringify(n));
assert.ok(share(/police|ambulance|firetruck/) < 0.02, 'emergency vehicles are rare');
assert.equal(Object.keys(n).length, VEHICLE_MODELS.length, 'every model appears');
assert.ok(t.cars.every(c => c.L >= 4 && c.L <= 10), 'vehicle lengths are real-world');
console.log(`PASS Narromine traffic: Dandaloo St ${peak.toFixed(1)}/km at 8 am, ${night.toFixed(2)}/km at 3 am; ${t.count} cars simulated near the hotel`);
