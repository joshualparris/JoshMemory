// Run only after building the exact production commit and verifying its fingerprint.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
const site=path.resolve(process.argv[2]);
const output=path.resolve(new URL('../dist/public/',import.meta.url).pathname);
const next=JSON.parse(fs.readFileSync(path.join(output,'release.json'),'utf8'));
if(next.sourceCommit!==process.env.EXPECTED_SOURCE_COMMIT||next.contentHash!==process.env.EXPECTED_CONTENT_HASH) throw Error('Refusing a backup that differs from production');
const git=(...args)=>execFileSync('git',['-C',site,...args],{encoding:'utf8'}).trim();
if(git('status','--porcelain'))throw Error('Backup checkout has local changes');
const previous=JSON.parse(fs.readFileSync(path.join(site,'release.json'),'utf8'));
const keep=new Set(['README.md','AGENTS.md','CLAUDE.md','.nojekyll']);
// Three legacy Pages files predate the release manifest. Keep their exact contents
// in source control before replacing the generated site; never silently drop drift.
// Immutable blobs from the 21 October Pages-only PR #35 (9e425ab...),
// committed *after* the last release.json was generated. Keep their exact
// git objects in the mirror's history and checked-in copies where available.
// Never accept a filename merely because it is on this list: check blob hash.
const historicBlobSha=new Map([
  ['tests/entrance-zones.mjs','fefadbaa51a36bd2ce6415e78f6843ac9e429cc5'],
  ['world/civic-entrance.js','2d2a4b353aea11feeb7f73e3099735e801489c03'],
  ['world/house-entrance.js','e705091ff71d57b0f5991af40523d38432511fc2'],
  ['ui/townpanels.js','08663f79cc6caecaec8c18f0a0b2e91445c1fb53'],
  ['ui/waste-depot-panel.js','b7836e92f74d138ea3531994eb922838d3683737'],
  ['world/facility-access.js','fc315272a9b6b1a94f11aad62306d11d7b4c5673'],
  ['world/shop-attendance.js','c26388c3c5c52c2b232631da0adc9e45a49793ae'],
  ['world/shop-staff.js','fd5a10f3d36f7dbe82d321409ab68cdf8c0b463e'],
  ['world/town.js','679c9cbc650e6519ab27db9a2ec5b1f4a3411a60'],
]);
const archiveDir=path.resolve(new URL('../audit/legacy-pages-drift-2026-10-23/',import.meta.url).pathname);
function exactHistoricalCopy(name){
  const sha=historicBlobSha.get(name);
  if(!sha||git('hash-object','--',name)!==sha)return false;
  const saved=path.join(archiveDir,name);
  // A local archival copy is extra protection; it must match if present.
  return !fs.existsSync(saved)||fs.readFileSync(saved).equals(fs.readFileSync(path.join(site,name)));
}

for(const name of git('ls-files').split('\n')) {
  if(name.startsWith('.github/')||keep.has(name)||name==='release.json')continue;
  const expected=previous.files[name];
  if(!expected){
    if(!exactHistoricalCopy(name))throw Error('Untracked-in-manifest site file; preserve it before publishing: '+name);
    console.log('Verified historical Pages-only file preserved by immutable blob: '+name);
    continue;
  }
  const hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(site,name))).digest('hex');
  if(hash!==expected){
    if(!exactHistoricalCopy(name))throw Error('Live-only edit must be reconciled into source first: '+name);
    console.log('Verified historical Pages-only edit preserved by immutable blob: '+name);
  }
}
for(const entry of fs.readdirSync(site))if(entry!=='.git'&&entry!=='.github'&&!keep.has(entry))fs.rmSync(path.join(site,entry),{recursive:true,force:true});
fs.cpSync(output,site,{recursive:true});
console.log('Prepared exact production backup '+next.sourceCommit);
