// Run only after building the exact production commit and verifying its fingerprint.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import { supersedesPagesOnlyCode } from './pages-drift-guard.mjs';
const site=path.resolve(process.argv[2]);
const output=path.resolve(new URL('../dist/public/',import.meta.url).pathname);
const next=JSON.parse(fs.readFileSync(path.join(output,'release.json'),'utf8'));
if(next.sourceCommit!==process.env.EXPECTED_SOURCE_COMMIT||next.contentHash!==process.env.EXPECTED_CONTENT_HASH) throw Error('Refusing a backup that differs from production');
const git=(...args)=>execFileSync('git',['-C',site,...args],{encoding:'utf8'}).trim();
if(git('status','--porcelain'))throw Error('Backup checkout has local changes');
const previous=JSON.parse(fs.readFileSync(path.join(site,'release.json'),'utf8'));
const keep=new Set(['README.md','AGENTS.md','CLAUDE.md','.nojekyll']);
// Two Pages-only files were added on 24 October *after* the previous
// release.json snapshot. Preserve their exact, individually audited Git
// blobs rather than deleting useful audio/test work or weakening the
// drift guard for arbitrary unmanifested files.
const preservedPagesOnlySha=new Map([
  ['AUDIO_INTEGRATION_TODO.md','2076f4a5c26728bedcbd2a8cc82b1656c4417aff'],
  ['tests/game300-live-playback.cjs','086a3ec1c2d85b031fecdbef077e471b71d8e203'],
]);
const pagesOnlyCopies=new Map();
for(const [name,sha] of preservedPagesOnlySha) {
  const oldPath=path.join(site,name),newPath=path.join(output,name);
  if(!fs.existsSync(oldPath))throw Error('Missing audited Pages-only asset: '+name);
  if(git('hash-object','--',name)!==sha)throw Error('Pages-only asset changed since audit: '+name);
  if(fs.existsSync(newPath))throw Error('Canonical release now owns Pages-only asset; reconcile explicitly: '+name);
  pagesOnlyCopies.set(name,fs.readFileSync(oldPath));
}
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
// These two published source files changed *after* the last release manifest.
// Compare the exact historical blob against the newer canonical output: the
// full old code must remain in order. The only allowed change of an old line
// is the recorded-choice focus guard, which is intentionally stricter.
const safelySupersededSha=new Map([
  ['ui/npc-chat.js','6cb4f2f33784c66d0778b376e56b5ca27e90037e'],
  ['ui/voicebank.js','43071c3418d22811c4d6a9a78a090001d9110ec2'],
]);
function safelySuperseded(name){
  const known=safelySupersededSha.get(name);
  if(!known||git('hash-object','--',name)!==known)return false;
  const nextFile=path.join(output,name);
  if(!fs.existsSync(nextFile))return false;
  const oldText=fs.readFileSync(path.join(site,name),'utf8');
  const newText=fs.readFileSync(nextFile,'utf8');
  return supersedesPagesOnlyCode(name,oldText,newText);
}
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
    if(pagesOnlyCopies.has(name)) {console.log('Preserving audited Pages-only file with pinned Git blob: '+name);continue;}
    if(!exactHistoricalCopy(name))throw Error('Untracked-in-manifest site file; preserve it before publishing: '+name);
    console.log('Verified historical Pages-only file preserved by immutable blob: '+name);
    continue;
  }
  const hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(site,name))).digest('hex');
  if(hash!==expected){
    if(safelySuperseded(name)){console.log('Verified canonical source supersedes historical Pages-only edit: '+name);continue;}
    if(!exactHistoricalCopy(name))throw Error('Live-only edit must be reconciled into source first: '+name);
    console.log('Verified historical Pages-only edit preserved by immutable blob: '+name);
  }
}
for(const entry of fs.readdirSync(site))if(entry!=='.git'&&entry!=='.github'&&!keep.has(entry))fs.rmSync(path.join(site,entry),{recursive:true,force:true});
fs.cpSync(output,site,{recursive:true});
// Restore exact old bytes after replacing generated game assets. These
// never override the canonical build and remain protected on later syncs.
for(const [name,bytes] of pagesOnlyCopies) {
  const destination=path.join(site,name);
  fs.mkdirSync(path.dirname(destination),{recursive:true});
  fs.writeFileSync(destination,bytes);
}
console.log('Prepared exact production backup '+next.sourceCommit+' and '+pagesOnlyCopies.size+' audited Pages-only files');
