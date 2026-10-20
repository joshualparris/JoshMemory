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

const workerGroup = new THREE.Group();
workerGroup.userData.body = new THREE.Group();
workerGroup.add(workerGroup.userData.body);
const worker = {
  npc: { id: 'finished-builder' },
  group: workerGroup,
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
  task: 'rest',
  workSite: {},
};
const atRest = workerGroup.position.clone();
for (let i = 0; i < 200; i++) animateNPCs([worker], 10 + i * 0.1, { x: 200, z: 200 }, 0.1);
assert.equal(worker.task, 'done', 'a finished worksite task leaves recovery state');
assert.notDeepEqual(workerGroup.position.toArray(), atRest.toArray(), 'a worker returns to wandering after resting');
console.log('PASS: off-screen NPCs move; finished worksite recovery resumes normal wandering');
