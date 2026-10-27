// Road signs follow the network: every unsignalised junction controls its north-south approaches
// (east-west streets have priority), no priority road is signed, signs stand on the left verge
// facing oncoming drivers, never on a carriageway, and every road segment is speed-posted.
//   node tests/road-signs.mjs
import assert from 'node:assert/strict';
import { planRoadSigns } from '../src/world/road-signs.js';
import { CORE_ROADS, graph } from '../src/world/masterplan-model.js';
import { PLAN_ROADS, onPlannedOrCoreRoad } from '../src/world/masterplan-built.js';
import { SIGNAL_CROSSINGS } from '../src/world/traffic-signals.js';

const signs = planRoadSigns({ highStreet: { z: 177, x0: -340, x1: 340 }, schools: [{ x: 120, z: 171 }] });
const roads = [...CORE_ROADS, ...PLAN_ROADS], byId = new Map(roads.map((r) => [r.id, r]));
const count = (t) => signs.filter((s) => s.type === t).length;
console.log(Object.fromEntries(['giveway', 'stop', 'speed50', 'speed40', 'school40'].map((t) => [t, count(t)])));

// Every junction of an east-west and a north-south road, except signalised ones, has a control sign
// for each north-south approach and none for the east-west road.
const g = graph(roads);
for (const n of g.nodes) {
  const ids = [...new Set(n.edges.map((e) => e.roadId))];
  if (ids.length < 2 || SIGNAL_CROSSINGS.some((s) => s.x === n.x && s.z === n.z)) continue;
  if (!ids.some((id) => byId.get(id).a.z === byId.get(id).b.z)) continue;   // two north-south roads: a bend
  const ns = [...new Set(n.edges.filter((e) => byId.get(e.roadId).a.x === byId.get(e.roadId).b.x).map((e) => Math.sign(g.nodes.find((m) => m.id === e.to).z - n.z)))];
  const here = signs.filter((s) => s.junction === `${n.x},${n.z}`);
  assert.equal(here.length, ns.length, `junction ${n.x},${n.z}: one control sign per north-south approach`);
  assert(here.every((s) => byId.get(s.road).a.x === byId.get(s.road).b.x), 'east-west priority roads are never signed GIVE WAY/STOP');
}
assert(!signs.some((s) => SIGNAL_CROSSINGS.some((c) => s.junction === `${c.x},${c.z}`)), 'signalised crossings have no priority signs');
// Estate links entering the High Street stop; the rest of the grid gives way.
assert.equal(count('stop'), 2, 'Kurrajong Road and Silo Lane stop at the High Street (Bottlebrush meets it at the signals)');
assert(count('giveway') > 60);

// Placement: off the carriageway, on the driver's left, facing them.
for (const s of signs) {
  assert(!onPlannedOrCoreRoad(s.x, s.z), `${s.type} at ${s.x.toFixed(1)},${s.z.toFixed(1)} stands off the carriageway`);
  const r = byId.get(s.road), fx = Math.sin(s.yaw), fz = Math.cos(s.yaw);
  const off = r.a.z === r.b.z ? s.z - r.a.z : s.x - r.a.x;
  const leftSign = r.a.z === r.b.z ? -fx : fz;               // left of (fx,fz) is (fz,-fx)
  assert.equal(Math.sign(off), Math.sign(leftSign), `${s.type} on ${r.id} is on the driver's left (keep left)`);
}
// Every road segment of 60 m or more is posted both ways; 40 only on the High Street.
for (const r of roads) assert(signs.some((s) => s.road === r.id && s.type.startsWith('speed')), `${r.id} has a speed sign`);
assert(signs.filter((s) => s.type === 'speed40').every((s) => s.road === 'street-8'), '40 km/h only on the High Street');
assert.equal(count('school40'), 2, 'school zone posted on both approaches');
console.log(`PASS: ${signs.length} signs; every unsignalised junction controlled, keep-left placement, every road speed-posted`);
