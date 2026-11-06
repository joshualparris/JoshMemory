// Detailed figure contract: real face/hair/clothing geometry, natural activity poses, LOD
// proxies and the legacy joint/clearance API used by every existing walker and interior.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { identityFor, outfitFor } from '../src/world/resident-identity.js';
import { makeResidentFigure, poseResident } from '../src/world/resident-figure.js';
import { makeDistinctPerson } from '../src/world/npc-wardrobe.js';
import { pose } from '../src/world/npcs.js';

const figures = [];
for (let i = 0; i < 36; i++) {
  const person = { id: 'figure:' + i, name: 'Person ' + i, age: [8, 16, 24, 38, 52, 67, 81][i % 7], gender: i % 2 ? 'male' : 'female', job: ['teacher', 'nurse', 'mechanic', 'farmer', 'student', 'retired', 'publican'][i % 7], workplaceKind: ['school', 'hospital', 'car_repair', 'agrarian', 'school', 'pub', 'pub'][i % 7] };
  const identity = identityFor(person.id, person);
  const fig = makeResidentFigure(identity);
  const box = new THREE.Box3().setFromObject(fig.group);
  assert.ok(box.max.y > 1.9 && box.max.y < 2.3, person.id + ' head height: ' + box.max.y.toFixed(2));
  assert.ok(box.min.y > -.05 && box.min.y < .1, person.id + ' shoes on the ground: ' + box.min.y.toFixed(3));
  assert.ok(box.max.x - box.min.x > .5 && box.max.x - box.min.x < 1.15, person.id + ' human shoulder width');
  const meshes = []; fig.group.traverse((o) => { if (o.isMesh) meshes.push(o); });
  assert.ok(meshes.length >= 55, person.id + ' has a detailed body/face/outfit: ' + meshes.length);
  let faceDetailMeshes = 0; fig.face.detail.traverse((o) => { if (o.isMesh) faceDetailMeshes++; });
  assert.ok(faceDetailMeshes >= 24, person.id + ' has eyes, brows, nose, mouth, ears and cheeks: ' + faceDetailMeshes);
  assert.ok(fig.clothing.children.length >= 6, person.id + ' has visible garments');
  assert.ok(fig.legs.length === 2 && fig.knees.length === 2 && fig.arms.length === 2 && fig.elbows.length === 2);
  assert.ok(Number.isFinite(fig.phase));
  assert.equal(fig.group.userData.residentAppearance.id, person.id);
  assert.equal(fig.group.userData.isResidentFigure, true);
  // Every pose must stay finite; a NaN joint used to make arms/legs disappear on phones.
  for (const activity of ['home', 'walk', 'sit', 'dinner', 'carry shopping', 'asleep', 'work shift', 'talk']) {
    fig.setActivity(activity);
    for (let t = 0; t < 30; t++) pose(fig, 1 / 60, t * .07, activity === 'walk' || activity === 'carry shopping', true);
    for (const joint of [...fig.legs, ...fig.knees, ...fig.arms, ...fig.elbows]) assert.ok(Number.isFinite(joint.rotation.x), person.id + ' ' + activity + ' finite joints');
  }
  figures.push(fig);
}
assert.ok(new Set(figures.map((f) => f.identity.face.shape)).size >= 4, 'face shapes vary');
assert.ok(new Set(figures.map((f) => f.identity.hair.style)).size >= 5, 'hair styles vary');
assert.ok(new Set(figures.map((f) => f.identity.body.build)).size >= 4, 'body builds vary');
assert.ok(new Set(figures.map((f) => f.identity.clothing.shirt)).size >= 8, 'clothing palettes vary');

// Age and clearance contract used by makeDistinctPerson / collision code.
const child = makeDistinctPerson('child:figure', { age: 7, gender: 'female', job: 'student' });
const adult = makeDistinctPerson('adult:figure', { age: 39, gender: 'female', job: 'teacher' });
assert.ok(child.group.scale.y < adult.group.scale.y * .8, 'child is materially shorter');
assert.ok(adult.group.scale.x >= .9 && adult.group.scale.x < 1.11, 'adult fits the existing walking clearance');
assert.ok(adult.group.children.some((c) => c.userData.isOutfit), 'outfit marker remains a direct child');
assert.equal(adult.group.userData.residentAppearance.identity, 'adult:figure');

// Pose semantics: sitting lowers the hips and bends the knees; sleep lies the body down.
const sitter = makeResidentFigure(identityFor('pose:sit', { age: 40 }));
sitter.setActivity('sit');
for (let i = 0; i < 60; i++) poseResident(sitter, 1 / 60, i / 60, false, true);
assert.ok(sitter.posture.position.y < -.2, 'sitting lowers the body: ' + sitter.posture.position.y.toFixed(2));
assert.ok(Math.abs(sitter.legs[0].rotation.x + Math.PI / 2) < .2, 'sitting rotates thighs forward');
assert.ok(Math.abs(sitter.knees[0].rotation.x - Math.PI / 2) < .2, 'sitting bends knees down');
const sleeper = makeResidentFigure(identityFor('pose:sleep', { age: 40 }));
sleeper.setActivity('asleep');
for (let i = 0; i < 80; i++) poseResident(sleeper, 1 / 60, i / 60, false, false);
assert.ok(sleeper.posture.rotation.x < -1.2, 'sleep lies the body down');
assert.ok(sleeper.posture.position.y > .4, 'sleep rests on the bed');
const carrier = makeResidentFigure(identityFor('pose:carry', { age: 40 }));
carrier.setActivity('carry shopping');
poseResident(carrier, .1, 1, true, true);
assert.ok(carrier.props.box.visible || carrier.props.bag.visible, 'carrying shows a load');
const worker = makeResidentFigure(identityFor('pose:work', { age: 40, job: 'mechanic', workplaceKind: 'car_repair' }));
worker.setActivity('work shift');
poseResident(worker, .1, 1, false, true);
assert.ok(worker.props.tool.visible, 'work shows a tool');
const eater = makeResidentFigure(identityFor('pose:eat', { age: 40 }));
eater.setActivity('dinner');
poseResident(eater, .1, 1, false, true);
assert.ok(eater.props.food.visible, 'eating shows food');

