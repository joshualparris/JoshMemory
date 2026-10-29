// The Railway Hotel lobby, laid out like a real country hotel: walk in and the reception counter
// faces you, staffed, with the receptionist behind it; the guest-room doors either side stay clear.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { buildHotelInterior, HOTEL_LOBBY, HOTEL_ROOM_COUNT } from '../src/world/hotel-interior.js';
const room = buildHotelInterior({ id: 'hotel', name: 'Railway Hotel' }, () => new THREE.Sprite(new THREE.SpriteMaterial()));
const lobby = room.rooms[0], hit = (x, z, r = 0.35) => room.colliders.some((c) => x + r > c.x0 && x - r < c.x1 && z + r > c.z0 && z - r < c.z1);
assert(room.staff, 'the hotel names where its receptionist stands');
const { staff, use, counterZ } = HOTEL_LOBBY;
assert(staff.z < counterZ && use.z > counterZ, 'receptionist behind the counter, guest in front of it');
assert(staff.x > lobby.x0 && staff.x < lobby.x1 && staff.z > lobby.z0 && staff.z < lobby.z1, 'receptionist stands inside the lobby');
const door = (room.exitZone.x0 + room.exitZone.x1) / 2;
assert(Math.abs(use.x - door) < 0.5, 'the counter is straight ahead of the street door');
const desk = room.interactables.find((x) => x.act?.do === 'civic-ledger');
assert(desk && Math.hypot(desk.pos.x - use.x, desk.pos.z - use.z) < 0.01, 'using the counter books a room');
// A clear walk from just inside the door to the counter.
for (let z = room.spawn.z; z >= use.z; z -= 0.2) assert(!hit(door, z), `door-to-counter path blocked at z ${z.toFixed(1)}`);
assert(!hit(staff.x, staff.z, 0.25), 'the receptionist is not standing inside furniture');
// Guest-room doorways in the lobby's side walls stay clear of the new fittings.
for (const o of room.openings.filter((o) => o.axis === 'x' && o.rooms.includes(0))) {
  const inside = o.at > 0 ? o.at - 0.6 : o.at + 0.6;
  assert(!hit(inside, o.c), `guest room door at x ${o.at} is blocked`);
}
assert.equal(room.interactables.filter((x) => x.act?.do === 'sleep').length, HOTEL_ROOM_COUNT);
console.log('PASS: Railway Hotel lobby — staffed counter facing the door, clear path, guest-room doors clear, ' + HOTEL_ROOM_COUNT + ' bookable rooms');
