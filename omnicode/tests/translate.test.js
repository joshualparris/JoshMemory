const { test } = require('node:test');
const assert = require('node:assert/strict');
const { translate, validate, bfRun, befungeRun, specs } = require('../site/lib/languages');

test('50 unique genuine target-language templates', () => {
  assert.equal(specs.length, 50);
  assert.equal(new Set(specs.map(x => x[0])).size, 50);
});
test('translation uses each specific payload and executes the three declared proof runtimes', () => {
  const out = translate('alex@example.com');
  assert.equal(out.length, 50);
  assert.equal(out.filter(x => x.status === 'executed').length, 3);
  assert.equal(out.filter(x => x.status === 'translated').length, 47);
  for (const item of out) {
    assert.ok(item.source.length > 5, item.language);
    assert.equal(item.expectedOutput, 'OMNI:alex@example.com');
    if (item.status === 'executed') assert.equal(item.actualOutput, item.expectedOutput);
  }
  assert.notEqual(translate('alice@example.com')[0].source, out[0].source);
});
test('user input cannot inject generated program syntax', () => {
  for (const bad of ['";process.exit(1)//', "abc'\\nquit", 'hello world', '', 'x'.repeat(71), '<script>']) {
    assert.throws(() => validate(bad));
  }
});
test('esolang execution halts and follows generated language semantics', () => {
  assert.equal(bfRun('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++.'), 'A');
  assert.equal(befungeRun('>"olleH",,,,,@'), 'Hello');
  assert.throws(() => bfRun('[+', 100));
  assert.throws(() => befungeRun('>>>>', 4));
});
