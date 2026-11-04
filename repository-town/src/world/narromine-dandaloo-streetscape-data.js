// Evidence-led Dandaloo Street surface plan. Coordinates are Repository Town world metres.
// OSM provides the *road centrelines*; planting, parking markings and furniture spacing
// remain estimates pending photographic/survey alignment. Never imply survey accuracy.
// Source: OSM 2026-11-03; Narromine Shire Dandaloo St South streetscape design (2019);
// NSW 42 Dandaloo St SEE (2023); Josh's 2026-11-04 side-by-side visual comparisons.
// Google Street View images are NOT copied into this repository.

export const DANDALOO_STREETSCAPE_EVIDENCE = Object.freeze({
  alignment: 'OpenStreetMap Dandaloo Street dual trunk-road centrelines (2026-11-03)',
  physicalDetails: 'Narromine Shire Dandaloo Street South streetscape plan and 2023 planning photos',
  photographs: 'Josh 2026-11-04 Street View vs game comparisons; reference only',
  confidence: Object.freeze({
    dualRoadPosition: 'mapped',
    medianFootprint: 'derived from mapped road-edge clearance; requires survey',
    angleParkingSpacing: 'approximate, 60-degree illustrative',
    lampsTreesPalmPositions: 'approximate photo-based visual placement',
  }),
});

// Leave the mapped Burraway, Nymagee and Meringo intersections open. The two
// OSM carriageways split at Burraway (~z -853) and meet near Meringo (~z -1184).
// Gaps around crossings avoid decorating through moving traffic or cross-streets.
export const LANDSCAPED_BANDS = Object.freeze([
  Object.freeze({ upperZ: -877, lowerZ: -932 }),
  Object.freeze({ upperZ: -979, lowerZ: -1165 }),
]);

export function roadXAtZ(road, z) {
  for (let i = 1; i < road.pts.length; i++) {
    const a = road.pts[i - 1], b = road.pts[i];
    if (z >= Math.min(a[1], b[1]) - 1e-6 && z <= Math.max(a[1], b[1]) + 1e-6
      && Math.abs(b[1] - a[1]) > 1e-5) {
      const t = (z - a[1]) / (b[1] - a[1]);
      return a[0] + (b[0] - a[0]) * t;
    }
  }
  return null;
}

export function findDandalooCarriageways(streets) {
  const roads = streets.filter(s => s.name === 'Dandaloo Street' && s.kind === 'trunk'
    && roadXAtZ(s, -1050) !== null && roadXAtZ(s, -1100) !== null);
  if (roads.length !== 2) throw Error('Expected two OSM Dandaloo carriageways near Nymagee/Meringo; found ' + roads.length);
  return roads.sort((a, b) => roadXAtZ(a, -1050) - roadXAtZ(b, -1050));
}

export function planDandalooStreetscape(streets) {
  const [west, east] = findDandalooCarriageways(streets);
  const medians = [], kerbs = [], pavers = [], parking = [], trees = [], lamps = [];
  const at = z => {
    const wx = roadXAtZ(west, z), ex = roadXAtZ(east, z);
    if (wx === null || ex === null) throw Error('Unmapped Dandaloo median point at z=' + z);
    // Clear each full carriageway plus 0.45 m from either inner road edge.
    const clear = ex - wx - (west.width + east.width) / 2 - 0.90;
    if (clear < 1.1) throw Error('Mapped median clearance too narrow at z=' + z);
    const cx = (wx + ex) / 2, hw = Math.min(4.2, clear) / 2;
    return { wx, ex, cx, hw };
  };
  const quad = (a, b, halfWidth) => [
    [a[0] - halfWidth, a[1]], [a[0] + halfWidth, a[1]],
    [b[0] + halfWidth, b[1]], [b[0] - halfWidth, b[1]],
  ];
  for (const band of LANDSCAPED_BANDS) {
    for (let z = band.upperZ; z > band.lowerZ; z -= 7) {
      const zz = Math.max(z - 7, band.lowerZ);
      const a = at(z), b = at(zz);
      // Disjoint quad boundaries at a shared z: no coplanar overlap.
      medians.push({ pts: [
        [a.cx - a.hw, z], [a.cx + a.hw, z],
        [b.cx + b.hw, zz], [b.cx - b.hw, zz],
      ], grass: Math.floor(Math.abs(z)) % 3 !== 0 });
      for (const side of [-1, 1]) {
        const innerA = a.cx + side * a.hw, innerB = b.cx + side * b.hw;
        kerbs.push({ a: [innerA, z], b: [innerB, zz], kind: 'median' });
        const external = side < 0 ? { x0: a.wx - west.width / 2, x1: b.wx - west.width / 2 }
          : { x0: a.ex + east.width / 2, x1: b.ex + east.width / 2 };
        kerbs.push({ a: [external.x0, z], b: [external.x1, zz], kind: 'outside' });
        // The mapped 2.5-m sidewalk strip remains traversable. This red-brick
        // surface is only a visual overlay; no raised obstruction/collider.
        const offset = side < 0 ? -1.25 : 1.25;
        pavers.push({ pts: quad([external.x0 + offset, z], [external.x1 + offset, zz], 1.0) });
      }
    }
    for (let z = band.upperZ - 7; z > band.lowerZ + 7; z -= 6.0) {
      const a = at(z), b = at(z - 2.15);
      // Painted 60-degree rear-to-kerb bay separator: 3.7 m inward, 2.15 m along.
      parking.push({ a: [a.wx - west.width / 2 + 0.17, z],
        b: [b.wx - west.width / 2 + 3.87, z - 2.15], side: 'west' });
      parking.push({ a: [a.ex + east.width / 2 - 0.17, z],
        b: [b.ex + east.width / 2 - 3.87, z - 2.15], side: 'east' });
    }
  }
  // Midpoint coordinates follow OSM. These z locations are indicative ONLY:
  // photogrammetric tree inventories and actual bay surveys have not been done.
  const put = (dest, z, where, kind) => {
    const r = at(z);
    const x = where === 'median' ? r.cx
      : where === 'west' ? r.wx - west.width / 2 - 1.35
      : r.ex + east.width / 2 + 1.35;
    dest.push({ x, z, where, kind });
  };
  for (const z of [-1019, -1073, -1137]) put(trees, z, 'median', z === -1073 ? 'palm' : 'deciduous');
  // Keep the existing palm/sculpture at Kierath's (~z -889) in narromine.js.
  for (const z of [-894, -1004, -1086, -1143]) put(trees, z, 'west', 'flowering');
  for (const z of [-916, -1038, -1114, -1155]) put(trees, z, 'east', 'deciduous');
  for (const z of [-911, -1028, -1126]) put(lamps, z, 'median', 'swan-neck');
  for (const z of [-902, -1048, -1140]) put(lamps, z, 'west', 'swan-neck');
  for (const z of [-927, -1066, -1138]) put(lamps, z, 'east', 'swan-neck');
  return { medians, kerbs, pavers, parking, trees, lamps, source: DANDALOO_STREETSCAPE_EVIDENCE };
}
