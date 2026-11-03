// Kierath's Shopping Square, Narromine: plan-grounded approximate geometry, NOT a survey.
// Site plan: supplied 3 Nov 2026 (Coles M01, shop units 1–10, kiosk, PO, rear P).
// NSW aerial/cadastre in narromine-buildings-data.js fixes the real parcel and orientation.
// Coordinates below are LOCAL METRES: x east, z south, anchored near the centre of 82 Dandaloo.
// No photographed tenants are asserted current; no external photos/textures are embedded.
export const KIERATHS_ORIGIN = Object.freeze({ lat: -32.2325, lon: 148.2392 });
const METRES_PER_DEGREE = 111195;
const EAST_METRES_PER_DEGREE = METRES_PER_DEGREE * Math.cos(KIERATHS_ORIGIN.lat * Math.PI / 180);
export const siteToGeo = ([x, z]) => [KIERATHS_ORIGIN.lat - z / METRES_PER_DEGREE, KIERATHS_ORIGIN.lon + x / EAST_METRES_PER_DEGREE];

// The site plan establishes TOPOLOGY, but isn't a survey drawing. These aisle alignments
// approximate the skew of the mapped 76 Dandaloo parcel and allow unobstructed walking.
// Rear (car park) to front (Dandaloo Street), with a bend at the shop-court junction.
export const KIERATHS_ROUTE = Object.freeze([
  [-48, -33.6], [-42, -33.0], [-36, -32.2], [-31, -31.0],
  [-22, -29.2], [-14, -27.7], [-9, -25.6], [0, -23.5], [10.5, -21.2],
].map(p => Object.freeze(p)));

// Quads: shop fronts face a continuous open-air passage. The ten shop identifiers are
// unit references from the commercial diagram, not claims about current shop operators.
const centreZ = x => -31.0 + (x + 33) * 0.21;
const BAYS = [
  // The plan puts the earlier units nearer Dandaloo/Coles and later units to the rear.
  { number: 1, side: 'south', x0: 2.5, x1: 8.5, depth: 2.4 },
  { number: 2, side: 'south', x0: -4.5, x1: 2.3, depth: 2.9 },
  { number: 3, side: 'south', x0: -11.5, x1: -4.7, depth: 3.3 },
  { number: 4, side: 'south', x0: -18.8, x1: -11.7, depth: 3.8 },
  { number: 5, side: 'south', x0: -28.2, x1: -19.0, depth: 4.5 },
  { number: 6, side: 'north', x0: -6.5, x1: -1.2, depth: 6.2 },
  { number: 7, side: 'north', x0: -12.6, x1: -6.7, depth: 6.1 },
  { number: 8, side: 'north', x0: -19.0, x1: -12.8, depth: 6.0 },
  { number: 9, side: 'north', x0: -25.0, x1: -19.2, depth: 5.8 },
  { number: 10, side: 'north', x0: -31.0, x1: -25.2, depth: 5.5 },
];
const HALF_AISLE = 2.35;
export const KIERATHS_SHOPS = Object.freeze(BAYS.map(b => {
  const z = x => centreZ(x) + (b.side === 'south' ? HALF_AISLE : -HALF_AISLE);
  const back = x => z(x) + (b.side === 'south' ? b.depth : -b.depth);
  return Object.freeze({ ...b, pts: Object.freeze([
    [b.x0, z(b.x0)], [b.x1, z(b.x1)],
    [b.x1, back(b.x1)], [b.x0, back(b.x0)],
  ].map(p => Object.freeze(p))) });
}));

// The small circular street-end kiosk is separate from the 10 retail bays.
export const KIERATHS_KIOSK = Object.freeze({ at: [6.4, -29.1], radius: 1.45, height: 2.75 });
// The arched rear canopy replaces the former mistaken "curved-roof shed" solid.
// Spans across the rear arcade entrance; posts stay outside the walking channel.
export const KIERATHS_CANOPY = Object.freeze({
  back: [-43.0, -33.0], front: [-32.3, -31.0], width: 8.0, eaves: 3.25, crown: 5.25,
});
// Source-grounded rear car park; parking stripes / equipment positions are approximations.
export const KIERATHS_REAR_PARKING = Object.freeze([
  [-59.5, -43.6], [-43.1, -41.1], [-43.0, -28.2], [-62.0, -30.4],
].map(p => Object.freeze(p)));
export const KIERATHS_PROVENANCE = Object.freeze({
  plan: 'Supplied commercial site plan: M01 2,157 m²; units 1–10, kiosk, Dandaloo frontage, rear parking and separate Post Office',
  aerial: 'NSW Spatial Services aerial & cadastral tracing already in narromine-buildings-data.js; local shop footprints and heights approximate',
  historical: 'Supplied exterior photographs, dates/current tenancy status not independently verified',
});
