// Generates ACCEPTANCE.md: one row per house, joining the design brief with the
// latest browser test results. Private repository: contains private repo names.
import fs from 'node:fs';
import path from 'node:path';
import { TOWN, loadBriefs, loadInventory } from './lib.mjs';

const inventory = loadInventory();
const briefs = loadBriefs();
// Test runs may be sharded (desktop/mobile, by street); merge every results file.
const dir = path.join(TOWN, 'test-results');
const results = { houses: {}, desktop: {}, mobile: {}, date: null };
for (const f of fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort() : []) {
  const r = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  if (r.desktop?.mechanics) results.desktop.mechanics = r.desktop.mechanics;
  results.date = [results.date, r.date].filter(Boolean).sort().pop();
  for (const [c, v] of Object.entries(r.houses)) {
    results.houses[c] = results.houses[c] || {};
    if (v.desktop) results.houses[c].desktop = v.desktop;
    if (v.mobile) results.houses[c].mobile = v.mobile;
  }
}
const cell = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');

function verdict(r) {
  if (!r) return 'not run';
  const ok = r.exhibits.filter((e) => e.ok).length;
  const parts = [r.checks.enteredByWalking ? 'walked in' : 'could not enter', `${ok}/${r.exhibits.length} exhibits`, r.checks.leftByWalking ? 'walked out' : 'could not leave'];
  return `${r.problems.length ? '✗' : '✓'} ${parts.join(', ')}`;
}

const rows = [];
let pass = 0, nameOnly = 0;
for (const p of inventory.projects) {
  const b = briefs.get(p.repo);
  const r = results.houses[p.coordinate];
  const unreachable = b.evidence.some((e) => e.startsWith('unreachable'));
  if (unreachable) nameOnly++;
  const props = b.int.rooms.reduce((n, room) => n + room.props.length, 0);
  const acts = b.int.rooms.flatMap((room) => room.props.filter((x) => Array.isArray(x) && x[2]?.do).map((x) => `${x[2].do}: ${x[1]}`));
  const issues = [...(r?.desktop?.problems || []), ...(r?.mobile?.problems || []).map((x) => 'mobile: ' + x)];
  if (unreachable) issues.push('designed from name/notes only — needs repository access to verify');
  const ok = r?.desktop && r.mobile && !r.desktop.problems.length && !r.mobile.problems.length;
  if (ok && !unreachable) pass++;
  rows.push([
    `${p.coordinate}`, `${p.repo} (${p.visibility})`,
    unreachable ? `⚠ ${b.evidence.join('; ')}` : `${b.evidence.length} sources: ${b.evidence.slice(0, 3).join(', ')}${b.evidence.length > 3 ? '…' : ''}`,
    `${b.ext.style} · ${b.ext.features.join(', ')}`,
    `${b.int.layout} · ${b.int.rooms.map((x) => x.name).join(' / ')} · ${props} props`,
    acts.join('; '),
    verdict(r?.desktop), verdict(r?.mobile),
    issues.length ? issues.join('; ') : '—',
  ].map(cell));
}

const m = results.desktop?.mechanics || {};
const out = `# Repository Town — acceptance checklist

Generated ${new Date().toISOString().slice(0, 10)} from \`briefs/\` and \`test-results/e2e.json\` (test run ${results.date || 'not yet run'}).

**Houses fully accepted** (repository inspected, all desktop and mobile checks passed): **${pass} / ${inventory.projects.length}**.
**Designed from name or notes only** (repository unreachable from the build session): **${nameOnly}**.

## How each house was tested

Automated, real rendering: Playwright drove headless Chromium with WebGL (SwiftShader software GPU) against the built game.
For every house, on a 1100×700 desktop viewport with the keyboard **and** on an emulated Pixel 7 with touch input (joystick drag and the ✋ button):
1. travel to the street outside the house;
2. walk forward until the front door swings open and the player enters through it (no teleport);
3. for every exhibit: stand in front of it, confirm the game prompts for it, use it, and check its effect (panel content, quiz answer, toggle state, link);
4. walk back out of the front door.

Movement mechanics checked once per run — run: ${m.run ?? '?'}, crouch: ${m.crouch ?? '?'}, jump: ${m.jump ?? '?'}, wall collision: ${m.collision ?? '?'}, autosave survives reload: ${m.autosave ?? '?'}.

**Not covered:** no test ran on a physical Android phone or a hardware GPU; frame rate on real devices is unmeasured; audio output was not listened to.

| Lot | Repository | Evidence inspected | Exterior design | Interior design | Unique interactions | Desktop test | Android (emulated) test | Bugs / outstanding |
|---|---|---|---|---|---|---|---|---|
${rows.map((r) => `| ${r.join(' | ')} |`).join('\n')}
`;
fs.writeFileSync(path.join(TOWN, 'ACCEPTANCE.md'), out);
console.log(`ACCEPTANCE.md: ${pass}/${inventory.projects.length} fully accepted, ${nameOnly} name-only designs`);
