import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

const auditURL=new URL('../audit/pub/2026-10-25-code-matrix.json',import.meta.url);
const audit=JSON.parse(await readFile(auditURL,'utf8'));
function repoFile(path){return new URL('../'+path.replace(/^repository-town\//,''),import.meta.url)}
function gitBlobSha(content){const header=Buffer.from('blob '+content.length+'\0');return createHash('sha1').update(header).update(content).digest('hex')}
test('pub audit stays visibly non-certifying and uses the correct NSW 2026 code',()=>{
 assert.equal(audit.name,'The Merged Branch');assert.equal(audit.locationId,'B:pub');assert.equal(audit.gameAddress,'N8-S');
 assert.match(audit.nccAsAtDate,/2022 Amendment 2/);assert.match(audit.nccAsAtDate,/2027-05-01/);
 assert.equal(audit.summary.verifiedCodeCompliant,0);
});
test('all RTPUB-001 through RTPUB-034 tasks unique with honest statuses and source refs',()=>{
 assert.equal(audit.checks.length,34);
 const statuses=new Set(['unverified','not-modelled','geometry-conflict','partially-represented']);
 const ids=new Set();
 for(let i=0;i<audit.checks.length;i++){
  const c=audit.checks[i];
  assert.equal(c.id,'RTPUB-'+String(i+1).padStart(3,'0'));
  assert.ok(!ids.has(c.id));ids.add(c.id);
  assert.ok(statuses.has(c.status));assert.equal(c.done,false);
  assert.ok(['P0','P1','P2'].includes(c.priority));
  assert.ok(c.sourceObservation.length>20 && c.requiredEvidenceOrWork.length>30);
  for(const ref of c.regulationRefs)assert.ok(audit.sources[ref],c.id+' missing '+ref);
 }
 assert.equal(audit.summary.notModelled,audit.checks.filter(x=>x.status==='not-modelled').length);
 assert.equal(audit.summary.geometryConflict,1);
});
test('audited source Git blob hashes unchanged — any code change requires new pub audit',async()=>{
 const entries=Object.entries(audit.sourceBlobs);
 assert.ok(entries.length>=7);
 for (const [path,expected] of entries) {
  const bytes=await readFile(repoFile(path));
  assert.equal(gitBlobSha(bytes),expected,'Re-audit changed source: '+path);
 }
});
test('observed decorative pub, incompatible geometry and only one room/exit metadata still true',async()=>{
 const pub=await readFile(repoFile('repository-town/src/world/pub-interior.js'),'utf8');
 const kit=await readFile(repoFile('repository-town/src/world/interior-kit.js'),'utf8');
 const ext=await readFile(repoFile('repository-town/src/world/townlife.js'),'utf8');
 assert.match(pub,/buildPubInterior/); assert.match(pub,/cold-room door/);assert.match(pub,/The kitchen uses/);
 assert.match(kit,/W: 14, D: 18/); assert.match(kit,/doors: \[\]/);
 assert.match(ext,/pub\(b\)/); assert.match(ext,/14, 7, 11/);
 const registry=JSON.parse(await readFile(repoFile('repository-town/audit/electricity/coverage.json'),'utf8'));
 const site=registry.records.find(x=>x.id==='B:pub');
 assert.equal(site.address,'N8-S');assert.equal(site.physicalServiceId,null);assert.equal(site.meterId,null);
});
