// Browser-only proof that actual Kenney CC0 instanced GLBs load in the playable
// Narromine scene, and that physical traffic moves. Does not claim real traffic
// volumes or a hardware FPS guarantee from cloud SwiftShader software rendering.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';

const base=process.env.TOWN_URL||'http://127.0.0.1:8091/';
const mobileOnly=process.argv.includes('--mobile');
const dir=process.env.NARROMINE_TRAFFIC_QA_DIR||'test-results/narromine-traffic-vehicles';
fs.mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const reports=[];
async function visit(mobile){
 const device=mobile?'mobile':'desktop';
 const page=await browser.newPage(mobile?{viewport:{width:393,height:852},isMobile:true,hasTouch:true,deviceScaleFactor:1}:{viewport:{width:1280,height:800},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>sessionStorage.setItem('town-cheats','1'));
 await page.route('**/api/npc-chat',r=>r.abort('connectionrefused'));
 try{
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__town&&document.getElementById('loading')?.hidden,null,{timeout:120000});
  await page.evaluate(()=>{
   window.__town.closePanel?.();
   window.__town.life.setTime(8*60);
   window.__town.place(-4805,-760,Math.PI);
  });
  await page.waitForFunction(()=>window.__town.narromineVisible()&&window.__town.traffic().count>5,null,{timeout:90000});
  // The old instanced boxes exist before models load. A positive flag proves
  // 15 GLB meshes were parsed, batched and added, not just that files exist.
  await page.waitForFunction(()=>window.__town.traffic().models===true,null,{timeout:90000});
  const before=await page.evaluate(()=>({cars:window.__town.traffic().cars,info:window.__town.state()}));
  await page.screenshot({path:`${dir}/${device}-live-vehicles.png`});
  await page.waitForTimeout(12000);
  const after=await page.evaluate(()=>({cars:window.__town.traffic().cars,info:window.__town.state(),models:window.__town.traffic().models}));
  assert(after.models,device+': GLB instancing was lost');
  assert(after.cars.length>5,device+': real traffic present');
  assert(after.cars.every(c=>Number.isFinite(c.x)&&Number.isFinite(c.z)&&Number.isFinite(c.v)&&c.v>=0&&c.v<=19),
   device+': cars have finite legal speeds and positions');
  // Match original cars to their nearest model-compatible new position;
  // traffic may spawn or despawn while the player is standing still.
  const moved=before.cars.filter(c=>after.cars.some(n=>n.model===c.model&&
    Math.hypot(n.x-c.x,n.z-c.z)>1.0&&Math.hypot(n.x-c.x,n.z-c.z)<150)).length;
  assert(moved>=2,device+': at least two cars should visibly move over real frames, got '+moved);
  assert(after.info.triangles>1000&&after.info.calls>0,device+': actual WebGL draw');
  assert.deepEqual(errors,[],device+': zero JS page errors');
  const report={device,modelsLoaded:true,countBefore:before.cars.length,countAfter:after.cars.length,
    movedCandidateCount:moved,carSpeedsKmh:after.cars.slice(0,20).map(c=>+(c.v*3.6).toFixed(1)),
    calls:after.info.calls,triangles:after.info.triangles,fps:after.info.fps,errors,source:base};
  reports.push(report);console.log('NARROMINE-TRAFFIC-GLB '+JSON.stringify(report));
 }finally{await page.close()}
}
try{
 if(!mobileOnly)await visit(false);
 await visit(true);
 fs.writeFileSync(dir+'/report.json',JSON.stringify(reports,null,2));
 console.log('PASS actual Narromine traffic GLBs and road movement in '+reports.map(r=>r.device).join('+')+' Chromium');
}finally{await browser.close()}
