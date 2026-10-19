// CPU check: leaving any house must put you on open ground that connects to the street.
import * as THREE from 'three';
import { loadBriefs, loadInventory, toHouse, sanitise } from '../tools/lib.mjs';
import { mergeDiscovery } from '../tools/merge-discovery.mjs';
import { buildTown } from '../src/world/town.js';
import { createTownLife } from '../src/world/townlife.js';
import { CollisionWorld } from '../src/engine/collision.js';
import fs from 'node:fs';
// Minimal DOM stand-in: townlife.js paints a clock face onto a canvas.
const noop = () => {}; const ctx2d = new Proxy({}, { get: (_, k) => (k === 'measureText' ? () => ({ width: 0 }) : k === 'createLinearGradient' || k === 'createRadialGradient' ? () => ({ addColorStop: noop }) : noop), set: () => true });
globalThis.document = { createElement: () => ({ width: 0, height: 0, getContext: () => ctx2d, style: {} }) };
globalThis.localStorage = { getItem: () => null, setItem: noop };
const R = Number(process.env.PLAYER_R || 0.35);
const inventory = loadInventory(), briefs = loadBriefs();
const games = new Map();
for (const g of JSON.parse(fs.readFileSync(new URL('../data/games.json', import.meta.url))).games) { if (!games.has(g.repo)) games.set(g.repo, []); games.get(g.repo).push(g); }
const houses = inventory.projects.map((row) => mergeDiscovery(sanitise(toHouse(briefs.get(row.repo), row, inventory.grid.streetNames, {}, games))));
const scene = new THREE.Scene();
const makeLabel = () => new THREE.Object3D();
const town = buildTown(scene, houses, inventory.grid.streetNames);
const life = createTownLife({ scene, town, makeLabel, sky: new THREE.Color(), hemi: new THREE.HemisphereLight(), sun: new THREE.DirectionalLight(), fog: new THREE.Fog(0, 1, 2) });
const half = { x: town.bounds.width / 2, z: town.bounds.depth / 2 };
const edges = [
  { x0: -half.x - 5, x1: half.x + 5, z0: -half.z - 5, z1: -half.z }, { x0: -half.x - 5, x1: half.x + 5, z0: half.z, z1: half.z + 5 },
  { x0: -half.x - 5, x1: -half.x, z0: -half.z, z1: half.z }, { x0: half.x, x1: half.x + 5, z0: -half.z, z1: half.z },
];
const world = new CollisionWorld([...town.colliders, ...life.colliders, ...edges]);
const fails = [];
for (const [coord, l] of town.lots) {
  const sx = l.doorPos.x, sz = l.doorPos.z + 4;
  const hit = world.hits(sx, sz, R);
  if (hit) { fails.push(`${coord}: exit point (${sx.toFixed(1)}, ${sz.toFixed(1)}) is inside a collider ${JSON.stringify(hit)}`); continue; }
  // Flood fill on a 0.5 m grid; the exit must reach 20 m from the door and a street centre line.
  const step = 0.5, seen = new Set([0 + ',' + 0]), q = [[0, 0]]; let reach = 0, streetReach = false;
  const streetZ = l.lot.z + 16;
  for (let i = 0; i < q.length && i < 40000; i++) {
    const [gx, gz] = q[i], x = sx + gx * step, z = sz + gz * step;
    reach = Math.max(reach, Math.hypot(gx, gz) * step);
    if (Math.abs(z - streetZ) < 2) streetReach = true;
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = gx + dx, nz = gz + dz, k = nx + ',' + nz;
      if (seen.has(k) || world.hits(sx + nx * step, sz + nz * step, R)) continue;
      seen.add(k); q.push([nx, nz]);
    }
  }
  if (reach < 20 || !streetReach) fails.push(`${coord}: trapped after exit — reaches ${reach.toFixed(1)} m, street ${streetReach} (region ${q.length} cells)`);
}
console.log(JSON.stringify({ houses: town.lots.size, colliders: world.all.length, failures: fails }, null, 2));
process.exit(fails.length ? 1 : 0);
