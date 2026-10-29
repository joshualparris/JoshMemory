// Rowan's "where can I eat / buy X?" answers come from the real simulation.
// Regression for the 29 Oct 2026 playtest: the live AI told a new player to get
// lunch at "HealthiestFood on M2" (a repository house) and a non-existent library café.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { TownLife } from '../src/world/life.js';
import { answerTownDirections, isTownDirectionsQuestion } from '../src/ui/town-directions.js';

const homes = [];
for (let r = 0; r < 8; r++) for (let c = 0; c < 26; c++) if (homes.length < 188) homes.push({ coordinate: String.fromCharCode(65 + c) + (r + 1), name: 'Home', door: { x: (c - 12.5) * 26, z: r * 46 - 157 } });
const t = new TownLife({ homes, minute: 12 * 60, seed: 20261029 });
const placeNames = [...t.places.values()].map((p) => p.name);

for (const q of ['Hi Rowan, I just arrived. Where can I buy lunch?', "I'm hungry", 'where can I get something to eat?', 'Where do I buy bread?', 'any shop that sells eggs?', 'where can I grab a pie']) {
  assert.ok(isTownDirectionsQuestion(q), 'recognised: ' + q);
}
for (const q of ['hello', 'tell me a story', 'what is this house about?', 'how old is the town?', "what's on the menu wall?"]) {
  assert.equal(isTownDirectionsQuestion(q), false, 'left to the AI / other answers: ' + q);
}

const lunch = answerTownDirections(t, 'Hi Rowan, I just arrived. Where can I buy lunch?');
assert.match(lunch, /Commit Café/); assert.match(lunch, /J8-S/); assert.match(lunch, /Bakery/); assert.doesNotMatch(lunch, /For a meal, try General Store/);
assert.doesNotMatch(lunch, /HealthiestFood|library/i, 'only real food places');
assert.match(lunch, /open till 17:00/, 'opening hours come from the simulation at 12:00');
// Every place named is a real place in the town.
for (const m of lunch.matchAll(/(?:try |, or |the )([A-Z][^(;,]+?) \(/g)) assert.ok(placeNames.includes(m[1].trim()), 'real place: ' + m[1]);

const bread = answerTownDirections(t, 'Where do I buy bread?');
assert.match(bread, /bread/); assert.match(bread, /Bakery|General Store/);
const eggs = answerTownDirections(t, 'any shop that sells eggs?');
assert.match(eggs, /General Store/); assert.doesNotMatch(eggs, /Butcher/);

t.minute = 23 * 60;
assert.match(answerTownDirections(t, "I'm hungry"), /closed now, opens/, 'late at night it says when places open');
assert.equal(answerTownDirections(null, "I'm hungry"), null, 'no town (NPC Lounge page) → falls through to other answers');

// The game wires it into Rowan's chat ahead of the AI call.
const chat = fs.readFileSync(new URL('../src/ui/npc-chat.js', import.meta.url), 'utf8');
assert.match(chat, /answerTownDirections\(getTown\(\),question\)/);
assert.match(fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), /mountNPCChat\(document, \{ getTown: \(\) => life \}\)/);
console.log('town-directions: grounded meal and shop directions —', lunch);
