import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
const code=fs.readFileSync(new URL('../src/ui/analytics.js',import.meta.url),'utf8');
for(const id of [undefined,'','__UMAMI_WEBSITE_ID__','not-a-website-id','12345678-1234-1234-1234-123456789abc']){
 const appended=[],dataset={websiteId:id,doNotTrack:'true',domains:'example.test',tag:'Town'};
 const document={currentScript:{dataset},createElement:()=>({dataset:{}}),head:{append:s=>appended.push(s)}};
 vm.runInNewContext(code,{document});
 if(id==='12345678-1234-1234-1234-123456789abc'){
  assert.equal(appended.length,1);assert.equal(appended[0].src,'https://cloud.umami.is/script.js');
  assert.equal(appended[0].dataset.websiteId,id);assert.equal(appended[0].dataset.doNotTrack,'true');
  assert.equal(appended[0].dataset.domains,'example.test');assert.equal(appended[0].dataset.tag,'Town');
 }else assert.equal(appended.length,0,'unconfigured analytics must make no network request');
}
console.log('PASS: no analytics request until configured; valid configuration preserves restrictions');
