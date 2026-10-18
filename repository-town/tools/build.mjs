// Builds dist/public (sanitised, deployable) and dist/private (full detail, local only).
import fs from 'node:fs';
import path from 'node:path';
import { TOWN, loadBriefs, loadInventory, validate, sanitise } from './lib.mjs';

const inventory = loadInventory();
const { errors, houses, report } = validate(loadBriefs(), inventory);
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
  fs.writeFileSync(path.join(out, 'houses.json'), JSON.stringify({ version: 2, generated: inventory.generated, streets: inventory.grid.streetNames, houses: list }));
}
console.log(`Built ${houses.length} houses (${report.styles} exterior styles) → dist/public, dist/private${errors.length ? ` · ${errors.length} briefs skipped (--partial)` : ''}`);
