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
for(const name of git('ls-files').split('\n')) {
  if(name.startsWith('.github/')||keep.has(name)||name==='release.json')continue;
  const expected=previous.files[name];
  if(!expected)throw Error('Untracked-in-manifest site file; preserve it before publishing: '+name);
  const hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(site,name))).digest('hex');
  if(hash!==expected)throw Error('Live-only edit must be reconciled into source first: '+name);
}
for(const entry of fs.readdirSync(site))if(entry!=='.git'&&entry!=='.github'&&!keep.has(entry))fs.rmSync(path.join(site,entry),{recursive:true,force:true});
fs.cpSync(output,site,{recursive:true});
console.log('Prepared exact production backup '+next.sourceCommit);
