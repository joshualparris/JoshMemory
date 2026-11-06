// NR-VQA-005: development-only source-response ablations.
// Never alter repository-town/src/ or production source. The caller serves
// these substitutions to isolated WebGL browser sessions.
import assert from 'node:assert/strict';
import { decodePng } from './temporal-flicker.mjs';

export const ABLATION_LAYERS = Object.freeze([
  'normal', 'reference-repeat', 'asphalt', 'footpaths', 'paint', 'terrain', 'noise',
]);

function replaceUnique(s, original, substitute, label) {
  assert.equal(s.split(original).length, 2, 'QA source marker missing/duplicated: ' + label);
  return s.replace(original, substitute);
}

export function ablateNarromineSource(s, layer) {
  assert(ABLATION_LAYERS.includes(layer), 'unknown ablation layer');
  if (['normal', 'reference-repeat', 'noise'].includes(layer)) return s;
  if (layer === 'asphalt') {
    s = replaceUnique(s,
      '  for (const s of roadSurfaces.asphalt) flatPoly(ROAD_COLOUR[s.kind] ?? 0x4f5153, s.pts, 0.075);',
      '  /* QA: asphalt hidden only in isolated browser session */', 'asphalt');
    s = replaceUnique(s,
      '  for (const s of roadSurfaces.fillets) flatPoly(ROAD_COLOUR[s.kind] ?? 0x4f5153, s.pts, 0.072);',
      '  /* QA: kerb return asphalt hidden */', 'kerb returns');
  }
  if (layer === 'footpaths') {
    s = replaceUnique(s,
      "  for (const s of roadSurfaces.footpaths) { const cx = s.pts.reduce((a, p) => a + p[0], 0) / s.pts.length, cz = s.pts.reduce((a, p) => a + p[1], 0) / s.pts.length; if (!inPoly(cx, cz, HOTEL_FORECOURT)) flatPoly(s.paving === 'red-brick' ? 0xa4563f : 0xbdb6a8, s.pts, 0.076); }",
      '  /* QA: generated footpath pavements hidden */', 'footpaths');
    s = replaceUnique(s, '  // OSM-mapped footways and paths: concrete where sealed, gravel where unpaved; zebra-white at crossings.',
      '  if (false) { // QA: mapped footway ablation\n  // OSM-mapped footways and paths: concrete where sealed, gravel where unpaved; zebra-white at crossings.',
      'footway start');
    s = replaceUnique(s, '  // Main-road line marking as on the real A32',
      '  }\n  // Main-road line marking as on the real A32', 'footway end');
  }
  if (layer === 'paint') {
    s = replaceUnique(s, '  // Main-road line marking as on the real A32',
      '  if (false) { // QA: all generated/mapped road paint hidden\n  // Main-road line marking as on the real A32', 'paint start');
    s = replaceUnique(s, '  // OSM-aligned Dandaloo streetscape: no duplicate road or building geometry.',
      '  }\n  // OSM-aligned Dandaloo streetscape: no duplicate road or building geometry.', 'paint end');
  }
  if (layer === 'terrain') {
    s = replaceUnique(s,
      '  box(0xa3b07a, REGION.x1 - REGION.x0, 0.1, REGION.z1 - REGION.z0, (REGION.x0 + REGION.x1) / 2, -0.12, (REGION.z0 + REGION.z1) / 2);',
      '  /* QA: base town terrain hidden */', 'terrain base');
    s = replaceUnique(s,
      "  for (const a of AREAS) { const c = AREA_COLOUR[a.kind]; if (c) flatPoly(c, a.pts, a.kind === 'swimming_pool' ? 0.02 : 0.004); }",
      '  /* QA: area fill absent */', 'terrain land use');
  }
  return s;
}

export function ablateSurfaceShader(s, layer) {
  assert(ABLATION_LAYERS.includes(layer), 'unknown shader layer');
  if (layer !== 'noise') return s;
  return replaceUnique(s,
    'float nrFilteredNoise(vec2 p) {\n  float pixelFootprint = max(fwidth(p.x), fwidth(p.y));\n  float weight = 1.0 - smoothstep(0.45, 1.0, pixelFootprint);\n  return mix(0.5, nrNoise(p), weight);\n}',
    'float nrFilteredNoise(vec2 p) { return 0.5; }',
    'shader noise function');
}

export function pixelDifference(reference, candidate) {
  const a = decodePng(reference), b = decodePng(candidate);
  assert.equal(a.width, b.width, 'image width mismatch');
  assert.equal(a.height, b.height, 'image height mismatch');
  let sample = 0, changed = 0, anyChanged = 0, roadSample = 0,
    roadChanged = 0, roadAnyChanged = 0, roadTotalMaxDelta = 0, roadMaximumDelta = 0;
  for (let y = 0; y < a.height; y += 2) for (let x = 0; x < a.width; x += 2) {
    const i = (y * a.width + x) * 4;
    const d = Math.max(Math.abs(a.data[i] - b.data[i]),
      Math.abs(a.data[i + 1] - b.data[i + 1]),
      Math.abs(a.data[i + 2] - b.data[i + 2]));
    sample++; if (d > 2) changed++; if (d > 0) anyChanged++;
    if (x >= a.width * .25 && x < a.width * .75 &&
        y >= a.height * .58 && y < a.height * .92) {
      roadSample++; if (d > 2) roadChanged++;
      if (d > 0) roadAnyChanged++;
      roadTotalMaxDelta += d;
      roadMaximumDelta = Math.max(roadMaximumDelta, d);
    }
  }
  return { wholeChangedPct: +(100 * changed / sample).toFixed(3),
    wholeAnyChangedPct: +(100 * anyChanged / sample).toFixed(3),
    roadRegionChangedPct: +(100 * roadChanged / Math.max(1, roadSample)).toFixed(3),
    roadRegionAnyChangedPct: +(100 * roadAnyChanged / Math.max(1, roadSample)).toFixed(3),
    roadMeanMaxChannelDelta: +(roadTotalMaxDelta / Math.max(1, roadSample)).toFixed(4),
    roadMaximumDelta };

}

export function ablationVerdict(referenceRepeat, layerDifference) {
  const delta = layerDifference.roadRegionChangedPct - referenceRepeat.roadRegionChangedPct;
  return {
    status: delta > 2 ? 'visible-effect' : 'review-required',
    excessRoadRegionChangedPct: +delta.toFixed(3),
    note: 'Layer deletion affects pixels, but not necessarily temporal flicker. Confounded by non-deterministic traffic. Inspect real screenshots.',
  };
}
