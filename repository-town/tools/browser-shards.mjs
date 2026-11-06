// Preserve the complete repository-town test:browser contract while executing
// the long NPC simulation independently from other Chromium browser tests.
// Every command is taken verbatim from package.json and executed once across
// shards 0, 1, 2. No tests are omitted or silently marked as passed.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';

const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'));
const commands=pkg.scripts['test:browser'].split(/\s*&&\s*/).map(s=>s.trim()).filter(Boolean);
const soaks=commands.map((s,i)=>s.includes('tests/npc-soak.mjs')?i:-1).filter(i=>i>=0);
assert.equal(soaks.length,1,'Expected exactly one NPC soak test in browser suite');
assert(commands.length>=20,'Refusing a suspiciously truncated browser suite');
const index=soaks[0];
const shards=[[commands[index]],commands.slice(0,index),commands.slice(index+1)];
assert(shards.every(a=>a.length>0),'All three browser shards must have tests');
assert.deepEqual([...shards[1],...shards[0],...shards[2]],commands,'Shards must preserve entire script');
if(process.argv.includes('--check')){
  console.log('PASS browser suite complete: '+commands.length+' original commands, shard sizes '+shards.map(s=>s.length).join('/'));
  process.exit(0);
}
const shard=Number(process.argv[2]);
assert(Number.isInteger(shard)&&shard>=0&&shard<3,'Usage: node tools/browser-shards.mjs 0|1|2');
console.log('Running browser shard '+shard+': '+shards[shard].length+' of '+commands.length+' commands');
for(const [i,command] of shards[shard].entries()){
  console.log('['+(i+1)+'/'+shards[shard].length+'] '+command);
  const result=spawnSync('bash',['-o','pipefail','-c',command],{stdio:'inherit',timeout:42*60*1000});
  if(result.error||result.status!==0){
    console.error('FAILED browser shard '+shard+': '+command+' ('+(result.error?.message||result.signal||result.status)+')');
    process.exit(result.status||1);
  }
}
console.log('PASS browser shard '+shard+' ('+shards[shard].length+' commands)');
