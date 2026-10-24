// Lightweight, browserless contract gate for the Skyvern + Playwright arcade QA.
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';

const games = JSON.parse(await readFile('data/games.json', 'utf8')).games;
const required = new Map([
  ['AA Game Adventure', ['hub-aa-game-adventure', 'ptshub-aa-game-adventure']],
  ['Mysterious Depths', ['hub-mysterious-depths', 'ptshub-mysterious-depths']],
]);
for (const [title, variants] of required) {
  const ids = games.filter(g => g.title === title).map(g => g.id).sort();
  assert.deepEqual(ids, [...variants].sort(), title + ' must retain both editions');
  for (const id of ids) await access(path.join('games', id, 'index.html'));
}
const skyvern = JSON.parse(await readFile('qa/skyvern-arcade-playtest.workflow.json', 'utf8'));
assert.equal(skyvern.workflow_definition.version, 2);
assert.equal(skyvern.run_with, 'agent');
const loop = skyvern.workflow_definition.blocks.find(block => block.block_type === 'for_loop');
assert.ok(loop);
assert.equal(loop.loop_variable_reference, 'game_titles');
assert.deepEqual(loop.loop_blocks.map(block => block.block_type), ['navigation', 'extraction']);
const schema = loop.loop_blocks[1].data_schema.properties;
for (const key of ['game_title', 'playable', 'reached_ending_or_progressed', 'bugs', 'confusing_ux', 'balance_issues', 'summary']) assert.ok(schema[key], key);
const runner = await readFile('tests/arcade-agent-playtest.mjs', 'utf8');
assert.ok(runner.includes("const allGames = selected.trim().toUpperCase() === 'ALL'"));
assert.ok(runner.includes('await gameFrame.contentFrame()'));
assert.ok(runner.includes('await page.screenshot'));
console.log('PASS: two target game titles, four packed editions, Skyvern v2 schema, browser runner wiring');
