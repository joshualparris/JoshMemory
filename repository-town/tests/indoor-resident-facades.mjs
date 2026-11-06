import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createIndoorResidentStyles } from '../src/world/indoor-resident-styles.js';
import { houseStreetFacade, addNarromineResidentialFacades } from '../src/world/narromine-residential-facades.js';

// Doors are on the wall facing the mapped road, including on rotated footprints.
const home = { x: 100, z: 100, w: 10, d: 8, yaw: 0, tone: 2 };
const north = houseStreetFacade(home, { px: 100, pz: 125, d: 25 });
assert(north && Math.abs(north.x - 100) < .001 && north.z > 104 && north.z < 105);
const east = houseStreetFacade(home, { px: 120, pz: 100, d: 20 });
assert(east && east.x > 105 && east.x < 106 && Math.abs(east.z - 100) < .001);
assert.equal(houseStreetFacade(home, { px: 200, pz: 100, d: 100 }), null);
assert.equal(houseStreetFacade({ ...home, w: 2 }, { px: 100, pz: 125, d: 25 }), null);

const rotated = { ...home, yaw: Math.PI / 3 };
const road = { px: 100 + Math.sin(rotated.yaw) * 22, pz: 100 + Math.cos(rotated.yaw) * 22, d: 22 };
const front = houseStreetFacade(rotated, road);
assert(front && Math.abs(Math.hypot(front.x - 100, front.z - 100) - 4.12) < .001);
const group = new THREE.Group();
const summary = addNarromineResidentialFacades(group, [home, rotated], (_, z) => z === 100 ? { px: 100, pz: 125, d: 25 } : road);
assert.equal(summary.facades, 2);
assert.equal(summary.doors, 2);
assert.equal(summary.windows, 4);
assert.equal(summary.interpretive, true);
assert.equal(group.children.find(o => o.name.includes('residential doors')).count, 2);

// The existing indoor figure and name label have different ownership.
// Switching skin must hide only the figure; unloading an interior must release it.
const root = new THREE.Group();
const body = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial());
const label = new THREE.Sprite(new THREE.SpriteMaterial());
root.add(body, label);
root.userData.residentAppearance = { descriptor: { seed: 1 } };
const staff = { group: root, tag: label, state: 'walking', speed: 1.2, talking: false };
let updates = 0, releases = 0;
const models = {
  update(adapter, state) {
    updates++;
    assert.equal(adapter.body.length, 1);
    assert.equal(adapter.body[0], body);
    assert.equal(state.moving, true);
    adapter.model = { rigged: true };
    body.visible = false;
  },
  hide(adapter) {
    releases++;
    adapter.model = null;
    body.visible = true;
  },
};
const renderer = createIndoorResidentStyles(models);
renderer.sync([staff], .016);
assert.equal(updates, 1);
assert.equal(renderer.wearing(), 1);
assert.equal(body.visible, false);
assert.equal(label.visible, true);
renderer.sync([], .016);
assert.equal(renderer.wearing(), 0);
assert.equal(releases, 1);
assert.equal(body.visible, true);
renderer.clear();
assert.equal(releases, 1);
console.log('PASS indoor model attachment/cleanup and interpretive street-facing Narromine front facades');
