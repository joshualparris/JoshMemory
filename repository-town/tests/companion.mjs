import assert from 'node:assert/strict';
import {companionContext,selectEvidence,developmentTask,companionRequest} from '../src/ui/companion-context.js';
import {companionKnowledge} from '../tools/companion-knowledge.mjs';
const c=companionContext({mode:'house',place:'Bank',coordinate:'M8',wallet:123,pos:{x:1.4,z:3.1},target:{key:'button',label:'Buy',act:{do:'purchase'},secret:'excluded'},interactions:[{label:'Counter',act:{do:'civic-ledger'}}],secret:'excluded'});
assert(!JSON.stringify(c).includes('excluded'));assert.equal(c.target.action,'purchase');assert.equal(c.position.x,1);
const k=companionKnowledge(process.cwd()),e=selectEvidence(k,c,'How was the bank coded?');assert(e.length>0);assert(e.every(x=>k.some(y=>y.path===x.path&&y.line===x.line)));
const payload=companionRequest(c,e,[{role:'user',content:'Can I buy this?'}]);assert.equal(payload.npcId,'town-companion');assert(payload.resident.currentLocation.name==='Bank');assert(payload.resident.readme.includes(e[0].path));assert(payload.resident.personality.includes('unknown'));assert(!JSON.stringify(payload).includes('excluded'));
assert(developmentTask(c,'Question','Suggestion',e).includes('verify before implementation'));
console.log('PASS: bounded context excludes unrelated fields, source selection uses real excerpts, deployed AI transport receives grounded context, tasks mark suggestions.');
