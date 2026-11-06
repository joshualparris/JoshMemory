// Historical regression metadata only: do not reproduce the unwanted letter.
import test from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { assertResearchOnly } from './verify.mjs';

test('PR #458 historical correspondence filename is rejected without reading its body', () => {
 assert.throws(() => assertResearchOnly([{name:'COUNCIL_DATA_REQUEST.md'}]), /Excluded correspondence deliverable/);
});
test('renaming the historical deliverable does not evade its status marker', () => {
 assert.throws(() => assertResearchOnly([{name:'APPENDIX.md',content:'Ready-to-send draft'}]), /Excluded correspondence content/);
});
test('nested correspondence deliverable is rejected', () => {
 assert.throws(() => assertResearchOnly([{name:'appendices/council-enquiry-draft.txt'}]), /Excluded correspondence deliverable/);
});
test('source research about Council records is allowed', () => {
 assert.doesNotThrow(() => assertResearchOnly([{name:'SOURCES.md',content:'Council tree policy and GIS records: historical evidence, not individual tree coordinates.'}]));
});
test('actual verifier rejects a nested renamed artifact before accepting valid GIS data', () => {
 const root=mkdtempSync(join(tmpdir(),'tree-exclusion-'));
 try {
  const folder=join(root,'docs/narromine/trees');
  cpSync(dirname(fileURLToPath(import.meta.url)),folder,{recursive:true});
  mkdirSync(join(root,'src/world'),{recursive:true});
  for(const name of ['narromine-trees-data.js','narromine-osm-data.js'])
   cpSync(new URL('../../../src/world/'+name,import.meta.url),join(root,'src/world',name));
  writeFileSync(join(root,'package.json'),JSON.stringify({type:'module'}));
  const script=join(folder,'verify.mjs');
  const baseline=spawnSync(process.execPath,[script],{encoding:'utf8'});
  assert.equal(baseline.status,0,baseline.stderr);
  mkdirSync(join(folder,'appendices'));
  // Historical status metadata only, never the letter's body.
  writeFileSync(join(folder,'appendices/APPENDIX.md'),'Ready-to-send draft');
  const rejected=spawnSync(process.execPath,[script],{encoding:'utf8'});
  assert.notEqual(rejected.status,0);
  assert.match(rejected.stderr,/Excluded correspondence content/);
 } finally { rmSync(root,{recursive:true,force:true}); }
});
