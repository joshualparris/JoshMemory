// Builds dist/public (sanitised, deployable) and dist/private (full detail, local only).
import fs from 'node:fs';
import zlib from 'node:zlib';
import { mergeDiscovery } from './merge-discovery.mjs';
import path from 'node:path';
import { TOWN, loadBriefs, loadInventory, loadRepoData, validate, sanitise, redactPrivate } from './lib.mjs';

// Generated Godot WebAssembly is kept as a checked-in gzip archive so clean
// Render/GitHub checkouts work without installing the Godot editor. The plain
// .wasm is ignored by Git and restored only as a local build input.
const packedGames = JSON.parse(fs.readFileSync(path.join(TOWN, 'data', 'games.json'), 'utf8')).games;
for (const game of packedGames.filter((g) => g.kind === 'godot')) {
  const dir = path.join(TOWN, 'games', game.id);
  const wasm = path.join(dir, 'index.wasm');
  const archive = wasm + '.gz';
  if (fs.existsSync(wasm) || !fs.existsSync(archive)) continue;
  const decoded = zlib.gunzipSync(fs.readFileSync(archive));
  if (decoded.length < 1024 || decoded.subarray(0, 4).toString('hex') !== '0061736d') {
    throw new Error(game.id + ': invalid WebAssembly archive; refusing to publish a broken game');
  }
  fs.writeFileSync(wasm, decoded); // ignored generated artifact; not committed to Git
  console.log('Restored '+game.id+' WebAssembly ('+(decoded.length/1048576).toFixed(1)+' MiB) from tracked gzip');
}

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
  const list = (target === 'public' ? houses.map(sanitise) : houses).map(mergeDiscovery);
  // The public archive carries public repositories only.
  // Public READMEs that link to a private repository get that link redacted.
  const archive = Object.fromEntries(Object.entries(repoData).filter(([repo]) => target === 'private' || inventory.projects.some((p) => p.repo === repo && p.visibility === 'public')));
  const archiveText = target === 'public' ? redactPrivate(JSON.stringify(archive), inventory) : JSON.stringify(archive);
  fs.writeFileSync(path.join(out, 'repo-data.json'), archiveText);
  // Packed games travel with the build; the public build carries public repositories' games only.
  const playable = new Set(list.flatMap((h) => h.int.rooms.flatMap((r) => r.props.filter((p) => p[2]?.do === 'game').map((p) => p[2].game))));
  for (const id of playable) {
    const srcGame = path.join(TOWN, 'games', id);
    for (const e of fs.readdirSync(srcGame)) {
      if (e.endsWith('.wasm.gz')) {
        const wasmOut = path.join(srcGame, e.slice(0, -3));
        if (!fs.existsSync(wasmOut)) fs.writeFileSync(wasmOut, zlib.gunzipSync(fs.readFileSync(path.join(srcGame, e))));
      }
    }
    const dest = path.join(out, 'games', id);
    fs.cpSync(srcGame, dest, { recursive: true });
    for (const e of fs.readdirSync(dest)) {
      if (e.endsWith('.wasm.gz')) fs.rmSync(path.join(dest, e), { force: true });
    }
    // Already-packed games contain the old runtime; repair its duplicate event
    // delivery in the copied build as well as in the packer template.
    (function repairRuntime(d) {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const f = path.join(d, e.name);
        if (e.isDirectory()) { repairRuntime(f); continue; }
        if (!/\.(html|js)$/.test(e.name)) continue;
        const text = fs.readFileSync(f, 'utf8');
        if (!text.includes('var k = this.__town;')) continue;
        const clean = text
          .replace("        if (typeof xhr.onreadystatechange === 'function') xhr.onreadystatechange();\n", '')
          .replace("        if (typeof xhr.onload === 'function') xhr.onload(new ProgressEvent('load'));\n", '')
          .replace("        if (typeof xhr.onloadend === 'function') xhr.onloadend(new ProgressEvent('loadend'));", "        xhr.dispatchEvent(new ProgressEvent('loadend'));");
        if (clean !== text) fs.writeFileSync(f, clean);
      }
    })(dest);
    // Public games can list sibling repositories (network menus, deployment maps): redact private ones.
    if (target === 'public') (function walk(d) {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const f = path.join(d, e.name);
        if (e.isDirectory()) { walk(f); continue; }
        if (!/\.(html|js|mjs|json|md|txt|css)$/i.test(e.name)) continue;
        const text = fs.readFileSync(f, 'utf8'), clean = redactPrivate(text, inventory);
        if (clean !== text) fs.writeFileSync(f, clean);
      }
    })(dest);
  }
  if (fs.existsSync(path.join(TOWN, 'games', '_python'))) fs.cpSync(path.join(TOWN, 'games', '_python'), path.join(out, 'games', '_python'), { recursive: true });
  fs.writeFileSync(path.join(out, 'houses.json'), JSON.stringify({ version: 2, generated: inventory.generated, streets: inventory.grid.streetNames, houses: list }));
}
console.log(`Built ${houses.length} houses (${report.styles} exterior styles) → dist/public, dist/private${errors.length ? ` · ${errors.length} briefs skipped (--partial)` : ''}`);

