import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PUB_HISTORY,pubAgeAt,pubHistoryDescription} from '../src/world/pub-history.js';
test('fictional history 1911–2026 canonical and not invented real permits',()=>{
 assert.equal(PUB_HISTORY.gridAddress,'N8-S');assert.equal(PUB_HISTORY.id,'B:pub');
 assert.equal(PUB_HISTORY.originalConstructionYear,1911);assert.equal(PUB_HISTORY.firstTradingYear,1912);
 assert.equal(pubAgeAt(2026),115);assert.equal(pubAgeAt(1911),0);assert.equal(pubAgeAt(1900),null);
 assert.equal(PUB_HISTORY.originalName,'Branch Line Hotel');
 assert.equal(PUB_HISTORY.originalPermitRecord,null);assert.equal(PUB_HISTORY.formalHeritageListing,null);
 assert.ok(PUB_HISTORY.fictional);assert.deepEqual(PUB_HISTORY.timeline.map(x=>x.year),[1911,1912,1958,1988,2019,2026]);
 assert.match(pubHistoryDescription(),/not a real heritage record/);
});
test('history plaque and interactive info are in pub and facades are decorative',async()=>{
 const p=await readFile(new URL('../src/world/pub-interior.js',import.meta.url),'utf8');
 const e=await readFile(new URL('../src/world/townlife.js',import.meta.url),'utf8');
 assert.match(p,/pubHistoryDescription\(\)/);assert.match(p,/EST\. '/);
 assert.match(p,/add\('heritage'/);
 assert.match(e,/fictional Federation-era 1911 hotel/);
});
