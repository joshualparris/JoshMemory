// Regenerate source-audited, labelled SYNTHETIC electrical design from existing
// authoritative RTU-001 building/door evidence. No new houses or street bands.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { buildTownElectricalBackbone,validateTownElectricNetwork } from '../src/world/electrical-backbone.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceFile=path.join(root,'audit/electricity/coverage.json');
const targetFile=path.join(root,'audit/electricity/design-network-v1.json');
const audit=JSON.parse(fs.readFileSync(sourceFile,'utf8'));
assert.equal(audit.schemaVersion,1);
assert.equal(audit.records.length,audit.counts.total);
const model=buildTownElectricalBackbone(audit.records);
const quality=validateTownElectricNetwork(model,audit.records);
assert.equal(quality.buildingSites,audit.counts.total);
const json=JSON.stringify(model,null,2)+'\n';
if(process.argv.includes('--check')){
  assert.equal(fs.readFileSync(targetFile,'utf8'),json,'network snapshot out of date; rerun generator');
}else fs.writeFileSync(targetFile,json);
console.log(JSON.stringify({task:'RTU-003/004/005',...quality,designKva:model.stats.connectedKva,
  status:model.status,mode:process.argv.includes('--check')?'check':'write'}));
