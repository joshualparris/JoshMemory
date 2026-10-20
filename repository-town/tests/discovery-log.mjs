import assert from 'node:assert/strict';
import { discoveryProgress } from '../src/ui/discovery-log.js';

const houses = [{ coordinate: 'A1', name: 'First' }, { coordinate: 'A2', name: 'Second' }, { coordinate: 'B1', name: 'Third' }];
const fresh = discoveryProgress(houses);
assert.equal(fresh.found, 0);
assert.equal(fresh.total, 3);
assert.equal(fresh.remaining, 3);
assert.equal(fresh.percent, 0);
assert.equal(fresh.next, houses[0]);

const partial = discoveryProgress(houses, new Set(['A1', 'unknown']));
assert.equal(partial.found, 1);
assert.equal(partial.remaining, 2);
assert.equal(partial.percent, 33);
assert.equal(partial.next, houses[1]);

const complete = discoveryProgress(houses, new Set(['A1', 'A2', 'B1']));
assert.equal(complete.found, 3);
assert.equal(complete.remaining, 0);
assert.equal(complete.percent, 100);
assert.equal(complete.next, null);

const deduped = discoveryProgress([houses[0], { coordinate: 'A1', name: 'Duplicate' }, houses[1]], new Set(['A1']));
assert.equal(deduped.total, 2);
assert.equal(deduped.found, 1);
assert.equal(deduped.next, houses[1]);
assert.deepEqual(discoveryProgress([]), { found: 0, total: 0, remaining: 0, percent: 0, next: null });
console.log('PASS: discovery progress counts unique houses, ignores unknown visits and selects the next house.');
