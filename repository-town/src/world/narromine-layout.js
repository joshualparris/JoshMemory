// Narromine, a separate town reached by driving west along the Mitchell Highway (A32).
// Pure data (no three.js) so driving, collision and tests share one source.
//
// The town is the real one: streets, buildings, parks, rail, water and named places come from
// an OpenStreetMap export (narromine-osm-data.js, made by tools/narromine-osm.mjs;
// map data © OpenStreetMap contributors, ODbL). Only the drive between the towns is compressed:
// the real Dubbo–Narromine trip is about 40 km (≈30 min); the game road is about 2.5 km
// (≈90 s at 100 km/h) and its signs state the real distance. It meets the real Mitchell Highway
// at the eastern edge of the export, from where the highway becomes Dandaloo Street.
// Facts and sources: docs/NARROMINE_RESEARCH_AND_PLAN_2026-11-03.md.
import { NARROMINE_OSM as OSM } from './narromine-osm-data.js';
import {NSW_GIS_STREETS,NSW_PUBLIC_PLACES,NSW_UNLOCATED_PUBLIC_PLACES,
  DANDALOO_HERITAGE_MEDIAN,NSW_GIS_PROVENANCE} from './narromine-nsw-mapping.js';
export { OSM };
import { ROYAL_HOTEL } from './narromine-royal-data.js';

export const HIGHWAY_Z = -7;                 // continues Repository Town's Street 4
export const HIGHWAY = Object.freeze({ id: 'mitchell-highway', name: 'Mitchell Highway (A32)', x0: -2870, x1: -343, z: HIGHWAY_Z, width: 9, speed: 100 });
// Map metres (x east, z south) → game world: the export's highway edge sits at the road's west end.
export const OFFSET = Object.freeze({ x: HIGHWAY.x0, z: HIGHWAY_Z });
export const toWorld = ([x, z]) => [OFFSET.x + x, OFFSET.z + z];
// Latitude/longitude → game world, with the same projection the OpenStreetMap converter used.
const RAD = Math.PI / 180, EARTH = 6371008.8, COS_ANCHOR = Math.cos(OSM.anchor.lat * RAD);
export const geoToWorld = (lat, lon) => toWorld([(lon - OSM.anchor.lon) * RAD * EARTH * COS_ANCHOR, -(lat - OSM.anchor.lat) * RAD * EARTH]);
const E = OSM.extent;
const mappedPoints=NSW_GIS_STREETS.flatMap(r=>r.pts);
export const REGION = Object.freeze({
 x0:Math.min(OFFSET.x+E.x0-40,...mappedPoints.map(p=>p[0]))-40,
 x1:OFFSET.x+Math.max(E.x1,0)+40, // keep original highway's region seam open
 z0:Math.min(OFFSET.z+E.z0-40,...mappedPoints.map(p=>p[1]))-40,
 z1:Math.max(OFFSET.z+E.z1+40,...mappedPoints.map(p=>p[1]))+40
});
export const CORRIDOR_HALF = 45;             // fenced paddock strip either side of the highway

// Real streets in world coordinates, as polylines with a carriageway width.
// NSW authoritative centreline coordinates win over older OSM road layout.
// Keep OSM's service lanes and tracks (missing from NSW road-centreline layer),
// and the source OSM road edge that physically meets the compressed highway.
const nswNames=new Set(NSW_GIS_STREETS.map(x=>x.name.toLowerCase()));
const originalOSM=OSM.roads.filter(r=>r.kind==='service'||r.kind==='track'||
   (!nswNames.has(String(r.name).toLowerCase())&&r.name)||
   (r.name==='Mitchell Highway'&&r.pts.some(([x,z])=>Math.hypot(x,z)<2)))
 .map(r=>Object.freeze({name:r.name,kind:r.kind,width:r.width,pts:r.pts.map(toWorld),source:'OpenStreetMap ODbL'}));
export const STREETS=Object.freeze([...NSW_GIS_STREETS,...originalOSM]);
export {NSW_GIS_STREETS,NSW_PUBLIC_PLACES,NSW_UNLOCATED_PUBLIC_PLACES,
 DANDALOO_HERITAGE_MEDIAN,NSW_GIS_PROVENANCE};

