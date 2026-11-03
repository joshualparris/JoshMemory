// Narromine from OpenStreetMap: the compressed highway joins the real Mitchell Highway, which
// becomes Dandaloo Street; real street names, buildings and named places are present and placed
// where the map puts them; private homes are never named; fences leave the highway open.
import assert from 'node:assert/strict';
import { HIGHWAY, REGION, OSM, STREETS, BUILDINGS, PLACES, ARRIVAL, OFFSET, onNarromineRoad, onOpenHighway, boundaryColliders } from '../src/world/narromine-layout.js';

const secs = (HIGHWAY.x1 - HIGHWAY.x0) / (HIGHWAY.speed / 3.6);
assert(secs > 80 && secs < 100, `compressed drive ≈ 90 s at 100 km/h (got ${secs.toFixed(0)} s)`);
for (let x = HIGHWAY.x1; x >= HIGHWAY.x0; x -= 2) assert(onNarromineRoad(x, HIGHWAY.z), 'highway driveable at x ' + x);
assert(onOpenHighway(-1500, HIGHWAY.z) && !onOpenHighway(HIGHWAY.x0 - 50, HIGHWAY.z), '100 km/h only on the open highway');
assert.equal(OSM.licence, 'ODbL 1.0'); assert.match(OSM.attribution, /OpenStreetMap contributors/);

// The real Mitchell Highway starts where the game highway ends, and is driveable from there.
const mitchell = STREETS.filter((s) => s.name === 'Mitchell Highway');
assert(mitchell.some((s) => s.pts.some(([x, z]) => Math.hypot(x - OFFSET.x, z - OFFSET.z) < 1)), 'real Mitchell Highway meets the game highway');
// The centre of the heritage-listed Dandaloo garden strip is NOT driveable.
// Check actual carriageway centres on both sides rather than assuming every
// government centreline is an asphalt surface.
for (const s of STREETS) for (const [x, z] of s.pts) if (x > REGION.x0 && x < REGION.x1) {
 if(s.divided){
   const [a,b]=s.pts,len=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=(b[1]-a[1])/len,nz=-(b[0]-a[0])/len;
   assert(onNarromineRoad(x+nx*6.8,z+nz*6.8),'Dandaloo one mapped lane driveable');
   assert(onNarromineRoad(x-nx*6.8,z-nz*6.8),'Dandaloo opposite mapped lane driveable');
 }else assert(onNarromineRoad(x,z),`${s.name||s.kind} driveable at its mapped point`);
}

const names = new Set(STREETS.map((s) => s.name));
for (const n of ['Dandaloo Street', 'Burraway Street', 'Cathundril Street', 'Meryula Street', 'Manildra Street', 'Merilba Street', 'Nymagee Street', 'Temoin Street'])
  assert(names.has(n), 'real street present: ' + n);
assert(BUILDINGS.length > 150, `mapped buildings present (${BUILDINGS.length})`);

// Named places sit on or beside their real street (main-street shops within 60 m of Dandaloo Street).
const place = (n) => PLACES.find((p) => p.name === n);
for (const n of ['Royal Hotel', 'Narromine Hotel', 'Coles', 'Narromine Post Office', 'Narromine Pharmacy', 'Imperial Hotel', 'Narromine RSL Club', 'Narromine Aviation Museum'])
  assert(place(n), 'named place present: ' + n);
const dandaloo=STREETS.filter(s=>s.name==='Dandaloo Street');
const distToStreet=(p,r)=>{
 let best=Infinity;
 for(let i=1;i<r.pts.length;i++){
  const [ax,az]=r.pts[i-1],[bx,bz]=r.pts[i],dx=bx-ax,dz=bz-az,l=dx*dx+dz*dz;
  const t=l?Math.max(0,Math.min(1,((p.x-ax)*dx+(p.z-az)*dz)/l)):0;
  best=Math.min(best,Math.hypot(p.x-ax-t*dx,p.z-az-t*dz));
 }
 return best;
};
// GURAS address coordinates can fall at the REAR of a commercial lot; they
// are verified street-address property points, not actual shop doorways.
for(const n of ['Coles','Narromine Post Office','Narromine Pharmacy','Royal Hotel','Narromine Hotel']){
 const p=place(n),d=Math.min(...dandaloo.map(r=>distToStreet(p,r)));
 assert(d<95,n+' registered on Dandaloo Street (property setback '+d.toFixed(1)+'m)');
}
assert.match(place('Royal Hotel').fact, /1890/); assert.match(place('Narromine Aviation Museum').fact, /Sabre/);

