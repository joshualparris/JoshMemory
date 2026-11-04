// Narromine rail network: one connected standard-gauge graph from the mapped OSM lines, junction
// routing, speed limits, path following forwards/backwards, buffer stops, and a clear corridor
// (no invented stand-in buildings within 6 m of any track).
//   node tests/narromine-rail-network.mjs
import assert from 'node:assert/strict';
import { RAIL, FILL_SHOPS, FILL_HOUSES } from '../src/world/narromine-layout.js';
import { buildRailNetwork, createTrainPath, RAIL_GAUGE_M, SPEED_LIMIT_KMH } from '../src/world/narromine-rail-network.js';
assert.equal(RAIL_GAUGE_M, 1.435, 'standard gauge');
const net = buildRailNetwork(RAIL);
const seen = new Set(), stack = [0];
while (stack.length) { const c = stack.pop(); if (seen.has(c)) continue; seen.add(c); for (const n of net.adj.get(c)) stack.push(n); }
assert.equal(seen.size, net.nodes.length, 'every mapped line joins one network');
const junctions = [...net.adj].filter(([, s]) => s.size >= 3).length;
assert.ok(junctions >= 6, 'yard and branch junctions: ' + junctions);
// Speed limits: yard loop 25, running lines 80.
const yardA = net.nodes.find(n => Math.hypot(n.x - RAIL[2].pts[3][0], n.z - RAIL[2].pts[3][1]) < 1.6).id;
const yardB = net.nodes.find(n => Math.hypot(n.x - RAIL[2].pts[4][0], n.z - RAIL[2].pts[4][1]) < 1.6).id;
assert.equal(net.limitKmh(yardA, yardB), SPEED_LIMIT_KMH.yard);
const mainA = net.nodes.find(n => Math.hypot(n.x - RAIL[7].pts[1][0], n.z - RAIL[7].pts[1][1]) < 1.6).id;
const mainB = net.nodes.find(n => Math.hypot(n.x - RAIL[7].pts[2][0], n.z - RAIL[7].pts[2][1]) < 1.6).id;
assert.equal(net.limitKmh(mainA, mainB), 50, 'ARTC permanent restriction into Narromine from Dubbo');
const nw = RAIL[1].pts, nwA = net.nodes.find(n => Math.hypot(n.x - nw[1][0], n.z - nw[1][1]) < 1.6).id, nwB = net.nodes.find(n => Math.hypot(n.x - nw[2][0], n.z - nw[2][1]) < 1.6).id;
assert.equal(net.limitKmh(nwA, nwB), 100, 'CRN Main Western Line west: OSM maxspeed 100');
const pk = RAIL[6].pts, pkId = (i) => net.nodes.find(n => Math.hypot(n.x - pk[i][0], n.z - pk[i][1]) < 1.6).id;
assert.equal(net.limitKmh(pkId(1), pkId(2)), 90, 'Parkes line beyond the 55 km/h boards');
assert.equal(net.limitKmh(pkId(pk.length - 3), pkId(pk.length - 2)), 55, 'Parkes line 55 km/h near Narromine');
assert.equal(net.lineName(pkId(1), pkId(2)), 'Parkes - Narromine Line');
assert.equal(net.lineName(yardA, yardB), 'Naromine Loop', 'OSM name (sic)');
// Drive the whole Main Western line from its north-west end to the Dubbo end, then back.
const nwEnd = net.nodes.find(n => Math.hypot(n.x - RAIL[1].pts[0][0], n.z - RAIL[1].pts[0][1]) < 1.6).id;
const second = [...net.adj.get(nwEnd)][0];
const path = createTrainPath(net, [nwEnd, second], 1);
let r, travelled = 0, junctionsPassed = 0;
for (let i = 0; i < 20000; i++) { r = path.move(2, 0); travelled += 2; if (r.junction) junctionsPassed++; if (r.blocked) break; }
assert.equal(r.blocked, 'end', 'reaches a buffer stop');
const end = path.pointAt(path.s);
assert.ok(Math.hypot(end.x - RAIL[7].pts.at(-1)[0], end.z - RAIL[7].pts.at(-1)[1]) < 3, 'straight-on routing follows the main line to the Dubbo end: ' + JSON.stringify(end));
assert.ok(travelled > 3500 && junctionsPassed >= 2, 'ran the main line through the junctions: ' + travelled + ' m');
// Reverse a 120 m train back past a junction without losing the rear.
const back = createTrainPath(net, [nwEnd, second], 130);
for (let i = 0; i < 200; i++) back.move(2, 120);
for (let i = 0; i < 100; i++) assert.notEqual(back.move(-2, 120).blocked, 'rear-lost');
// Junction choice: at the yard-loop junction, left and right lead to different tracks.
const j = [...net.adj].find(([, s]) => s.size >= 3)[0];
const into = [...net.adj.get(j)].find(n => { const o = [...net.adj.get(j)].filter(m => m !== n); return net.next(n, j, 'left') !== null && net.next(n, j, 'left') !== net.next(n, j, 'right'); });
if (into !== undefined) assert.notEqual(net.next(into, j, 'left'), net.next(into, j, 'right'), 'left/right choose different routes');
// No invented stand-in building on the railway.
const near = (x, z) => { for (const w of RAIL) for (let i = 1; i < w.pts.length; i++) { const [a, b] = [w.pts[i - 1], w.pts[i]], dx = b[0] - a[0], dz = b[1] - a[1], l = dx * dx + dz * dz || 1;
  const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / l)); if (Math.hypot(x - a[0] - t * dx, z - a[1] - t * dz) < 6) return true; } return false; };
for (const f of [...FILL_SHOPS, ...FILL_HOUSES]) for (const [x, z] of f.rect.poly) assert.ok(!near(x, z), 'stand-in building on the railway at ' + [f.x, f.z].map(Math.round));
console.log(`PASS Narromine rail network: ${net.nodes.length} nodes, ${junctions} junctions, main line ${travelled} m end to end, junction routing, reversing, clear corridor`);
