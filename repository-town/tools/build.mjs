// Builds dist/public (sanitised, deployable) and dist/private (full detail, local only).
import fs from 'node:fs';
import path from 'node:path';
import { TOWN, loadBriefs, loadInventory, loadRepoData, validate, sanitise, redactPrivate } from './lib.mjs';

const inventory = loadInventory();
const repoData = loadRepoData();
const { errors, houses, report } = validate(loadBriefs(), inventory, repoData);
const partial = process.argv.includes('--partial');
if (errors.length && !partial) {
  console.error(errors.join('\n'));
  console.error(`\n${errors.length} brief errors — fix them or build with --partial while work is in progress.`);
  process.exit(1);
}

for (const target of ['public', 'private']) {
  const out = path.join(TOWN, 'dist', target);
  fs.rmSync(out, { recursive: true, force: true });
  fs.cpSync(path.join(TOWN, 'src'), out, { recursive: true });
  fs.cpSync(path.join(TOWN, 'vendor'), path.join(out, 'vendor'), { recursive: true });
  const list = target === 'public' ? houses.map(sanitise) : houses;
  // The public archive carries public repositories only.
  // Public READMEs that link to a private repository get that link redacted.
  const archive = Object.fromEntries(Object.entries(repoData).filter(([repo]) => target === 'private' || inventory.projects.some((p) => p.repo === repo && p.visibility === 'public')));
  const archiveText = target === 'public' ? redactPrivate(JSON.stringify(archive), inventory) : JSON.stringify(archive);
  fs.writeFileSync(path.join(out, 'repo-data.json'), archiveText);
  // Packed games travel with the build; the public build carries public repositories' games only.
  const playable = new Set(list.flatMap((h) => h.int.rooms.flatMap((r) => r.props.filter((p) => p[2]?.do === 'game').map((p) => p[2].game))));
  for (const id of playable) fs.cpSync(path.join(TOWN, 'games', id), path.join(out, 'games', id), { recursive: true });
  if (fs.existsSync(path.join(TOWN, 'games', '_python'))) fs.cpSync(path.join(TOWN, 'games', '_python'), path.join(out, 'games', '_python'), { recursive: true });
  fs.writeFileSync(path.join(out, 'houses.json'), JSON.stringify({ version: 2, generated: inventory.generated, streets: inventory.grid.streetNames, houses: list }));
}
console.log(`Built ${houses.length} houses (${report.styles} exterior styles) → dist/public, dist/private${errors.length ? ` · ${errors.length} briefs skipped (--partial)` : ''}`);