// Clothing contexts really swap garments and props.
const identity = identityFor('outfit:figure', { age: 36, gender: 'female', job: 'supermarket team member', workplaceKind: 'supermarket' });
const fig = makeResidentFigure(identity);
const homeKey = fig._outfitKey;
fig.setActivity('work shift', { jobKind: 'supermarket', minute: 10 * 60, weather: 'sunny' });
const workKey = fig._outfitKey;
assert.notEqual(workKey, homeKey, 'work clothing is a different garment set');
assert.equal(fig.outfit.uniform, 'coles');
fig.setActivity('walk', { weather: 'rainy', minute: 10 * 60 });
poseResident(fig, .1, 2, true, true);
assert.equal(fig.outfit.umbrella, true);
assert.ok(fig.props.umbrella.visible, 'rain shows an umbrella');

// LOD: detail drops, the seven-mesh proxy takes over, and the full body returns.
const lod = makeResidentFigure(identityFor('lod:1', { age: 30 }));
const countMeshes = (root) => { let n = 0; root.traverse((o) => { if (o.isMesh) n++; }); return n; };
const full = countMeshes(lod.group);
lod.setLod(2);
assert.equal(lod.face.detail.visible, false, 'far LOD hides face micro detail');
assert.equal(lod.face.simple.visible, true, 'far LOD keeps readable eyes');
lod.setLod(3);
assert.equal(lod.posture.visible, false, 'proxy replaces the detailed body');
assert.equal(lod.proxy.visible, true, 'proxy is visible');
const proxyMeshes = countMeshes(lod.proxy);
assert.ok(proxyMeshes <= 8, 'proxy is cheap: ' + proxyMeshes + ' meshes');
assert.ok(full > proxyMeshes * 8, 'detail model is materially richer than proxy: ' + full + ' vs ' + proxyMeshes);
lod.setLod(0);
assert.equal(lod.posture.visible, true);
assert.equal(lod.proxy.visible, false);
assert.equal(lod.face.micro.visible, true);

// The same person always looks the same; different ids do not collapse to one look.
const a = makeDistinctPerson('persist:1', { age: 30, gender: 'female' });
const b = makeDistinctPerson('persist:1', { age: 30, gender: 'female' });
const c = makeDistinctPerson('persist:2', { age: 30, gender: 'female' });
assert.equal(a.group.userData.residentAppearance.signature, b.group.userData.residentAppearance.signature);
assert.notEqual(a.group.userData.residentAppearance.signature, c.group.userData.residentAppearance.signature);

// Issue #492: repeated outfit switching must not accumulate sleeve/leg/hat geometry.
const outfitFig = makeResidentFigure(identityFor('outfit:leak', { age: 38, gender: 'female', job: 'nurse', workplaceKind: 'hospital' }));
const meshCount = () => { let n = 0; outfitFig.group.traverse((o) => { if (o.isMesh) n++; }); return n; };
const countsByOutfit = new Map();
for (const activity of ['work shift', 'home', 'walk', 'home', 'work shift', 'asleep', 'work shift', 'walk', 'home']) {
  outfitFig.setActivity(activity, { mode: activity === 'work shift' ? 'work' : 'home', minute: 600, weather: 'sunny', jobKind: 'hospital' });
  const key = outfitFig._outfitKey;
  const count = meshCount();
  if (countsByOutfit.has(key)) assert.equal(count, countsByOutfit.get(key), 'outfit switch must replace, not accumulate: ' + activity);
  else countsByOutfit.set(key, count);
}
assert.ok(outfitFig.group.getObjectByName('resident-lod-sensor'), 'LOD sensor still present');
// Issue #492: manual LOD must not be overwritten by the automatic sensor.
outfitFig.setLod(3);
const sensor = outfitFig.group.getObjectByName('resident-lod-sensor');
sensor.onBeforeRender(null, null, { position: new THREE.Vector3(100, 0, 0) });
assert.equal(outfitFig.lod, 3, 'manual far LOD survives an automatic sensor update');
outfitFig.setLod(0);
assert.equal(outfitFig.lod, 0);

console.log(`PASS resident figures: 36 detailed identities (${figures[0].identity.name}…), ${figures.reduce((n, f) => { let c = 0; f.group.traverse((o) => { if (o.isMesh) c++; }); return n + c; }, 0)} meshes checked; activity poses finite; sit/sleep/carry/work/eat props; LOD ${full}→${proxyMeshes} meshes; persistent signatures.`);
