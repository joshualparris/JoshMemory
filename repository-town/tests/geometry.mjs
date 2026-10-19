// CPU geometry/interaction checks, not a graphical browser or device playtest.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { loadBriefs, loadInventory, toHouse, sanitise } from '../tools/lib.mjs';
import { mergeDiscovery } from '../tools/merge-discovery.mjs';
import { buildInterior } from '../src/world/interior.js';
import { CollisionWorld } from '../src/engine/collision.js';
import { runInteraction } from '../src/ui/interactions.js';
const inventory = loadInventory(), briefs = loadBriefs();
const games = new Map();
for (const g of JSON.parse(fs.readFileSync(new URL('../data/games.json', import.meta.url))).games) {
  if (!games.has(g.repo)) games.set(g.repo, []); games.get(g.repo).push(g);
}
const failures = [], counts = { houses: 0, rooms: 0, exhibits: 0, toys: 0, games: 0 };
let declaredToys = 0;
const kinds = new Set(['battle','loot','signal','repair','safari','kitchen','vault','trail']);
// Beds in the new sleep/fatigue system are intentionally converted from old
// authored actions (R5 used to assign a kitchen challenge to its recovery bed).
// Count only the interactions that should exist in the *built* game.
const effectiveAction = p => (typeof p !== 'string' && p[0] === 'bed') ? 'sleep' : p?.[2]?.do;
const ctx = { activate() {}, toggle() { return true; } };
for (const row of inventory.projects) {
  const h = mergeDiscovery(sanitise(toHouse(briefs.get(row.repo), row, inventory.grid.streetNames, {}, games)));
  // Each public-safe house brief declares the toys that must be interactive.
  // Verify the realised geometry against those declarations, not a frozen
  // town-wide number that changes when a house's design is legitimately revised.
  declaredToys += h.int.rooms.reduce((n,r) =>
    n + (r.props || []).filter(p => kinds.has(effectiveAction(p))).length, 0);
  const b = buildInterior(h, () => new THREE.Object3D()), world = new CollisionWorld(b.colliders);
  const fail = m => failures.push(`${h.coordinate}: ${m}`);
  const authored = h.int.rooms.flatMap(r=>r.props || []);
  if (!b.interactables.some(e=>e.type==='bed' && e.act?.do==='sleep')) fail('no functional sleeping bed');
  for (const kind of kinds) {
    const expected=authored.filter(p=>effectiveAction(p)===kind).length;
    const actual=b.interactables.filter(e=>e.act.do===kind).length;
    if (actual!==expected) fail(`missing/extra ${kind} interactions: declared ${expected}, realised ${actual}`);
  }

  counts.houses++; counts.rooms += b.rooms.length; counts.exhibits += b.interactables.length;
  if (world.hits(b.spawn.x, b.spawn.z, .35)) fail('spawn intersects collider');
  const pos = { x: b.spawn.x, z: b.spawn.z };
  world.move(pos, 0, b.exitZone.z1 - pos.z, .35);
  if (pos.z < b.rooms[0].z1 - .3) fail('straight exit path obstructed');
  // Flood-fill actual walkable floor at player radius. Doorway connectivity and
  // exhibit approach points are checked without teleporting through walls.
  const step = .4, origin = b.spawn, seen = new Set(['0,0']), queue = [[0,0]];
  const inside = (x,z) => b.rooms.some(r => x>=r.x0 && x<=r.x1 && z>=r.z0 && z<=r.z1);
  for (let i=0; i<queue.length; i++) {
    const [gx,gz]=queue[i];
    for (const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nx=gx+dx,nz=gz+dz,key=`${nx},${nz}`,x=origin.x+nx*step,z=origin.z+nz*step;
      if (seen.has(key)||!inside(x,z)||world.hits(x,z,.35)) continue;
      seen.add(key);queue.push([nx,nz]);
    }
  }
  const points = queue.map(([x,z]) => [origin.x+x*step,origin.z+z*step]);
  for (const r of b.rooms) if (!points.some(([x,z]) => x>r.x0+.4 && x<r.x1-.4 && z>r.z0+.4 && z<r.z1-.4)) fail(`unreachable room ${r.name}`);
  for (const e of b.interactables) {
    if (!points.some(([x,z]) => Math.hypot(x-e.pos.x,z-e.pos.z)<2.5)) fail(`unreachable exhibit ${e.key}`);
    if (e.act.do==='game') counts.games++;
    if (kinds.has(e.act.do)) {
      counts.toys++;
      let p = await runInteraction(e,ctx);
      for (let i=0;i<8;i++) {
        assert.ok(p.title && p.body && p.actions.length,`${e.key} empty toy panel`);
        const a=p.actions[0];p=await(a.run?a.run():p.onAnswer(a.answer));
      }
    }
  }
  b.group.traverse(o=>{o.geometry?.dispose();});
}
console.log(JSON.stringify({type:'CPU geometry and toy logic (not WebGL)',...counts,failures},null,2));
assert.equal(failures.length,0,'Geometry regressions');
assert.equal(counts.houses, inventory.projects.length, 'all inventory houses were built');
assert.ok(counts.houses >= 188, 'unexpected loss of town houses');
assert.ok(counts.toys >= 180, 'unexpected large loss of working toy interactions');
assert.equal(counts.toys, declaredToys, 'all toys declared by house designs must exist as interactive exhibits');
