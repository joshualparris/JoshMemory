// npm run test:integration includes this zero-network identity regression.
import assert from 'node:assert/strict';
import { residentName } from '../src/ui/resident-identity.js';
import { residentName as conversationName } from '../src/ui/npc.js';

const coords = Array.from({length:8},(_,row)=>Array.from({length:26},(_,col)=>String.fromCharCode(65+col)+(row+1))).flat();
const names=coords.map(residentName);
assert.equal(coords.length,208);
assert.equal(new Set(names).size,coords.length,'each possible town house has its own full resident name');
assert(names.every(name=>/^[A-Z][a-z]+ [A-Z][a-z]+$/.test(name)),'names should look natural, not contain coordinates');
for(let i=0;i<coords.length;i++){
  assert.equal(conversationName(coords[i]),names[i],'chat identity must match house labels');
  assert.equal(residentName(coords[i]),names[i],'name must remain stable between reloads');
}
assert.equal(residentName('Z8'),names.at(-1));
assert.equal(residentName('private/repository'), 'Town resident','no private repository identifier should appear in a name');
console.log('PASS: 208 unique stable house-resident identities, consistent across build and chat');
