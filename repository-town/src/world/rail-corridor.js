// Fictional Repository Town railway geometry and visual protection envelope.
// Metres in world space. These are explicit *game design* buffers, not an
// engineering sign-off or a substitute for AS 7633:2026 structure-gauge checks.
export const RAIL_Z = 7 * 46 - 3.5 * 46 - 17; // 144: between street 7 and row-8 rear lots
export const RAIL_GAUGE = 1.435;
export const RAIL_STRUCTURE_HALF_WIDTH = 3.5;
export const RAIL_LAMP_MIN_DISTANCE = 5.5;
export const CROSSING_HALF_DECK = 4.5;
export const RAIL_CROSSINGS = Object.freeze([0,5,10,15,20,25].map(col =>
  Object.freeze({x:(col-13)*26, z:RAIL_Z, avenue:col})));
export function permittedTracksideLight(z,margin=RAIL_LAMP_MIN_DISTANCE) {
  return Math.abs(z - RAIL_Z) >= margin;
}
// Keep detached sheds, clotheslines and animal/yard props away from the train.
// Conservatively include the prop's full depth and one extra metre of margin.
export function railSideYardClear(z,depth=0) {
  return Math.abs(z-RAIL_Z) >= RAIL_STRUCTURE_HALF_WIDTH + depth/2 + 1;
}
export function withinLevelCrossing(x,extra=0) {
  return RAIL_CROSSINGS.some(c => Math.abs(x-c.x)<CROSSING_HALF_DECK+extra);
}
// The locomotive x is the front of a ~60 m train extending 54 m to the west.
// Gates begin warning while the train is still ~60 m short of the crossing,
// and stay closed until the last carriage clears. Never signal a train during
// its stationary, depot dwell interval (07:00–07:20 game clock).
export function railCrossingClosed(trainFrontX,crossingX,moving=true) {
  return moving && Number.isFinite(trainFrontX) &&
    trainFrontX + 6 >= crossingX - 60 &&
    trainFrontX - 54 <= crossingX + 60;
}
