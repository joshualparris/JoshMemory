// Narromine, a separate town reached by driving west along the Mitchell Highway (A32).
// Pure data (no three.js) so driving, collision and tests share one source.
//
// Scale: the real Dubbo–Narromine drive is about 40 km (≈30 min). The game compresses it to
// about 2.5 km (≈90 s at 100 km/h); signs still state the real distance. Narromine sits in its
// own region far west of Repository Town, outside the town's boundary walls, and is drawn only
// when the player is near (see narromine.js). The street layout is a simplified game layout,
// not a survey: Dandaloo Street (the main street) continues the highway and Burraway Street
// crosses it. Facts and sources: docs/NARROMINE_RESEARCH_AND_PLAN_2026-11-03.md.

export const HIGHWAY_Z = -7;                 // continues Repository Town's Street 4
export const HIGHWAY = Object.freeze({ id: 'mitchell-highway', name: 'Mitchell Highway (A32)', x0: -2870, x1: -343, z: HIGHWAY_Z, width: 9, speed: 100 });
export const REGION = Object.freeze({ x0: -3300, x1: -2860, z0: -260, z1: 250 });
export const CORRIDOR_HALF = 45;             // fenced paddock strip either side of the highway
export const STREETS = Object.freeze([
  { id: 'dandaloo-street', name: 'Dandaloo Street', a: { x: -3240, z: HIGHWAY_Z }, b: { x: -2860, z: HIGHWAY_Z }, width: 14, speed: 50 },
  { id: 'burraway-street', name: 'Burraway Street', a: { x: -3050, z: -200 }, b: { x: -3050, z: 190 }, width: 10, speed: 50 },
]);
export const ARRIVAL = Object.freeze({ x: -2960, z: HIGHWAY_Z + 10, yaw: -Math.PI / 2 }); // footpath, facing up Dandaloo St

const rect = (x0, x1, z0, z1) => Object.freeze({ x0: Math.min(x0, x1), x1: Math.max(x0, x1), z0: Math.min(z0, z1), z1: Math.max(z0, z1) });
// Driveable rectangles (the same form as masterplan DRIVEABLE_RECTS), padded 0.5 m.
export const NARROMINE_DRIVEABLE = Object.freeze([
  rect(HIGHWAY.x0, HIGHWAY.x1, HIGHWAY.z - HIGHWAY.width / 2 - 0.5, HIGHWAY.z + HIGHWAY.width / 2 + 0.5),
  ...STREETS.map((s) => s.a.z === s.b.z
    ? rect(s.a.x - 0.5, s.b.x + 0.5, s.a.z - s.width / 2 - 0.5, s.a.z + s.width / 2 + 0.5)
    : rect(s.a.x - s.width / 2 - 0.5, s.a.x + s.width / 2 + 0.5, s.a.z - 0.5, s.b.z + 0.5)),
]);
// The open highway between the towns (100 km/h): not the town end of Street 4 or Narromine's streets.
export const onOpenHighway = (x, z) => x > HIGHWAY.x0 + 40 && x < -400 && Math.abs(z - HIGHWAY.z) <= HIGHWAY.width / 2 + 0.5;
export const onNarromineRoad = (x, z) => NARROMINE_DRIVEABLE.some((b) => x >= b.x0 && x <= b.x1 && z >= b.z0 && z <= b.z1);

