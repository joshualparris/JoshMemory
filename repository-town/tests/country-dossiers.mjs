// Researched country houses: each dossier home builds, every room is reachable on foot from the
// front door (0.35 m player radius), every fixture and resident sits inside its own room and is
// approachable, residents are historical (have life dates and a biography) and each dossier lists
// sources. Run for every country that has a dossier.
//   node tests/country-dossiers.mjs
import assert from 'node:assert/strict';
import { COUNTRY_DOSSIERS } from '../src/world/country-dossiers.js';
import { PLAN_HOMES } from '../src/world/masterplan-built.js';
import { buildCountryInterior } from '../src/world/country-interiors.js';

const R = 0.35, STEP = 0.1;
for (const [country, dossier] of Object.entries(COUNTRY_DOSSIERS)) {
  const home = PLAN_HOMES.find((h) => h.country === country);
  assert(home, `${country} has a home in the estate`);
  const built = buildCountryInterior(home);
  assert.equal(built.dossier, dossier, `${country} uses its dossier interior`);
  const { x0, x1, z0, z1 } = built.bounds;
  const blocked = (x, z) => x - R < x0 || x + R > x1 || z - R < z0 || (z + R > z1 && Math.abs(x) > .87) ||
    built.colliders.some((c) => x + R > c.x0 && x - R < c.x1 && z + R > c.z0 && z - R < c.z1);
  // Flood fill walkable cells from the spawn just inside the front door.
  const key = (x, z) => `${Math.round(x / STEP)},${Math.round(z / STEP)}`, seen = new Set(), open = [[built.spawn.x, built.spawn.z]];
  assert(!blocked(built.spawn.x, built.spawn.z), `${country}: spawn is clear`);
  seen.add(key(built.spawn.x, built.spawn.z));
  while (open.length) {
    const [x, z] = open.pop();
    for (const [dx, dz] of [[STEP, 0], [-STEP, 0], [0, STEP], [0, -STEP]]) {
      const nx = x + dx, nz = z + dz, k = key(nx, nz);
      if (seen.has(k) || nz > z1 || blocked(nx, nz)) continue;
      seen.add(k); open.push([nx, nz]);
    }
  }
  const reachable = (x, z) => seen.has(key(x, z));
  const inRoom = (r, x, z) => x >= r.x0 - 1e-6 && x <= r.x1 + 1e-6 && z >= r.z0 - 1e-6 && z <= r.z1 + 1e-6;
  for (const r of built.rooms) {
    let found = false;
    for (let x = r.x0; x <= r.x1 && !found; x += STEP) for (let z = r.z0; z <= r.z1 && !found; z += STEP) found = reachable(x, z);
    assert(found, `${country}: ${r.name} can be walked into from the front door`);
  }
  // Every interactable (fixture or resident) is in its room and has a reachable spot within 1.6 m.
  for (const it of built.interactables) {
    const r = built.rooms[it.room];
    assert(inRoom(r, it.pos.x, it.pos.z), `${country}: ${it.label} stands inside ${r.name}`);
    let ok = false;
    for (let a = 0; a < Math.PI * 2 && !ok; a += Math.PI / 16) for (const dist of [0.7, 1.0, 1.3, 1.6]) {
      const x = it.pos.x + Math.cos(a) * dist, z = it.pos.z + Math.sin(a) * dist;
      if (inRoom(r, x, z) && reachable(x, z)) { ok = true; break; }
    }
    assert(ok, `${country}: ${it.label} can be approached`);
  }
  // Fixture footprints sit inside their rooms (no furniture through a wall).
  for (const c of built.colliders.filter((c) => c.x1 - c.x0 < 2.2 && c.z1 - c.z0 < 2.2)) {
    const cx = (c.x0 + c.x1) / 2, cz = (c.z0 + c.z1) / 2;
    if (!built.rooms.some((r) => inRoom(r, cx, cz))) continue;   // wall stubs
    assert(built.rooms.some((r) => c.x0 >= r.x0 - .02 && c.x1 <= r.x1 + .02 && c.z0 >= r.z0 - .02 && c.z1 <= r.z1 + .02), `${country}: footprint ${JSON.stringify(c)} is inside one room`);
  }
  // Residents: historical, documented and placed.
  assert(dossier.residents.length >= 1);
  for (const r of dossier.residents) {
    assert(/\d{4}/.test(r.life) && r.bio.length >= 1 && r.day.length >= 1 && r.wears, `${country}: ${r.name} has life dates, biography, day and dress`);
    assert(built.interactables.some((i) => i.key === 'resident:' + r.id), `${country}: ${r.name} can be talked to`);
  }
  assert(dossier.sources.length >= 3 && dossier.sources.every(([t, u]) => t && /^https:\/\//.test(u)), `${country}: sources listed`);
  assert(dossier.caveats, `${country}: states what is not established`);
  console.log(`PASS ${country}: ${built.rooms.length} rooms all reachable, ${built.interactables.length} approachable fixtures and residents, ${dossier.sources.length} sources`);
}