// Spatial grid of road segments so "is this point on a road?" stays cheap every frame.
const CELL = 40, grid = new Map();
const key = (cx, cz) => cx + ',' + cz;
for (const s of STREETS) for (let i=1;i<s.pts.length;i++){
 const [ax,az]=s.pts[i-1],[bx,bz]=s.pts[i],len=Math.hypot(bx-ax,bz-az);
 if(len<.01)continue;
 const offsets=s.divided?[-DANDALOO_HERITAGE_MEDIAN.laneOffsetsEstimatedMetres,
                             DANDALOO_HERITAGE_MEDIAN.laneOffsetsEstimatedMetres]:[0];
 for(const offset of offsets){
   const nx=(bz-az)/len,nz=-(bx-ax)/len;
   const x0=ax+nx*offset,z0=az+nz*offset,x1=bx+nx*offset,z1=bz+nz*offset;
   const pad=s.width/2+0.5;
   for(let cx=Math.floor((Math.min(x0,x1)-pad)/CELL);cx<=Math.floor((Math.max(x0,x1)+pad)/CELL);cx++)
    for(let cz=Math.floor((Math.min(z0,z1)-pad)/CELL);cz<=Math.floor((Math.max(z0,z1)+pad)/CELL);cz++){
      const k=key(cx,cz);if(!grid.has(k))grid.set(k,[]);
      grid.get(k).push({ax:x0,az:z0,bx:x1,bz:z1,half:pad,source:s.source});
    }
 }
}
const segDist = (x, z, s) => { const dx = s.bx - s.ax, dz = s.bz - s.az, l = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((x - s.ax) * dx + (z - s.az) * dz) / l)); return Math.hypot(x - s.ax - t * dx, z - s.az - t * dz); };
export const onTownStreet = (x, z) => (grid.get(key(Math.floor(x / CELL), Math.floor(z / CELL))) || []).some((s) => segDist(x, z, s) <= s.half);
export const nearTownStreet = (x, z, margin) => (grid.get(key(Math.floor(x / CELL), Math.floor(z / CELL))) || []).some((s) => segDist(x, z, s) <= s.half + margin);
const medianSegments=NSW_GIS_STREETS.filter(s=>s.divided).map(s=>{
 const [[ax,az],[bx,bz]]=s.pts;return {ax,az,bx,bz};
});
export function onDandalooGardenMedian(x,z,radius=0){
 if(!Number.isFinite(x)||!Number.isFinite(z))return false;
 const onMedian=medianSegments.some(m=>{
  if(x<Math.min(m.ax,m.bx)-5||x>Math.max(m.ax,m.bx)+5 ||
     z<Math.min(m.az,m.bz)-5||z>Math.max(m.az,m.bz)+5)return false;
  return segDist(x,z,m)<DANDALOO_HERITAGE_MEDIAN.widthEstimatedMetres/2+radius;
 });
 if(!onMedian)return false;
 // An ordinary mapped cross street traversing the real Dandaloo junction must
 // remain passable; don't accidentally obstruct the legal intersections.
 const crossing=NSW_GIS_STREETS.some(r=>r.name!=='Dandaloo Street'&&r.pts.some(([px,pz])=>
  Math.abs(px-x)<16&&Math.abs(pz-z)<16)&&
  r.pts.slice(1).some(([bx,bz],i)=>segDist(x,z,{ax:r.pts[i][0],az:r.pts[i][1],bx,bz})<r.width/2+2));
 return !crossing;
}


const inRect = (b, x, z) => x >= b.x0 && x <= b.x1 && z >= b.z0 && z <= b.z1;
export const HIGHWAY_RECT = Object.freeze({ x0: HIGHWAY.x0 - 1, x1: HIGHWAY.x1, z0: HIGHWAY.z - HIGHWAY.width / 2 - 0.5, z1: HIGHWAY.z + HIGHWAY.width / 2 + 0.5 });
// The open highway between the towns (100 km/h): not the town end of Street 4 or Narromine's streets.
export const onOpenHighway = (x, z) => x > HIGHWAY.x0 + 40 && x < -400 && Math.abs(z - HIGHWAY.z) <= HIGHWAY.width / 2 + 0.5;
export const onNarromineRoad = (x, z) => inRect(HIGHWAY_RECT, x, z) || (x < REGION.x1 && onTownStreet(x, z));

// Buildings in world coordinates. Unnamed outlines stay unnamed; private homes were stripped of
// names and addresses by the converter.
// Buildings modelled in detail from aerial imagery and the cadastre (see narromine-royal-data.js).
export const DETAILED = Object.freeze([{ id: 'royal-hotel', name: 'Royal Hotel', address: '123 Dandaloo Street',
  boundary: ROYAL_HOTEL.boundary.map(([lat, lon]) => geoToWorld(lat, lon)),
  parts: Object.fromEntries(Object.entries(ROYAL_HOTEL.parts).map(([k, pts]) => [k, pts.map(([lat, lon]) => geoToWorld(lat, lon))])),
  trees: ROYAL_HOTEL.trees.map(([lat, lon]) => geoToWorld(lat, lon)) }]);
