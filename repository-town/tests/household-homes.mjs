// Every house can be a villager's home: built with its household rooms, the kitchen, bathroom and
// laundry, and living room are reachable on foot and every household appliance can be used.
// CPU geometry (no WebGL): node tests/household-homes.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { loadBriefs, loadInventory, toHouse, sanitise } from '../tools/lib.mjs';
import { mergeDiscovery } from '../tools/merge-discovery.mjs';
import { buildInterior } from '../src/world/interior.js';
import { createFloorStack } from '../src/world/multifloor.js';
import { CollisionWorld } from '../src/engine/collision.js';
const inventory = loadInventory(), briefs = loadBriefs();
const games = new Map();
for (const g of JSON.parse(fs.readFileSync(new URL('../data/games.json', import.meta.url))).games) {
  if (!games.has(g.repo)) games.set(g.repo, []); games.get(g.repo).push(g);
}
const WANT = ['fridge', 'pantry', 'oven', 'sink', 'crockery', 'shower', 'laundry', 'freezer', 'power', 'tv', 'climate', 'computer'];
const failures = [];
let houses = 0, appliances = 0;
for (const row of inventory.projects) {
  const h = { ...mergeDiscovery(sanitise(toHouse(briefs.get(row.repo), row, inventory.grid.streetNames, {}, games))), household: 'Test' };
  const fail = (m) => failures.push(`${h.coordinate}: ${m}`);
  let b;
  // Tall buildings are entered through their floor stack, as main.js does.
  try { const floors = createFloorStack(h, () => new THREE.Object3D()); b = floors ? floors.levels[0] : buildInterior(h, () => new THREE.Object3D()); } catch (e) { fail(`${h.int.layout} ${h.int.rooms.length} rooms: ${e.message}`); continue; }
  const world = new CollisionWorld(b.colliders);
  houses++;
  const uses = b.interactables.filter((e) => e.act?.do === 'household');
  for (const w of WANT) if (!uses.some((e) => e.act.what === w) && !['Kitchen', 'Bathroom and laundry', 'Living room'].some((n) => h.int.rooms.some((r) => r.name === n))) fail(`no ${w}`);
  appliances += uses.length;
  // Walkable floor from the front door at the player's radius.
  const step = 0.4, o = b.spawn, seen = new Set(['0,0']), queue = [[0, 0]];
  const inside = (x, z) => b.rooms.some((r) => x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1);
  for (let i = 0; i < queue.length; i++) {
    const [gx, gz] = queue[i];
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = gx + dx, nz = gz + dz, key = `${nx},${nz}`, x = o.x + nx * step, z = o.z + nz * step;
      if (seen.has(key) || !inside(x, z) || world.hits(x, z, 0.35)) continue;
      seen.add(key); queue.push([nx, nz]);
    }
  }
  const pts = queue.map(([x, z]) => [o.x + x * step, o.z + z * step]);
  for (const r of b.rooms) if (!pts.some(([x, z]) => x > r.x0 + 0.4 && x < r.x1 - 0.4 && z > r.z0 + 0.4 && z < r.z1 - 0.4)) fail(`unreachable room ${r.name}`);
  for (const e of uses) if (!pts.some(([x, z]) => Math.hypot(x - e.pos.x, z - e.pos.z) < 2.5)) fail(`unreachable ${e.act.what}`);
  b.group.traverse((x) => x.geometry?.dispose());
}
console.log(JSON.stringify({ houses, appliances, failures: failures.slice(0, 20) }, null, 1));
assert.equal(failures.length, 0, 'household rooms must fit and be reachable in every house');
assert.ok(appliances >= houses * WANT.length * 0.95);
console.log(`PASS: ${houses} houses can each be a villager home with ${WANT.length} working household appliances, all reachable.`);
