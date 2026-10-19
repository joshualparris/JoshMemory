// Offline personality contract for the street villagers.
import assert from 'node:assert/strict';
import { villagerProfile } from '../src/ui/npc.js';

const names = ['Mabel', 'Arlo', 'Bea', 'Cas', 'Dot', 'Ezra', 'Flo', 'Gus', 'Hattie', 'Ivo', 'June', 'Kip', 'Lou', 'Merv', 'Nora', 'Ollie', 'Peg', 'Rafe', 'Sadie', 'Theo', 'Una', 'Vern', 'Win', 'Zara'];
const profiles = names.map((name) => villagerProfile(name));
assert.equal(new Set(profiles.map((p) => p[0])).size, names.length, 'each villager has a distinct role');
assert.equal(villagerProfile('Sadie')[0], 'curious book-and-building collector');
assert.match(villagerProfile('Sadie')[2], /book stacks/);
assert.equal(villagerProfile('unknown')[0], 'town neighbour');
console.log('NPC personality contract passed for 24 street villagers.');
