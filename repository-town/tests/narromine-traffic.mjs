// Narromine traffic volumes follow the NSW level crossing register (Dandaloo St 7,000 vehicles/day,
// Manildra St 500/day): at the morning peak Dandaloo Street carries about 11 cars per km (both
// directions at 50 km/h), residential streets well under 1, and the night is quiet.
//   node tests/narromine-traffic.mjs
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createNarromineTraffic, DAILY_VEHICLES } from '../src/world/narromine-traffic.js';
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
console.log(`PASS Narromine traffic: Dandaloo St ${peak.toFixed(1)}/km at 8 am, ${night.toFixed(2)}/km at 3 am; ${t.count} cars simulated near the hotel`);
