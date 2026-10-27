// Jumping onto things: a collider with a top stops the player only below that top, they land on it
// and stand there, walk off the edge and drop to the floor; walls (no top) block at any height.
// The normal jump clears a 0.76 m table but not a 2.2 m wardrobe; the cheat 6 m jump reaches a roof.
//   node tests/climb-and-carry.mjs
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { CollisionWorld } from '../src/engine/collision.js';
import { Player } from '../src/engine/player.js';
import { standTop, PORTABLE } from '../src/world/props.js';

const table = { x0: 1, x1: 2.6, z0: -0.5, z1: 0.5, top: standTop('table') };
const wardrobe = { x0: 1, x1: 2.4, z0: 3, z1: 3.6, top: standTop('wardrobe') };
const wall = { x0: 1, x1: 1.2, z0: 6, z1: 9 };
const roof = { x0: 1, x1: 9, z0: 12, z1: 20, top: 5.5 };
const world = new CollisionWorld([table, wardrobe, wall, roof]);
assert.equal(world.hits(1.5, 0, 0.35, 0), table, 'table blocks at floor level');
assert.equal(world.hits(1.5, 0, 0.35, 0.8), null, 'above the table top it does not');
assert.equal(world.hits(1.1, 7, 0.35, 40), wall, 'a wall blocks at any height');
assert.equal(world.groundAt(1.8, 0, 0.35, 0.8), table.top, 'standing over the table, the floor is its top');
assert.equal(world.groundAt(1.8, 0, 0.35, 0.3), 0, 'below the top you are not on it');

// Drive the real Player with a scripted input.
function makeInput() {
  const st = { m: { x: 0, z: 0 }, jump: false };
  return { st, takeLook: () => ({ dx: 0, dy: 0 }), movement: () => ({ ...st.m, running: false, crouching: false }), consume: (k) => (k === 'jump' && st.jump ? (st.jump = false, true) : false) };
}
function run(player, input, seconds, dt = 1 / 60) { let peak = 0; for (let t = 0; t < seconds; t += dt) { player.update(dt, input, world); peak = Math.max(peak, player.y); } return peak; }
const cam = new THREE.PerspectiveCamera();
const p = new Player(cam); p.place(0.3, 0, -Math.PI / 2);   // facing +x, towards the table
const input = makeInput();
input.st.jump = true; input.st.m = { x: 0, z: -1 };
run(p, input, 0.3);
input.st.m = { x: 0, z: 0 }; run(p, input, 1.0);
assert(p.pos.x > 1.1 && Math.abs(p.y - table.top) < 1e-6, `normal jump lands on the table (x ${p.pos.x.toFixed(2)}, y ${p.y.toFixed(2)})`);
input.st.m = { x: 0, z: -1 }; run(p, input, 1.2);
assert(p.pos.x > 2.6 && p.y === 0, `walking off the far edge drops to the floor (x ${p.pos.x.toFixed(2)}, y ${p.y})`);

const q = new Player(cam); q.place(0.3, 3.3, -Math.PI / 2); input.st.m = { x: 0, z: -1 }; input.st.jump = true;
const peak = run(q, input, 1.5);
assert(peak < standTop('wardrobe') && q.pos.x < 1, `a normal jump (peak ${peak.toFixed(2)} m) cannot get onto a 2.2 m wardrobe`);

const r = new Player(cam); r.place(5, 10.5, Math.PI);   // facing +z, towards the roof
r.jumpSpeed = Math.sqrt(2 * 22 * 6); input.st.m = { x: 0, z: -1 }; input.st.jump = true;
run(r, input, 2.5);
assert(Math.abs(r.y - roof.top) < 1e-6 && r.pos.z > 12, `cheat 6 m jump lands on the roof (y ${r.y.toFixed(2)}, z ${r.pos.z.toFixed(1)})`);
assert(PORTABLE.has('lamp') && !PORTABLE.has('chair'), 'small things are portable; chairs stay put for sitting');
console.log('PASS: land on furniture and roofs, walls block at any height, normal jump vs cheat jump, walk off edges');
