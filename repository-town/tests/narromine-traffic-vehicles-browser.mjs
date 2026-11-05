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
  // Stage beside the public school (the teleport is positioning only): assert that
  // scheduled people exist as actual visible scene figures and move at walking speed.
  const school=await page.evaluate(()=>window.__town.narrominePlace('Narromine Public School'));
  assert(school&&Number.isFinite(school.x)&&Number.isFinite(school.z),device+': public school geolocation');
  await page.evaluate(p=>{
   window.__town.life.setDay(2); // Tuesday, an actual school day.
   window.__town.life.setTime(8*60+32);
   window.__town.place(p.x+12,p.z+12,Math.PI);
  },school);
  await page.waitForFunction(()=>window.__town.narromineVisible()&&window.__town.state().triangles>1000,null,{timeout:30000});
  await page.waitForFunction(()=>window.__town.narromineWalkers().some(w=>w.shown&&w.inScene&&w.parentShown),
    null,{timeout:20000});
  const walkersBefore=await page.evaluate(()=>window.__town.narromineWalkers());
  const onScene=walkersBefore.filter(w=>w.shown&&w.inScene&&w.parentShown&&w.kids>0);
  assert(onScene.length>0,device+': school walkers must be visibly attached to scene (not just counted in a timetable)');
  await page.screenshot({path:`${dir}/${device}-school-walkers.png`});
  await page.waitForTimeout(2500);
  const walkersAfter=await page.evaluate(()=>window.__town.narromineWalkers());
  const continuing=onScene.map(w=>[w,walkersAfter.find(n=>n.id===w.id)]).filter(([,n])=>n&&n.shown);
  const distances=continuing.map(([w,n])=>Math.hypot(n.x-w.x,n.z-w.z));
  assert(distances.some(d=>d>1.0&&d<7.0),
    device+': at least one visibly rendered walker travels ~1.1–1.3 m/s in real frames; observed '+JSON.stringify(distances.slice(0,10)));
  const walkProof={visible:onScene.length,moving:distances.filter(d=>d>1&&d<7).length,
   sampleMetres:distances.slice(0,10).map(d=>+d.toFixed(2))};

  assert.deepEqual(errors,[],device+': zero JS page errors');
  const report={device,modelsLoaded:true,countBefore:before.cars.length,countAfter:after.cars.length,
    movedCandidateCount:moved,carSpeedsKmh:after.cars.slice(0,20).map(c=>+(c.v*3.6).toFixed(1)),
    walkers:walkProof,calls:after.info.calls,triangles:after.info.triangles,fps:after.info.fps,errors,source:base};
  reports.push(report);console.log('NARROMINE-TRAFFIC-GLB '+JSON.stringify(report));
 }finally{await page.close()}
}
try{
 if(!mobileOnly)await visit(false);
 await visit(true);
 fs.writeFileSync(dir+'/report.json',JSON.stringify(reports,null,2));
 console.log('PASS actual Narromine traffic GLBs and road movement in '+reports.map(r=>r.device).join('+')+' Chromium');
}finally{await browser.close()}
