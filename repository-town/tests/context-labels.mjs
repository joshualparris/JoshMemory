import assert from 'node:assert/strict';
import * as THREE from 'three';
import { focusInteriorLabels, showNearbyHouseLabel } from '../src/ui/context-labels.js';
import { makePerson } from '../src/world/npcs.js';

const make = (text, x, z, kind = 'interactive') => ({
  isSprite: true, visible: true, userData: {text, labelKind: kind},
  position: new THREE.Vector3(x, 2, z),
  getWorldPosition(out) { return out.copy(this.position); }
});
const close = make('Table 4', 0, 2.5);
const far = make('Other station', 6, 3);
const long = make('Table 4 · deliver / clear', 0, 2.5);
const room = make('Café', 0, 2.5, 'room');
const nested = make('Elsewhere', 0.5, 2.7);
const group = { traverse(cb) { [close, far, long, room, nested].forEach(cb); } };
const opts = {target: {x:0,z:2.5}, player: {x:0,z:0}, forward:{x:0,z:1}};
assert.equal(focusInteriorLabels(group,opts),close,'only matching short focused tag selected');
assert.deepEqual([close,far,long,room,nested].filter(x=>x.visible),[close],'never show overlapping tags');
assert.equal(focusInteriorLabels(group,{...opts,forward:{x:0,z:-1}}),null,'looking away hides labels');
assert.equal(focusInteriorLabels(group,{...opts,target:null}),null,'no selected interaction hides labels');
assert.equal(focusInteriorLabels(group,{...opts,modal:true}),null,'dialogues hide labels');
assert.equal(focusInteriorLabels(group,{...opts,canSee:()=>false}),null,'walls hide labels');
assert.equal(focusInteriorLabels(group,{...opts,player:{x:0,z:2.1}}),null,'very close target uses HUD instead');
assert.equal(showNearbyHouseLabel({distance:5,facing:1,nearest:true}),true);
assert.equal(showNearbyHouseLabel({distance:10,facing:1,nearest:true}),false);
assert.equal(showNearbyHouseLabel({distance:5,facing:-1,nearest:true}),false);
assert.equal(showNearbyHouseLabel({distance:5,facing:1,nearest:true,modal:true}),false);
// Visitors and workers must be distinct full humanoids, not a single floating torso.
for (const seed of [11, 47, 85, 123]) {
  const p = makePerson(seed, 0x587e88, 0x333945);
  const meshes = [];
  p.group.traverse(x => { if (x.isMesh) meshes.push(x); });
  assert.ok(meshes.length >= 15, 'visible head, face, hands, legs and shoes');
  assert.equal(p.legs.length, 2);
  assert.equal(p.arms.length, 2);
  assert.ok(p.head.children.length >= 5, 'recognisable face');
  assert.ok(p.group.children.some(x=>x.userData?.isOutfit), 'shaped body');
}
console.log('PASS: one proximity/focus label; mobile-safe HUD fallback; complete low-poly NPCs');
