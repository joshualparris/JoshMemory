// Exact Narromine Hotel footpath clipping: no centroid-based surface deletion.
import assert from 'node:assert/strict';
import { STREETS, HIGHWAY } from '../src/world/narromine-layout.js';
import { hotelForecourtPolygon } from '../src/world/narromine-hotel.js';
import { subtractConvex, buildDisjointRoadSurfaces } from '../src/world/narromine-road-surfaces.js';
import { clipFootpathsOutsideForecourt, forecourtTriangles } from '../src/world/narromine-forecourt-footpaths.js';

const area = pts => Math.abs(pts.reduce((sum, p, i) => {
  const q = pts[(i + 1) % pts.length];
  return sum + p[0] * q[1] - q[0] * p[1];
}, 0)) / 2;
const outsideArea = (pts, triangles) => {
  let fragments = [pts];
  for (const triangle of triangles)
    fragments = fragments.flatMap(fragment => subtractConvex(fragment, triangle));
  return fragments.reduce((n, part) => n + area(part), 0);
};

const L = [[0, 0], [8, 0], [8, 2], [2, 2], [2, 8], [0, 8]];
for (const poly of [L, L.slice().reverse()]) {
  const tris = forecourtTriangles(poly);
  assert.equal(tris.length, 4, 'six-point concave shape triangulates');
  assert(Math.abs(tris.reduce((n, t) => n + area(t), 0) - area(poly)) < 1e-6);
  const intersecting = { pts: [[1, -1], [4, -1], [4, 1], [1, 1]], kind: 'secondary', paving: 'red-brick' };
  const result = clipFootpathsOutsideForecourt([intersecting], poly);
  assert(Math.abs(result.reduce((n, s) => n + area(s.pts), 0) - 3) < 1e-6,
    'retain precisely 3 m2 outside the forecourt, rather than entire polygon');
  assert(result.every(s => s.kind === 'secondary' && s.paving === 'red-brick'));
  for (const s of result)
    assert(Math.abs(area(s.pts) - outsideArea(s.pts, tris)) < 1e-6, 'no leaked surface');
  assert.equal(clipFootpathsOutsideForecourt([{ pts: [[0.2, 0.2], [1.2, 0.2], [1.2, 1.2], [0.2, 1.2]] }], poly).length, 0,
    'fully internal generic paving is removed');
  const outside = { pts: [[9, 9], [10, 9], [10, 10], [9, 10]], paving: 'concrete' };
  assert.equal(clipFootpathsOutsideForecourt([outside], poly).length, 1, 'unrelated footpath preserved');
}

const hotel = hotelForecourtPolygon();
const triangles = forecourtTriangles(hotel);
assert.equal(triangles.length, hotel.length - 2);
const mapped = buildDisjointRoadSurfaces(STREETS, { highway: HIGHWAY }).footpaths;
const clipped = clipFootpathsOutsideForecourt(mapped, hotel);
const mappedArea = mapped.reduce((n, s) => n + area(s.pts), 0);
const afterArea = clipped.reduce((n, s) => n + area(s.pts), 0);
const expected = mapped.reduce((n, s) => n + outsideArea(s.pts, triangles), 0);
assert(Math.abs(afterArea - expected) < 1e-3,
  'map preserves exactly all generic footpath area outside the hotel');
assert(afterArea <= mappedArea + 1e-5);
assert(clipped.length < 30000, 'keep polygon count bounded for browser rendering');
for (const s of clipped) {
  assert(area(s.pts) > 1e-5 && s.pts.every(p => p.every(Number.isFinite)));
  assert(Math.abs(area(s.pts) - outsideArea(s.pts, triangles)) < 1e-4,
    'no mapped paving over real hotel sealed forecourt');
}
console.log('PASS Narromine hotel forecourt clipping: ' +
  mapped.length + ' mapped fragments -> ' + clipped.length +
  ' retained; ' + (mappedArea - afterArea).toFixed(2) + ' m2 omitted from forecourt');
