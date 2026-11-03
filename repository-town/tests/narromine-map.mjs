// Regression: the 2D map must show the actual Narromine scene, not just Repository Town.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ARRIVAL, REGION, PLACES, STREETS, DETAILED } from '../src/world/narromine-layout.js';
import { NARROMINE_MAP_DESTINATION, NARROMINE_MAP_SEARCH, drawNarromineMap, hitNarromineMap } from '../src/ui/narromine-map-layer.js';

assert.equal(NARROMINE_MAP_DESTINATION.name, 'Narromine');
assert.equal(NARROMINE_MAP_DESTINATION.x, ARRIVAL.x);
assert.equal(NARROMINE_MAP_DESTINATION.z, ARRIVAL.z);
assert(ARRIVAL.x >= REGION.x0 && ARRIVAL.x <= REGION.x1);
assert(ARRIVAL.z >= REGION.z0 && ARRIVAL.z <= REGION.z1);
assert(STREETS.length > 20, 'actual Narromine roads are available');
assert(DETAILED.some((x) => x.id === 'dandaloo-82'), 'Coles site is mapped');
for (const name of ['Narromine', 'Coles', 'Narromine Post Office', "Kierath's Shopping Square", 'Royal Hotel']) {
  assert(NARROMINE_MAP_SEARCH.some((p) => p.name === name), name + ' searchable');
}
const coles = NARROMINE_MAP_SEARCH.find((p) => p.name === 'Coles');
assert.equal(hitNarromineMap(coles.x, coles.z)?.name, 'Coles', 'public landmark is selectable on map');
assert(NARROMINE_MAP_SEARCH.find((p) => p.name === "Kierath's Shopping Square").fact.includes('NOT a surveyed'), 'arcade marker is explicitly approximate');

function render(view) {
  const operations = { fills: 0, strokes: 0, labels: 0 };
  const ctx = {
    beginPath() {}, moveTo() {}, lineTo() {}, closePath() {}, arc() {},
    fill() { operations.fills++; }, stroke() { operations.strokes++; },
  };
  const scale = 1.5, width = 640, height = 640;
  drawNarromineMap(ctx, {
    project: (x, z) => ({ x: (x - view.x) * scale + width / 2, y: (z - view.z) * scale + height / 2 }),
    view, width, height, scale, label: () => { operations.labels++; },
  });
  return operations;
}
const near = render(ARRIVAL);
assert(near.strokes > 5, 'Narromine roads rendered');
assert(near.fills > 5, 'Narromine buildings / polygons rendered');
assert(near.labels > 0, 'Named public landmarks labelled');
const home = render({ x: 0, z: 0 });
assert.equal(home.fills, 0, 'Narromine buildings are not drawn across Repository Town');

const map = readFileSync(new URL('../src/ui/town-map.js', import.meta.url), 'utf8');
for (const name of ['town-map-narromine', 'town-map-repo', 'NARROMINE_MAP_SEARCH', 'drawNarromineMap', 'hitNarromineMap']) {
  assert(map.includes(name), 'full-screen map wires up ' + name);
}
console.log('PASS Narromine map: destination buttons, public POI lookup, real road/building draw, home-town separation');
