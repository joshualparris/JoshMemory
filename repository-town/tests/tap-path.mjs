// Tap-to-walk routing (RuneScape engine step 2): A* around real obstacles, no corner cutting,
// smoothed to a few straight legs, "walk next to" targets, and a clean null when boxed in.
import assert from 'node:assert/strict';
import { findPath, clearLine } from '../src/world/tap-path.js';
// A wall from z = -10 to 10 at x = 5 (0.6 m thick), with a body radius of 0.4.
const wall = (x, z) => x > 4.3 && x < 6.1 && z > -10.4 && z < 10.4;
const p = findPath({ x: 0, z: 0 }, { x: 10, z: 0 }, wall);
assert(p && p.length >= 2, 'routes around the wall'); assert.deepEqual(p.at(-1), { x: 10, z: 0 });
let at = { x: 0, z: 0 }; for (const w of p) { assert(clearLine(at, w, wall), 'every leg is clear'); at = w; }
assert(p.length <= 4, `smoothed to a few legs (${p.length})`);
const len = p.reduce((s, w, i) => s + Math.hypot(w.x - (i ? p[i - 1] : { x: 0 }).x, w.z - (i ? p[i - 1] : { z: 0 }).z), 0);
assert(len < 26, `near-shortest route (${len.toFixed(1)} m)`);
// Open ground: one straight leg.
assert.equal(findPath({ x: 0, z: 0 }, { x: 7, z: 3 }, () => false).length, 1);
// Walk next to a tree (blocked trunk) rather than into it.
const trunk = (x, z) => Math.hypot(x - 8, z) < 0.9;
const t = findPath({ x: 0, z: 0 }, { x: 8, z: 0 }, trunk, { near: 1.6 });
const end = t.at(-1); assert(Math.hypot(end.x - 8, end.z) <= 1.6 + 0.01 && !trunk(end.x, end.z), 'stops beside the trunk');
// Boxed in: no route, quickly.
const box = (x, z) => Math.max(Math.abs(x), Math.abs(z)) > 2 && Math.max(Math.abs(x), Math.abs(z)) < 3;
const t0 = Date.now(); assert.equal(findPath({ x: 0, z: 0 }, { x: 10, z: 0 }, box), null); assert(Date.now() - t0 < 500, 'gives up fast');
assert.deepEqual(findPath({ x: 1, z: 1 }, { x: 1.1, z: 1 }, () => false), [], 'already there');
// A long fence with one gap far along it (the rail corridor and its level crossing).
const fence = (x, z) => z > -0.6 && z < 0.6 && x > -60 && x < 46;
const t1 = Date.now(), round = findPath({ x: 13, z: -5 }, { x: 14, z: 6 }, fence);
assert(round && round.length >= 2, 'detours to the gap at the end of a long fence'); assert(Date.now() - t1 < 1500, `long detour is quick (${Date.now() - t1} ms)`);
console.log('PASS: tap-to-walk A* around walls, no corner cutting, smoothed legs, walk-beside targets, boxed-in null, long fence detour');
