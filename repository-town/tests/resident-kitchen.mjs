// Residents cook dinner in the room with the stove, not wherever a coffee machine is.
// Regression for the 2026-10-29 playtest: in Y5 the household's real Kitchen came
// second to the "Menu Wall" exhibit room (it has a coffee machine), so Ada spent
// dinner time milling about the hallway. Checked for every house as a household home.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { loadBriefs, loadInventory, toHouse, sanitise } from '../tools/lib.mjs';
import { mergeDiscovery } from '../tools/merge-discovery.mjs';
import { buildInterior } from '../src/world/interior.js';
import { CollisionWorld } from '../src/engine/collision.js';
import { houseWander, rankKitchens, freeSpot } from '../src/world/npcs.js';

// Unit: ranking.
assert.deepEqual(rankKitchens([{ type: 'coffeeMachine', room: 0 }, { type: 'stove', room: 4 }, { type: 'fridge', room: 4 }]), [4, 0]);
assert.deepEqual(rankKitchens([{ type: 'fridge', room: 2 }, { type: 'fridge', room: 1 }], [{ name: 'Hall' }, { name: 'Lab' }, { name: 'Kitchen' }]), [2, 1]);
assert.deepEqual(rankKitchens([{ type: 'sofa', room: 1 }]), []);

const inventory = loadInventory(), briefs = loadBriefs(), games = new Map();
for (const g of JSON.parse(fs.readFileSync(new URL('../data/games.json', import.meta.url))).games) { if (!games.has(g.repo)) games.set(g.repo, []); games.get(g.repo).push(g); }
const at = (rooms, p) => rooms.findIndex((r) => p.x >= r.x0 && p.x <= r.x1 && p.z >= r.z0 && p.z <= r.z1);
const failures = [];
let homes = 0, reached = 0;
for (const row of inventory.projects) {
  const h = mergeDiscovery(sanitise(toHouse(briefs.get(row.repo), row, inventory.grid.streetNames, {}, games)));
  if (h.memorial) continue;
  h.household = 'Test Resident';
  const b = buildInterior(h, () => new THREE.Object3D()), world = new CollisionWorld(b.colliders);
  const kitchens = rankKitchens(b.placedProps, b.rooms);
  const stoveRooms = new Set(b.placedProps.filter((p) => p.type === 'stove').map((p) => p.room));
  homes++;
  if (stoveRooms.size && !stoveRooms.has(kitchens[0])) { failures.push(`${row.coordinate}: cooks in room ${kitchens[0]} (${b.rooms[kitchens[0]]?.name}) not the stove room`); continue; }
  // From every room, the dinner plan ends in the chosen kitchen (or as far as furniture allows).
  const plan = houseWander(b.rooms, b.openings, world, () => 18 * 60 + 5, kitchens);
  const start = b.walkers[0];
  if (!start || !kitchens.length) continue;
  const pos = { ...start.pos }; freeSpot(pos, world); freeSpot(pos, world, 0.52);   // as main.js and Walker.update do
  // The planner is randomised and may stop "as far as possible"; the Walker then
  // replans from where it stopped. Follow up to eight successive plans, as the game does.
  const w = { room: start.room, pos, activity: '' };
  for (let n = 0; n < 8 && w.room !== kitchens[0]; n++) {
    const path = plan(w);
    if (!path.length) continue;
    const end = path.at(-1); w.pos = { x: end.x, z: end.z }; const r = at(b.rooms, end); if (r >= 0) w.room = r;
  }
  if (w.room === kitchens[0]) reached++;
  else failures.push(`${row.coordinate}: after 8 dinner plans the resident is in ${b.rooms[w.room]?.name}, not ${b.rooms[kitchens[0]]?.name}`);
}
if (failures.length) console.log(failures.slice(0, 20).join('\n'));
assert.equal(failures.length, 0, failures.length + ' houses send residents to the wrong place for dinner');
console.log(`resident-kitchen: ${homes} household homes cook in the stove room; dinner route reaches it from the resident's start in ${reached}.`);