export const BUILDINGS = Object.freeze(OSM.buildings.map((b) => Object.freeze({ ...b, pts: b.pts.map(toWorld) })));
export const AREAS = Object.freeze(OSM.areas.map((a) => Object.freeze({ ...a, pts: a.pts.map(toWorld) })));
export const WATER = Object.freeze(OSM.water.map((w) => Object.freeze({ ...w, pts: w.pts.map(toWorld) })));
export const RAIL = Object.freeze(OSM.rail.map((r) => Object.freeze({ pts: r.pts.map(toWorld) })));
export function polyRect(pts) {
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (const [x, z] of pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z); }
  return { x0, x1, z0, z1 };
}

// Spelling corrections for the map data, and sourced history for places that have it.
const NAME_FIX = { 'Narromine Aviation Muesum': 'Narromine Aviation Museum', 'Narrmine Physiotherapy': 'Narromine Physiotherapy' };
const FACTS = {
  'Royal Hotel': 'Built in 1890; once a Cobb & Co coach stop. (Aussietowns)',
  'Narromine Hotel': 'Built in 1901 as the Federal Hotel; known for the iron lace on its upper veranda. (Aussietowns)',
  'The Court House Hotel': 'First established by David Fitch in 1889, on the corner of Burraway and Merilba Streets. (Aussietowns)',
  'Narromine Aviation Museum': 'Opened in 2002 at the aerodrome, home of RAAF No. 5 Elementary Flying Training School (1940–44), where about 2,800 pilots trained. Exhibits include a CAC Sabre and a flying Wright Flyer replica. (Narromine Aviation Museum / AWM)',
  'Tom Perry Park': 'Home of a Glenn McGrath statue. (Wikipedia)',
};
const KIND_LABEL = (k) => String(k || 'place').replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
// Dated OSM named places remain available where government address data has
// not confirmed them. Replace official-match names/positions with NSW GURAS
// property coordinates, especially Coles (directory 76 vs older OSM 82).
const aliases=new Map([
 ['coles','Coles'],['narromine post office','Narromine Post Office'],
 ['macquarie regional library','Narromine Library & Local History Room'],
 ['narromine health centre','Narromine Health Service'],
 ['zest','Zest by Modern Foodie'],['narromine hotel','Narromine Hotel'],
 ['royal hotel','Royal Hotel'],['imperial hotel','Imperial Hotel'],
 ['vinnies','Vinnies'],['narromine pharmacy','Narromine Pharmacy'],
 ['macquarie clothing','Macquarie Clothing'],['the abbey','The Abbey']
]);
const currentNames=new Set(NSW_PUBLIC_PLACES.map(p=>p.name.toLowerCase()));
const datedOSM=OSM.places.map(p=>{
 const name=NAME_FIX[p.name]||p.name,[x,z]=toWorld([p.x,p.z]);
 const address=p.number&&p.street?`${p.number} ${p.street}`:p.street;
 return {name,kind:p.kind,kindLabel:KIND_LABEL(p.kind),address,x,z,fact:FACTS[name]||'',
   provenance:'OpenStreetMap dated 2026-11-03, current operating status unverified'};
}).filter(p=>!currentNames.has((aliases.get(p.name.toLowerCase())||p.name).toLowerCase()));
export const PLACES=Object.freeze([
 ...datedOSM,
 ...NSW_PUBLIC_PLACES.map(p=>Object.freeze({...p,
   kindLabel:KIND_LABEL(p.kind),address:p.address.replace(/ NARROMINE$/,''),
   fact:FACTS[p.name]||p.fact,
   provenance:'NSW government GURAS property-address point and public visitor directory, current trade status unverified'}))
]);

// Arrival: the Royal Hotel's footpath on Dandaloo Street (search "Narromine" lands here).
const royal = PLACES.find((p) => p.name === 'Royal Hotel');
export const ARRIVAL = Object.freeze(royal ? { x: royal.x + 12, z: royal.z, yaw: 0 } : { x: OFFSET.x - 1900, z: OFFSET.z - 600, yaw: 0 });

// Invisible fences: the highway corridor and Narromine's region, open only where the road runs.
export function boundaryColliders() {
  const t = 5, gap = CORRIDOR_HALF, z = HIGHWAY_Z, R = REGION;
  return [
    { x0: R.x1, x1: -1490, z0: z - gap - t, z1: z - gap }, { x0: R.x1, x1: -1490, z0: z + gap, z1: z + gap + t },
    { x0: R.x0 - t, x1: R.x0, z0: R.z0, z1: R.z1 },
    { x0: R.x0, x1: R.x1, z0: R.z0 - t, z1: R.z0 }, { x0: R.x0, x1: R.x1, z0: R.z1, z1: R.z1 + t },
    { x0: R.x1, x1: R.x1 + t, z0: R.z0, z1: z - gap }, { x0: R.x1, x1: R.x1 + t, z0: z + gap, z1: R.z1 },
  ];
}