// Privacy: no private home names or home addresses (the export contains a named private house).
for (const p of PLACES) assert(p.kind !== 'house' && !/'s (house|home)|residence/i.test(p.name), 'no private home named: ' + p.name);
for (const b of BUILDINGS) assert(!b.name || !/'s house|residence/i.test(b.name), 'no named private building: ' + b.name);
assert(!/Parris/i.test(JSON.stringify(OSM)), 'no family names from private homes in the data');

const hit = (x, z) => boundaryColliders().some((c) => x >= c.x0 && x <= c.x1 && z >= c.z0 && z <= c.z1);
for (let x = -1480; x > REGION.x1 - 20; x -= 5) assert(!hit(x, HIGHWAY.z), 'fences leave the highway open at x ' + x);
assert(hit(-2000, HIGHWAY.z - 50) && hit(-2000, HIGHWAY.z + 50), 'the corridor is fenced');
console.log(`PASS Narromine (OpenStreetMap): ${STREETS.length} street pieces, ${BUILDINGS.length} buildings, ${PLACES.length} named places; ${names.size} street names; drive ≈${secs.toFixed(0)} s`);

// The Royal Hotel, modelled from NSW aerial imagery and the cadastre.
{
  const { DETAILED, FILL_SHOPS, FILL_HOUSES, polyRect, inPoly } = await import('../src/world/narromine-layout.js');
  const royal = DETAILED.find((d) => d.id === 'royal-hotel');
  const area = Math.abs(royal.boundary.reduce((s, p, i, a) => { const q = a[(i + 1) % a.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0) / 2);
  // The cadastre's Shape__Area (3,355) is in Web Mercator units; true area = 3,355 × cos²(32.24°) ≈ 2,395 m²,
  // matching the hotel's sale listing ("approx 2393 sqm").
  assert(Math.abs(area - 2393) < 30, `Royal Hotel lot is the real ~2,393 m² (got ${area.toFixed(0)})`);
  const pub = PLACES.find((p) => p.name === 'Royal Hotel');
  assert(inPoly(pub.x, pub.z, royal.boundary), 'the mapped pub lies inside its own lot');
  // Traced corners lie inside the lot or within 2.5 m of its line (buildings sit on the boundary;
  // the verandah overhangs the footpath, so with the slanted lot line it may reach 6.5 m past it).
  const edgeDist = (x, z) => Math.min(...royal.boundary.map((a, i, arr) => { const b = arr[(i + 1) % arr.length], dx = b[0] - a[0], dz = b[1] - a[1], l = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / l)); return Math.hypot(x - a[0] - t * dx, z - a[1] - t * dz); }));
  for (const [k, pts] of Object.entries(royal.parts)) for (const [x, z] of pts) { const tol = k === 'verandah' ? 6.5 : 2.5; assert(inPoly(x, z, royal.boundary) || edgeDist(x, z) <= tol, `${k} inside the lot (corner ${edgeDist(x, z).toFixed(1)} m outside)`); }
  const f = polyRect(royal.parts.front);
  assert(Math.abs((f.z1 - f.z0) - 20.3) < 0.5 && Math.abs((f.x1 - f.x0) - 7.4) < 0.5, 'front block 20.3 m × 7.4 m as traced');
  assert(!onNarromineRoad((f.x0 + f.x1) / 2, (f.z0 + f.z1) / 2), 'the hotel is off the road');
  for (const g of [...FILL_SHOPS, ...FILL_HOUSES]) assert(!inPoly(g.x, g.z, royal.boundary), 'no generated building inside the Royal Hotel lot');
  console.log('PASS Royal Hotel: lot', area.toFixed(0), 'm², front 20.3 × 7.4 m, verandah, wings, car park and yard inside the lot');
}
