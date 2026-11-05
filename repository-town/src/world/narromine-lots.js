// Decodes the generated cadastre lot outlines (narromine-lots-data.js, made by tools/narromine-lots.mjs).
// Pure data (no three.js). Points are local map metres (x east, z south); apply toWorld() from
// narromine-layout.js for game-world coordinates. These are legal parcel boundaries, NOT fences or buildings.
import { NARROMINE_LOTS } from './narromine-lots-data.js';

export function decodeLots(data = NARROMINE_LOTS) {
  return data.lots.map(([lot, plan, d]) => {
    let x = d[0], z = d[1]; const pts = [[x / 10, z / 10]];
    for (let i = 2; i < d.length; i += 2) { x += d[i]; z += d[i + 1]; pts.push([x / 10, z / 10]); }
    return { lot, plan, label: lot ? `${lot}//${plan}` : plan, pts };
  });
}
let cache = null;
export const narromineLots = () => cache || (cache = decodeLots());
export { NARROMINE_LOTS };