// ── Stand-ins where the map has no outline (marked `generic`) ─────────────────────────────
// OpenStreetMap has every street but only some buildings: most houses and several shopfronts
// are unmapped. So that the town reads as the real one, the game adds:
//  • a shopfront at each named place that has no mapped outline, facing its nearest street;
//  • plain houses along residential streets, kept clear of mapped buildings, places, parks,
//    schools, sports grounds, water and other roads.
// These are placed from the map but are not surveyed; they are never named.
export const inPoly = (x, z, pts) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, zi] = pts[i], [xj, zj] = pts[j]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c; } return c; };
const centre = (pts) => pts.reduce((a, p) => [a[0] + p[0] / pts.length, a[1] + p[1] / pts.length], [0, 0]);
const BUILDING_CENTRES = BUILDINGS.map((b) => ({ c: centre(b.pts), r: polyRect(b.pts), pts: b.pts }));
const nearMapped = (x, z, d) => BUILDING_CENTRES.some((b) => x > b.r.x0 - d && x < b.r.x1 + d && z > b.r.z0 - d && z < b.r.z1 + d);
const KEEP_CLEAR = new Set(['park', 'pitch', 'golf_course', 'cemetery', 'school', 'sports_centre', 'swimming_pool', 'track', 'parking', 'industrial', 'retail', 'farmyard']);
const inDetailed = (x, z) => DETAILED.some((d) => inPoly(x, z, d.boundary));
const inArea = (x, z) => inDetailed(x, z) || AREAS.some((a) => KEEP_CLEAR.has(a.kind) && inPoly(x, z, a.pts)) || WATER.some((w) => w.closed && inPoly(x, z, w.pts));
export function nearestSegment(x, z) {
  let best = null;
  for (const s of STREETS) for (let i = 1; i < s.pts.length; i++) {
    const [ax, az] = s.pts[i - 1], [bx, bz] = s.pts[i], dx = bx - ax, dz = bz - az, l = dx * dx + dz * dz || 1;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l)), px = ax + t * dx, pz = az + t * dz, d = Math.hypot(x - px, z - pz);
    if (!best || d < best.d) best = { d, px, pz, s, angle: Math.atan2(dz, dx) };
  }
  return best;
}
// Box with centre, size along/across the street, rotation (yaw about y), and its world AABB.
const placed = [];
const footprint = (cx, cz, w, d, yaw) => { const c = Math.cos(yaw), s = Math.sin(yaw), hx = Math.abs(c) * w / 2 + Math.abs(s) * d / 2, hz = Math.abs(s) * w / 2 + Math.abs(c) * d / 2; return { x0: cx - hx, x1: cx + hx, z0: cz - hz, z1: cz + hz }; };
const overlapsPlaced = (r) => placed.some((q) => r.x0 < q.x1 && r.x1 > q.x0 && r.z0 < q.z1 && r.z1 > q.z0);
const clearOfStreets = (r) => { for (let x = r.x0; x <= r.x1; x += 2) for (let z = r.z0; z <= r.z1; z += 2) if (nearTownStreet(x, z, 1.5)) return false; return true; };

// Fidelity contract: do not fabricate shop buildings or private houses where
// building outlines are missing. Only actual OSM geometry and NSW address/lot
// references may be shown. Unmapped buildings are a documented research gap.
export const FILL_SHOPS=Object.freeze([]);
export const FILL_HOUSES=Object.freeze([]);

// Main-street frontages of mapped buildings: the outline edge facing a through street within
// 14 m gets a veranda; a named place inside the outline names it. Map-derived, not surveyed.
export const FRONTAGES = Object.freeze(BUILDINGS.flatMap((b, bi) => {
  let best = null;
  for (let i = 0; i < b.pts.length; i++) {
    const [ax, az] = b.pts[i], [bx, bz] = b.pts[(i + 1) % b.pts.length], len = Math.hypot(bx - ax, bz - az);
    if (len < 5) continue;
    const n = nearestSegment((ax + bx) / 2, (az + bz) / 2);
    if (!n || n.d > 14 || !/^(trunk|primary|secondary|tertiary)$/.test(n.s.kind)) continue;
    // The edge must run roughly along the street.
    const along = Math.abs(Math.cos(Math.atan2(bz - az, bx - ax) - n.angle));
    if (along < 0.85) continue;
    if (!best || n.d < best.d) best = { a: [ax, az], b: [bx, bz], d: n.d, street: n.s.name, toward: [n.px - (ax + bx) / 2, n.pz - (az + bz) / 2] };
  }
  if (!best) return [];
  const named = PLACES.find((p) => inPoly(p.x, p.z, b.pts));
  return [Object.freeze({ building: bi, ...best, name: named?.name || '' })];
}));
