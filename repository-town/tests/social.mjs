// Local-first village relationship contract.
import assert from 'node:assert/strict';
import {
  changeRelationship,
  emptySocialState,
  getRelationship,
  recordPlayerMessage,
  recordTownAction,
  relationshipLabel,
  socialGossip,
} from '../src/ui/social.js';

const state = emptySocialState();
assert.equal(relationshipLabel(40), 'friend');
assert.equal(relationshipLabel(-40), 'enemy');
assert.equal(relationshipLabel(0), 'neutral');

changeRelationship('Sadie', 'Mabel', 100, 'a kind afternoon', state);
assert.equal(getRelationship('Sadie', 'Mabel', state).status, 'friend');
assert.match(socialGossip('Sadie', state), /Mabel/);

recordPlayerMessage('Sadie', 'I really like Mabel, she is brilliant.', state);
assert(getRelationship('Sadie', 'Mabel', state).score > 0);
assert((state.playerTrust.Sadie || 0) > 0);

const before = getRelationship('Sadie', 'Arlo', state).score;
recordPlayerMessage('Sadie', 'Arlo is an annoying liar.', state);
assert(getRelationship('Sadie', 'Arlo', state).score < before);
recordTownAction('Sadie', 'completed errand', 'Arlo', state);
assert(getRelationship('Sadie', 'Arlo', state).score > before - 8);
console.log('Social simulation contract passed.');
