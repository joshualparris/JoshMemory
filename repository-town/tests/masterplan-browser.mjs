import {chromium,devices} from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {alternatives,roadRect,rect,overlap} from '../src/world/masterplan-model.js';
import {OUTSKIRT_PARCELS,PLANNED_ROADS} from '../src/world/town-planning.js';
const url=process.env.TOWN_URL||'http://localhost:8091/';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
fs.mkdirSync('test-results/masterplan',{recursive:true});
const results=[];
try{for(const [name,opts] of [['desktop',{viewport:{width:1280,height:800}}],['mobile',{...devices['Pixel 7']}]]){
 const context=await browser.newContext(opts),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url);await page.waitForFunction(()=>window.__town?.planningAudit,null,{timeout:120000});
 const audit=await page.evaluate(()=>window.__town.planningAudit());assert.equal(audit.buildings.length,306);
 fs.writeFileSync(`test-results/masterplan/${name}-geometry.json`,JSON.stringify(audit,null,2));
 const alternativesResult=[];
 for(const plan of alternatives(OUTSKIRT_PARCELS,PLANNED_ROADS)){
  const conflicts=[];
  for(const road of plan.roads){const box=roadRect(road);for(const b of audit.buildings)if(b.extent&&overlap(box,b.extent))conflicts.push({road:road.id,building:b.id});for(const b of audit.buildings)if(b.field&&overlap(box,b.field))conflicts.push({road:road.id,field:b.id});}
  const blocked=await page.evaluate(roads=>{const out=[];for(const r of roads){const n=Math.ceil(Math.hypot(r.b.x-r.a.x,r.b.z-r.a.z));let count=0;for(let i=0;i<=n;i++){const t=i/n,x=r.a.x+(r.b.x-r.a.x)*t,z=r.a.z+(r.b.z-r.a.z)*t;if(window.__town.probeStatic(x,z,1.25))count++;}if(count)out.push({road:r.id,blockedMetres:count});}return out;},plan.roads);
  alternativesResult.push({id:plan.id,conflicts,blocked});
 }
 const timings=await page.evaluate(async()=>{const a=[];let before=performance.now();for(let i=0;i<60;i++)await new Promise(resolve=>requestAnimationFrame(now=>{a.push(now-before);before=now;resolve();}));a.sort((a,b)=>a-b);return {frames:a.length,medianMs:a[30],p95Ms:a[57],state:window.__town.state()};});
 await page.screenshot({path:`test-results/masterplan/${name}.png`});
 results.push({name,url,errors,alternatives:alternativesResult,performance:{frames:timings.frames,medianMs:timings.medianMs,p95Ms:timings.p95Ms,calls:timings.state.calls,triangles:timings.state.triangles}});
 await context.close();
}}finally{await browser.close();fs.writeFileSync('test-results/masterplan/browser.json',JSON.stringify(results,null,2));}
console.log(JSON.stringify(results,null,2));assert(results.every(r=>!r.errors.length));
