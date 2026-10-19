// Ensures the opt-in merge Action contains valid JS, and the required safety
// gates cannot be accidentally removed. This test NEVER invokes GitHub.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const yml=readFileSync(new URL('../../.github/workflows/town-automerge.yml', import.meta.url),'utf8');
const lines=yml.split('\n');
const start=lines.findIndex(x=>x.trim()==='script: |');
assert(start>=0,'workflow must contain github-script source');
const body=lines.slice(start+1)
  .filter(x=>x.trim().length>0)
  .map(x=>x.replace(/^ {12}/,'')).join('\n');
assert.match(body,/town-automerge-approved/,'merging must require explicit maintainer opt-in');
assert.match(body,/pr\.head\.sha!==run\.head_sha/,'stale-head guard is mandatory');
assert.match(body,/mergeable_state!=='clean'/,'conflicts must block auto merge');
assert.match(body,/Town safety gate/,'the town safety check must have passed');
assert.match(body,/pr\.draft/,'draft PRs must never auto merge');
assert.match(body,/pr\.base\.ref!=='main'/,'only approved main PRs may merge');
// Compile without executing; payload can never affect the repository during tests.
new Function('github','context', 'return (async () => {\n' + body + '\n})()');
console.log('PASS: opt-in merge workflow parses and retains safe merge guards');
