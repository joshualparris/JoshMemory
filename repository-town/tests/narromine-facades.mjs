// Geometry/provenance regression: real footprint orientation vs intentionally
// estimated commercial facade openings. Runs without a WebGL/browser environment.
import assert from 'node:assert/strict';
import { facadeBays, estimatedShopfrontProfile, landmarkFacadeSpec } from '../src/world/narromine-facade-profiles.js';
import { DETAILED, FILL_SHOPS, FRONTAGES, BUILDINGS } from '../src/world/narromine-layout.js';
import { roofLetteringSurface } from '../src/world/narromine-roof-lettering.js';

const a = estimatedShopfrontProfile({ name: 'Test Shop', street: 'Dandaloo Street' });
const b = estimatedShopfrontProfile({ name: 'Test Shop', street: 'Dandaloo Street' });
assert.deepEqual(a, b, 'stable palette per mapped shop');
assert(Object.isFrozen(a) && Object.isFrozen(a.sources), 'profile metadata immutable');
assert.equal(a.evidenceLevel, 'estimated', 'generic doors/windows must never claim survey or photographs');
assert(['main-street-shop', 'country-hotel', 'service-workshop', 'civic-shop'].includes(a.key));
assert.equal(estimatedShopfrontProfile({ name: 'Royal Hotel' }).key, 'country-hotel');
assert.equal(estimatedShopfrontProfile({ kind: 'garage' }).key, 'service-workshop');

assert.equal(facadeBays(2.3).length, 0, 'small faces stay undecorated');
assert.equal(facadeBays(NaN).length, 0);
for(const width of [3, 5, 10, 14, 22, 40]) {
  const bays = facadeBays(width);
  assert(bays.length >= 1 && bays.length <= 8);
  assert.equal(bays.filter(x => x.door).length, 1, 'only one cosmetic door per frontage');
  let prev = -1;
  for(const bay of bays) {
    assert(bay.t > prev && bay.t > 0 && bay.t < 1, 'deterministic in-bounds bay positioning');
    assert(bay.width > 0.4 && bay.width <= 2.6, 'window width fits the facade');
    prev = bay.t;
  }
}
assert(FILL_SHOPS.length > 0, 'some mapped named sites need visually estimated shopfronts');
assert(FRONTAGES.length > 0, 'some mapped street-facing buildings have frontages');
for(const shop of FILL_SHOPS) {
  const p = estimatedShopfrontProfile({ name: shop.name, kind: shop.kind });
  assert.equal(p.evidenceLevel, 'estimated');
  const dx = shop.front[0] - shop.x, dz = shop.front[1] - shop.z;
  assert(Math.hypot(dx, dz) > 0.1, 'fill shop has a distinct street-facing normal');
}
for(const f of FRONTAGES) {
  const dx = f.b[0] - f.a[0], dz = f.b[1] - f.a[1], L = Math.hypot(dx, dz);
  assert(BUILDINGS[f.building] && L >= 5, 'frontage anchored to mapped building outline');
  assert(Math.hypot(...f.toward) > 0.1, 'frontage faces a mapped street');
}

// Verandah and traced wall positions are evidence-based; window rhythm remains inferred.
const plans = [
  ['royal-hotel', 'front', 1, 8],
  ['narromine-hotel', 'Dandaloo Street wing', 2, 12],
  ['narromine-hotel', 'Derribong Avenue wing', 2, 8],
];
for(const [id, part, storeys, maxVerandahGap] of plans) {
  const d = DETAILED.find(x => x.id === id), p = d?.parts.find(x => x.name === part);
  assert(p, 'traced hotel part ' + id + ' / ' + part);
  const spec = landmarkFacadeSpec(id, part);
  assert(spec && spec.storeys === storeys && spec.evidenceLevel === 'estimated');
  const e = spec.edge, mid = [(p.pts[e[0]][0] + p.pts[e[1]][0])/2, (p.pts[e[0]][1] + p.pts[e[1]][1])/2];
  const separation = Math.min(...d.verandahs.map(v => {
    const outer = v.outer, o = [(v.pts[outer[0]][0] + v.pts[outer[1]][0])/2, (v.pts[outer[0]][1] + v.pts[outer[1]][1])/2];
    return Math.hypot(mid[0] - o[0], mid[1] - o[1]);
  }));
  assert(separation < maxVerandahGap, id + ' ' + part + ': chosen wall actually faces traced verandah (' + separation.toFixed(1) + 'm)');
}
assert.equal(landmarkFacadeSpec('narromine-post-office', 'north wing'), null, 'photo-matched post office remains unchanged');
assert.equal(landmarkFacadeSpec('dandaloo-82', 'Coles north hall'), null, 'photo-matched Coles remains unchanged');
assert.equal(landmarkFacadeSpec('st-marys-anglican', 'nave'), null, 'dedicated church not re-skinned');
// Royal Hotel rooftop paint is no longer buried by the later LiDAR roof-pitch fit.
// Verify its surface is 10 cm outward *along the roof normal*, even on rotated
// buildings and at pitches other than the old 0.42 rad hard-coded value.
{
  const royal = DETAILED.find(d => d.id === 'royal-hotel');
  const part = royal?.parts.find(p => p.roofText === 'ROYAL HOTEL');
  assert(part?.roof === 'hip', 'actual mapped Royal Hotel roof has painted lettering');
  const [a, b, , d] = part.pts;
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const W = Math.hypot(d[0] - a[0], d[1] - a[1]);
  const cx = part.pts.reduce((s, p) => s + p[0] / 4, 0);
  const cz = part.pts.reduce((s, p) => s + p[1] / 4, 0);
  const yaw = -Math.atan2(b[1] - a[1], b[0] - a[0]);
  assert(W > L, 'Royal sign lives on the west-facing short-pitch hip slope');
  for (const pitch of [0.15, 0.42, 0.65]) for (const rotate of [0, 0.31]) {
    const f = { L, W, cx, cz, yaw: yaw + rotate }, h = 4.2;
    const surface = roofLetteringSurface(f, h, pitch);
    assert(surface && surface.positions.length === 12 && surface.uv.length === 8);
    assert.deepEqual(surface.triangles, [0, 2, 1, 1, 2, 3], 'visible both sides');
    assert(surface.textSpanM < surface.ridgeLengthM, 'text ends remain before roof hips');
    for (let i = 0; i < 4; i++) {
      const x = surface.positions[i * 3], y = surface.positions[i * 3 + 1], z = surface.positions[i * 3 + 2];
      const lx = (x - cx) * Math.cos(f.yaw) - (z - cz) * Math.sin(f.yaw);
      const signedDistanceM = (y - h - (lx + L / 2) * Math.tan(pitch)) * Math.cos(pitch);
      assert(Math.abs(signedDistanceM - 0.10) < 1e-8,
        'lettering lies 10 cm above actual roof plane, not inside it');
    }
  }
  assert.equal(roofLetteringSurface({ L: 4, W: 4, cx: 0, cz: 0, yaw: 0 }, 4, 0.42), null,
    'near-square roofs cannot fit the word across a ridge');
}
console.log('PASS Narromine storefront profiles: provenance, deterministic glazing and door spacing, mapped street normals, hotel verandah faces');
