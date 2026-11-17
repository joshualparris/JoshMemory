#!/usr/bin/env node
/**
 * Arcade originality gate. Existing games are inventoried without inventing their
 * mechanics; new games MUST provide a reviewable gameplay profile.
 * Run: node tools/audit_game_originality.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const load = (p) => JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const games = load('data/games.json').games;
const baseline = load('data/game-originality-baseline.json');
const profiles = load('data/gameplay-profiles.json').profiles;
const errors = [];
const ids = new Set();
const required = ['genre','playerActions','coreLoop','objective','progression','failureState','distinctiveMechanics','comparison','playtestEvidence'];
const meaningful = v => typeof v === 'string' ? v.trim().length >= 12 : Array.isArray(v) && v.length > 0 && v.every(x=>typeof x === 'string' && x.trim().length >= 3);
const normalize = x => String(x??'').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,' ').trim();
const titleGroups = new Map(), sourceGroups = new Map(), fingerprints = new Map();
for(const g of games){
  if(!g.id || ids.has(g.id)) errors.push('Missing or duplicate game id: '+g.id);
  ids.add(g.id);
  const title=normalize(g.title);
  if(!titleGroups.has(title)) titleGroups.set(title,[]);
  titleGroups.get(title).push(g.id);
  const source=[g.repo,g.dir??'',g.main??''].join(' / ');
  if(!sourceGroups.has(source)) sourceGroups.set(source,[]);
  sourceGroups.get(source).push(g.id);
  const p=profiles[g.id];
  if(!baseline.legacyIds.includes(g.id) && !p) errors.push(g.id+': new game lacks gameplay profile');
  if(!p) continue;
  for(const key of required) if(!meaningful(p[key])) errors.push(g.id+': missing meaningful '+key);
  if(p.comparison && !Array.isArray(p.comparison)) errors.push(g.id+': comparison must list existing game IDs and concrete mechanical differences');
  else if(Array.isArray(p.comparison)) for(const c of p.comparison) if(!/^[^:]+:\s*.+/.test(c)) errors.push(g.id+': comparison item needs "game-id: meaningful mechanical difference"');
  const fingerprint=['genre','playerActions','coreLoop','objective','progression','failureState'].map(k=>Array.isArray(p[k])?p[k].map(normalize).sort().join('|'):normalize(p[k])).join('||');
  if(!fingerprints.has(fingerprint)) fingerprints.set(fingerprint,[]);
  fingerprints.get(fingerprint).push(g.id);
}
for(const id of Object.keys(profiles)) if(!ids.has(id)) errors.push('Profile for unknown game: '+id);
for(const [fp,group] of fingerprints) if(group.length>1) errors.push('Identical documented gameplay fingerprints: '+group.join(', '));
const duplicates = m => [...m.entries()].filter(([key,ids])=>key && ids.length>1).sort((a,b)=>b[1].length-a[1].length);
const nameDuplicates=duplicates(titleGroups), sameSources=duplicates(sourceGroups);
const lines=[
 '# Repository Town arcade originality audit','',
 'This is a catalogue and declared-mechanics audit, **not** a claim that every game was playtested.',
 'Repeated names/sources are review candidates; they are not automatically gameplay clones.','',
 '## Coverage','',
 '- Registered games: '+games.length,
 '- Games with reviewed profiles: '+games.filter(g=>profiles[g.id]).length,
 '- Legacy entries awaiting mechanics review: '+games.filter(g=>!profiles[g.id]).length,
 '- New unprofiled entries: '+games.filter(g=>!baseline.legacyIds.includes(g.id)&&!profiles[g.id]).length,
 '','## Repeated display titles','',
 ...nameDuplicates.map(([name,ids])=>'- **'+name+'**: '+ids.join(', ')),
 '','## Shared source reference (potential variants / duplicated packaging)','',
 ...sameSources.map(([source,ids])=>'- '+source+': '+ids.join(', ')),
 '','## Requirements for new games','',
 'Add a gameplay profile to data/gameplay-profiles.json including player actions, core loop, objective, progression, loss/failure, distinctive mechanics, comparison with existing games, and reproducible playtest evidence. A reskin alone does not qualify.',
 '','## Validation','',
 ...(errors.length?errors.map(e=>'- FAIL: '+e):['- PASS: registered new games have documented differentiating mechanics; no identical declared fingerprints']),
 ''];
const report = lines.join('\n');
if(process.argv.includes('--report')) fs.writeFileSync(path.join(root,'GAME_ORIGINALITY_AUDIT.md'),report);
console.log(report);
if(errors.length) process.exitCode=1;
