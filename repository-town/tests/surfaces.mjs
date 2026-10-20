// node tests/surfaces.mjs — footstep surface lookup matches the town layout.
import assert from 'node:assert/strict';
import { surfaceAt, roomFloor, SURFACE_NAMES } from '../src/world/surfaces.js';
import { AVENUES, FIELD_Z0, RAIL_Z } from '../src/world/life.js';
const ROAD8 = 7 * 46 - 3.5 * 46 + 16;
assert.equal(surfaceAt(-50, ROAD8), 'asphalt', 'street 8 carriageway');
assert.equal(surfaceAt(-50, ROAD8 - 5.3), 'concrete', 'north footpath');
assert.equal(surfaceAt(-50, ROAD8 + 5.3), 'concrete', 'south footpath');
assert.equal(surfaceAt(-50, ROAD8 - 8), 'paver', 'High Street forecourt');
assert.equal(surfaceAt(AVENUES[2], 10), 'asphalt', 'avenue');
assert.equal(surfaceAt(-50, FIELD_Z0 + 8), 'dirt', 'farm field');
assert.equal(surfaceAt(-50, RAIL_Z), 'gravel', 'rail ballast');
assert.equal(surfaceAt(13, -100 + 8), 'grass', 'a front lawn');
assert.equal(surfaceAt(1e5, 1e5), 'grass', 'far outside the town');
for (const id of ['cafe', 'pub', 'store', 'hotel', 'coop', 'fire', 'house', 'nonsense']) assert(SURFACE_NAMES.includes(roomFloor(id)), id + ' has a known floor');
assert.equal(roomFloor('cafe'), 'tile'); assert.equal(roomFloor('house'), 'timber');
console.log('PASS: footstep surfaces for roads, footpaths, forecourts, fields, ballast, lawns and rooms');
