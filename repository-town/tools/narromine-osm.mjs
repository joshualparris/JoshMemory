// Converts an OpenStreetMap export of central Narromine into the compact game data module
// src/world/narromine-osm-data.js. Run: node tools/narromine-osm.mjs <map.osm>
//
// Map data © OpenStreetMap contributors, ODbL 1.0 (https://www.openstreetmap.org/copyright).
// The game credits OpenStreetMap wherever Narromine is shown.
//
// Privacy: private homes are never named. Any feature tagged as a house/residence, or whose
// name reads as someone's home ("…'s house", "residence"), loses its name and address; only its
// outline is kept. Businesses named after a person show their category, not the person's name.
import fs from 'node:fs';
import path from 'node:path';

const src = process.argv[2];
if (!src) { console.error('usage: node tools/narromine-osm.mjs <map.osm>'); process.exit(1); }
const xml = fs.readFileSync(src, 'utf8');

const attrs = (s) => Object.fromEntries([...s.matchAll(/(\w[\w:]*)="([^"]*)"/g)].map((m) => [m[1], m[2].replace(/&amp;/g, '&').replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')]));
const tagsOf = (body) => Object.fromEntries([...body.matchAll(/<tag ([^>]*)\/>/g)].map((m) => { const a = attrs(m[1]); return [a.k, a.v]; }));

const B = attrs(xml.match(/<bounds ([^>]*)\/>/)[1]);
const inBox = (n) => n && n.lat >= +B.minlat && n.lat <= +B.maxlat && n.lon >= +B.minlon && n.lon <= +B.maxlon;
const nodes = new Map(), poiNodes = [];
for (const m of xml.matchAll(/<node ([^>]*?)(\/>|>([\s\S]*?)<\/node>)/g)) {
  const a = attrs(m[1]); const n = { id: a.id, lat: +a.lat, lon: +a.lon, tags: m[3] ? tagsOf(m[3]) : {} };
  nodes.set(n.id, n); if (n.tags.name) poiNodes.push(n);
}
const ways = [];
for (const m of xml.matchAll(/<way ([^>]*?)>([\s\S]*?)<\/way>/g)) {
  const refs = [...m[2].matchAll(/<nd ref="(\d+)"/g)].map((r) => r[1]);
  ways.push({ id: attrs(m[1]).id, refs, tags: tagsOf(m[2]) });
}

// Anchor: the Mitchell Highway's easternmost node (the road from Dubbo) becomes the game's
// join with the highway from Repository Town. x = metres east, z = metres south (game -z is north).
const hwyNodes = ways.filter((w) => w.tags.name === 'Mitchell Highway').flatMap((w) => w.refs.map((r) => nodes.get(r)).filter(inBox));
if (!hwyNodes.length) throw new Error('No Mitchell Highway in this export');
const anchor = hwyNodes.reduce((a, b) => (b.lon > a.lon ? b : a));
const R = 6371008.8, k = Math.PI / 180, cosLat = Math.cos(anchor.lat * k);
const proj = (n) => [Math.round((n.lon - anchor.lon) * k * R * cosLat * 10) / 10, Math.round(-(n.lat - anchor.lat) * k * R * 10) / 10];
// Lines are clipped to the export box: runs of in-box nodes become separate pieces (the API
// returns whole ways, so the highway would otherwise run on to Dubbo).
const pieces = (w) => { const out = []; let cur = [];
  for (const r of w.refs) { const n = nodes.get(r); if (inBox(n)) cur.push(proj(n)); else { if (cur.length > 1) out.push(cur); cur = []; } }
  if (cur.length > 1) out.push(cur); return out; };
const line = (w) => { const all = w.refs.map((r) => nodes.get(r)); return all.every(inBox) ? all.map(proj) : []; };

const ROAD_WIDTH = { trunk: 10, primary: 9, secondary: 9, tertiary: 8, unclassified: 7, residential: 7, service: 4.5, living_street: 6, track: 3.5 };
const PRIVATE = (t) => /^(house|residential|detached|semidetached_house|bungalow)$/.test(t.building || '') || /\b(house|residence|home)\b/i.test(t.name || '') && !t.shop && !t.amenity && !t.tourism;
const PERSON_NAMED = (name) => /\bby [A-Z][a-z]+|photograph/i.test(name || '');
const b = B;
const out = { source: 'OpenStreetMap', licence: 'ODbL 1.0', attribution: '© OpenStreetMap contributors', exported: new Date().toISOString().slice(0, 10),
  bbox: { minlat: +b.minlat, minlon: +b.minlon, maxlat: +b.maxlat, maxlon: +b.maxlon }, anchor: { lat: anchor.lat, lon: anchor.lon },
  extent: null, roads: [], rail: [], water: [], areas: [], buildings: [], places: [] };

for (const w of ways) {
  const t = w.tags;
  if (t.highway && ROAD_WIDTH[t.highway]) { for (const pts of pieces(w)) out.roads.push({ name: t.name || '', kind: t.highway, width: ROAD_WIDTH[t.highway], pts }); continue; }
  if (t.railway === 'rail') { for (const pts of pieces(w)) out.rail.push({ pts }); continue; }
  if ((t.waterway === 'river' || t.waterway === 'canal') && !(t.natural === 'water')) { for (const pts of pieces(w)) out.water.push({ kind: t.waterway, name: t.name || '', closed: false, pts }); continue; }
  const pts = line(w); if (pts.length < 3) continue;   // areas and buildings: whole, inside the box
  if (t.natural === 'water') out.water.push({ kind: 'water', name: t.name || '', closed: true, pts: pts.slice(0, -1) });
  else if (t.building) {
    const priv = PRIVATE(t), name = priv ? '' : (PERSON_NAMED(t.name) ? '' : t.name || '');
    const levels = +t['building:levels'] || 0;
    out.buildings.push({ kind: t.building, name, levels, amenity: t.amenity || t.shop || t.tourism || '', pts: pts.slice(0, -1) });
  } else if (t.leisure || t.landuse || t.amenity === 'parking' || t.amenity === 'school') {
    if (w.refs[0] !== w.refs.at(-1)) continue;
    out.areas.push({ kind: t.leisure || t.landuse || t.amenity, name: t.name || '', pts: pts.slice(0, -1) });
  }
}
// Named places (shops, services, churches, parks…) as points. Private homes never appear.
const centroid = (pts) => pts.reduce((a, p) => [a[0] + p[0] / pts.length, a[1] + p[1] / pts.length], [0, 0]).map((v) => Math.round(v * 10) / 10);
const addPlace = (t, pos) => {
  if (PRIVATE(t) || t.highway || t.railway || t.waterway || t.place) return;
  const kind = t.shop || t.amenity || t.tourism || t.office || t.leisure || t.craft || t.historic || t.healthcare || '';
  if (!kind) return;
  const name = PERSON_NAMED(t.name) ? kind.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase()) : t.name;
  out.places.push({ name, kind, street: t['addr:street'] || '', number: t['addr:housenumber'] || '', x: pos[0], z: pos[1] });
};
for (const n of poiNodes) if (inBox(n)) addPlace(n.tags, proj(n));
for (const w of ways) if (w.tags.name && !w.tags.building) { const pts = line(w); if (pts.length > 2) addPlace(w.tags, centroid(pts)); }
// Drop duplicate names at nearly the same spot (a node and an area for the same place).
out.places = out.places.filter((p, i, a) => a.findIndex((q) => q.name === p.name && Math.hypot(q.x - p.x, q.z - p.z) < 60) === i);

const all = [...out.roads, ...out.buildings, ...out.areas, ...out.water, ...out.rail].flatMap((f) => f.pts);
out.extent = { x0: Math.min(...all.map((p) => p[0])), x1: Math.max(...all.map((p) => p[0])), z0: Math.min(...all.map((p) => p[1])), z1: Math.max(...all.map((p) => p[1])) };

const dest = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'src', 'world', 'narromine-osm-data.js');
fs.writeFileSync(dest, `// Generated by tools/narromine-osm.mjs from an OpenStreetMap export — do not edit by hand.
// Map data © OpenStreetMap contributors, ODbL 1.0 — https://www.openstreetmap.org/copyright
// Local metres: x east, z south, origin at the Mitchell Highway's eastern edge of the export.
export const NARROMINE_OSM = ${JSON.stringify(out)};
`);
console.log(`wrote ${path.relative(process.cwd(), dest)}: ${out.roads.length} roads, ${out.buildings.length} buildings, ${out.areas.length} areas, ${out.water.length} water, ${out.rail.length} rail, ${out.places.length} places; extent`, out.extent);
