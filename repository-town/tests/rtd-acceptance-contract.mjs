// RTD-008: regression for versioned acceptance and PR metadata traceability.
// Contract cases are CRITERIA ONLY, never a certificate of live game playback.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = rel => readFileSync(new URL(rel, import.meta.url), 'utf8');
const contract = JSON.parse(read('../docs/RTD_DIALOGUE_ACCEPTANCE_V1.json'));
const roadmap = read('../docs/SKYRIM_NPC_DIALOGUE_IMPLEMENTATION_TODO.md');
const template = read('../../.github/PULL_REQUEST_TEMPLATE/repository-town-rtd.md');
const taskId = n => 'RTD-' + String(n).padStart(3, '0');
const stableIds = Array.from({ length: 93 }, (_, i) => taskId(i + 1));
const roadmapIds = [...roadmap.matchAll(/^- \[[ x]\] \*\*(RTD-\d{3})\*\*/gm)].map(m => m[1]);
assert.deepEqual(roadmapIds, stableIds, 'roadmap must retain exactly RTD-001–093');
assert.match(contract.schemaVersion, /^1\.\d+\.\d+$/);
assert.equal(contract.contractId, 'repository-town-dialogue');
assert.equal(contract.ownerTask, 'RTD-008');
assert.equal(contract.status, 'criteria_only_not_implementation_proof');
assert.equal(contract.cases.length, 34);
assert.deepEqual(Object.keys(contract.layers).sort(), [
  'browser-hosted','browser-local','ci','deployment','review','unit'
]);
assert(contract.rules.length >= 4);
const cases = new Map(), coverage = new Set();
for (let index = 0; index < contract.cases.length; index++) {
  const c = contract.cases[index], expected = 'RTAC-' + String(index + 1).padStart(3,'0');
  assert.equal(c.id, expected, 'acceptance case IDs must stay sequential and stable');
  assert(!cases.has(c.id), 'duplicate acceptance case');
  cases.set(c.id,c);
  assert(contract.layers[c.gate], 'invalid evidence layer ' + c.id);
  assert.equal(c.status,'not_evaluated','acceptance criteria do not imply feature passed');
  for (const field of ['title','setup','expectedPass','prohibitedFailure','requiredEvidence']) {
    assert.equal(typeof c[field],'string',c.id+' field '+field);
    assert(c[field].trim().length > 15,c.id+' needs concrete '+field);
  }
  assert(Array.isArray(c.rtdIds) && c.rtdIds.length);
  assert.equal(new Set(c.rtdIds).size,c.rtdIds.length,'duplicate RTD within case');
  for (const id of c.rtdIds) {
    assert(stableIds.includes(id),c.id+' unknown task '+id);
    coverage.add(id);
  }
}
for (let n = 9; n <= 93; n++) assert(coverage.has(taskId(n)),taskId(n)+' not covered');
assert(coverage.has('RTD-008'));
for (const field of ['RTD task IDs:','Acceptance case IDs:','Scope/exclusions:','Evidence:','Checkpoint:','Incomplete or blocked:']) {
  assert(template.includes(field),'template missing '+field);
}
assert(template.includes('RTD-NNN') && template.includes('RTAC-NNN'));

const extract = (str,regex) => [...new Set((str||'').match(regex)||[])];
function validatePR(title,body) {
  const titleTasks = extract(title,/\bRTD-\d{3}\b/g);
  if (!titleTasks.length) {
    assert(!/\bRTD-\d{3}\b/.test(body),'RTD task in body must also appear in PR title');
    return 'non-RTD PR unaffected';
  }
  const taskMatch = body.match(/^RTD task IDs:\s*(.+)$/m);
  const caseMatch = body.match(/^Acceptance case IDs:\s*(.+)$/m);
  assert(taskMatch,'missing task IDs field');
  assert(caseMatch,'missing acceptance case IDs field');
  const tasks = extract(taskMatch[1],/\bRTD-\d{3}\b/g);
  const acs = extract(caseMatch[1],/\bRTAC-\d{3}\b/g);
  assert(tasks.length && acs.length,'RTD and RTAC IDs required');
  for (const id of titleTasks) assert(tasks.includes(id),'title task missing in body: '+id);
  for (const id of tasks) {
    assert(stableIds.includes(id) && titleTasks.includes(id),'body has unknown/unmatched task: '+id);
    assert(acs.some(ac => cases.get(ac)?.rtdIds.includes(id)),'task lacks mapped acceptance case: '+id);
  }
  for (const ac of acs) assert(cases.has(ac),'unknown acceptance case: '+ac);
  for (const field of ['Scope/exclusions:','Evidence:','Checkpoint:','Incomplete or blocked:']) {
    const value = body.split('\n').find(line => line.startsWith(field))?.slice(field.length).trim() || '';
    assert(value.length >= 8 && !/^(?:TODO|\.{3}|<)/i.test(value),'missing actual field '+field);
  }
  assert(body.includes('repository-town/WORK_CHECKPOINT.md'),'checkpoint link required');
  return 'validated '+tasks.join(', ')+' / '+acs.join(', ');
}

if (process.argv.includes('--self-test-pr') || process.argv.includes('--pr')) {
  const good = [
    'RTD task IDs: RTD-009',
    'Acceptance case IDs: RTAC-003',
    'Scope/exclusions: Actor graph schema only; exclude live voice player.',
    'Evidence: node tests/dialogue-schema.mjs PASS, tested commit 01234567.',
    'Checkpoint: repository-town/WORK_CHECKPOINT.md',
    'Incomplete or blocked: Hosted production voice remains unverified.'
  ].join('\n');
  assert.match(validatePR('feat(town): RTD-009 actor graph schema',good),/validated/);
  const negative = [
    ['feat(town): actor graph schema',good],
    ['feat(town): RTD-009',good.replace('RTD-009','RTD-010')],
    ['feat(town): RTD-009',good.replace('RTAC-003','RTAC-032')],
    ['feat(town): RTD-999',good.replace('RTD-009','RTD-999')],
    ['feat(town): RTD-009',good.replace('Evidence:','Unverified:')],
    ['feat(town): RTD-009',good.replace('Incomplete or blocked:','Else:')]
  ];
  for (const [title,body] of negative) assert.throws(() => validatePR(title,body));
  if (process.argv.includes('--pr')) {
    console.log('PASS RTD-008 PR metadata: '+validatePR(
      process.env.TOWN_PR_TITLE || '',process.env.TOWN_PR_BODY || ''));
  }
}
console.log('PASS RTD-008 acceptance v'+contract.schemaVersion+': '+
  cases.size+' stable cases, RTD-009–093 mapped, evidence layers and PR template validated');
