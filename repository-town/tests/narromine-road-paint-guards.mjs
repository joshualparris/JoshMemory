import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { nearMappedLanePaint, shouldDrawInferredCentreDash } from '../src/world/narromine-road-paint-guards.js';

const lanes = [[[0, 0], [40, 0]], [[120, 20], [120, 50]]];
assert(nearMappedLanePaint(lanes, 0, 0), 'start of mapped segment');
assert(nearMappedLanePaint(lanes, 20, 2.9), 'close mapped centre line');
assert(nearMappedLanePaint(lanes, 120, 35), 'vertical mapped segment');
assert(!nearMappedLanePaint(lanes, 20, 3.1), 'keep independent nearby road');
assert(!nearMappedLanePaint(lanes, 90, 0), 'do not extend mapped line beyond endpoint');
assert(!nearMappedLanePaint([[[1, 1], [1, 1]]], 1, 1), 'zero-length segment cannot shadow paint');
assert(!nearMappedLanePaint(lanes, NaN, 0), 'invalid sample does not shadow paint');
assert(!shouldDrawInferredCentreDash('secondary', 20, 0, lanes), 'suppress duplicate mapped paint mid-street');
assert(shouldDrawInferredCentreDash('secondary', 90, 0, lanes), 'allow untagged continuation');
assert(shouldDrawInferredCentreDash('primary', 90, 0, lanes), 'allow other main road');
assert(!shouldDrawInferredCentreDash('trunk', 90, 0, lanes), 'no centre on one-way trunk');
assert(!shouldDrawInferredCentreDash('residential', 90, 0, lanes), 'no main-road fallback on residential');
const sceneSource = readFileSync(new URL('../src/world/narromine.js', import.meta.url), 'utf8');
assert.match(sceneSource, /shouldDrawInferredCentreDash\(st\.kind, mx, mz, NARROMINE_FURNITURE\.laned\)/,
  'scene must guard every fallback centre dash against mapped paint');
assert.doesNotMatch(sceneSource, /const centre = st\.kind !== 'trunk' && !nearLine\(NARROMINE_FURNITURE\.laned, st\.pts\[0\]/,
  'never make an entire street paint decision using just its first coordinate');
console.log('PASS Narromine centre paint guard: tagged routes take priority over inferred paint at each dash.');
