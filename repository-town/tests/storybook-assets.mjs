import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=new URL('../src/assets/people/',import.meta.url);
const manifest=JSON.parse(fs.readFileSync(new URL('kaykit-manifest.json',root),'utf8'));
assert.equal(manifest.license,'CC0-1.0');
assert.equal(manifest.sourceCommit,'672074b73ba276876a19e8816ecdc5241817ab47');
assert.equal(manifest.bodyAssets.length,5);
assert(manifest.totalBytes<6_000_000);
const parse=(file)=>{
 const data=fs.readFileSync(new URL(file,root));
 assert.equal(data.toString('utf8',0,4),'glTF','missing valid GLB magic');
 assert.equal(data.readUInt32LE(4),2,'unsupported GLB');
 assert.equal(data.readUInt32LE(8),data.length,'invalid GLB length');
 const size=data.readUInt32LE(12);
 assert.equal(data.toString('utf8',16,20),'JSON','missing JSON chunk');
 const json=JSON.parse(data.toString('utf8',20,20+size));
 const offset=20+size;
 assert(offset+8<=data.length,'missing BIN chunk');
 assert.equal(data.toString('utf8',offset+4,offset+8),'BIN\\x00','missing BIN data');
 assert(json.nodes?.length>0&&json.meshes?.length>0&&json.skins?.length>0);
 const animations=json.animations||[];
 for(const anim of animations){
  assert(anim.channels?.length>0,anim.name+' lost animation channels');
  for(const ch of anim.channels){
   const sampler=anim.samplers?.[ch.sampler];
   assert(sampler&&json.accessors?.[sampler.input]&&json.accessors?.[sampler.output]&&json.nodes[ch.target.node],
    'broken animation sampler or node index for '+anim.name);
   assert(json.accessors[sampler.input].count>0&&json.accessors[sampler.output].count>0,
    'empty keyframe buffer '+anim.name);
  }
 }
 const suspicious=(json.nodes||[]).filter(n=>n.mesh!==undefined&&/^(?:Sword|Shield|Axe|Dagger|Crossbow|Quiver|Arrow|Wand|Weapon)(?:_|$)/i.test(n.name||''));
 assert.equal(suspicious.length,0,'carried weapons included: '+suspicious.map(n=>n.name).join(','));
 return {json,bytes:data.length};
};
const models=manifest.bodyAssets.map(({file,bytes})=>{const r=parse(file);assert.equal(r.bytes,bytes,'manifest drift '+file);return r.json;});
const knight=models[0];
assert.deepEqual(knight.animations.map(a=>a.name).sort(),['Idle','Run','Sit','Talk','Walk']);
for(const model of models.slice(1))assert.equal(model.animations?.length||0,0,'duplicate animation buffers in body');
const jointNames=m=>m.skins[0].joints.map(id=>m.nodes[id].name);
const expected=jointNames(knight);
assert(expected.length>12,'rig is missing bones');
for(const [i,m] of models.entries())assert.deepEqual(jointNames(m),expected,'skeleton mismatch at '+manifest.bodyAssets[i].file);
assert.equal(models.reduce((sum,_,i)=>sum+manifest.bodyAssets[i].bytes,0),manifest.totalBytes);
console.log('PASS: five CC0 characters, unique weapons-free rigs, compatible skeletons, 5 intact shared animation clips and '+manifest.totalBytes+' total bytes');
