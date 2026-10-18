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
const kinds = new Set(['battle','loot','signal','repair','safari','kitchen','vault','trail']);
const ctx = { activate() {}, toggle() { return true; } };
for (const row of inventory.projects) {
  const h = mergeDiscovery(sanitise(toHouse(briefs.get(row.repo), row, inventory.grid.streetNames, {}, games)));
  const b = buildInterior(h, () => new THREE.Object3D()), world = new CollisionWorld(b.colliders);
  const fail = m => failures.push(`${h.coordinate}: ${m}`);
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
assert.equal(counts.houses,188); assert.equal(counts.toys,193);
