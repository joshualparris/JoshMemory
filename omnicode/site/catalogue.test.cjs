const { test } = require('node:test');
const assert = require('node:assert/strict');
const entries = require('./catalogue.js');

test('the original catalogue contains exactly 50 ordered, complete entries', () => {
  assert.equal(entries.length, 50);
  assert.deepEqual(entries.map(x => x.id), Array.from({ length: 50 }, (_, i) => i + 1));
  for (const item of entries) for (const field of ['name', 'type', 'strengths', 'weaknesses']) assert.ok(item[field]?.trim(), '#' + item.id + ' missing ' + field);
});
test('original duplicate is transparently labelled rather than counted as another language', () => {
  assert.equal(entries[33].name, 'COBOL');
  assert.equal(entries[42].name, 'COBOL (duplicate)');
  assert.equal(entries[42].type, 'Duplicate');
  assert.equal(new Set(entries.map(x => x.name.replace(' (duplicate)', ''))).size, 49);
});
test('the list distinguishes languages from frameworks, databases and tools', () => {
  const types = new Set(entries.map(x => x.type));
  for (const type of ['Language','Framework','Database','Tooling','Web / API','Runtime','Duplicate']) assert.ok(types.has(type), type);
  assert.equal(entries.find(x => x.name === 'React').type, 'Framework');
  assert.equal(entries.find(x => x.name === 'PostgreSQL').type, 'Database');
  assert.equal(entries.find(x => x.name === 'Docker').type, 'Tooling');
});
