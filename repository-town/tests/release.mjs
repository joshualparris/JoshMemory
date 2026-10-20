import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {stampRelease} from '../tools/release-manifest.mjs';
import {exportProgress,validateProgress,importProgress} from '../src/engine/save-transfer.js';
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'town-release-'));
try {
  const town=path.resolve(new URL('..',import.meta.url).pathname);
  fs.writeFileSync(path.join(temp,'index.html'),'town');
  const first=stampRelease(town,temp,'a'.repeat(40));
  assert.deepEqual(stampRelease(town,temp,'a'.repeat(40)),first,'repeat builds must be deterministic');
  fs.writeFileSync(path.join(temp,'index.html'),'changed');
  assert.notEqual(stampRelease(town,temp,'a'.repeat(40)).contentHash,first.contentHash,'changing a hosted file must change its fingerprint');
  assert.throws(()=>stampRelease(town,temp,'main'));
  const data=new Map([
    ['repository-town.save.v2',JSON.stringify({pos:{x:1,z:2},yaw:0,visited:['M5']})],
    ['repository-town.groq-keys','secret'],['other-app','private'],['repository-town.npc-chats','private chat']
  ]);
  const storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
  const exported=exportProgress(storage);
  assert.deepEqual(Object.keys(exported.entries),['repository-town.save.v2']);
  assert.equal(importProgress(storage,validateProgress(JSON.stringify(exported))),1);
  assert.equal(data.get('other-app'),'private');
  assert.equal(importProgress(storage,{...exported,entries:{'repository-town.sound':'on'}}),1);
  assert.throws(()=>validateProgress(JSON.stringify({...exported,entries:{'repository-town.groq-keys':'"secret"'}})));
  assert.throws(()=>validateProgress(JSON.stringify({...exported,entries:{'repository-town.save.v2':'{"pos":{"x":null,"z":1},"yaw":0}'}})));
  assert.throws(()=>validateProgress('x'.repeat(5*1024*1024+1)));
  const unsupported={...exported,entries:{'repository-town.life.v1':JSON.stringify({v:1,life:{saveVersion:100,day:1,minute:0}})}};
  assert.throws(()=>validateProgress(JSON.stringify(unsupported)));
  const before=new Map(data);let once=true;
  const failing={...storage,setItem:(k,v)=>{if(once){once=false;throw Error('quota');}data.set(k,v);}};
  assert.throws(()=>importProgress(failing,exported));assert.deepEqual(data,before);
  console.log('PASS: deterministic release fingerprint, mutation detection, bounded save transfer, credential exclusion and failed-import rollback');
} finally {fs.rmSync(temp,{recursive:true,force:true});}
