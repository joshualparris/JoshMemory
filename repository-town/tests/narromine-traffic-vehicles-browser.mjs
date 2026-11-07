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
  // Sample real requestAnimationFrame positions *before* the slow screenshot,
  // so arrivals that reach school during capture are not wrongly discarded.
  const tracks=await page.evaluate(()=>new Promise(resolve=>{
    const started=performance.now(), found=new Map();
    function sample(now){
      for(const w of window.__town.narromineWalkers()){
        if(!w.shown||!w.inScene||!w.parentShown||w.kids<=0)continue;
        if(!found.has(w.id))found.set(w.id,[]);
        found.get(w.id).push({t:now,x:w.x,z:w.z});
      }
      // Software-rendered CI can process fewer than three actual 3D frames
      // in 2.2 s. Require real third-frame evidence, without accepting a
      // static screenshot or indefinite timeout: keep sampling up to 7.5 s.
      const haveThree=[...found.values()].some(points=>points.length>=3);
      if((now-started<2200 || !haveThree) && now-started<7500)requestAnimationFrame(sample);
      else resolve([...found].map(([id,positions])=>{
        const first=positions[0],last=positions.at(-1),seconds=(last.t-first.t)/1000;
        const metres=Math.hypot(last.x-first.x,last.z-first.z);
        return {id,frames:positions.length,seconds,metres,speed:seconds>0?metres/seconds:0};
      }));
    }
    requestAnimationFrame(sample);
  }));
  const moving=tracks.filter(t=>t.frames>=3&&t.seconds>=0.25&&t.metres>0.25&&t.speed>=0.6&&t.speed<=2.0);
  console.log('NARROMINE-SCHOOL-WALKERS '+JSON.stringify({device,visible:onScene.length,tracks:tracks.slice(0,12),moving:moving.length}));
  await page.screenshot({path:`${dir}/${device}-school-walkers.png`});
  assert(moving.length>0,device+': no physically moving scene walker at realistic speed during actual WebGL frames');
  const walkProof={visible:onScene.length,moving:moving.length,
   sampleMetres:moving.slice(0,10).map(t=>+t.metres.toFixed(2)),speeds:moving.slice(0,10).map(t=>+t.speed.toFixed(2))};

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
