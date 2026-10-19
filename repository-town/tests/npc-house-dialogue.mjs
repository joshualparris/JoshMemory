// Run with: node tests/npc-house-dialogue.mjs
// Pure offline dialogue checks, no Groq calls, browser state or private repos.
import assert from 'node:assert/strict';
import { houseAwareReply } from '../src/ui/npc-chat.js';
const npc={id:'rowan',name:'Rowan'};
const home={name:'Copper Workshop',kind:'Creative workshop',coordinate:'M4'};
assert.match(houseAwareReply(npc,home,'Where do you live?'),/Copper Workshop/);
assert.match(houseAwareReply(npc,home,'Tell me about your project'),/Creative workshop/i);
assert.match(houseAwareReply(npc,home,'Any games to play?'),/interactive exhibits/);
assert.equal(houseAwareReply(npc,null,'Where do you live?'),null);
assert.equal(houseAwareReply(npc,home,'Hello there'),null);
console.log('NPC house-aware offline dialogue checks passed');
