import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PUB_HISTORY,pubAgeAt,pubHistoryDescription} from '../src/world/pub-history.js';
test('pub construction remains explicitly UNKNOWN, without invented ages or permits',()=>{
 assert.equal(PUB_HISTORY.gridAddress,'N8-S');assert.equal(PUB_HISTORY.id,'B:pub');
 assert.equal(PUB_HISTORY.originalConstructionYear,null);assert.equal(PUB_HISTORY.firstTradingYear,null);
 assert.equal(PUB_HISTORY.originalName,null);assert.equal(pubAgeAt(2026),null);
 assert.equal(PUB_HISTORY.originalPermitRecord,null);assert.equal(PUB_HISTORY.formalHeritageListing,null);
 assert.ok(PUB_HISTORY.fictional);assert.deepEqual(PUB_HISTORY.timeline.map(x=>x.year),[2026]);
 assert.match(pubHistoryDescription(),/UNKNOWN/);
 assert.doesNotMatch(pubHistoryDescription(),/built in 1911|115 years old|opened in 1912/i);
});
test('pub interior says unknown, not invented established date',async()=>{
 const p=await readFile(new URL('../src/world/pub-interior.js',import.meta.url),'utf8');
 const e=await readFile(new URL('../src/world/townlife.js',import.meta.url),'utf8');
 assert.match(p,/pubHistoryDescription\(\)/);assert.match(p,/DATE UNKNOWN/);
 assert.match(p,/add\('heritage'/);assert.doesNotMatch(p,/EST\. 1911|built 1911/);
 assert.doesNotMatch(e,/Federation-era 1911 hotel/);
});
