// Phase 1 provisional registration of Josh's 3 Nov 2026 commercial diagram.
// This is a CADASTRE-BOUNDED SCHEMATIC FIT, *not* an orthophoto control-point survey.
// Pixels refer to the original 619 x 459 plan screenshot (not a cropped/resized image).
// IMPORTANT: the diagram has 1–5, 8–10 as distinct dark/pink units, while '6–7'
// appears INSIDE THE BLUE COLES/MAJOR TENANCY outline. Do not manufacture two
// separate exterior shop buildings for 6 and 7 from this evidence.
const imageSize = Object.freeze([619, 459]);
// Map schematic horizontal direction to actual north/south parcel separation;
// map diagram top (rear car park) toward actual west and bottom toward eastern
// Dandaloo frontage. Bound using four existing cadastral parcel corners.
// These ties are a *visual fit* to the 76 Dandaloo boundary and not measured
// homologous plan/orthophoto control points. Residual error is unknown.
export const KIERATHS_SCHEMATIC_TIES = Object.freeze([
  { pixel: [341, 390], geo: [-32.2323505, 148.2393169], description: 'south side / street end, 76 parcel' },
  { pixel: [426, 390], geo: [-32.2321954, 148.2393443], description: 'north side / street end, 76 parcel' },
  { pixel: [341, 177], geo: [-32.2322446, 148.2384965], description: 'south side / rear end, 76 parcel' },
  { pixel: [426, 177], geo: [-32.2320939, 148.2385461], description: 'north side / rear end, 76 parcel' },
]);
const interp = (a, b, t) => a + (b - a) * t;
export function schematicPixelToGeo([px, py]) {
  const u = (px - 341) / (426 - 341), v = (py - 177) / (390 - 177);
  // Bilinear map of the cadastral parcel quadrilateral.
  // No exact door coordinate accuracy is claimed.
  const [sStreet, nStreet, sRear, nRear] = KIERATHS_SCHEMATIC_TIES.map(p => p.geo);
  const south = sRear.map((val, i) => interp(val, sStreet[i], v));
  const north = nRear.map((val, i) => interp(val, nStreet[i], v));
  return south.map((val, i) => interp(val, north[i], u));
}
const rect = (x0, y0, x1, y1) => [[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
// Traced to approximately 2–5 pixels from the user-supplied small screenshot;
// angled details are polygon outlines only. Listed IDs are plan labels, NOT
// claims about modern tenants, surveyed lease lines, or verified door locations.
export const KIERATHS_SCHEMATIC_UNITS = Object.freeze([
  { id: '1', pixel: rect(341,359,370,390), provenance: 'pink small unit at street edge' },
  { id: '2', pixel: [[341,329],[354,329],[370,344],[370,359],[341,359]], provenance: 'angled unit alongside blue major tenancy' },
  { id: '3', pixel: [[370,299],[386,283],[400,301],[400,329],[371,329],[360,315]], provenance: 'angled central unit' },
  { id: '4', pixel: [[400,303],[426,303],[426,362],[412,362],[398,349]], provenance: 'right-hand central unit' },
  { id: '5', pixel: rect(371,283,426,303), provenance: 'narrow central unit' },
  { id: '6–7', pixel: [[341,177],[371,177],[371,284],[357,300],[341,300]], provenance: 'numbering appears within blue major tenancy, not separately outlined shops', ambiguous: true },
  { id: '8', pixel: rect(371,271,426,283), provenance: 'thin unit south of 9' },
  { id: '9', pixel: rect(371,250,426,271), provenance: 'middle northern unit' },
  { id: '10', pixel: rect(371,177,426,217), provenance: 'large rear-side unit near parking' },
]);
export const KIERATHS_SCHEMATIC_REGISTRATION = Object.freeze({
  imageSize,
  controlPointType: 'PROVISIONAL VISUAL PARCEL-CORNER FIT',
  surveyed: false,
  measuredRmsResidualMetres: null,
  accuracy: 'unknown',
  planRightIs: 'north / toward Post Office',
  planBottomIs: 'east / Dandaloo Street',
  planTopIs: 'west / rear parking',
  note: 'Not a metric floor plan. Distances in the diagram may be distorted or schematised.',
});
