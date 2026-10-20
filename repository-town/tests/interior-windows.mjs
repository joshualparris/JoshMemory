// Verify that every repository house interior (including upper storeys) and
// every High Street civic/shop interior has framed, translucent see-through
// windows and that main.js keeps the outdoor town visible and aligned when indoors.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { loadBriefs, loadInventory, toHouse, sanitise } from '../tools/lib.mjs';
import { mergeDiscovery } from '../tools/merge-discovery.mjs';
import { buildInterior } from '../src/world/interior.js';
import { createFloorStack } from '../src/world/multifloor.js';
import { buildCivicInterior, CIVIC_INTERIOR_IDS } from '../src/world/shop-interior.js';

const inventory = loadInventory(), briefs = loadBriefs();
const games = new Map();
for (const g of JSON.parse(fs.readFileSync(new URL('../data/games.json', import.meta.url), 'utf8')).games) {
  if (!games.has(g.repo)) games.set(g.repo, []);
  games.get(g.repo).push(g);
}
const houses = inventory.projects.map((row) =>
  mergeDiscovery(sanitise(toHouse(briefs.get(row.repo), row, inventory.grid.streetNames, {}, games)))
);

let totalHouseWindows = 0;
let multiFloorStories = 0;
for (const h of houses) {
  const stack = createFloorStack(h, () => new THREE.Object3D());
  const levels = stack ? stack.levels : [buildInterior(h, () => new THREE.Object3D())];
  if (stack) multiFloorStories += stack.levels.length;
  for (let i = 0; i < levels.length; i++) {
    const b = levels[i];
    assert.ok(Array.isArray(b.windows) && b.windows.length > 0, `${h.coordinate} floor ${i + 1} must have see-through exterior windows`);
    totalHouseWindows += b.windows.length;
    let hasTranslucentPane = false;
    b.group.traverse((o) => {
      if (o.isMesh && o.material?.transparent && o.material.depthWrite === false && o.material.opacity <= 0.3) {
        hasTranslucentPane = true;
      }
      o.geometry?.dispose();
    });
    assert.ok(hasTranslucentPane, `${h.coordinate} floor ${i + 1} must include translucent window glass mesh`);
  }
}

let totalCivicWindows = 0;
for (const id of CIVIC_INTERIOR_IDS) {
  const place = { id, name: id.replace(/-/g, ' ') };
  const built = buildCivicInterior(place, () => new THREE.Object3D());
  assert.ok(Array.isArray(built.windows) && built.windows.length > 0, `${place.id} must have windows`);
  totalCivicWindows += built.windows.length;
  let hasTranslucentPane = false;
  built.group.traverse((o) => {
    if (o.isMesh && o.material?.transparent && o.material.depthWrite === false && o.material.opacity <= 0.3) {
      hasTranslucentPane = true;
    }
    o.geometry?.dispose();
  });
  assert.ok(hasTranslucentPane, `${place.id} must have translucent see-through window glass`);
}

const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
assert.match(main, /function syncOutdoorView\(\)/, 'main.js must define syncOutdoorView()');
assert.doesNotMatch(main, /town\.group\.visible\s*=\s*false/, 'main.js must not hide the outdoor town when entering a building');

console.log(`PASS: ${houses.length} houses (${totalHouseWindows} windows across ground + ${multiFloorStories} multi-floor levels) and ${CIVIC_INTERIOR_IDS.length} civic buildings (${totalCivicWindows} windows) have see-through exterior windows`);
