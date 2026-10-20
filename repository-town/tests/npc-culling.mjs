import assert from 'node:assert/strict';
import * as THREE from 'three';
import { animateNPCs } from '../src/world/npcs.js';

const group = new THREE.Group();
group.userData.body = new THREE.Group();
group.add(group.userData.body);
const label = new THREE.Group();
group.userData.label = label;
const resident = {
  npc: { id: 'offscreen-test' },
  group,
  mode: 'town',
  homeX: 0,
  homeZ: 0,
  seed: 17,
  activity: 'idle',
  activityUntil: 0,
  walkPhase: 0,
  targetX: 0,
  targetZ: 0,
  heading: 0,
};

animateNPCs([resident], 10, { x: 200, z: 200 }, 1 / 60);
assert.equal(group.visible, false, 'distant resident is not rendered');
assert.equal(resident.walkPhase, 1, 'distant resident still advances their routine');
assert.equal(label.visible, false, 'distant resident label is hidden');

resident.activity = 'walk';
resident.activityUntil = 100;
resident.targetX = 2;
resident.targetZ = 0;
const previous = group.position.clone();
animateNPCs([resident], 10.1, { x: 200, z: 200 }, 1 / 60);
assert.notDeepEqual(group.position.toArray(), previous.toArray(), 'off-screen resident movement continues');
console.log('PASS: render culling hides distant residents without pausing their routines or movement');
