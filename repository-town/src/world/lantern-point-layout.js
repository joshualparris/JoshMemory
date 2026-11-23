// Fictional shared-world geography. x points east; +z points south.
// Keep Repository Town at (0,0); like Narromine, distant travel is compressed in the game.
export const LANTERN_POINT = Object.freeze({
  id: 'parristan-lantern-point', name: 'Lantern Point', x: 0, z: 2870,
  source: 'Parristan Living Nation settlement #11',
  fictional: true,
  // 16.5 km is an illustrative straight-line separation, NOT a surveyed road.
  representedDistanceMetres: 16500, gameDistanceMetres: 2870,
  latitude: -32.273600 - 16500 / 111195, longitude: 148.408400,
  approach: Object.freeze({ x: 0, z: 2810, yaw: Math.PI }),
});
export const LANTERN_ROAD = Object.freeze({
  x: 0, entranceX: 338, startZ: 235, turnZ: 650, endZ: 3160, halfWidth: 5,
  crossStreets: Object.freeze([2760, 2990]), crossExtent: 180,
});
export function onLanternRoad(x, z) {
  if (!Number.isFinite(x) || !Number.isFinite(z)) return false;
  const northLeg = Math.abs(x - LANTERN_ROAD.entranceX) <= LANTERN_ROAD.halfWidth &&
    z >= LANTERN_ROAD.startZ && z <= LANTERN_ROAD.turnZ;
  const westTurn = x >= LANTERN_ROAD.x && x <= LANTERN_ROAD.entranceX &&
    Math.abs(z - LANTERN_ROAD.turnZ) <= LANTERN_ROAD.halfWidth;
  const southLeg = Math.abs(x - LANTERN_ROAD.x) <= LANTERN_ROAD.halfWidth &&
    z >= LANTERN_ROAD.turnZ && z <= LANTERN_ROAD.endZ;
  const cross = Math.abs(x) <= LANTERN_ROAD.crossExtent &&
    LANTERN_ROAD.crossStreets.some(roadZ => Math.abs(z - roadZ) <= 5);
  return northLeg || westTurn || southLeg || cross;
}
export const LANTERN_MAP_DESTINATION = Object.freeze({
  id: LANTERN_POINT.id, kind: 'region', name: LANTERN_POINT.name,
  x: LANTERN_POINT.x, z: LANTERN_POINT.z,
  address: 'Fictional Parristan settlement · south of Repository Town',
  fact: 'A 3D settlement linked to Parristan Living Nation. 16.5 km represented; the playable access road is compressed to about 2.9 km.',
});
