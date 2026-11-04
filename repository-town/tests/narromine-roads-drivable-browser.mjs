// Every Narromine street centreline is free of solid colliders (a car is ~1 m half-width),
// while buildings still block: a rotated building's box corners must not wall off the road
// (owner report 4 Nov 2026: invisible barrier by Monaghan's Butchery, Burraway Street).
//   node tools/serve.mjs dist/public 8091 && node tests/narromine-roads-drivable-browser.mjs
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const b=await chromium.launch();const p=await b.newPage();
await p.goto(process.env.TOWN_URL||'http://127.0.0.1:8091/');
await p.waitForFunction(()=>window.__town?.probeStatic,null,{timeout:90000});
const r=await p.evaluate(async()=>{const L=await import('./world/narromine-layout.js');const hits=[];let samples=0;
 for(const s of L.STREETS)for(let i=1;i<s.pts.length;i++){const [ax,az]=s.pts[i-1],[bx,bz]=s.pts[i];const n=Math.ceil(Math.hypot(bx-ax,bz-az)/2);
  for(let k=0;k<=n;k++){samples++;const x=ax+(bx-ax)*k/n,z=az+(bz-az)*k/n;if(window.__town.probeStatic(x,z,1.0))hits.push([s.name||s.kind,+x.toFixed(1),+z.toFixed(1)]);}}
 // A mapped building's own centre must still be solid.
 const solid=L.BUILDINGS.filter(b=>b.pts.length>=4).slice(0,40).filter(b=>{const cx=b.pts.reduce((s,q)=>s+q[0],0)/b.pts.length,cz=b.pts.reduce((s,q)=>s+q[1],0)/b.pts.length;return L.inPoly(cx,cz,b.pts)&&window.__town.probeStatic(cx,cz,.3);}).length;
 return {hits,samples,solid,butcher:window.__town.probeStatic(-4694.2,-807.4,1.0)};});
await b.close();
assert.equal(r.hits.length,0,'street centrelines blocked: '+JSON.stringify(r.hits.slice(0,10)));
assert.equal(r.butcher,null,'Burraway Street by Monaghan\'s Butchery is drivable');
assert.ok(r.solid>=10,'mapped buildings still block ('+r.solid+' of first 40 sampled)');
console.log(`PASS Narromine roads drivable: ${r.samples} centreline samples clear; ${r.solid} sampled buildings still solid`);
