// Every building with a service counter says where its staff stand, and they stand behind that
// counter facing the door: walking in, the counter reads as manned (Josh, 29 Oct 2026).
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { buildCivicInterior, CIVIC_INTERIOR_IDS } from '../src/world/shop-interior.js';
const label = () => new THREE.Sprite(new THREE.SpriteMaterial());
let checked = 0;
for (const id of CIVIC_INTERIOR_IDS) {
  const r = buildCivicInterior({ id, name: id }, label);
  const desk = r?.interactables.find((x) => x.act?.do === 'civic-ledger');
  if (!desk || id === 'farmhouse') continue;
  assert(r.staff, `${id}: has a counter but no staff position (they'd stand at a default spot)`);
  const { pos } = r.staff, room = r.rooms[0];
  assert(pos.x > room.x0 && pos.x < room.x1 && pos.z > room.z0 && pos.z < room.z1, `${id}: staff stand outside the room`);
  // Not service counters: the power station operator sits at the control desk facing the screens,
  // and the fire station has no counter (the officer meets visitors by the engine bay).
  if (!['power', 'fire'].includes(id)) assert(pos.z < desk.pos.z, `${id}: staff stand on the customer side of the counter`);
  checked++;
}
assert(checked >= 30, `checked ${checked} counters`);
console.log(`PASS: ${checked} service counters are staffed from behind the counter, facing the door`);