// Main-street buildings, north (frontage z = -17, building extends north/-z) and south
// (frontage z = +3, extends south/+z) of Dandaloo Street, and on Burraway Street's west side.
// `fact` is shown when the player stands at the door; every fact is sourced in the research doc.
export const BUILDINGS = Object.freeze([
  { id: 'royal-hotel', name: 'Royal Hotel', side: 'north', x: -2985, w: 26, d: 18, storeys: 1, colour: 0xc9b48f, veranda: true,
    fact: 'Royal Hotel, built 1890 — once a Cobb & Co coach stop. (Aussietowns)' },
  { id: 'narromine-hotel', name: 'Narromine Hotel', side: 'north', x: -3120, w: 24, d: 18, storeys: 2, colour: 0xd6c3a0, veranda: true, ironLace: true,
    fact: 'Narromine Hotel, built 1901 as the Federal Hotel, known for the iron lace on its upper veranda. (Aussietowns)' },
  { id: 'shops-n1', name: 'Dandaloo Street shops', side: 'north', x: -2930, w: 30, d: 14, storeys: 1, colour: 0xb7a58a, veranda: true, fact: 'Country main-street shops with street verandas.' },
  { id: 'shops-n2', name: 'Dandaloo Street shops', side: 'north', x: -3185, w: 34, d: 14, storeys: 1, colour: 0xa9b29a, veranda: true, fact: 'Country main-street shops with street verandas.' },
  { id: 'shops-s1', name: 'Dandaloo Street shops', side: 'south', x: -2950, w: 40, d: 14, storeys: 1, colour: 0xbfae94, veranda: true, fact: 'Country main-street shops with street verandas.' },
  { id: 'shops-s2', name: 'Dandaloo Street shops', side: 'south', x: -3150, w: 40, d: 14, storeys: 1, colour: 0xc2b9a4, veranda: true, fact: 'Country main-street shops with street verandas.' },
  { id: 'visitor-centre', name: 'Visitor Information Centre', side: 'burraway', z: -60, w: 14, d: 16, storeys: 1, colour: 0xd8cdb4,
    fact: 'Visitor information. The old Court House next door is the town museum. (Aussietowns)' },
  { id: 'court-house', name: 'Old Court House — town museum', side: 'burraway', z: -84, w: 18, d: 20, storeys: 1, colour: 0xb9764f, veranda: true,
    fact: 'The old Court House on Burraway Street, between the visitor centre and the police station, houses the town museum. (Aussietowns)' },
  { id: 'police-station', name: 'Police Station', side: 'burraway', z: -110, w: 16, d: 16, storeys: 1, colour: 0xa7aeb5, fact: 'Narromine Police Station.' },
]);
// The Soldiers' Wall memorial on Dandaloo Street (Visit NSW / Aussietowns).
export const MEMORIAL = Object.freeze({ id: 'soldiers-wall', name: "Narromine Soldiers' Wall", x: -3020, z: HIGHWAY_Z + 12, w: 9,
  fact: "Narromine Soldiers' Wall, Dandaloo Street — a memorial wall honouring those who served in war. (Visit NSW)" });

// Rectangular footprint (world space) of a building, for colliders and placement.
export function buildingRect(b) {
  if (b.side === 'burraway') { const x1 = -3050 - 5 - 3, x0 = x1 - b.d; return rect(x0, x1, b.z - b.w / 2, b.z + b.w / 2); }
  const front = b.side === 'north' ? HIGHWAY_Z - 10 : HIGHWAY_Z + 10;
  return b.side === 'north' ? rect(b.x - b.w / 2, b.x + b.w / 2, front - b.d, front) : rect(b.x - b.w / 2, b.x + b.w / 2, front, front + b.d);
}
// Where to stand to read a building's fact: the footpath in front of its door.
export function buildingDoor(b) {
  if (b.side === 'burraway') return { x: -3050 - 5 - 1.5, z: b.z };
  return { x: b.x, z: b.side === 'north' ? HIGHWAY_Z - 8.5 : HIGHWAY_Z + 8.5 };
}

// Invisible fences: the highway corridor and Narromine's region, open only where the road runs.
export function boundaryColliders() {
  const t = 5, gap = CORRIDOR_HALF, z = HIGHWAY_Z, R = REGION;
  return [
    // corridor sides from Repository Town's west wall to Narromine's east edge
    { x0: R.x1, x1: -1490, z0: z - gap - t, z1: z - gap }, { x0: R.x1, x1: -1490, z0: z + gap, z1: z + gap + t },
    // Narromine region: west, north, south walls; east wall with the corridor opening
    { x0: R.x0 - t, x1: R.x0, z0: R.z0, z1: R.z1 },
    { x0: R.x0, x1: R.x1, z0: R.z0 - t, z1: R.z0 }, { x0: R.x0, x1: R.x1, z0: R.z1, z1: R.z1 + t },
    { x0: R.x1, x1: R.x1 + t, z0: R.z0, z1: z - gap }, { x0: R.x1, x1: R.x1 + t, z0: z + gap, z1: R.z1 },
  ];
}
